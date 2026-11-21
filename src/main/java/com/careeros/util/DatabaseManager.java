package com.careeros.util;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Logger;

public class DatabaseManager {

    private static final Logger logger = Logger.getLogger(DatabaseManager.class.getName());
    private static DatabaseManager instance;
    private Properties properties;

    private DatabaseManager() {
        loadProperties();
    }

    public static synchronized DatabaseManager getInstance() {
        if (instance == null) {
            instance = new DatabaseManager();
        }
        return instance;
    }

    private void loadProperties() {
        properties = new Properties();
        try (InputStream input = getClass().getClassLoader()
                .getResourceAsStream("database.properties")) {
            if (input == null) {
                logger.severe("database.properties file not found!");
                return;
            }
            properties.load(input);
            logger.info("Database properties loaded successfully.");
        } catch (IOException e) {
            logger.severe("Failed to load database.properties: " + e.getMessage());
        }
    }

    public Connection getConnection() throws SQLException {
        try {
            Class.forName(properties.getProperty("db.driver"));
            Connection connection = DriverManager.getConnection(
                    properties.getProperty("db.url"),
                    properties.getProperty("db.username"),
                    properties.getProperty("db.password")
            );
            logger.info("Database connection established.");
            return connection;
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL Driver not found: " + e.getMessage());
        }
    }

    public void closeConnection(Connection connection) {
        if (connection != null) {
            try {
                connection.close();
                logger.info("Database connection closed.");
            } catch (SQLException e) {
                logger.warning("Failed to close connection: " + e.getMessage());
            }
        }
    }

    public Properties getProperties() {
        return properties;
    }
}