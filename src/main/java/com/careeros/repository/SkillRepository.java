package com.careeros.repository;

import com.careeros.model.Skill;
import com.careeros.util.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class SkillRepository {

    private final DatabaseManager dbManager = DatabaseManager.getInstance();

    // Get all skills
    public List<Skill> findAll() throws SQLException {
        String sql = "SELECT * FROM skills ORDER BY category, name";
        List<Skill> skills = new ArrayList<>();

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                skills.add(mapResultSetToSkill(rs));
            }
        }
        return skills;
    }

    // Get skills by user ID
    public List<Skill> findByUserId(Long userId) throws SQLException {
        String sql = "SELECT s.* FROM skills s " +
                    "JOIN user_skills us ON s.id = us.skill_id " +
                    "WHERE us.user_id = ?";
        List<Skill> skills = new ArrayList<>();

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, userId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    skills.add(mapResultSetToSkill(rs));
                }
            }
        }
        return skills;
    }

    // Get required skills for a career path
    public List<Skill> findByCareerPathId(Long careerPathId) throws SQLException {
        String sql = "SELECT s.* FROM skills s " +
                    "JOIN career_path_skills cps ON s.id = cps.skill_id " +
                    "WHERE cps.career_path_id = ? " +
                    "ORDER BY cps.priority_order";
        List<Skill> skills = new ArrayList<>();

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, careerPathId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    skills.add(mapResultSetToSkill(rs));
                }
            }
        }
        return skills;
    }

    // Add skill to user
    public boolean addUserSkill(Long userId, Long skillId, String proficiencyLevel) throws SQLException {
        String sql = "INSERT IGNORE INTO user_skills (user_id, skill_id, proficiency_level) " +
                    "VALUES (?, ?, ?)";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, userId);
            pstmt.setLong(2, skillId);
            pstmt.setString(3, proficiencyLevel);
            return pstmt.executeUpdate() > 0;
        }
    }

    // Find skill by name (case-insensitive: "react" matches "React")
    public Optional<Skill> findByName(String name) throws SQLException {
        String sql = "SELECT * FROM skills WHERE LOWER(name) = LOWER(?)";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, name);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToSkill(rs));
                }
            }
        }
        return Optional.empty();
    }

    // Create a new skill (for custom skills) — returns the new skill's id
    public Long createSkill(String name, String category) throws SQLException {
        String sql = "INSERT INTO skills (name, category) VALUES (?, ?)";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, name);
            pstmt.setString(2, category); // e.g. "OTHER"
            pstmt.executeUpdate();

            try (ResultSet keys = pstmt.getGeneratedKeys()) {
                if (keys.next()) {
                    return keys.getLong(1);
                }
            }
        }
        return null;
    }

    // Remove a skill from a user
    public boolean removeUserSkill(Long userId, Long skillId) throws SQLException {
        String sql = "DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, userId);
            pstmt.setLong(2, skillId);
            return pstmt.executeUpdate() > 0;
        }
    }

    // Helper
    private Skill mapResultSetToSkill(ResultSet rs) throws SQLException {
        Skill skill = new Skill();
        skill.setId(rs.getLong("id"));
        skill.setName(rs.getString("name"));
        skill.setCategory(Skill.Category.valueOf(rs.getString("category")));
        skill.setDescription(rs.getString("description"));
        skill.setIconUrl(rs.getString("icon_url"));
        return skill;
    }
}