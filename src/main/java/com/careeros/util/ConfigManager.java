package com.careeros.util;

import java.io.InputStream;
import java.util.Properties;

public class ConfigManager {
    private static volatile ConfigManager instance;
    private final Properties properties;

    private ConfigManager() {
        properties = new Properties();
        try (InputStream input = getClass().getClassLoader().getResourceAsStream("database.properties")) {
            if (input == null) {
                // Fallback to absolute path if needed
                System.out.println("⚠️ database.properties not found in resources. Using default.");
            } else {
                properties.load(input);
            }
        } catch (Exception e) {
            System.err.println("Config load failed: " + e.getMessage());
        }
    }

    public static ConfigManager getInstance() {
        if (instance == null) {
            synchronized (ConfigManager.class) {
                if (instance == null) {
                    instance = new ConfigManager();
                }
            }
        }
        return instance;
    }

    public String getProperty(String key) {
        return properties.getProperty(key);
    }

    public String getProperty(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }
}