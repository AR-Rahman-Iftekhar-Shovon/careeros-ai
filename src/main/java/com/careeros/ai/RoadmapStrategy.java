package com.careeros.ai;

import com.careeros.model.RoadmapWeek;
import com.careeros.model.Skill;

import java.util.List;

public interface RoadmapStrategy {

    /**
     * Generate week-by-week roadmap based on missing skills
     */
    List<RoadmapWeek> generateWeeks(List<Skill> missingSkills, Long roadmapId);

    /**
     * Get total weeks for this strategy
     */
    int calculateTotalWeeks(List<Skill> missingSkills);

    /**
     * Get strategy name
     */
    String getStrategyName();

    /**
     * Get weeks per skill for this strategy
     */
    int getWeeksPerSkill();
}