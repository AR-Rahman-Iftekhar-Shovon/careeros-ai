package com.careeros.ai;

import com.careeros.model.RoadmapWeek;
import com.careeros.model.Skill;

import java.util.ArrayList;
import java.util.List;

public class NormalLearnerStrategy implements RoadmapStrategy {

    private static final int WEEKS_PER_SKILL = 2;

    @Override
    public List<RoadmapWeek> generateWeeks(List<Skill> missingSkills, Long roadmapId) {
        List<RoadmapWeek> weeks = new ArrayList<>();
        int weekNumber = 1;

        // Week 1 — Orientation
        weeks.add(new RoadmapWeek(
                roadmapId, weekNumber++,
                "Orientation & Setup",
                "Understand your career path. Set up tools and development environment.",
                "YouTube: Traversy Media, FreeCodeCamp, Official Documentation"
        ));

        // Two weeks per skill
        for (Skill skill : missingSkills) {
            // Week 1 of skill — Learn
            weeks.add(new RoadmapWeek(
                    roadmapId, weekNumber++,
                    "Learn: " + skill.getName() + " — Fundamentals",
                    "Study core concepts of " + skill.getName() +
                            ". Watch tutorials and follow along with examples.",
                    generateLearnResources(skill.getName())
            ));

            // Week 2 of skill — Practice
            weeks.add(new RoadmapWeek(
                    roadmapId, weekNumber++,
                    "Practice: " + skill.getName() + " — Build Projects",
                    "Apply what you learned. Build 1-2 small projects using " +
                            skill.getName() + ".",
                    generatePracticeResources(skill.getName())
            ));
        }

        // Final 2 weeks — Portfolio project
        weeks.add(new RoadmapWeek(
                roadmapId, weekNumber++,
                "Capstone Project — Phase 1",
                "Plan and start building your portfolio project using all skills.",
                "GitHub, Project planning tools, Figma for UI design"
        ));

        weeks.add(new RoadmapWeek(
                roadmapId, weekNumber,
                "Capstone Project — Phase 2 & Deploy",
                "Complete and deploy your project. Write README and share on GitHub.",
                "GitHub Pages, Vercel, Netlify, LinkedIn profile update"
        ));

        return weeks;
    }

    @Override
    public int calculateTotalWeeks(List<Skill> missingSkills) {
        return (missingSkills.size() * WEEKS_PER_SKILL) + 3;
    }

    @Override
    public String getStrategyName() {
        return "NORMAL";
    }

    @Override
    public int getWeeksPerSkill() {
        return WEEKS_PER_SKILL;
    }

    private String generateLearnResources(String skillName) {
        return switch (skillName.toLowerCase()) {
            case "html" -> "MDN Web Docs, freeCodeCamp HTML, HTML Crash Course — Traversy Media";
            case "css" -> "MDN CSS Docs, CSS Tricks, Kevin Powell YouTube, Flexbox Froggy";
            case "javascript" -> "javascript.info, FreeCodeCamp JS, Akshay Saini — Namaste JS";
            case "react" -> "React Official Docs, Scrimba React, Codevolution React YouTube";
            case "python" -> "Python.org Docs, CS50P Harvard, Corey Schafer YouTube";
            case "java" -> "Oracle Java Docs, Java Brains, Telusko YouTube";
            case "mysql" -> "MySQL Docs, SQLZoo, Programming with Mosh MySQL";
            case "git" -> "Pro Git Book, GitHub Docs, Colt Steele Git Course";
            case "docker" -> "Docker Docs, TechWorld with Nana, NetworkChuck YouTube";
            case "node.js" -> "Node.js Docs, The Odin Project, Codevolution Node YouTube";
            default -> "Official Documentation, Coursera, Udemy, freeCodeCamp";
        };
    }

    private String generatePracticeResources(String skillName) {
        return switch (skillName.toLowerCase()) {
            case "html", "css" -> "Build a personal portfolio page, Frontend Mentor challenges";
            case "javascript" -> "Build a todo app, calculator, JavaScript30 by Wes Bos";
            case "react" -> "Build a weather app or note-taking app, React projects on GitHub";
            case "python" -> "Build a CLI tool or automation script, Python projects on GitHub";
            case "java" -> "Build a console application, LeetCode easy problems in Java";
            case "mysql" -> "Design a database schema, practice queries on SQLFiddle";
            case "git" -> "Create a GitHub repo, practice branching and merging";
            default -> "Build a small project, contribute to open source, LeetCode";
        };
    }
}