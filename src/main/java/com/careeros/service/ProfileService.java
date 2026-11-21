package com.careeros.service;

import com.careeros.model.Profile;
import com.careeros.repository.ProfileRepository;
import java.sql.SQLException;
import java.util.Optional;

public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService() {
        this.profileRepository = new ProfileRepository();
    }

    /**
     * Create or Update User Profile
     */
    public Profile saveProfile(Profile profile) throws SQLException {
        if (profile.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        // Default values
        if (profile.getDailyStudyHours() == null) {
            profile.setDailyStudyHours(2.0);
        }
        if (profile.getExperienceYears() == null) {
            profile.setExperienceYears(0);
        }

        Profile savedProfile = profileRepository.save(profile);
        System.out.println("Profile updated for user ID: " + profile.getUserId());
        return savedProfile;
    }

    /**
     * Get Profile by User ID
     */
    public Optional<Profile> getProfileByUserId(Long userId) throws SQLException {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        return profileRepository.findByUserId(userId);
    }

    /**
     * Update Daily Study Hours (used in roadmap calculation)
     */
    public boolean updateDailyStudyHours(Long userId, Double hours) throws SQLException {
        Profile profile = getProfileByUserId(userId).orElse(new Profile());
        profile.setUserId(userId);
        profile.setDailyStudyHours(hours);
        saveProfile(profile);
        return true;
    }
}