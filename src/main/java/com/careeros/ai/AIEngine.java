package com.careeros.ai;

import java.sql.SQLException;

public abstract class AIEngine {

    protected Long userId;

    public AIEngine(Long userId) {
        this.userId = userId;
    }

    /**
     * Main method — every AI engine must implement this
     */
    public abstract String analyze() throws SQLException;

    /**
     * Get suggestions based on analysis
     */
    public abstract String getSuggestion() throws SQLException;

    /**
     * Get engine name
     */
    public abstract String getEngineName();

    /**
     * Format response as JSON
     */
    protected String buildResponse(String type, String message, String suggestion) {
        return "{" +
                "\"type\":\"" + type + "\"," +
                "\"message\":\"" + escapeJson(message) + "\"," +
                "\"suggestion\":\"" + escapeJson(suggestion) + "\"" +
                "}";
    }

    /**
     * Escape special characters for JSON
     */
    protected String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r");
    }
}