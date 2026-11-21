package com.careeros.repository;

import com.careeros.model.Roadmap;
import com.careeros.model.RoadmapWeek;
import com.careeros.util.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class RoadmapRepository {

    private final DatabaseManager dbManager = DatabaseManager.getInstance();

    // Save roadmap
    public Roadmap save(Roadmap roadmap) throws SQLException {
        String sql = "INSERT INTO roadmaps (user_id, career_path_id, strategy, total_weeks, " +
                    "current_week, completion_percentage, is_active) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setLong(1, roadmap.getUserId());
            pstmt.setLong(2, roadmap.getCareerPath().getId());
            pstmt.setString(3, roadmap.getStrategy().name());
            pstmt.setInt(4, roadmap.getTotalWeeks());
            pstmt.setInt(5, roadmap.getCurrentWeek());
            pstmt.setDouble(6, roadmap.getCompletionPercentage());
            pstmt.setBoolean(7, roadmap.isActive());

            pstmt.executeUpdate();

            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    roadmap.setId(rs.getLong(1));
                }
            }
        }
        return roadmap;
    }

    // Save roadmap weeks
    public void saveWeeks(List<RoadmapWeek> weeks) throws SQLException {
        String sql = "INSERT INTO roadmap_weeks (roadmap_id, week_number, topic, " +
                    "description, resources, is_completed) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            for (RoadmapWeek week : weeks) {
                pstmt.setLong(1, week.getRoadmapId());
                pstmt.setInt(2, week.getWeekNumber());
                pstmt.setString(3, week.getTopic());
                pstmt.setString(4, week.getDescription());
                pstmt.setString(5, week.getResources());
                pstmt.setBoolean(6, week.isCompleted());
                pstmt.addBatch();
            }
            pstmt.executeBatch();
        }
    }

    // Find active roadmap by user ID
    public Optional<Roadmap> findActiveByUserId(Long userId) throws SQLException {
        String sql = "SELECT r.*, cp.id as cp_id, cp.title, cp.description, " +
                    "cp.category, cp.avg_salary_usd, cp.demand_level " +
                    "FROM roadmaps r " +
                    "JOIN career_paths cp ON r.career_path_id = cp.id " +
                    "WHERE r.user_id = ? AND r.is_active = TRUE " +
                    "ORDER BY r.created_at DESC LIMIT 1";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, userId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToRoadmap(rs));
                }
            }
        }
        return Optional.empty();
    }

    // Find weeks by roadmap ID
    public List<RoadmapWeek> findWeeksByRoadmapId(Long roadmapId) throws SQLException {
        String sql = "SELECT * FROM roadmap_weeks WHERE roadmap_id = ? " +
                    "ORDER BY week_number";
        List<RoadmapWeek> weeks = new ArrayList<>();

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, roadmapId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    weeks.add(mapResultSetToWeek(rs));
                }
            }
        }
        return weeks;
    }

    // Mark week as complete
    public boolean completeWeek(Long weekId) throws SQLException {
        String sql = "UPDATE roadmap_weeks SET is_completed = TRUE, " +
                    "completed_at = CURRENT_TIMESTAMP WHERE id = ?";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, weekId);
            return pstmt.executeUpdate() > 0;
        }
    }

    // Update completion percentage
    public boolean updateCompletion(Long roadmapId, Double percentage,
                                     Integer currentWeek) throws SQLException {
        String sql = "UPDATE roadmaps SET completion_percentage = ?, " +
                    "current_week = ? WHERE id = ?";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setDouble(1, percentage);
            pstmt.setInt(2, currentWeek);
            pstmt.setLong(3, roadmapId);
            return pstmt.executeUpdate() > 0;
        }
    }

    // Deactivate old roadmaps
    public void deactivateUserRoadmaps(Long userId) throws SQLException {
        String sql = "UPDATE roadmaps SET is_active = FALSE WHERE user_id = ?";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, userId);
            pstmt.executeUpdate();
        }
    }

    // Helper — map roadmap
    private Roadmap mapResultSetToRoadmap(ResultSet rs) throws SQLException {
        Roadmap roadmap = new Roadmap();
        roadmap.setId(rs.getLong("id"));
        roadmap.setUserId(rs.getLong("user_id"));
        roadmap.setStrategy(Roadmap.Strategy.valueOf(rs.getString("strategy")));
        roadmap.setTotalWeeks(rs.getInt("total_weeks"));
        roadmap.setCurrentWeek(rs.getInt("current_week"));
        roadmap.setCompletionPercentage(rs.getDouble("completion_percentage"));
        roadmap.setActive(rs.getBoolean("is_active"));

        com.careeros.model.CareerPath cp = new com.careeros.model.CareerPath();
        cp.setId(rs.getLong("cp_id"));
        cp.setTitle(rs.getString("title"));
        cp.setDescription(rs.getString("description"));
        cp.setCategory(com.careeros.model.CareerPath.Category.valueOf(rs.getString("category")));
        cp.setAvgSalaryUsd(rs.getInt("avg_salary_usd"));
        cp.setDemandLevel(com.careeros.model.CareerPath.DemandLevel.valueOf(rs.getString("demand_level")));
        roadmap.setCareerPath(cp);

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) roadmap.setCreatedAt(createdAt.toLocalDateTime());

        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) roadmap.setUpdatedAt(updatedAt.toLocalDateTime());

        return roadmap;
    }

    // Helper — map week
    private RoadmapWeek mapResultSetToWeek(ResultSet rs) throws SQLException {
        RoadmapWeek week = new RoadmapWeek();
        week.setId(rs.getLong("id"));
        week.setRoadmapId(rs.getLong("roadmap_id"));
        week.setWeekNumber(rs.getInt("week_number"));
        week.setTopic(rs.getString("topic"));
        week.setDescription(rs.getString("description"));
        week.setResources(rs.getString("resources"));
        week.setCompleted(rs.getBoolean("is_completed"));

        Timestamp completedAt = rs.getTimestamp("completed_at");
        if (completedAt != null) week.setCompletedAt(completedAt.toLocalDateTime());

        return week;
    }
}