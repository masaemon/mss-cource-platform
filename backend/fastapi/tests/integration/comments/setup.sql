-- Comments API Test Setup
-- This script sets up test data for comments API integration tests
-- Note: common_setup.sql is run by run_all_tests.sh before this file

-- Create test users
INSERT INTO profiles (id, email, display_name, hashed_password, role, avatar_url, created_at, updated_at) VALUES
('user-001', 'user1@example.com', 'User One',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'user', NULL, NOW(), NOW()),
('user-002', 'user2@example.com', 'User Two',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'user', NULL, NOW(), NOW()),
('instructor-001', 'instructor1@example.com', 'Instructor One',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'instructor', NULL, NOW(), NOW()),
('instructor-002', 'instructor2@example.com', 'Instructor Two',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'instructor', NULL, NOW(), NOW()),
('admin-001', 'admin@example.com', 'Admin User',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'admin', NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Create test courses
INSERT INTO courses (id, title_ja, title_en, category_id, instructor_id, is_published, created_at, updated_at) VALUES
('course-001', 'テストコース1', 'Test Course 1', 'cat-programming-001', 'instructor-001', true, NOW(), NOW()),
('course-002', 'テストコース2', 'Test Course 2', 'cat-programming-001', 'instructor-002', true, NOW(), NOW()),
('course-003', '空のコース', 'Empty Course', 'cat-design-002', 'instructor-001', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Create test comments for course-001
INSERT INTO course_comments (id, course_id, user_id, content, is_instructor_reply, created_at, updated_at) VALUES
('comment-001', 'course-001', 'user-001', 'とても分かりやすかったです！', false, NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 3 HOUR),
('comment-002', 'course-001', 'instructor-001', 'ご質問ありがとうございます。', true, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR),
('comment-003', 'course-001', 'user-002', '続きが楽しみです', false, NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 1 HOUR)
ON DUPLICATE KEY UPDATE updated_at = NOW();
