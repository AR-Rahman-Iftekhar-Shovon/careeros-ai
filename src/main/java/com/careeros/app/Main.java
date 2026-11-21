package com.careeros.app;
//mvn compile exec:java -Dexec.mainClass="com.careeros.app.Main"
import com.careeros.api.ApiServer;
import com.careeros.util.DatabaseManager;
import java.sql.Connection;
import java.sql.SQLException;

public class Main {
    public static void main(String[] args) {
        System.out.println("╔═══════════════════════════════════╗");
        System.out.println("║       CareerOS AI — Starting      ║");
        System.out.println("╚═══════════════════════════════════╝");

        // Test Database Connection
        DatabaseManager dbManager = DatabaseManager.getInstance();

        try (Connection connection = dbManager.getConnection()) {
            if (connection != null) {
                System.out.println(" Database connected successfully!");
            }
        } catch (SQLException e) {
            System.out.println(" Database connection failed: " + e.getMessage());
            return;
        }

        // Start API Server
        try {
            ApiServer server = new ApiServer();
            server.start();

            // Keep server running
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println(" Shutting down CareerOS AI...");
                server.stop();
            }));

        } catch (Exception e) {
            System.out.println(" Server failed to start: " + e.getMessage());
        }
    }
}