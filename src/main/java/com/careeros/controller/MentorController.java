package com.careeros.controller;

import com.careeros.ai.MentorAI;
import com.careeros.ai.GeminiClient;
import com.careeros.util.CorsUtil;
import com.careeros.util.JwtUtil;
import com.careeros.util.RequestUtil;
import com.careeros.util.ResponseUtil;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.SQLException;

public class MentorController implements HttpHandler {

    private final Gson gson;

    public MentorController() {
        this.gson = new Gson();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsUtil.handlePreflight(exchange)) return;

        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        try {
            String token = RequestUtil.getAuthToken(exchange);
            if (token == null || !JwtUtil.isTokenValid(token)) {
                ResponseUtil.sendError(exchange, 401, "Unauthorized");
                return;
            }

            Long userId = JwtUtil.getUserIdFromToken(token);
            MentorAI mentor = new MentorAI(userId);

            if ("GET".equals(method)) {
                if (path.contains("/analyze")) {
                    handleAnalyze(exchange, mentor);
                } else if (path.contains("/internship")) {
                    handleInternshipCheck(exchange, mentor);
                } else if (path.contains("/suggestion")) {
                    handleSuggestion(exchange, mentor);
                } else {
                    ResponseUtil.sendError(exchange, 404, "Endpoint not found");
                }
            } else if ("POST".equals(method)) {
                if (path.contains("/ask")) {
                    handleAskQuestion(exchange, mentor);
                } else {
                    ResponseUtil.sendError(exchange, 404, "Endpoint not found");
                }
            } else {
                ResponseUtil.sendError(exchange, 405, "Method not allowed");
            }

        } catch (SQLException e) {
            ResponseUtil.sendError(exchange, 500, "Database error: " + e.getMessage());
        } catch (Exception e) {
            ResponseUtil.sendError(exchange, 400, e.getMessage());
        }
    }

    private void handleAnalyze(HttpExchange exchange, MentorAI mentor)
            throws IOException, SQLException {
        String analysis = mentor.analyze();
        String suggestion = mentor.getSuggestion();
        String response = "{\"analysis\":\"" + analysis + "\"," +
                         "\"suggestion\":\"" + suggestion + "\"}";
        ResponseUtil.sendSuccess(exchange, response);
    }

    private void handleInternshipCheck(HttpExchange exchange, MentorAI mentor)
            throws IOException, SQLException {
        String result = mentor.checkInternshipReadiness();
        ResponseUtil.sendSuccess(exchange, result);
    }

    private void handleSuggestion(HttpExchange exchange, MentorAI mentor)
            throws IOException, SQLException {
        String suggestion = mentor.getSuggestion();
        ResponseUtil.sendSuccess(exchange,
                "{\"suggestion\":\"" + suggestion + "\"}");
    }

    // System prompt: the mentor's personality
    private static final String SYSTEM_PROMPT =
            "You are the CareerOS AI Mentor — a friendly, encouraging career mentor for tech students. " +
            "Use the student's data below to give personalized, practical advice. " +
            "Keep answers concise (under 250 words), use simple language, " +
            "use markdown **bold** for key points and short bullet lists where helpful. " +
            "If the student writes in Bangla, reply in Bangla. " +
            "Never invent data about the student — only use what is provided.\n\n";

    private void handleAskQuestion(HttpExchange exchange, MentorAI mentor)
            throws IOException, SQLException {
        String body = RequestUtil.readRequestBody(exchange);
        JsonObject json = gson.fromJson(body, JsonObject.class);

        if (json == null || !json.has("question") || json.get("question").isJsonNull()) {
            ResponseUtil.sendError(exchange, 400, "question is required");
            return;
        }
        String question = json.get("question").getAsString().trim();
        if (question.isEmpty()) {
            ResponseUtil.sendError(exchange, 400, "question cannot be empty");
            return;
        }

        String reply;
        String source;

        try {
            GeminiClient gemini = new GeminiClient();
            String context = mentor.buildUserContext();
            reply = gemini.generateReply(SYSTEM_PROMPT + context, question);
            source = "gemini";
        } catch (Exception e) {
            // Gemini failed (no key / network / quota) → rule-based fallback
            System.out.println("Gemini fallback: " + e.getMessage());
            reply = mentor.fallbackAnswer();
            source = "rules";
        }

        JsonObject result = new JsonObject();
        result.addProperty("message", reply);
        result.addProperty("source", source);
        ResponseUtil.sendSuccess(exchange, gson.toJson(result));
    }
}