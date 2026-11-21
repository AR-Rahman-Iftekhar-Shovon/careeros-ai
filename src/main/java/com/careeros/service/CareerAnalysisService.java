package com.careeros.service;

import com.careeros.model.CareerMatch;
import com.careeros.model.CareerPath;
import com.careeros.model.Skill;
import com.careeros.repository.CareerPathRepository;
import com.careeros.repository.SkillRepository;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class CareerAnalysisService {

    private final SkillRepository skillRepository;
    private final CareerPathRepository careerPathRepository;

    public CareerAnalysisService() {
        this.skillRepository = new SkillRepository();
        this.careerPathRepository = new CareerPathRepository();
    }

    /**
     * Analyze all career matches for a user
     */
    public List<CareerMatch> analyzeAllCareers(Long userId) throws SQLException {
        List<Skill> userSkills = skillRepository.findByUserId(userId);
        List<CareerPath> allPaths = careerPathRepository.findAll();
        List<CareerMatch> matches = new ArrayList<>();

        for (CareerPath path : allPaths) {
            CareerMatch match = analyzeCareerMatch(userId, path, userSkills);
            matches.add(match);

            // Save to database
            careerPathRepository.saveCareerMatch(
                userId,
                path.getId(),
                match.getMatchScore(),
                match.getConfidenceScore(),
                match.getMissingSkillsCount()
            );
        }

        // Sort by match score descending
        matches.sort(Comparator.comparingDouble(CareerMatch::getMatchScore).reversed());
        return matches;
    }

    /**
     * Analyze match for a specific career path
     */
    public CareerMatch analyzeCareerMatch(Long userId, CareerPath careerPath,
                                           List<Skill> userSkills) throws SQLException {
        List<Skill> requiredSkills = skillRepository.findByCareerPathId(careerPath.getId());

        if (requiredSkills.isEmpty()) {
            return new CareerMatch(userId, careerPath, 0.0, 0.0,
                    new ArrayList<>(), new ArrayList<>());
        }

        // Find matched and missing skills
        List<String> userSkillNames = userSkills.stream()
                .map(s -> s.getName().toLowerCase())
                .collect(Collectors.toList());

        List<Skill> matchedSkills = new ArrayList<>();
        List<Skill> missingSkills = new ArrayList<>();

        for (Skill required : requiredSkills) {
            if (userSkillNames.contains(required.getName().toLowerCase())) {
                matchedSkills.add(required);
            } else {
                missingSkills.add(required);
            }
        }

        // Calculate match score (0-100)
        double matchScore = ((double) matchedSkills.size() / requiredSkills.size()) * 100;

        // Calculate confidence score based on total skills user has
        double confidenceScore = calculateConfidenceScore(
                matchScore, userSkills.size(), requiredSkills.size()
        );

        return new CareerMatch(userId, careerPath,
                Math.round(matchScore * 100.0) / 100.0,
                Math.round(confidenceScore * 100.0) / 100.0,
                missingSkills, matchedSkills);
    }

    /**
     * Get skill gap for a specific career path
     */
    public List<Skill> getSkillGap(Long userId, Long careerPathId) throws SQLException {
        List<Skill> userSkills = skillRepository.findByUserId(userId);
        List<Skill> requiredSkills = skillRepository.findByCareerPathId(careerPathId);

        List<String> userSkillNames = userSkills.stream()
                .map(s -> s.getName().toLowerCase())
                .collect(Collectors.toList());

        return requiredSkills.stream()
                .filter(s -> !userSkillNames.contains(s.getName().toLowerCase()))
                .collect(Collectors.toList());
    }

    /**
     * Get top career match for a user
     */
    public CareerMatch getTopCareerMatch(Long userId) throws SQLException {
        List<CareerMatch> matches = analyzeAllCareers(userId);
        return matches.isEmpty() ? null : matches.get(0);
    }

    /**
     * Calculate confidence score
     */
    private double calculateConfidenceScore(double matchScore,
                                             int userSkillCount,
                                             int requiredSkillCount) {
        double baseConfidence = matchScore;

        // Boost confidence if user has more skills
        if (userSkillCount > requiredSkillCount) {
            baseConfidence = Math.min(100, baseConfidence + 10);
        }

        // Reduce confidence if user has very few skills
        if (userSkillCount < 3) {
            baseConfidence = baseConfidence * 0.8;
        }

        return Math.round(baseConfidence * 100.0) / 100.0;
    }
}