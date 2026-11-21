package com.careeros.repository;

import com.careeros.model.Session;
import com.careeros.util.DatabaseManager;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SessionRepository {

    private final DatabaseManager dbManager = DatabaseManager.getInstance();

    // Save new session
    public Session save(Session session) throws SQLException {
        String sql = "INSERT INTO sessions (user_id, topic, duration_minutes, mood, " +
                    "productivity_score, notes, session_date) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setLong(1, session.getUserId());
            pstmt.setString(2, session.getTopic());
            pstmt.setInt(3, session.getDurationMinutes());
            pstmt.setString(4, session.getMood() != null ? session.getMood().name() : "GOOD");
            pstmt.setInt(5, session.getProductivityScore());
            pstmt.setString(6, session.getNotes());
            pstmt.setDate(7, Date.valueOf(session.getSessionDate()));

            pstmt.executeUpdate();

            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    session.setId(rs.getLong(1));
                }
            }
            return session;
        }
    }

    // Get recent sessions for a user
    public List<Session> findRecentByUserId(Long userId, int limit) throws SQLException {
        String sql = "SELECT * FROM sessions WHERE user_id = ? " +
                    "ORDER BY session_date DESC, created_at DESC LIMIT ?";

        List<Session> sessions = new ArrayList<>();

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, userId);
            pstmt.setInt(2, limit);

            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    sessions.add(mapResultSetToSession(rs));
                }
            }
        }
        return sessions;
    }

    // Helper method
    private Session mapResultSetToSession(ResultSet rs) throws SQLException {
        Session session = new Session();
        session.setId(rs.getLong("id"));
        session.setUserId(rs.getLong("user_id"));
        session.setTopic(rs.getString("topic"));
        session.setDurationMinutes(rs.getInt("duration_minutes"));
        session.setMood(Session.Mood.valueOf(rs.getString("mood")));
        session.setProductivityScore(rs.getInt("productivity_score"));
        session.setNotes(rs.getString("notes"));
        session.setSessionDate(rs.getDate("session_date").toLocalDate());
        session.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return session;
    }
}