package com.careeros.controller;

import com.careeros.model.User;
import com.careeros.service.UserService;
import com.careeros.util.JwtUtil;
import com.careeros.util.RequestUtil;
import com.careeros.util.ResponseUtil;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Optional;

public class AuthController implements HttpHandler {

    private final UserService userService;
    private final Gson gson;

    public AuthController() {
        this.userService = new UserService();
        this.gson = new Gson();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (com.careeros.util.CorsUtil.handlePreflight(exchange)) return;

        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        try {
            if ("POST".equals(method)) {
                if (path.contains("/register")) {
                    handleRegister(exchange);
                } else if (path.contains("/login")) {
                    handleLogin(exchange);
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

    private void handleRegister(HttpExchange exchange) throws IOException, SQLException {
        String body = RequestUtil.readRequestBody(exchange);
        JsonObject json = gson.fromJson(body, JsonObject.class);

        // Safe extraction with validation
        String email = getStringFromJson(json, "email");
        String password = getStringFromJson(json, "password");
        String fullName = getStringFromJson(json, "fullName");

        if (email == null || password == null || fullName == null) {
            ResponseUtil.sendError(exchange, 400, "Missing required fields: email, password, fullName");
            return;
        }

        if (password.length() < 6) {
            ResponseUtil.sendError(exchange, 400, "Password must be at least 6 characters");
            return;
        }

        User user = userService.registerUser(email, password, fullName);

        JsonObject responseData = new JsonObject();
        responseData.addProperty("id", user.getId());
        responseData.addProperty("email", user.getEmail());
        responseData.addProperty("fullName", user.getFullName());
        responseData.addProperty("role", user.getRole().name());

        ResponseUtil.sendCreated(exchange, gson.toJson(responseData));
    }

    private void handleLogin(HttpExchange exchange) throws IOException, SQLException {
        String body = RequestUtil.readRequestBody(exchange);
        JsonObject json = gson.fromJson(body, JsonObject.class);

        String email = getStringFromJson(json, "email");
        String password = getStringFromJson(json, "password");

        if (email == null || password == null) {
            ResponseUtil.sendError(exchange, 400, "Missing required fields: email, password");
            return;
        }

        Optional<User> userOpt = userService.loginUser(email, password);

        if (userOpt.isEmpty()) {
            ResponseUtil.sendError(exchange, 401, "Invalid email or password");
            return;
        }

        User user = userOpt.get();

        // Generate JWT Token
        String token = JwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        JsonObject responseData = new JsonObject();
        responseData.addProperty("id", user.getId());
        responseData.addProperty("email", user.getEmail());
        responseData.addProperty("fullName", user.getFullName());
        responseData.addProperty("role", user.getRole().name());
        responseData.addProperty("token", token);

        ResponseUtil.sendSuccess(exchange, gson.toJson(responseData));
    }

    // Helper method to safely get string from JSON
    private String getStringFromJson(JsonObject json, String key) {
        if (json == null || !json.has(key) || json.get(key).isJsonNull()) {
            return null;
        }
        return json.get(key).getAsString().trim();
    }
} 