package com.careeros.api;


import com.careeros.controller.AuthController;
import com.careeros.controller.BurnoutController;
import com.careeros.controller.CareerController;
import com.careeros.controller.MentorController;
import com.careeros.controller.ProfileController;
import com.careeros.controller.RoadmapController;
import com.careeros.controller.SessionController;
import com.careeros.util.CorsUtil;
import com.careeros.util.DatabaseManager;
import com.careeros.util.ResponseUtil;
import com.sun.net.httpserver.HttpServer;


import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.Properties;
import java.util.logging.Logger;

public class ApiServer {

    private static final Logger logger = Logger.getLogger(ApiServer.class.getName());
    private HttpServer server;
    private final int port;

    public ApiServer() {
        Properties props = DatabaseManager.getInstance().getProperties();
        this.port = Integer.parseInt(props.getProperty("server.port", "8080"));
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        // ==================== CAREER ROUTES ====================
CareerController careerController = new CareerController();
server.createContext("/api/careers/analyze", careerController);
server.createContext("/api/careers/gap", careerController);
server.createContext("/api/careers/paths", careerController);
server.createContext("/api/careers/skills", careerController);
server.createContext("/api/careers/my-skills", careerController);
server.createContext("/api/careers/skills/add", careerController);

// ==================== ROADMAP ROUTES ====================
RoadmapController roadmapController = new RoadmapController();
server.createContext("/api/roadmaps/generate", roadmapController);
server.createContext("/api/roadmaps/active", roadmapController);
server.createContext("/api/roadmaps/complete-week", roadmapController);

// ==================== MENTOR ROUTES ====================
MentorController mentorController = new MentorController();
server.createContext("/api/mentor/analyze", mentorController);
server.createContext("/api/mentor/internship", mentorController);
server.createContext("/api/mentor/suggestion", mentorController);
server.createContext("/api/mentor/ask", mentorController);

        // Health Check
        server.createContext("/api/health", exchange -> {
            if (CorsUtil.handlePreflight(exchange)) return;
            ResponseUtil.sendSuccess(exchange,
                "{\"status\":\"UP\",\"app\":\"CareerOS AI\",\"version\":\"1.0\"}"
            );
        });

        // ==================== AUTH ROUTES ====================
        AuthController authController = new AuthController();
        server.createContext("/api/auth/register", authController);
        server.createContext("/api/auth/login", authController);

        // ==================== PROFILE ROUTES ====================
        ProfileController profileController = new ProfileController();
        server.createContext("/api/profile", profileController);

        // Placeholder routes
        server.createContext("/api/users", exchange -> {
            if (CorsUtil.handlePreflight(exchange)) return;
            ResponseUtil.sendSuccess(exchange, "{\"message\":\"Users endpoint - coming soon\"}");
        });

        server.createContext("/api/careers", exchange -> {
            if (CorsUtil.handlePreflight(exchange)) return;
            ResponseUtil.sendSuccess(exchange, "{\"message\":\"Careers endpoint - coming soon\"}");
        });

        // ==================== SESSION ROUTES  ====================
    SessionController sessionController = new SessionController();
    server.createContext("/api/sessions", sessionController);

// ==================== BURNOUT & MOMENTUM ROUTES    ====================
BurnoutController burnoutController = new BurnoutController();
server.createContext("/api/burnout", burnoutController);


        server.setExecutor(null);
        server.start();

        logger.info("CareerOS AI Server started on port: " + port);
        System.out.println("╔════════════════════════════════════════════════╗");
        System.out.println("║        CareerOS AI Server is Running           ║");
        System.out.println("╠════════════════════════════════════════════════╣");
        System.out.println("║  Health   : /api/health                        ║");
        System.out.println("║  Auth     : /api/auth/register, /login         ║");
        System.out.println("║  Profile  : /api/profile                       ║");
        System.out.println("║  Careers  : /api/careers/analyze               ║");
        System.out.println("║  Roadmap  : /api/roadmaps/generate             ║");
        System.out.println("║  Sessions : /api/sessions                      ║");
        System.out.println("║  Mentor   : /api/mentor/ask                    ║");
        System.out.println("╠════════════════════════════════════════════════╣");
        System.out.println("║  http://localhost:" + port + "/api/health              ║");
        System.out.println("╚════════════════════════════════════════════════╝");
    }
    public void stop() {
        if (server != null) {
            server.stop(0);
            logger.info("CareerOS AI Server stopped.");
        }
    }
}