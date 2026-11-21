package com.careeros.service;

import com.careeros.model.MomentumScore;
import com.careeros.model.Session;
import com.careeros.repository.SessionRepository;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

public class BurnoutService {

    private final SessionRepository sessionRepository;
    private final SessionService sessionService;

    public BurnoutService() {
        this.sessionRepository = new SessionRepository();
        this.sessionService = new SessionService();
    }

    /**
     * Full Burnout & Momentum Analysis
     */
    public MomentumScore calculateMomentumAndBurnout(Long userId) throws SQLException {
        MomentumScore ms = new MomentumScore();
        ms.setUserId(userId);

        List<Session> last7Days = sessionRepository.findRecentByUserId(userId, 7);
        List<Session> last30Days = sessionRepository.findRecentByUserId(userId, 30);

        double momentum = sessionService.calculateMomentumScore(userId);
        String cognitiveType = sessionService.detectCognitiveType(userId);

        ms.setScore(momentum);
        ms.setCognitiveType(cognitiveType);
        ms.setConsistencyRate(calculateConsistencyRate(last30Days));
        ms.setCurrentStreak(calculateCurrentStreak(last7Days));
        ms.setBurnoutRisk(calculateBurnoutRisk(last7Days, momentum));

        return ms;
    }

    private MomentumScore.BurnoutRisk calculateBurnoutRisk(List<Session> last7Days, double momentum) {
        int sessionCount = last7Days.size();
        long tiredCount = last7Days.stream()
                .filter(s -> s.getMood() == Session.Mood.TIRED || s.getMood() == Session.Mood.STRESSED)
                .count();

        if (sessionCount < 3 || momentum < 35 || tiredCount >= 3) {
            return MomentumScore.BurnoutRisk.HIGH;
        } else if (sessionCount < 5 || momentum < 55) {
            return MomentumScore.BurnoutRisk.MEDIUM;
        }
        return MomentumScore.BurnoutRisk.LOW;
    }

    private double calculateConsistencyRate(List<Session> sessions) {
        if (sessions.isEmpty()) return 0.0;
        return Math.min(100.0, (sessions.size() / 30.0) * 100);
    }

    private int calculateCurrentStreak(List<Session> last7Days) {
        // Simple streak logic - can be improved later
        return last7Days.size() >= 3 ? 5 : last7Days.size();
    }

    /**
     * Honest Mirror - Career Readiness
     */
    public String getHonestMirror(Long userId) throws SQLException {
        double momentum = sessionService.calculateMomentumScore(userId);
        // You can integrate CareerAnalysisService later for more accuracy
        double readiness = Math.min(100, momentum * 0.85);

        String message;
        if (readiness >= 75) {
            message = "You are performing excellently. Ready for real opportunities!";
        } else if (readiness >= 50) {
            message = "Good progress. Keep consistency and you will reach soon.";
        } else {
            message = "You need more consistent effort. Focus on daily sessions.";
        }

        return String.format("Current Readiness: %.0f%% — %s", readiness, message);
    }

    /**
     * Career Simulator (Estimated Months)
     */
    public String simulateCareerProgress(Long userId, double dailyHours) throws SQLException {
        double momentum = sessionService.calculateMomentumScore(userId);
        double baseMonths = 18; // Average for target career

        double adjustedMonths = baseMonths * (2.0 / (dailyHours + 1)) * (80 / momentum);

        return String.format("At current pace (%d hours/day): %.1f months to job-ready.", 
                (int) dailyHours, adjustedMonths);
    }
}