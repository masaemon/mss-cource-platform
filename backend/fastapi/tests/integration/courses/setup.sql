-- Courses API Test Setup
-- This script sets up test data for course API integration tests
-- Note: common_setup.sql is run by run_all_tests.sh before this file

-- Create test users with different roles
INSERT INTO profiles (id, email, display_name, hashed_password, role, bio, created_at, updated_at) VALUES
('instructor-001', 'instructor1@example.com', 'Instructor One',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'instructor', 'Experienced instructor', NOW(), NOW()),
('instructor-002', 'instructor2@example.com', 'Instructor Two',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'instructor', 'Another instructor', NOW(), NOW()),
('admin-001', 'admin@example.com', 'Admin User',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'admin', 'System administrator', NOW(), NOW()),
('user-001', 'user@example.com', 'Regular User',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'user', 'Just a regular user', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Create test courses for various test scenarios
INSERT INTO courses (id, title_ja, title_en, description_ja, description_en, thumbnail_url, category_id, instructor_id, is_published, created_at, updated_at) VALUES
-- Published courses for listing tests
('course-001', 'Pythonプログラミング入門', 'Introduction to Python', 'Python基礎を学ぶコース', 'Learn Python basics', 'https://example.com/python.jpg', 'cat-programming-001', 'instructor-001', true, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY),
('course-002', 'Python応用', 'Advanced Python', '初心者向けPython応用', 'Advanced Python for beginners', 'https://example.com/python-adv.jpg', 'cat-programming-001', 'instructor-001', true, NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 9 DAY),
('course-003', 'Webデザイン基礎', 'Web Design Basics', 'デザインの基本', 'Design fundamentals', 'https://example.com/design.jpg', 'cat-design-002', 'instructor-002', true, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY),

-- Unpublished courses
('course-004', '非公開コース1', 'Unpublished Course 1', '非公開', 'Unpublished', NULL, 'cat-programming-001', 'instructor-001', false, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY),
('course-005', '非公開コース2', 'Unpublished Course 2', '非公開', 'Unpublished', NULL, 'cat-design-002', 'instructor-002', false, NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 6 DAY)
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Create videos for testing video_count
INSERT INTO videos (id, course_id, title_ja, title_en, description_ja, description_en, youtube_url, youtube_video_id, duration_seconds, order_number, created_at, updated_at) VALUES
('video-001', 'course-001', '第1回', 'Lesson 1', '導入', 'Introduction', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 300, 1, NOW(), NOW()),
('video-002', 'course-001', '第2回', 'Lesson 2', '基礎', 'Basics', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 600, 2, NOW(), NOW()),
('video-003', 'course-001', '第3回', 'Lesson 3', '応用', 'Advanced', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 450, 3, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
