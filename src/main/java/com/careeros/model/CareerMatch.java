package com.careeros.model;

import java.util.List;

public class CareerMatch {

    private Long id;
    private Long userId;
    private CareerPath careerPath;
    private Double matchScore;
    private Double confidenceScore;
    private List<Skill> missingSkills;
    private List<Skill> matchedSkills;
    private Integer missingSkillsCount;

    public CareerMatch() {}

    public CareerMatch(Long userId, CareerPath careerPath,
                       Double matchScore, Double confidenceScore,
                       List<Skill> missingSkills, List<Skill> matchedSkills) {
        this.userId = userId;
        this.careerPath = careerPath;
        this.matchScore = matchScore;
        this.confidenceScore = confidenceScore;
        this.missingSkills = missingSkills;
        this.matchedSkills = matchedSkills;
        this.missingSkillsCount = missingSkills != null ? missingSkills.size() : 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public CareerPath getCareerPath() { return careerPath; }
    public void setCareerPath(CareerPath careerPath) { this.careerPath = careerPath; }

    public Double getMatchScore() { return matchScore; }
    public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public List<Skill> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<Skill> missingSkills) {
        this.missingSkills = missingSkills;
        this.missingSkillsCount = missingSkills != null ? missingSkills.size() : 0;
    }

    public List<Skill> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<Skill> matchedSkills) { this.matchedSkills = matchedSkills; }

    public Integer getMissingSkillsCount() { return missingSkillsCount; }
    public void setMissingSkillsCount(Integer missingSkillsCount) { this.missingSkillsCount = missingSkillsCount; }

    @Override
    public String toString() {
        return "CareerMatch{userId=" + userId +
                ", career='" + (careerPath != null ? careerPath.getTitle() : "null") +
                "', matchScore=" + matchScore + "}";
    }
}