package com.careeros.controller;

import com.careeros.model.Profile;
import com.careeros.service.ProfileService;
import com.careeros.util.JwtUtil;
import com.careeros.util.RequestUtil;
import com.careeros.util.ResponseUtil;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.SQLException;

public class ProfileController implements HttpHandler {

    private final ProfileService profileService;
    private final Gson gson;

    public ProfileController() {
        this.profileService = new ProfileService();
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
        String path = exchange.getRequestURI().getPath();

        try {
            // Extract userId from JWT Token
            String token = RequestUtil.getAuthToken(exchange);
            if (token == null || !JwtUtil.isTokenValid(token)) {
                ResponseUtil.sendError(exchange, 401, "Unauthorized - Invalid or missing token");
                return;
            }

            Long userId = JwtUtil.getUserIdFromToken(token);

            if ("GET".equals(method)) {
                handleGetProfile(exchange, userId);
            } else if ("POST".equals(method) || "PUT".equals(method)) {
                handleUpdateProfile(exchange, userId);
            } else {
                ResponseUtil.sendError(exchange, 405, "Method not allowed");
            }
        } catch (SQLException e) {
            ResponseUtil.sendError(exchange, 500, "Database error: " + e.getMessage());
        } catch (Exception e) {
            ResponseUtil.sendError(exchange, 400, e.getMessage());
        }
    }

    private void handleGetProfile(HttpExchange exchange, Long userId) throws IOException, SQLException {
        Profile profile = profileService.getProfileByUserId(userId).orElse(new Profile());
        profile.setUserId(userId); // Ensure userId is set

        ResponseUtil.sendSuccess(exchange, gson.toJson(profile));
    }

    private void handleUpdateProfile(HttpExchange exchange, Long userId) throws IOException, SQLException {
        String body = RequestUtil.readRequestBody(exchange);
        JsonObject json = gson.fromJson(body, JsonObject.class);

        Profile profile = new Profile();
        profile.setUserId(userId);

        // Safe field mapping
        if (json.has("age")) profile.setAge(json.get("age").getAsInt());
        if (json.has("phone")) profile.setPhone(json.get("phone").getAsString());
        if (json.has("location")) profile.setLocation(json.get("location").getAsString());
        if (json.has("educationLevel")) profile.setEducationLevel(json.get("educationLevel").getAsString());
        if (json.has("institution")) profile.setInstitution(json.get("institution").getAsString());
        if (json.has("graduationYear")) profile.setGraduationYear(json.get("graduationYear").getAsInt());
        if (json.has("bio")) profile.setBio(json.get("bio").getAsString());
        if (json.has("dailyStudyHours")) profile.setDailyStudyHours(json.get("dailyStudyHours").getAsDouble());
        if (json.has("careerGoal")) profile.setCareerGoal(json.get("careerGoal").getAsString());
        if (json.has("experienceYears")) profile.setExperienceYears(json.get("experienceYears").getAsInt());
        if (json.has("linkedinUrl")) profile.setLinkedinUrl(json.get("linkedinUrl").getAsString());
        if (json.has("githubUrl")) profile.setGithubUrl(json.get("githubUrl").getAsString());
        if (json.has("portfolioUrl")) profile.setPortfolioUrl(json.get("portfolioUrl").getAsString());

        Profile updatedProfile = profileService.saveProfile(profile);

        ResponseUtil.sendSuccess(exchange, gson.toJson(updatedProfile));
    }
}