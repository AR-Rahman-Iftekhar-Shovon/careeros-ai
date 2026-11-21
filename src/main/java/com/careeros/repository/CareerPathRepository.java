package com.careeros.repository;

import com.careeros.model.CareerPath;
import com.careeros.util.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class CareerPathRepository {

    private final DatabaseManager dbManager = DatabaseManager.getInstance();

    // Get all career paths
    public List<CareerPath> findAll() throws SQLException {
        String sql = "SELECT * FROM career_paths ORDER BY title";
        List<CareerPath> paths = new ArrayList<>();

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                paths.add(mapResultSetToCareerPath(rs));
            }
        }
        return paths;
    }

    // Find by ID
    public Optional<CareerPath> findById(Long id) throws SQLException {
        String sql = "SELECT * FROM career_paths WHERE id = ?";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToCareerPath(rs));
                }
            }
        }
        return Optional.empty();
    }

    // Find by title
    public Optional<CareerPath> findByTitle(String title) throws SQLException {
        String sql = "SELECT * FROM career_paths WHERE title = ?";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, title);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToCareerPath(rs));
                }
            }
        }
        return Optional.empty();
    }

    // Save career match result
    public void saveCareerMatch(Long userId, Long careerPathId,
                                 Double matchScore, Double confidenceScore,
                                 Integer missingSkillsCount) throws SQLException {
        String sql = "INSERT INTO career_matches " +
                    "(user_id, career_path_id, match_score, confidence_score, missing_skills_count) " +
                    "VALUES (?, ?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "match_score=VALUES(match_score), " +
                    "confidence_score=VALUES(confidence_score), " +
                    "missing_skills_count=VALUES(missing_skills_count), " +
                    "calculated_at=CURRENT_TIMESTAMP";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, userId);
            pstmt.setLong(2, careerPathId);
            pstmt.setDouble(3, matchScore);
            pstmt.setDouble(4, confidenceScore);
            pstmt.setInt(5, missingSkillsCount);
            pstmt.executeUpdate();
        }
    }

    // Helper
    private CareerPath mapResultSetToCareerPath(ResultSet rs) throws SQLException {
        CareerPath path = new CareerPath();
        path.setId(rs.getLong("id"));
        path.setTitle(rs.getString("title"));
        path.setDescription(rs.getString("description"));
        path.setCategory(CareerPath.Category.valueOf(rs.getString("category")));
        path.setAvgSalaryUsd(rs.getInt("avg_salary_usd"));
        path.setDemandLevel(CareerPath.DemandLevel.valueOf(rs.getString("demand_level")));
        return path;
    }
}