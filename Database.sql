CREATE DATABASE IF NOT EXISTS careeros_ai
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE careeros_ai;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'PROFESSIONAL', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    full_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_uuid (uuid),
    INDEX idx_role (role)
);

CREATE TABLE profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    age INT,
    phone VARCHAR(20),
    location VARCHAR(100),
    education_level ENUM('HIGH_SCHOOL', 'BACHELOR', 'MASTER', 'PHD', 'SELF_TAUGHT') DEFAULT 'BACHELOR',
    institution VARCHAR(150),
    graduation_year INT,
    bio TEXT,
    avatar_url VARCHAR(500),
    daily_study_hours DECIMAL(4,2) DEFAULT 2.00,
    career_goal VARCHAR(100),
    experience_years INT DEFAULT 0,
    linkedin_url VARCHAR(300),
    github_url VARCHAR(300),
    portfolio_url VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_career_goal (career_goal)
);

CREATE TABLE skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('PROGRAMMING', 'FRAMEWORK', 'DATABASE', 'CLOUD', 'SOFT_SKILL', 'TOOL', 'OTHER') NOT NULL,
    description TEXT,
    icon_url VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);

CREATE TABLE user_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT') DEFAULT 'BEGINNER',
    is_verified BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, skill_id),
    INDEX idx_user_id (user_id)
);


CREATE TABLE career_paths (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category ENUM('WEB', 'MOBILE', 'AI_ML', 'DEVOPS', 'CYBERSECURITY', 'DATA', 'GAME', 'OTHER') NOT NULL,
    avg_salary_usd INT,
    demand_level ENUM('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH') DEFAULT 'HIGH',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);

CREATE TABLE career_goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    career_path_id BIGINT NOT NULL,
    target_date DATE,
    priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'HIGH',
    status ENUM('ACTIVE', 'ACHIEVED', 'PAUSED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (career_path_id) REFERENCES career_paths(id),
    INDEX idx_user_id (user_id)
);

CREATE TABLE roadmaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    career_path_id BIGINT NOT NULL,
    strategy ENUM('FAST', 'NORMAL', 'SLOW') DEFAULT 'NORMAL',
    total_weeks INT NOT NULL,
    current_week INT DEFAULT 1,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (career_path_id) REFERENCES career_paths(id),
    INDEX idx_user_id (user_id)
);

CREATE TABLE roadmap_weeks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id BIGINT NOT NULL,
    week_number INT NOT NULL,
    topic VARCHAR(200) NOT NULL,
    description TEXT,
    resources TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
    INDEX idx_roadmap_id (roadmap_id)
);



CREATE TABLE sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    topic VARCHAR(200) NOT NULL,
    duration_minutes INT NOT NULL,
    mood ENUM('GREAT', 'GOOD', 'NEUTRAL', 'TIRED', 'STRESSED') DEFAULT 'GOOD',
    productivity_score INT DEFAULT 50,
    notes TEXT,
    session_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_date (session_date)
);

CREATE TABLE momentum_scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    consistency_rate DECIMAL(5,2) DEFAULT 0.00,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    burnout_risk ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'LOW',
    cognitive_type ENUM('VISUAL', 'FAST', 'DEEP', 'CONSISTENT') DEFAULT 'CONSISTENT',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

CREATE TABLE cognitive_fingerprints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    peak_hours VARCHAR(50),
    avg_session_duration DECIMAL(6,2) DEFAULT 0.00,
    preferred_topics TEXT,
    learning_style ENUM('VISUAL', 'FAST', 'DEEP', 'CONSISTENT') DEFAULT 'CONSISTENT',
    total_sessions INT DEFAULT 0,
    total_hours DECIMAL(8,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM('BURNOUT_ALERT', 'STREAK_CELEBRATION', 'MILESTONE', 'ROADMAP_WARNING', 'GENERAL') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read)
);

CREATE TABLE career_matches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    career_path_id BIGINT NOT NULL,
    match_score DECIMAL(5,2) DEFAULT 0.00,
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    missing_skills_count INT DEFAULT 0,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (career_path_id) REFERENCES career_paths(id),
    INDEX idx_user_id (user_id)
);

CREATE TABLE analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type)
);

CREATE TABLE admin_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    action VARCHAR(200) NOT NULL,
    target_user_id BIGINT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id),
    INDEX idx_admin_id (admin_id)
);

CREATE TABLE career_path_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    career_path_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    priority_order INT DEFAULT 1,
    FOREIGN KEY (career_path_id) REFERENCES career_paths(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY unique_path_skill (career_path_id, skill_id)
);









-- Career Paths
INSERT INTO career_paths (title, description, category, avg_salary_usd, demand_level) VALUES
('Frontend Developer', 'Build beautiful web interfaces', 'WEB', 75000, 'VERY_HIGH'),
('Backend Developer', 'Build powerful server-side applications', 'WEB', 85000, 'VERY_HIGH'),
('Full Stack Developer', 'Master both frontend and backend', 'WEB', 95000, 'VERY_HIGH'),
('AI/ML Engineer', 'Build intelligent systems', 'AI_ML', 120000, 'VERY_HIGH'),
('Data Scientist', 'Analyze and interpret complex data', 'DATA', 110000, 'HIGH'),
('DevOps Engineer', 'Automate and optimize development pipelines', 'DEVOPS', 100000, 'HIGH'),
('Mobile Developer', 'Build iOS and Android applications', 'MOBILE', 90000, 'HIGH'),
('Cybersecurity Engineer', 'Protect systems from threats', 'CYBERSECURITY', 105000, 'HIGH');

-- Skills
INSERT INTO skills (name, category, description) VALUES
('HTML', 'PROGRAMMING', 'HyperText Markup Language'),
('CSS', 'PROGRAMMING', 'Cascading Style Sheets'),
('JavaScript', 'PROGRAMMING', 'Core web programming language'),
('TypeScript', 'PROGRAMMING', 'Typed superset of JavaScript'),
('React', 'FRAMEWORK', 'Frontend JavaScript library'),
('Node.js', 'FRAMEWORK', 'JavaScript runtime for backend'),
('Python', 'PROGRAMMING', 'Versatile programming language'),
('Java', 'PROGRAMMING', 'Object-oriented programming language'),
('MySQL', 'DATABASE', 'Relational database management system'),
('MongoDB', 'DATABASE', 'NoSQL document database'),
('Git', 'TOOL', 'Version control system'),
('Docker', 'TOOL', 'Containerization platform'),
('AWS', 'CLOUD', 'Amazon Web Services cloud platform'),
('Machine Learning', 'OTHER', 'AI/ML fundamentals'),
('Data Analysis', 'OTHER', 'Data processing and analysis'),
('REST API', 'OTHER', 'RESTful API design'),
('Tailwind CSS', 'FRAMEWORK', 'Utility-first CSS framework'),
('Spring Boot', 'FRAMEWORK', 'Java backend framework'),
('TensorFlow', 'FRAMEWORK', 'Machine learning framework'),
('Communication', 'SOFT_SKILL', 'Effective communication skills');



-- Frontend Developer Required Skills
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order) VALUES
(1, 1, TRUE, 1),  -- HTML
(1, 2, TRUE, 2),  -- CSS
(1, 3, TRUE, 3),  -- JavaScript
(1, 4, FALSE, 4), -- TypeScript
(1, 5, TRUE, 5),  -- React
(1, 11, TRUE, 6), -- Git
(1, 17, FALSE, 7); -- Tailwind CSS

-- Backend Developer Required Skills
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order) VALUES
(2, 8, TRUE, 1),  -- Java
(2, 6, TRUE, 2),  -- Node.js
(2, 9, TRUE, 3),  -- MySQL
(2, 16, TRUE, 4), -- REST API
(2, 11, TRUE, 5), -- Git
(2, 12, FALSE, 6), -- Docker
(2, 18, FALSE, 7); -- Spring Boot

-- Full Stack Developer Required Skills
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order) VALUES
(3, 1, TRUE, 1),  -- HTML
(3, 2, TRUE, 2),  -- CSS
(3, 3, TRUE, 3),  -- JavaScript
(3, 5, TRUE, 4),  -- React
(3, 6, TRUE, 5),  -- Node.js
(3, 9, TRUE, 6),  -- MySQL
(3, 11, TRUE, 7), -- Git
(3, 16, TRUE, 8); -- REST API

-- AI/ML Engineer Required Skills
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order) VALUES
(4, 7, TRUE, 1),  -- Python
(4, 14, TRUE, 2), -- Machine Learning
(4, 15, TRUE, 3), -- Data Analysis
(4, 19, TRUE, 4), -- TensorFlow
(4, 9, FALSE, 5), -- MySQL
(4, 11, TRUE, 6); -- Git

-- Admin User
INSERT INTO users (uuid, email, password_hash, role, full_name, is_active, is_verified) VALUES
(UUID(), 'admin@careeros.ai', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMZJaaaSwm4MeEgb0pTAz6iNq2', 'ADMIN', 'CareerOS Admin', TRUE, TRUE);


USE careeros_ai;
SHOW TABLES;
USE careeros_ai;
ALTER TABLE profiles MODIFY COLUMN education_level VARCHAR(50) DEFAULT 'BACHELOR';

USE careeros_ai;
SELECT * FROM profiles WHERE user_id = 6;







USE careeros_ai;

INSERT IGNORE INTO skills (name, category, description) VALUES
('Linux', 'TOOL', 'Linux OS administration'),
('Networking', 'OTHER', 'Computer networking fundamentals'),
('Cybersecurity Fundamentals', 'OTHER', 'Security principles and threat handling'),
('Penetration Testing', 'OTHER', 'Ethical hacking and vulnerability testing'),
('Kubernetes', 'TOOL', 'Container orchestration'),
('CI/CD', 'TOOL', 'Continuous integration and deployment'),
('Statistics', 'OTHER', 'Statistical analysis fundamentals'),
('Power BI', 'TOOL', 'Data visualization and BI tool'),
('Swift', 'PROGRAMMING', 'iOS app development language'),
('Kotlin', 'PROGRAMMING', 'Android app development language'),
('Flutter', 'FRAMEWORK', 'Cross-platform mobile framework');


-- Data Scientist (career_path_id = 5)
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 5, id, TRUE, 1 FROM skills WHERE name = 'Python';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 5, id, TRUE, 2 FROM skills WHERE name = 'Statistics';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 5, id, TRUE, 3 FROM skills WHERE name = 'Data Analysis';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 5, id, TRUE, 4 FROM skills WHERE name = 'Machine Learning';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 5, id, TRUE, 5 FROM skills WHERE name = 'MySQL';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 5, id, FALSE, 6 FROM skills WHERE name = 'Power BI';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 5, id, FALSE, 7 FROM skills WHERE name = 'TensorFlow';

-- DevOps Engineer (career_path_id = 6)
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 6, id, TRUE, 1 FROM skills WHERE name = 'Linux';
INSERT IGNORE INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 6, id, TRUE, 2 FROM skills WHERE name = 'Docker';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 6, id, TRUE, 3 FROM skills WHERE name = 'Kubernetes';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 6, id, TRUE, 4 FROM skills WHERE name = 'CI/CD';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 6, id, TRUE, 5 FROM skills WHERE name = 'AWS';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 6, id, FALSE, 6 FROM skills WHERE name = 'Git';

-- Mobile Developer (career_path_id = 7)
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 7, id, TRUE, 1 FROM skills WHERE name = 'Flutter';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 7, id, FALSE, 2 FROM skills WHERE name = 'Swift';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 7, id, FALSE, 3 FROM skills WHERE name = 'Kotlin';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 7, id, TRUE, 4 FROM skills WHERE name = 'REST API';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 7, id, TRUE, 5 FROM skills WHERE name = 'Git';

-- Cybersecurity Engineer (career_path_id = 8)
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 8, id, TRUE, 1 FROM skills WHERE name = 'Networking';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 8, id, TRUE, 2 FROM skills WHERE name = 'Linux';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 8, id, TRUE, 3 FROM skills WHERE name = 'Cybersecurity Fundamentals';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 8, id, TRUE, 4 FROM skills WHERE name = 'Penetration Testing';
INSERT INTO career_path_skills (career_path_id, skill_id, is_required, priority_order)
SELECT 8, id, FALSE, 5 FROM skills WHERE name = 'Python';


SELECT cp.title, COUNT(cps.skill_id) AS skill_count
FROM career_paths cp
LEFT JOIN career_path_skills cps ON cp.id = cps.career_path_id
GROUP BY cp.id, cp.title
ORDER BY cp.id;