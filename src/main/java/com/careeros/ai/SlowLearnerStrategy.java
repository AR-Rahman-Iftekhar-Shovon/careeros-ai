package com.careeros.ai;

import com.careeros.model.RoadmapWeek;
import com.careeros.model.Skill;

import java.util.ArrayList;
import java.util.List;

public class SlowLearnerStrategy implements RoadmapStrategy {

    private static final int WEEKS_PER_SKILL = 3;

    @Override
    public List<RoadmapWeek> generateWeeks(List<Skill> missingSkills, Long roadmapId) {
        List<RoadmapWeek> weeks = new ArrayList<>();
        int weekNumber = 1;

        // Week 1 & 2 — Orientation
        weeks.add(new RoadmapWeek(
                roadmapId, weekNumber++,
                "Orientation — Week 1",
                "Understand your career path and goals. Research the field.",
                "YouTube career guides, LinkedIn job postings for inspiration"
        ));

        weeks.add(new RoadmapWeek(
                roadmapId, weekNumber++,
                "Orientation — Week 2",
                "Set up development environment. Learn how to use Git basics.",
                "Git Official Docs, VS Code setup guides, Terminal basics"
        ));

        // Three weeks per skill
        for (Skill skill : missingSkills) {

            // Week 1 — Introduction
            weeks.add(new RoadmapWeek(
                    roadmapId, weekNumber++,
                    skill.getName() + " — Introduction",
                    "Get familiar with " + skill.getName() +
                            ". Watch beginner videos and read basic concepts.",
                    generateIntroResources(skill.getName())
            ));

            // Week 2 — Deep Study
            weeks.add(new RoadmapWeek(
                    roadmapId, weekNumber++,
                    skill.getName() + " — Deep Study",
                    "Study " + skill.getName() +
                            " in depth. Take notes and follow along with tutorials.",
                    generateStudyResources(skill.getName())
            ));

            // Week 3 — Practice
            weeks.add(new RoadmapWeek(
                    roadmapId, weekNumber++,
                    skill.getName() + " — Practice & Review",
                    "Build a small project using " + skill.getName() +
                            ". Review weak areas and reinforce concepts.",
                    generatePracticeResources(skill.getName())
            ));
        }

        // Final 3 weeks — Project
        weeks.add(new RoadmapWeek(
                roadmapId, weekNumber++,
                "Portfolio Project — Planning",
                "Plan your final project. Create wireframes and set up repository.",
                "Figma, GitHub, Notion for project planning"
        ));

        weeks.add(new RoadmapWeek(
                roadmapId, weekNumber++,
                "Portfolio Project — Development",
                "Build your portfolio project step by step.",
                "Stack Overflow, GitHub Copilot, official docs"
        ));

        weeks.add(new RoadmapWeek(
                roadmapId, weekNumber,
                "Portfolio Project — Deploy & Share",
                "Deploy your project and share on LinkedIn and GitHub.",
                "Vercel, Netlify, GitHub Pages, LinkedIn profile tips"
        ));

        return weeks;
    }

    @Override
    public int calculateTotalWeeks(List<Skill> missingSkills) {
        return (missingSkills.size() * WEEKS_PER_SKILL) + 5;
    }

    @Override
    public String getStrategyName() {
        return "SLOW";
    }

    @Override
    public int getWeeksPerSkill() {
        return WEEKS_PER_SKILL;
    }

    private String generateIntroResources(String skillName) {
        return switch (skillName.toLowerCase()) {
            case "html" -> "HTML in 1 hour — freeCodeCamp, W3Schools HTML Intro";
            case "css" -> "CSS in 1 hour — freeCodeCamp, W3Schools CSS Intro";
            case "javascript" -> "JavaScript for Beginners — Mosh, freeCodeCamp JS Intro";
            case "react" -> "React in 1 hour — Traversy Media, React Docs Quick Start";
            case "python" -> "Python for Beginners — Mosh, CS50P Week 0";
            case "java" -> "Java for Beginners — Mosh, Telusko Java Intro";
            case "mysql" -> "SQL for Beginners — freeCodeCamp, W3Schools SQL";
            case "git" -> "Git for Beginners — Traversy Media, GitHub Hello World guide";
            default -> "YouTube beginner tutorials, W3Schools, freeCodeCamp intro";
        };
    }

    private String generateStudyResources(String skillName) {
        return switch (skillName.toLowerCase()) {
            case "html" -> "MDN HTML Docs, HTML Full Course — freeCodeCamp";
            case "css" -> "MDN CSS Docs, Kevin Powell CSS Full Course";
            case "javascript" -> "javascript.info full course, Eloquent JavaScript book";
            case "react" -> "React Official Docs, Scrimba React Full Course";
            case "python" -> "Automate the Boring Stuff book, Corey Schafer Python";
            case "java" -> "Oracle Java Tutorials, Java Brains full playlist";
            case "mysql" -> "MySQL full course — freeCodeCamp, SQLZoo exercises";
            case "git" -> "Pro Git book chapters 1-3, Atlassian Git tutorials";
            default -> "Official documentation, Udemy course, freeCodeCamp";
        };
    }

    private String generatePracticeResources(String skillName) {
        return switch (skillName.toLowerCase()) {
            case "html", "css" -> "Frontend Mentor — newbie challenges, build 3 layouts";
            case "javascript" -> "JavaScript30 by Wes Bos, build a quiz app";
            case "react" -> "Build a todo list and weather app, React projects GitHub";
            case "python" -> "Build a number guessing game and calculator, HackerRank Python";
            case "java" -> "Build a student grade calculator, LeetCode easy problems";
            case "mysql" -> "Design a library database, practice joins and subqueries";
            case "git" -> "Create 3 repos, practice branching, submit a pull request";
            default -> "Build a small project, HackerRank, LeetCode easy";
        };
    }
}