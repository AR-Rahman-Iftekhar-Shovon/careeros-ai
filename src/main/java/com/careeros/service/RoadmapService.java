package com.careeros.service;

import com.careeros.ai.RoadmapStrategy;
import com.careeros.ai.RoadmapStrategyFactory;
import com.careeros.model.CareerPath;
import com.careeros.model.Roadmap;
import com.careeros.model.RoadmapWeek;
import com.careeros.model.Skill;
import com.careeros.repository.CareerPathRepository;
import com.careeros.repository.ProfileRepository;
import com.careeros.repository.RoadmapRepository;
import com.careeros.service.CareerAnalysisService;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class RoadmapService {

    private final RoadmapRepository roadmapRepository;
    private final CareerPathRepository careerPathRepository;
    private final CareerAnalysisService careerAnalysisService;
    private final ProfileRepository profileRepository;

    public RoadmapService() {
        this.roadmapRepository = new RoadmapRepository();
        this.careerPathRepository = new CareerPathRepository();
        this.careerAnalysisService = new CareerAnalysisService();
        this.profileRepository = new ProfileRepository();
    }

    /**
     * Generate a new roadmap for user
     */
    public Roadmap generateRoadmap(Long userId, Long careerPathId) throws SQLException {

        // Get career path
        CareerPath careerPath = careerPathRepository.findById(careerPathId)
                .orElseThrow(() -> new IllegalArgumentException("Career path not found"));

        // Get daily study hours from profile
        Double dailyHours = profileRepository.findByUserId(userId)
                .map(p -> p.getDailyStudyHours())
                .orElse(2.0);

        // Select strategy based on daily hours
        Roadmap.Strategy strategyType = RoadmapStrategyFactory.determineStrategy(dailyHours);
        RoadmapStrategy strategy = RoadmapStrategyFactory.createStrategy(strategyType);

        // Get missing skills
        List<Skill> missingSkills = careerAnalysisService.getSkillGap(userId, careerPathId);

        // Deactivate old roadmaps
        roadmapRepository.deactivateUserRoadmaps(userId);

        // Build roadmap
        Roadmap roadmap = new Roadmap();
        roadmap.setUserId(userId);
        roadmap.setCareerPath(careerPath);
        roadmap.setStrategy(strategyType);
        roadmap.setTotalWeeks(strategy.calculateTotalWeeks(missingSkills));
        roadmap.setCurrentWeek(1);
        roadmap.setCompletionPercentage(0.0);
        roadmap.setActive(true);

        // Save roadmap
        Roadmap savedRoadmap = roadmapRepository.save(roadmap);

        // Generate and save weeks
        List<RoadmapWeek> weeks = strategy.generateWeeks(missingSkills, savedRoadmap.getId());
        roadmapRepository.saveWeeks(weeks);
        savedRoadmap.setWeeks(weeks);

        System.out.println("Roadmap generated for user " + userId +
                " | Strategy: " + strategyType +
                " | Weeks: " + savedRoadmap.getTotalWeeks());

        return savedRoadmap;
    }

    /**
     * Get active roadmap with weeks
     */
    public Optional<Roadmap> getActiveRoadmap(Long userId) throws SQLException {
        Optional<Roadmap> roadmapOpt = roadmapRepository.findActiveByUserId(userId);

        if (roadmapOpt.isPresent()) {
            Roadmap roadmap = roadmapOpt.get();
            List<RoadmapWeek> weeks = roadmapRepository.findWeeksByRoadmapId(roadmap.getId());
            roadmap.setWeeks(weeks);
            return Optional.of(roadmap);
        }

        return Optional.empty();
    }

    /**
     * Mark a week as complete
     */
    public Roadmap completeWeek(Long userId, Long weekId) throws SQLException {
        roadmapRepository.completeWeek(weekId);

        // Recalculate completion percentage
        Roadmap roadmap = roadmapRepository.findActiveByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("No active roadmap found"));

        List<RoadmapWeek> weeks = roadmapRepository.findWeeksByRoadmapId(roadmap.getId());

        long completedCount = weeks.stream().filter(RoadmapWeek::isCompleted).count();
        double percentage = ((double) completedCount / weeks.size()) * 100;
        int currentWeek = (int) completedCount + 1;

        roadmapRepository.updateCompletion(roadmap.getId(),
                Math.round(percentage * 100.0) / 100.0, currentWeek);

        roadmap.setWeeks(weeks);
        roadmap.setCompletionPercentage(percentage);
        roadmap.setCurrentWeek(currentWeek);

        return roadmap;
    }
}