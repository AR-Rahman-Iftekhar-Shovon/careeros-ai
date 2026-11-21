package com.careeros.ai;

import com.careeros.util.ConfigManager;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Gemini API client — sends a prompt, returns the AI's text reply.
 */
public class GeminiClient {

    private static final String BASE_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/";

    private final String apiKey;
    private final String model;
    private final HttpClient httpClient;

    public GeminiClient() {
        ConfigManager config = ConfigManager.getInstance();
        this.apiKey = config.getProperty("gemini.api.key");
        this.model = config.getProperty("gemini.model", "gemini-3.6-flash");
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Send a prompt to Gemini and return the text response.
     * systemInstruction = mentor personality + user context
     * userMessage = the actual question
     */
    public String generateReply(String systemInstruction, String userMessage) throws Exception {
        if (!isConfigured()) {
            throw new IllegalStateException("Gemini API key is not configured");
        }

        // Build request body:
        // { "system_instruction": {...}, "contents": [{ "parts": [{"text": "..."}] }] }
        JsonObject textPart = new JsonObject();
        textPart.addProperty("text", userMessage);

        JsonArray parts = new JsonArray();
        parts.add(textPart);

        JsonObject content = new JsonObject();
        content.add("parts", parts);

        JsonArray contents = new JsonArray();
        contents.add(content);

        JsonObject body = new JsonObject();
        body.add("contents", contents);

        if (systemInstruction != null && !systemInstruction.isBlank()) {
            JsonObject sysPart = new JsonObject();
            sysPart.addProperty("text", systemInstruction);
            JsonArray sysParts = new JsonArray();
            sysParts.add(sysPart);
            JsonObject sysObj = new JsonObject();
            sysObj.add("parts", sysParts);
            body.add("system_instruction", sysObj);
        }

        String url = BASE_URL + model + ":generateContent?key=" + apiKey;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                .build();

        HttpResponse<String> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini API error (HTTP " + response.statusCode() + "): "
                    + response.body());
        }

        // Parse: candidates[0].content.parts[0].text
        JsonObject json = JsonParser.parseString(response.body()).getAsJsonObject();
        JsonArray candidates = json.getAsJsonArray("candidates");
        if (candidates == null || candidates.size() == 0) {
            throw new RuntimeException("Gemini returned no candidates");
        }

        JsonObject firstCandidate = candidates.get(0).getAsJsonObject();
        JsonObject candidateContent = firstCandidate.getAsJsonObject("content");
        JsonArray candidateParts = candidateContent.getAsJsonArray("parts");

        StringBuilder reply = new StringBuilder();
        for (int i = 0; i < candidateParts.size(); i++) {
            JsonObject part = candidateParts.get(i).getAsJsonObject();
            if (part.has("text")) {
                reply.append(part.get("text").getAsString());
            }
        }
        return reply.toString().trim();
    }
}