-- Auth API test setup
-- Clean up auth-related data

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE course_comments;
TRUNCATE TABLE video_progress;
TRUNCATE TABLE videos;
TRUNCATE TABLE courses;
TRUNCATE TABLE profiles;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert categories (needed for course creation)
INSERT INTO categories (id, name_ja, name_en, slug, created_at, updated_at) VALUES
('cat-programming-001', 'プログラミング', 'Programming', 'programming', NOW(), NOW()),
('cat-design-002', 'デザイン', 'Design', 'design', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Pre-create a user for login tests (TC-AUTH-010, TC-AUTH-012)
-- Password: "password123" (hashed with bcrypt)
INSERT INTO profiles (id, email, display_name, hashed_password, role, created_at, updated_at) VALUES
('existing-user-001', 'existing@example.com', 'Existing User', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'user', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
