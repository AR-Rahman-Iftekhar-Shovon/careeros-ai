package com.careeros.repository;

import com.careeros.model.Profile;
import com.careeros.util.DatabaseManager;
import java.sql.*;
import java.util.Optional;

public class ProfileRepository {

    private final DatabaseManager dbManager = DatabaseManager.getInstance();

    // Create or Update Profile (Upsert)
    public Profile save(Profile profile) throws SQLException {
        String sql = "INSERT INTO profiles (user_id, age, phone, location, education_level, " +
                    "institution, graduation_year, bio, avatar_url, daily_study_hours, " +
                    "career_goal, experience_years, linkedin_url, github_url, portfolio_url) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "age=VALUES(age), phone=VALUES(phone), location=VALUES(location), " +
                    "education_level=VALUES(education_level), institution=VALUES(institution), " +
                    "graduation_year=VALUES(graduation_year), bio=VALUES(bio), " +
                    "avatar_url=VALUES(avatar_url), daily_study_hours=VALUES(daily_study_hours), " +
                    "career_goal=VALUES(career_goal), experience_years=VALUES(experience_years), " +
                    "linkedin_url=VALUES(linkedin_url), github_url=VALUES(github_url), " +
                    "portfolio_url=VALUES(portfolio_url)";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setLong(1, profile.getUserId());
            pstmt.setObject(2, profile.getAge());
            pstmt.setString(3, profile.getPhone());
            pstmt.setString(4, profile.getLocation());
            pstmt.setString(5, profile.getEducationLevel());
            pstmt.setString(6, profile.getInstitution());
            pstmt.setObject(7, profile.getGraduationYear());
            pstmt.setString(8, profile.getBio());
            pstmt.setString(9, profile.getAvatarUrl());
            pstmt.setDouble(10, profile.getDailyStudyHours());
            pstmt.setString(11, profile.getCareerGoal());
            pstmt.setObject(12, profile.getExperienceYears());
            pstmt.setString(13, profile.getLinkedinUrl());
            pstmt.setString(14, profile.getGithubUrl());
            pstmt.setString(15, profile.getPortfolioUrl());

            pstmt.executeUpdate();

            // Get the profile after save
            return findByUserId(profile.getUserId()).orElse(profile);
        }
    }

    // Find Profile by User ID
    public Optional<Profile> findByUserId(Long userId) throws SQLException {
        String sql = "SELECT * FROM profiles WHERE user_id = ?";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, userId);

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToProfile(rs));
                }
            }
        }
        return Optional.empty();
    }

    // Helper method
    private Profile mapResultSetToProfile(ResultSet rs) throws SQLException {
        Profile profile = new Profile();
        profile.setId(rs.getLong("id"));
        profile.setUserId(rs.getLong("user_id"));
        profile.setAge(rs.getObject("age", Integer.class));
        profile.setPhone(rs.getString("phone"));
        profile.setLocation(rs.getString("location"));
        profile.setEducationLevel(rs.getString("education_level"));
        profile.setInstitution(rs.getString("institution"));
        profile.setGraduationYear(rs.getObject("graduation_year", Integer.class));
        profile.setBio(rs.getString("bio"));
        profile.setAvatarUrl(rs.getString("avatar_url"));
        profile.setDailyStudyHours(rs.getDouble("daily_study_hours"));
        profile.setCareerGoal(rs.getString("career_goal"));
        profile.setExperienceYears(rs.getObject("experience_years", Integer.class));
        profile.setLinkedinUrl(rs.getString("linkedin_url"));
        profile.setGithubUrl(rs.getString("github_url"));
        profile.setPortfolioUrl(rs.getString("portfolio_url"));
        profile.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        profile.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        return profile;
    }
}