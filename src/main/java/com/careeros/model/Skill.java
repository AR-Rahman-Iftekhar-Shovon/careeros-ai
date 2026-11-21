package com.careeros.model;

public class Skill {

    private Long id;
    private String name;
    private Category category;
    private String description;
    private String iconUrl;

    public enum Category {
        PROGRAMMING, FRAMEWORK, DATABASE, CLOUD, SOFT_SKILL, TOOL, OTHER
    }

    public Skill() {}

    public Skill(String name, Category category, String description) {
        this.name = name;
        this.category = category;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIconUrl() { return iconUrl; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }

    @Override
    public String toString() {
        return "Skill{id=" + id + ", name='" + name + "', category=" + category + "}";
    }
}