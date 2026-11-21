package com.careeros.model;

public class CareerPath {

    private Long id;
    private String title;
    private String description;
    private Category category;
    private Integer avgSalaryUsd;
    private DemandLevel demandLevel;

    public enum Category {
        WEB, MOBILE, AI_ML, DEVOPS, CYBERSECURITY, DATA, GAME, OTHER
    }

    public enum DemandLevel {
        LOW, MEDIUM, HIGH, VERY_HIGH
    }

    public CareerPath() {}

    public CareerPath(String title, String description, Category category,
                      Integer avgSalaryUsd, DemandLevel demandLevel) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.avgSalaryUsd = avgSalaryUsd;
        this.demandLevel = demandLevel;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Integer getAvgSalaryUsd() { return avgSalaryUsd; }
    public void setAvgSalaryUsd(Integer avgSalaryUsd) { this.avgSalaryUsd = avgSalaryUsd; }

    public DemandLevel getDemandLevel() { return demandLevel; }
    public void setDemandLevel(DemandLevel demandLevel) { this.demandLevel = demandLevel; }

    @Override
    public String toString() {
        return "CareerPath{id=" + id + ", title='" + title + "', category=" + category + "}";
    }
}