package com.careeros.model;

import java.time.LocalDateTime;

public class MomentumScore {

    private Long id;
    private Long userId;
    private Double score;                    // 0-100
    private Double consistencyRate;          // 0-100
    private Integer currentStreak;
    private Integer longestStreak;
    private BurnoutRisk burnoutRisk;
    private String cognitiveType;
    private LocalDateTime calculatedAt;

    public enum BurnoutRisk {
        LOW, MEDIUM, HIGH
    }

    public MomentumScore() {
        this.score = 50.0;
        this.consistencyRate = 50.0;
        this.currentStreak = 0;
        this.longestStreak = 0;
        this.burnoutRisk = BurnoutRisk.LOW;
        this.cognitiveType = "CONSISTENT";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public Double getConsistencyRate() { return consistencyRate; }
    public void setConsistencyRate(Double consistencyRate) { this.consistencyRate = consistencyRate; }

    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }

    public Integer getLongestStreak() { return longestStreak; }
    public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }

    public BurnoutRisk getBurnoutRisk() { return burnoutRisk; }
    public void setBurnoutRisk(BurnoutRisk burnoutRisk) { this.burnoutRisk = burnoutRisk; }

    public String getCognitiveType() { return cognitiveType; }
    public void setCognitiveType(String cognitiveType) { this.cognitiveType = cognitiveType; }

    public LocalDateTime getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(LocalDateTime calculatedAt) { this.calculatedAt = calculatedAt; }
}