package com.careeros.model;

import java.time.LocalDateTime;

public class RoadmapWeek {

    private Long id;
    private Long roadmapId;
    private Integer weekNumber;
    private String topic;
    private String description;
    private String resources;
    private boolean isCompleted;
    private LocalDateTime completedAt;

    public RoadmapWeek() {
        this.isCompleted = false;
    }

    public RoadmapWeek(Long roadmapId, Integer weekNumber,
                       String topic, String description, String resources) {
        this();
        this.roadmapId = roadmapId;
        this.weekNumber = weekNumber;
        this.topic = topic;
        this.description = description;
        this.resources = resources;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRoadmapId() { return roadmapId; }
    public void setRoadmapId(Long roadmapId) { this.roadmapId = roadmapId; }

    public Integer getWeekNumber() { return weekNumber; }
    public void setWeekNumber(Integer weekNumber) { this.weekNumber = weekNumber; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getResources() { return resources; }
    public void setResources(String resources) { this.resources = resources; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}