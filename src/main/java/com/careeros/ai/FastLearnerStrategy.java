package com.careeros.ai;

import com.careeros.model.RoadmapWeek;
import com.careeros.model.Skill;

import java.util.ArrayList;
import java.util.List;

public class FastLearnerStrategy implements RoadmapStrategy {

    private static final int WEEKS_PER_SKILL = 1;

    @Override
    public List<RoadmapWeek> generateWeeks(List<Skill> missingSkills, Long roadmapId) {
        List<RoadmapWeek> weeks = new ArrayList<>();
        int weekNumber = 1;

        // Week 1 — Orientation
        weeks.add(new RoadmapWeek(
                roadmapId, weekNumber++,
                "Fast Track Orientation",
                "Overview of your learning path. Set up development environment and tools.",
                "YouTube: Traversy Media, FreeCodeCamp, Official Documentation"
        ));

        // One week per skill
        for (Skill skill : missingSkills) {
            String resources = generateResources(skill.getName());
            String description = "Intensive study of " + skill.getName() +
                    ". Complete at least 2 projects this week.";

            weeks.add(new RoadmapWeek(
                    roadmapId, weekNumber++,
                    "Master: " + skill.getName(),
                    description,
                    resources
            ));
        }

        // Final week — Project
        weeks.add(new RoadmapWeek(
                roadmapId, weekNumber,
                "Final Project & Portfolio",
                "Build a complete project using all learned skills. Deploy it online.",
                "GitHub, Vercel, Netlify, Portfolio tips"
        ));

        return weeks;
    }

    @Override
    public int calculateTotalWeeks(List<Skill> missingSkills) {
        return missingSkills.size() + 2;
    }

    @Override
    public String getStrategyName() {
        return "FAST";
    }

    @Override
    public int getWeeksPerSkill() {
        return WEEKS_PER_SKILL;
    }

    private String generateResources(String skillName) {
        return switch (skillName.toLowerCase()) {
            case "html" -> "MDN Web Docs, freeCodeCamp HTML Course, W3Schools";
            case "css" -> "CSS Tricks, Flexbox Froggy, Grid Garden, MDN CSS";
            case "javascript" -> "javascript.info, Eloquent JavaScript, FreeCodeCamp JS";
            case "react" -> "React Official Docs, Scrimba React Course, Jack Herrington YouTube";
            case "python" -> "Python.org, Automate the Boring Stuff, Real Python";
            case "java" -> "Oracle Java Docs, Baeldung, Java Brains YouTube";
            case "mysql" -> "MySQL Official Docs, SQLZoo, Mode Analytics SQL Tutorial";
            case "git" -> "Pro Git Book, GitHub Learning Lab, Atlassian Git Tutorials";
            case "docker" -> "Docker Official Docs, TechWorld with Nana YouTube";
            case "node.js" -> "Node.js Official Docs, The Odin Project, Traversy Media";
            default -> "Official Documentation, YouTube tutorials, freeCodeCamp";
        };
    }
}