package com.careeros.controller;

import com.careeros.model.CareerMatch;
import com.careeros.model.CareerPath;
import com.careeros.model.Skill;
import com.careeros.service.CareerAnalysisService;
import com.careeros.repository.CareerPathRepository;
import com.careeros.repository.SkillRepository;
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
import java.util.List;

public class CareerController implements HttpHandler {

    private final CareerAnalysisService careerAnalysisService;
    private final CareerPathRepository careerPathRepository;
    private final SkillRepository skillRepository;
    private final Gson gson;

    public CareerController() {
        this.careerAnalysisService = new CareerAnalysisService();
        this.careerPathRepository = new CareerPathRepository();
        this.skillRepository = new SkillRepository();
        this.gson = new Gson();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (com.careeros.util.CorsUtil.handlePreflight(exchange)) return;

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
                if (path.contains("/analyze")) {
                    handleAnalyze(exchange, userId);
                } else if (path.contains("/gap")) {
                    handleSkillGap(exchange, userId);
                } else if (path.contains("/paths")) {
                    handleGetAllPaths(exchange);
                } else if (path.contains("/my-skills")) {
                    // NOTE: must be checked BEFORE "/skills" (substring overlap risk)
                    handleGetUserSkills(exchange, userId);
                } else if (path.contains("/skills")) {
                    handleGetAllSkills(exchange);
                } else {
                    ResponseUtil.sendError(exchange, 404, "Endpoint not found");
                }
            } else if ("POST".equals(method)) {
                if (path.contains("/skills/add")) {
                    handleAddSkill(exchange, userId);
                } else if (path.contains("/skills/remove")) {
                    handleRemoveSkill(exchange, userId);
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

    // Analyze all career matches
    private void handleAnalyze(HttpExchange exchange, Long userId)
            throws IOException, SQLException {

        List<CareerMatch> matches = careerAnalysisService.analyzeAllCareers(userId);

        JsonArray array = new JsonArray();
        for (CareerMatch match : matches) {
            JsonObject obj = new JsonObject();
            obj.addProperty("careerTitle", match.getCareerPath().getTitle());
            obj.addProperty("careerCategory", match.getCareerPath().getCategory().name());
            obj.addProperty("matchScore", match.getMatchScore());
            obj.addProperty("confidenceScore", match.getConfidenceScore());
            obj.addProperty("missingSkillsCount", match.getMissingSkillsCount());
            obj.addProperty("avgSalary", match.getCareerPath().getAvgSalaryUsd());
            obj.addProperty("demandLevel", match.getCareerPath().getDemandLevel().name());

            JsonArray missingArray = new JsonArray();
            if (match.getMissingSkills() != null) {
                match.getMissingSkills().forEach(s -> missingArray.add(s.getName()));
            }
            obj.add("missingSkills", missingArray);

            JsonArray matchedArray = new JsonArray();
            if (match.getMatchedSkills() != null) {
                match.getMatchedSkills().forEach(s -> matchedArray.add(s.getName()));
            }
            obj.add("matchedSkills", matchedArray);

            array.add(obj);
        }

        ResponseUtil.sendSuccess(exchange, array.toString());
    }

    // Get skill gap for a specific career
    private void handleSkillGap(HttpExchange exchange, Long userId)
            throws IOException, SQLException {

        var params = RequestUtil.parseQueryParams(exchange);
        String careerIdStr = params.get("careerId");

        if (careerIdStr == null) {
            ResponseUtil.sendError(exchange, 400, "careerId is required");
            return;
        }

        Long careerId = Long.parseLong(careerIdStr);
        List<Skill> gap = careerAnalysisService.getSkillGap(userId, careerId);

        JsonArray array = new JsonArray();
        for (Skill skill : gap) {
            JsonObject obj = new JsonObject();
            obj.addProperty("id", skill.getId());
            obj.addProperty("name", skill.getName());
            obj.addProperty("category", skill.getCategory().name());
            array.add(obj);
        }

        ResponseUtil.sendSuccess(exchange, array.toString());
    }

    // Get all career paths
    private void handleGetAllPaths(HttpExchange exchange)
            throws IOException, SQLException {

        List<CareerPath> paths = careerPathRepository.findAll();
        JsonArray array = new JsonArray();
        for (CareerPath path : paths) {
            JsonObject obj = new JsonObject();
            obj.addProperty("id", path.getId());
            obj.addProperty("title", path.getTitle());
            obj.addProperty("description", path.getDescription());
            obj.addProperty("category", path.getCategory().name());
            obj.addProperty("avgSalary", path.getAvgSalaryUsd());
            obj.addProperty("demandLevel", path.getDemandLevel().name());
            array.add(obj);
        }
        ResponseUtil.sendSuccess(exchange, array.toString());
    }

    // Get all skills
    private void handleGetAllSkills(HttpExchange exchange)
            throws IOException, SQLException {

        List<Skill> skills = skillRepository.findAll();
        JsonArray array = new JsonArray();
        for (Skill skill : skills) {
            JsonObject obj = new JsonObject();
            obj.addProperty("id", skill.getId());
            obj.addProperty("name", skill.getName());
            obj.addProperty("category", skill.getCategory().name());
            array.add(obj);
        }
        ResponseUtil.sendSuccess(exchange, array.toString());
    }

    // Get user skills
    private void handleGetUserSkills(HttpExchange exchange, Long userId)
            throws IOException, SQLException {

        List<Skill> skills = skillRepository.findByUserId(userId);
        JsonArray array = new JsonArray();
        for (Skill skill : skills) {
            JsonObject obj = new JsonObject();
            obj.addProperty("id", skill.getId());
            obj.addProperty("name", skill.getName());
            obj.addProperty("category", skill.getCategory().name());
            array.add(obj);
        }
        ResponseUtil.sendSuccess(exchange, array.toString());
    }

    // Add skill to user (accepts skillId OR skillName; creates skill if new)
    private void handleAddSkill(HttpExchange exchange, Long userId)
            throws IOException, SQLException {

        String body = RequestUtil.readRequestBody(exchange);
        JsonObject json = gson.fromJson(body, JsonObject.class);

        Long skillId = null;

        if (json.has("skillId") && !json.get("skillId").isJsonNull()) {
            skillId = json.get("skillId").getAsLong();
        } else if (json.has("skillName") && !json.get("skillName").isJsonNull()) {
            String skillName = json.get("skillName").getAsString().trim();
            if (skillName.isEmpty()) {
                ResponseUtil.sendError(exchange, 400, "skillName cannot be empty");
                return;
            }
            // Find existing skill by name, otherwise create it (find-or-create)
            Skill existing = skillRepository.findByName(skillName).orElse(null);
            skillId = (existing != null)
                    ? existing.getId()
                    : skillRepository.createSkill(skillName, "OTHER");
        }

        if (skillId == null) {
            ResponseUtil.sendError(exchange, 400, "skillId or skillName is required");
            return;
        }

        String proficiencyLevel = json.has("proficiencyLevel")
                ? json.get("proficiencyLevel").getAsString()
                : "BEGINNER";

        boolean added = skillRepository.addUserSkill(userId, skillId, proficiencyLevel);

        if (added) {
            ResponseUtil.sendSuccess(exchange, "{\"message\":\"Skill added successfully\"}");
        } else {
            ResponseUtil.sendError(exchange, 400, "Skill already exists or invalid");
        }
    }

    // Remove skill from user
    private void handleRemoveSkill(HttpExchange exchange, Long userId)
            throws IOException, SQLException {

        String body = RequestUtil.readRequestBody(exchange);
        JsonObject json = gson.fromJson(body, JsonObject.class);

        if (!json.has("skillId") || json.get("skillId").isJsonNull()) {
            ResponseUtil.sendError(exchange, 400, "skillId is required");
            return;
        }

        Long skillId = json.get("skillId").getAsLong();
        boolean removed = skillRepository.removeUserSkill(userId, skillId);

        if (removed) {
            ResponseUtil.sendSuccess(exchange, "{\"message\":\"Skill removed successfully\"}");
        } else {
            ResponseUtil.sendError(exchange, 404, "Skill not found for this user");
        }
    }
}