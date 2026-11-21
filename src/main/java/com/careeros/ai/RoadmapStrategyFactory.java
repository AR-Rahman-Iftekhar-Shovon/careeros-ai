package com.careeros.ai;

import com.careeros.model.Roadmap;

public class RoadmapStrategyFactory {

    /**
     * Factory Pattern — creates the right strategy based on daily study hours
     */
    public static RoadmapStrategy createStrategy(Double dailyStudyHours) {
        if (dailyStudyHours == null) {
            return new NormalLearnerStrategy();
        }

        if (dailyStudyHours >= 5.0) {
            return new FastLearnerStrategy();
        } else if (dailyStudyHours >= 2.0) {
            return new NormalLearnerStrategy();
        } else {
            return new SlowLearnerStrategy();
        }
    }

    /**
     * Create strategy from Roadmap.Strategy enum
     */
    public static RoadmapStrategy createStrategy(Roadmap.Strategy strategy) {
        return switch (strategy) {
            case FAST -> new FastLearnerStrategy();
            case SLOW -> new SlowLearnerStrategy();
            default -> new NormalLearnerStrategy();
        };
    }

    /**
     * Determine strategy type from daily study hours
     */
    public static Roadmap.Strategy determineStrategy(Double dailyStudyHours) {
        if (dailyStudyHours == null) return Roadmap.Strategy.NORMAL;

        if (dailyStudyHours >= 5.0) return Roadmap.Strategy.FAST;
        else if (dailyStudyHours >= 2.0) return Roadmap.Strategy.NORMAL;
        else return Roadmap.Strategy.SLOW;
    }
}