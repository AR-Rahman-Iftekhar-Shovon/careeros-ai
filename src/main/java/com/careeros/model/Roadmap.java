package com.careeros.model;

import java.time.LocalDateTime;
import java.util.List;

public class Roadmap {

    private Long id;
    private Long userId;
    private CareerPath careerPath;
    private Strategy strategy;
    private Integer totalWeeks;
    private Integer currentWeek;
    private Double completionPercentage;
    private boolean isActive;
    private List<RoadmapWeek> weeks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum Strategy {
        FAST, NORMAL, SLOW
    }

    public Roadmap() {
        this.currentWeek = 1;
        this.completionPercentage = 0.0;
        this.isActive = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public CareerPath getCareerPath() { return careerPath; }
    public void setCareerPath(CareerPath careerPath) { this.careerPath = careerPath; }

    public Strategy getStrategy() { return strategy; }
    public void setStrategy(Strategy strategy) { this.strategy = strategy; }

    public Integer getTotalWeeks() { return totalWeeks; }
    public void setTotalWeeks(Integer totalWeeks) { this.totalWeeks = totalWeeks; }

    public Integer getCurrentWeek() { return currentWeek; }
    public void setCurrentWeek(Integer currentWeek) { this.currentWeek = currentWeek; }

    public Double getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Double completionPercentage) { this.completionPercentage = completionPercentage; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public List<RoadmapWeek> getWeeks() { return weeks; }
    public void setWeeks(List<RoadmapWeek> weeks) { this.weeks = weeks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}