package com.careeros.controller;

import com.careeros.model.MomentumScore;
import com.careeros.service.BurnoutService;
import com.careeros.util.JwtUtil;
import com.careeros.util.RequestUtil;
import com.careeros.util.ResponseUtil;
import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.SQLException;

public class BurnoutController implements HttpHandler {

    private final BurnoutService burnoutService;
    private final Gson gson;

    public BurnoutController() {
        this.burnoutService = new BurnoutService();
        this.gson = new Gson();
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

            if ("GET".equals(method)) {
                handleGetBurnoutStatus(exchange, userId);
            } else {
                ResponseUtil.sendError(exchange, 405, "Method not allowed");
            }
        } catch (SQLException e) {
            ResponseUtil.sendError(exchange, 500, "Database error");
        } catch (Exception e) {
            ResponseUtil.sendError(exchange, 400, e.getMessage());
        }
    }

    private void handleGetBurnoutStatus(HttpExchange exchange, Long userId) throws IOException, SQLException {
        MomentumScore momentum = burnoutService.calculateMomentumAndBurnout(userId);
        String honestMirror = burnoutService.getHonestMirror(userId);

        // Build response
        String response = "{" +
                "\"momentumScore\":" + momentum.getScore() + "," +
                "\"consistencyRate\":" + momentum.getConsistencyRate() + "," +
                "\"currentStreak\":" + momentum.getCurrentStreak() + "," +
                "\"burnoutRisk\":\"" + momentum.getBurnoutRisk() + "\"," +
                "\"cognitiveType\":\"" + momentum.getCognitiveType() + "\"," +
                "\"honestMirror\":\"" + honestMirror + "\"" +
                "}";

        ResponseUtil.sendSuccess(exchange, response);
    }
}