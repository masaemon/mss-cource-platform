-- Videos API Test Setup
-- This script sets up test data for video API integration tests
-- Note: common_setup.sql is run by run_all_tests.sh before this file

-- Create test users
INSERT INTO profiles (id, email, display_name, hashed_password, role, created_at, updated_at) VALUES
('instructor-001', 'instructor1@example.com', 'Instructor One',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'instructor', NOW(), NOW()),
('instructor-002', 'instructor2@example.com', 'Instructor Two',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'instructor', NOW(), NOW()),
('admin-001', 'admin@example.com', 'Admin User',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'admin', NOW(), NOW()),
('user-001', 'user@example.com', 'Regular User',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'user', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Create test courses
INSERT INTO courses (id, title_ja, title_en, category_id, instructor_id, is_published, created_at, updated_at) VALUES
('course-001', 'テストコース1', 'Test Course 1', 'cat-programming-001', 'instructor-001', true, NOW(), NOW()),
('course-002', 'テストコース2', 'Test Course 2', 'cat-programming-001', 'instructor-002', true, NOW(), NOW()),
('course-003', '空のコース', 'Empty Course', 'cat-design-002', 'instructor-001', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Create test videos for course-001
INSERT INTO videos (id, course_id, title_ja, title_en, description_ja, description_en, youtube_url, youtube_video_id, duration_seconds, order_number, created_at, updated_at) VALUES
('video-001', 'course-001', '第1回', 'Lesson 1', '導入', 'Introduction', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 300, 1, NOW(), NOW()),
('video-002', 'course-001', '第2回', 'Lesson 2', '基礎', 'Basics', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 600, 2, NOW(), NOW()),
('video-003', 'course-001', '第3回', 'Lesson 3', '応用', 'Advanced', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 450, 3, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Create test videos for course-002 (for other instructor's course)
INSERT INTO videos (id, course_id, title_ja, youtube_url, youtube_video_id, order_number, created_at, updated_at) VALUES
('video-004', 'course-002', '他講師の動画', 'https://www.youtube.com/watch?v=test12345', 'test12345', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
