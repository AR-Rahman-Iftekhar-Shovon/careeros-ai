package com.careeros.util;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;

public class ResponseUtil {

    public static void sendResponse(HttpExchange exchange, int statusCode, String jsonBody) throws IOException {
        CorsUtil.setCorsHeaders(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        byte[] responseBytes = jsonBody.getBytes("UTF-8");
        exchange.sendResponseHeaders(statusCode, responseBytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(responseBytes);
        os.close();
    }

    public static void sendSuccess(HttpExchange exchange, String data) throws IOException {
        String json = "{\"success\":true,\"data\":" + data + "}";
        sendResponse(exchange, 200, json);
    }

    public static void sendError(HttpExchange exchange, int statusCode, String message) throws IOException {
        String json = "{\"success\":false,\"error\":\"" + message + "\"}";
        sendResponse(exchange, statusCode, json);
    }

    public static void sendCreated(HttpExchange exchange, String data) throws IOException {
        String json = "{\"success\":true,\"data\":" + data + "}";
        sendResponse(exchange, 201, json);
    }
}