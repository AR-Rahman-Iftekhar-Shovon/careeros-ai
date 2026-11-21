package com.careeros.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Session {

    private Long id;
    private Long userId;
    private String topic;
    private Integer durationMinutes;
    private Mood mood;
    private Integer productivityScore;     // 1-100
    private String notes;
    private LocalDate sessionDate;
    private LocalDateTime createdAt;

    public enum Mood {
        GREAT, GOOD, NEUTRAL, TIRED, STRESSED
    }

    public Session() {
        this.productivityScore = 50;
        this.sessionDate = LocalDate.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Mood getMood() { return mood; }
    public void setMood(Mood mood) { this.mood = mood; }

    public Integer getProductivityScore() { return productivityScore; }
    public void setProductivityScore(Integer productivityScore) { this.productivityScore = productivityScore; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}