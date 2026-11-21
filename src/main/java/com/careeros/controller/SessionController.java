package com.careeros.controller;

import com.careeros.model.Session;
import com.careeros.repository.SessionRepository;
import com.careeros.service.SessionService;
import com.careeros.util.JwtUtil;
import com.careeros.util.RequestUtil;
import com.careeros.util.ResponseUtil;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

public class SessionController implements HttpHandler {

    private final SessionService sessionService;
    private final SessionRepository sessionRepository;
    private final Gson gson;

    public SessionController() {
        this.sessionService = new SessionService();
        this.sessionRepository = new SessionRepository();
       this.gson = new com.google.gson.GsonBuilder()
    .registerTypeAdapter(java.time.LocalDate.class,
        (com.google.gson.JsonSerializer<java.time.LocalDate>) (src, type, ctx) ->
            new com.google.gson.JsonPrimitive(src.toString()))
    .registerTypeAdapter(java.time.LocalDateTime.class,
        (com.google.gson.JsonSerializer<java.time.LocalDateTime>) (src, type, ctx) ->
            new com.google.gson.JsonPrimitive(src.toString()))
    .create();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (com.careeros.util.CorsUtil.handlePreflight(exchange)) return;

        String method = exchange.getRequestMethod();

        try {
            String token = RequestUtil.getAuthToken(exchange);
            if (token == null || !JwtUtil.isTokenValid(token)) {
                ResponseUtil.sendError(exchange, 401, "Unauthorized");
                return;
            }

            Long userId = JwtUtil.getUserIdFromToken(token);

            if ("POST".equals(method)) {
                handleCreateSession(exchange, userId);
            } else if ("GET".equals(method)) {
                handleGetRecentSessions(exchange, userId);
            } else {
                ResponseUtil.sendError(exchange, 405, "Method not allowed");
            }
        } catch (SQLException e) {
            ResponseUtil.sendError(exchange, 500, "Database error");
        } catch (Exception e) {
            ResponseUtil.sendError(exchange, 400, e.getMessage());
        }
    }

    private void handleCreateSession(HttpExchange exchange, Long userId) throws IOException, SQLException {
        String body = RequestUtil.readRequestBody(exchange);
        JsonObject json = gson.fromJson(body, JsonObject.class);

        Session session = new Session();
        session.setUserId(userId);
        session.setTopic(json.get("topic").getAsString());
        session.setDurationMinutes(json.get("durationMinutes").getAsInt());

        if (json.has("mood")) session.setMood(Session.Mood.valueOf(json.get("mood").getAsString()));
        if (json.has("notes")) session.setNotes(json.get("notes").getAsString());

        Session saved = sessionService.saveSession(session);
        ResponseUtil.sendCreated(exchange, gson.toJson(saved));
    }

    private void handleGetRecentSessions(HttpExchange exchange, Long userId) throws IOException, SQLException {
        List<Session> sessions = sessionRepository.findRecentByUserId(userId, 10);
        ResponseUtil.sendSuccess(exchange, gson.toJson(sessions));
    }
}