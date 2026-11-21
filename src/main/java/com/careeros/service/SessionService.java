package com.careeros.service;

import com.careeros.model.Session;
import com.careeros.repository.SessionRepository;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

public class SessionService {

    private final SessionRepository sessionRepository;

    public SessionService() {
        this.sessionRepository = new SessionRepository();
    }

    /**
     * Save Session + Calculate Momentum
     */
    public Session saveSession(Session session) throws SQLException {
        if (session.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        // Auto set productivity score based on mood
        if (session.getProductivityScore() == null || session.getProductivityScore() == 50) {
            session.setProductivityScore(calculateProductivityFromMood(session.getMood()));
        }

        Session saved = sessionRepository.save(session);
        System.out.println("✅ Session saved for user " + session.getUserId());
        return saved;
    }

    /**
     * Calculate Momentum Score (0-100)
     */
    public double calculateMomentumScore(Long userId) throws SQLException {
        List<Session> recentSessions = sessionRepository.findRecentByUserId(userId, 14); // Last 14 days

        if (recentSessions.isEmpty()) {
            return 50.0;
        }

        double totalProductivity = 0;
        int totalDuration = 0;
        int streak = 0;
        LocalDate lastDate = null;

        for (Session s : recentSessions) {
            totalProductivity += s.getProductivityScore();
            totalDuration += s.getDurationMinutes();

            // Simple streak calculation
            if (lastDate == null || lastDate.minusDays(1).equals(s.getSessionDate())) {
                streak++;
            }
            lastDate = s.getSessionDate();
        }

        double avgProductivity = totalProductivity / recentSessions.size();
        double consistency = (streak / 7.0) * 100; // Weekly consistency

        // Final Momentum Formula (Weighted)
        double momentum = (avgProductivity * 0.6) + (consistency * 0.3) + 
                         (Math.min(totalDuration / 60.0, 100) * 0.1);

        return Math.min(100.0, Math.max(0.0, momentum));
    }

    /**
     * Simple Cognitive Fingerprint Detection
     */
    public String detectCognitiveType(Long userId) throws SQLException {
        List<Session> sessions = sessionRepository.findRecentByUserId(userId, 30);

        if (sessions.size() < 5) {
            return "CONSISTENT";
        }

        int highProductivityCount = 0;
        int longSessions = 0;

        for (Session s : sessions) {
            if (s.getProductivityScore() >= 75) highProductivityCount++;
            if (s.getDurationMinutes() >= 90) longSessions++;
        }

        double highRate = (double) highProductivityCount / sessions.size();

        if (highRate > 0.6) return "FAST";
        if (longSessions > sessions.size() * 0.4) return "DEEP";
        if (highRate > 0.4) return "VISUAL";

        return "CONSISTENT";
    }

    private int calculateProductivityFromMood(Session.Mood mood) {
        if (mood == null) return 50;
        return switch (mood) {
            case GREAT -> 90;
            case GOOD -> 75;
            case NEUTRAL -> 60;
            case TIRED -> 40;
            case STRESSED -> 30;
        };
    }
}