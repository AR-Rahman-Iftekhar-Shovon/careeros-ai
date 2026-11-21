package com.careeros.controller;

import com.careeros.model.Roadmap;
import com.careeros.model.RoadmapWeek;
import com.careeros.service.RoadmapService;
import com.careeros.util.CorsUtil;
import com.careeros.util.JwtUtil;
import com.careeros.util.RequestUtil;
import com.careeros.util.ResponseUtil;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Optional;

public class RoadmapController implements HttpHandler {

    private final RoadmapService roadmapService;
    private final Gson gson;

    public RoadmapController() {
        this.roadmapService = new RoadmapService();
        this.gson = new Gson();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsUtil.handlePreflight(exchange)) return;

        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        try {
            // Verify JWT
            String token = RequestUtil.getAuthToken(exchange);
            if (token == null || !JwtUtil.isTokenValid(token)) {
                ResponseUtil.sendError(exchange, 401, "Unauthorized");
                return;
            }

            Long userId = JwtUtil.getUserIdFromToken(token);

            if ("GET".equals(method)) {
                if (path.contains("/active")) {
                    handleGetActiveRoadmap(exchange, userId);
                } else {
                    ResponseUtil.sendError(exchange, 404, "Endpoint not found");
                }
            } else if ("POST".equals(method)) {
                if (path.contains("/generate")) {
                    handleGenerateRoadmap(exchange, userId);
                } else if (path.contains("/complete-week")) {
                    handleCompleteWeek(exchange, userId);
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

    // Generate roadmap
    private void handleGenerateRoadmap(HttpExchange exchange, Long userId)
            throws IOException, SQLException {

        String body = RequestUtil.readRequestBody(exchange);
        JsonObject json = gson.fromJson(body, JsonObject.class);

        Long careerPathId = json.get("careerPathId").getAsLong();
        Roadmap roadmap = roadmapService.generateRoadmap(userId, careerPathId);

        ResponseUtil.sendSuccess(exchange, buildRoadmapJson(roadmap).toString());
    }

    // Get active roadmap
    private void handleGetActiveRoadmap(HttpExchange exchange, Long userId)
            throws IOException, SQLException {

        Optional<Roadmap> roadmapOpt = roadmapService.getActiveRoadmap(userId);

        if (roadmapOpt.isEmpty()) {
            ResponseUtil.sendError(exchange, 404, "No active roadmap found");
            return;
        }

        ResponseUtil.sendSuccess(exchange, buildRoadmapJson(roadmapOpt.get()).toString());
    }

    // Complete a week
    private void handleCompleteWeek(HttpExchange exchange, Long userId)
            throws IOException, SQLException {

        String body = RequestUtil.readRequestBody(exchange);
        JsonObject json = gson.fromJson(body, JsonObject.class);

        Long weekId = json.get("weekId").getAsLong();
        Roadmap roadmap = roadmapService.completeWeek(userId, weekId);

        ResponseUtil.sendSuccess(exchange, buildRoadmapJson(roadmap).toString());
    }

    // Build roadmap JSON response
    private JsonObject buildRoadmapJson(Roadmap roadmap) {
        JsonObject obj = new JsonObject();
        obj.addProperty("id", roadmap.getId());
        obj.addProperty("userId", roadmap.getUserId());
        obj.addProperty("strategy", roadmap.getStrategy().name());
        obj.addProperty("totalWeeks", roadmap.getTotalWeeks());
        obj.addProperty("currentWeek", roadmap.getCurrentWeek());
        obj.addProperty("completionPercentage", roadmap.getCompletionPercentage());
        obj.addProperty("isActive", roadmap.isActive());

        if (roadmap.getCareerPath() != null) {
            JsonObject cp = new JsonObject();
            cp.addProperty("id", roadmap.getCareerPath().getId());
            cp.addProperty("title", roadmap.getCareerPath().getTitle());
            cp.addProperty("category", roadmap.getCareerPath().getCategory().name());
            obj.add("careerPath", cp);
        }

        if (roadmap.getWeeks() != null) {
            JsonArray weeksArray = new JsonArray();
            for (RoadmapWeek week : roadmap.getWeeks()) {
                JsonObject w = new JsonObject();
                w.addProperty("id", week.getId());
                w.addProperty("weekNumber", week.getWeekNumber());
                w.addProperty("topic", week.getTopic());
                w.addProperty("description", week.getDescription());
                w.addProperty("resources", week.getResources());
                w.addProperty("isCompleted", week.isCompleted());
                weeksArray.add(w);
            }
            obj.add("weeks", weeksArray);
        }

        return obj;
    }
}