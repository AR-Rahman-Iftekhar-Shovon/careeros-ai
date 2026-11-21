package com.careeros.ai;

import com.careeros.model.CareerMatch;
import com.careeros.model.Profile;
import com.careeros.model.Skill;
import com.careeros.repository.ProfileRepository;
import com.careeros.repository.SkillRepository;
import com.careeros.service.CareerAnalysisService;
import com.careeros.service.SessionService;

import java.sql.SQLException;
import java.util.List;

public class MentorAI extends AIEngine {

    private final SessionService sessionService;
    private final CareerAnalysisService careerAnalysisService;
    private final ProfileRepository profileRepository;
    private final SkillRepository skillRepository;

    public MentorAI(Long userId) {
        super(userId);
        this.sessionService = new SessionService();
        this.careerAnalysisService = new CareerAnalysisService();
        this.profileRepository = new ProfileRepository();
        this.skillRepository = new SkillRepository();
    }

    @Override
    public String analyze() throws SQLException {
        double momentum = sessionService.calculateMomentumScore(userId);
        List<Skill> userSkills = skillRepository.findByUserId(userId);
        CareerMatch topMatch = careerAnalysisService.getTopCareerMatch(userId);

        StringBuilder analysis = new StringBuilder();

        // Momentum analysis
        if (momentum < 30) {
            analysis.append("Your momentum is critically low. ");
        } else if (momentum < 60) {
            analysis.append("Your momentum is moderate. ");
        } else {
            analysis.append("Your momentum is strong. ");
        }

        // Skill analysis
        if (userSkills.size() < 3) {
            analysis.append("You have very few skills registered. ");
        } else {
            analysis.append("You have " + userSkills.size() + " skills. ");
        }

        // Career match analysis
        if (topMatch != null) {
            analysis.append("Best career match: " + topMatch.getCareerPath().getTitle() +
                    " at " + topMatch.getMatchScore() + "%.");
        }

        return analysis.toString();
    }

    @Override
    public String getSuggestion() throws SQLException {
        double momentum = sessionService.calculateMomentumScore(userId);
        List<Skill> userSkills = skillRepository.findByUserId(userId);
        CareerMatch topMatch = careerAnalysisService.getTopCareerMatch(userId);

        int skillGapCount = topMatch != null ? topMatch.getMissingSkillsCount() : 0;

        // Rule-based suggestions
        if (skillGapCount > 5 && momentum < 40) {
            return "Focus on basics first. Start with one skill at a time. " +
                   "Study at least 1 hour daily to build momentum.";
        }

        if (momentum > 80) {
            return "You are ready for projects! Start building real-world " +
                   "projects to strengthen your portfolio.";
        }

        if (userSkills.size() < 3) {
            return "Add your current skills to get personalized recommendations. " +
                   "Go to Profile and update your skill set.";
        }

        if (skillGapCount == 0 && topMatch != null) {
            return "You have all required skills for " +
                   topMatch.getCareerPath().getTitle() +
                   "! Start applying for jobs or internships now.";
        }

        if (momentum < 50) {
            return "Try to study consistently every day, even just 30 minutes. " +
                   "Consistency beats intensity.";
        }

        return "Keep going! You are making progress. " +
               "Focus on completing your roadmap week by week.";
    }

    /**
     * Check if user is ready for internship
     */
    public String checkInternshipReadiness() throws SQLException {
        double momentum = sessionService.calculateMomentumScore(userId);
        List<Skill> userSkills = skillRepository.findByUserId(userId);
        CareerMatch topMatch = careerAnalysisService.getTopCareerMatch(userId);

        double matchScore = topMatch != null ? topMatch.getMatchScore() : 0;
        int skillCount = userSkills.size();

        // Readiness score (0-100)
        double readiness = (matchScore * 0.5) +
                          (Math.min(skillCount * 5, 30) * 0.3) +
                          (momentum * 0.2);

        String level;
        String message;
        String suggestion;

        if (readiness >= 70) {
            level = "READY";
            message = "You are ready for internships!";
            suggestion = "Start applying on LinkedIn, Glassdoor, and local job boards. " +
                        "Polish your GitHub and update your resume.";
        } else if (readiness >= 45) {
            level = "ALMOST";
            message = "You are almost ready. A few more skills needed.";
            suggestion = "Complete your roadmap and build 2-3 portfolio projects. " +
                        "Then start applying with confidence.";
        } else {
            level = "NOT_YET";
            message = "Keep learning. You need more preparation.";
            suggestion = "Focus on completing your skill gaps first. " +
                        "Follow your roadmap consistently for 2-3 months.";
        }

        return "{" +
                "\"readinessScore\":" + Math.round(readiness) + "," +
                "\"level\":\"" + level + "\"," +
                "\"message\":\"" + escapeJson(message) + "\"," +
                "\"suggestion\":\"" + escapeJson(suggestion) + "\"," +
                "\"matchScore\":" + matchScore + "," +
                "\"skillCount\":" + skillCount + "," +
                "\"momentum\":" + Math.round(momentum) +
                "}";
    }

    /**
     * Answer specific questions
     */
    public String answerQuestion(String question) throws SQLException {
        String q = question.toLowerCase();

        if (q.contains("next") || q.contains("learn")) {
            return answerWhatToLearnNext();
        } else if (q.contains("internship") || q.contains("job") || q.contains("ready")) {
            return checkInternshipReadiness();
        } else if (q.contains("slow") || q.contains("progress") || q.contains("behind")) {
            return answerWhyProgressingSlow();
        } else if (q.contains("strongest") || q.contains("best skill")) {
            return answerStrongestSkill();
        } else if (q.contains("burnout") || q.contains("tired")) {
            return answerBurnout();
        } else {
            return buildResponse("GENERAL", analyze(), getSuggestion());
        }
    }

    private String answerWhatToLearnNext() throws SQLException {
        CareerMatch topMatch = careerAnalysisService.getTopCareerMatch(userId);

        if (topMatch == null || topMatch.getMissingSkills().isEmpty()) {
            return buildResponse("NEXT_SKILL",
                    "You have all required skills!",
                    "Start building projects and apply for jobs.");
        }

        String nextSkill = topMatch.getMissingSkills().get(0).getName();
        return buildResponse("NEXT_SKILL",
                "Your next skill to learn is: " + nextSkill,
                "Focus on " + nextSkill + " this week. " +
                "Check your roadmap for resources.");
    }

    private String answerWhyProgressingSlow() throws SQLException {
        double momentum = sessionService.calculateMomentumScore(userId);
        String cognitiveType = sessionService.detectCognitiveType(userId);

        String reason;
        String suggestion;

        if (momentum < 30) {
            reason = "Your study sessions are too infrequent.";
            suggestion = "Try to study every day, even 20-30 minutes counts. " +
                        "Use the Pomodoro technique.";
        } else if (cognitiveType.equals("TIRED")) {
            reason = "You seem to be studying while tired.";
            suggestion = "Study during your peak hours. " +
                        "Take breaks and get enough sleep.";
        } else {
            reason = "Progress takes time. You are doing better than you think.";
            suggestion = "Stay consistent. Review your roadmap and celebrate small wins.";
        }

        return buildResponse("SLOW_PROGRESS", reason, suggestion);
    }

    private String answerStrongestSkill() throws SQLException {
        List<Skill> userSkills = skillRepository.findByUserId(userId);

        if (userSkills.isEmpty()) {
            return buildResponse("STRONGEST_SKILL",
                    "No skills added yet.",
                    "Go to your profile and add your current skills.");
        }

        String strongest = userSkills.get(0).getName();
        return buildResponse("STRONGEST_SKILL",
                "Your strongest registered skill is: " + strongest,
                "Keep building on " + strongest +
                " while learning new skills from your roadmap.");
    }

    private String answerBurnout() throws SQLException {
        double momentum = sessionService.calculateMomentumScore(userId);

        if (momentum < 40) {
            return buildResponse("BURNOUT",
                    "Signs of burnout detected. Your momentum is low.",
                    "Take a 2-3 day break. Come back refreshed. " +
                    "Reduce daily study target temporarily.");
        }

        return buildResponse("BURNOUT",
                "You seem okay, but listen to your body.",
                "Keep sessions short and focused. " +
                "Quality over quantity always wins.");
    }

    /**
     * Build a text summary of the user's real data — sent to Gemini
     * so replies are personalized.
     */
    public String buildUserContext() throws SQLException {
        StringBuilder ctx = new StringBuilder();
        ctx.append("STUDENT'S CURRENT DATA:\n");

        // Profile
        Profile profile = profileRepository.findByUserId(userId).orElse(null);
        if (profile != null) {
            if (profile.getCareerGoal() != null)
                ctx.append("- Career goal: ").append(profile.getCareerGoal()).append("\n");
            if (profile.getEducationLevel() != null)
                ctx.append("- Education: ").append(profile.getEducationLevel()).append("\n");
            if (profile.getExperienceYears() != null)
                ctx.append("- Experience: ").append(profile.getExperienceYears()).append(" years\n");
            if (profile.getDailyStudyHours() != null)
                ctx.append("- Daily study target: ").append(profile.getDailyStudyHours()).append(" hours\n");
        }

        // Skills
        List<Skill> userSkills = skillRepository.findByUserId(userId);
        if (userSkills.isEmpty()) {
            ctx.append("- Skills: none added yet\n");
        } else {
            ctx.append("- Skills (").append(userSkills.size()).append("): ");
            for (int i = 0; i < userSkills.size(); i++) {
                if (i > 0) ctx.append(", ");
                ctx.append(userSkills.get(i).getName());
            }
            ctx.append("\n");
        }

        // Momentum
        double momentum = sessionService.calculateMomentumScore(userId);
        ctx.append("- Study momentum score: ").append(Math.round(momentum)).append("/100\n");

        // Top career match
        CareerMatch topMatch = careerAnalysisService.getTopCareerMatch(userId);
        if (topMatch != null) {
            ctx.append("- Best career match: ").append(topMatch.getCareerPath().getTitle())
               .append(" (").append(Math.round(topMatch.getMatchScore())).append("% match)\n");
            if (topMatch.getMissingSkills() != null && !topMatch.getMissingSkills().isEmpty()) {
                ctx.append("- Missing skills for that career: ");
                List<Skill> missing = topMatch.getMissingSkills();
                for (int i = 0; i < missing.size(); i++) {
                    if (i > 0) ctx.append(", ");
                    ctx.append(missing.get(i).getName());
                }
                ctx.append("\n");
            }
        }

        return ctx.toString();
    }

    /**
     * Plain-text fallback answer (used when Gemini API is unavailable)
     */
    public String fallbackAnswer() throws SQLException {
        return analyze() + "\n\n" + getSuggestion();
    }

    @Override
    public String getEngineName() {
        return "MentorAI";
    }
}