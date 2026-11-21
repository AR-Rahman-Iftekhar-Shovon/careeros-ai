package com.careeros.service;

import com.careeros.model.User;
import com.careeros.repository.UserRepository;
import com.careeros.util.PasswordHasher;
import java.sql.SQLException;
import java.util.Optional;

public class UserService {

    private final UserRepository userRepository;

    public UserService() {
        this.userRepository = new UserRepository();
    }

    /**
     * User Registration
     */
    public User registerUser(String email, String password, String fullName) throws SQLException {
        // Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        // Hash password
        String hashedPassword = PasswordHasher.hashPassword(password);

        // Create user
        User user = new User(email, hashedPassword, fullName, User.Role.STUDENT);

        // Save to database
        User savedUser = userRepository.save(user);

        System.out.println("New user registered: " + savedUser.getEmail());
        return savedUser;
    }

    /**
     * User Login
     */
    public Optional<User> loginUser(String email, String password) throws SQLException {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        User user = userOpt.get();

        // Verify password
        if (!PasswordHasher.verifyPassword(password, user.getPasswordHash())) {
            return Optional.empty();
        }

        // Update last login
        userRepository.updateLastLogin(user.getId());

        System.out.println("User logged in: " + user.getEmail());
        return Optional.of(user);
    }

    /**
     * Get user by ID
     */
    public Optional<User> getUserById(Long id) throws SQLException {
        return userRepository.findById(id);
    }

    /**
     * Get user by Email
     */
    public Optional<User> getUserByEmail(String email) throws SQLException {
        return userRepository.findByEmail(email);
    }
}