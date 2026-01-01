-- Progress API Test Setup
-- This script sets up test data for progress API integration tests
-- Note: common_setup.sql is run by run_all_tests.sh before this file

-- Create test users
INSERT INTO profiles (id, email, display_name, hashed_password, role, created_at, updated_at) VALUES
('user-001', 'user1@example.com', 'User One',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'user', NOW(), NOW()),
('user-002', 'user2@example.com', 'User Two',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'user', NOW(), NOW()),
('instructor-001', 'instructor1@example.com', 'Instructor One',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y9hZZbdJEL4G', 'instructor', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Create test courses
INSERT INTO courses (id, title_ja, title_en, category_id, instructor_id, is_published, created_at, updated_at) VALUES
('course-001', 'テストコース1', 'Test Course 1', 'cat-programming-001', 'instructor-001', true, NOW(), NOW()),
('course-002', 'テストコース2', 'Test Course 2', 'cat-programming-001', 'instructor-001', true, NOW(), NOW()),
('course-003', '空のコース', 'Empty Course', 'cat-design-002', 'instructor-001', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Create test videos for course-001 (3 videos)
INSERT INTO videos (id, course_id, title_ja, title_en, youtube_url, youtube_video_id, order_number, created_at, updated_at) VALUES
('video-001', 'course-001', '第1回', 'Lesson 1', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 1, NOW(), NOW()),
('video-002', 'course-001', '第2回', 'Lesson 2', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 2, NOW(), NOW()),
('video-003', 'course-001', '第3回', 'Lesson 3', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 3, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Create test videos for course-002 (2 videos)
INSERT INTO videos (id, course_id, title_ja, youtube_url, youtube_video_id, order_number, created_at, updated_at) VALUES
('video-004', 'course-002', 'コース2動画1', 'https://www.youtube.com/watch?v=test12345', 'test12345', 1, NOW(), NOW()),
('video-005', 'course-002', 'コース2動画2', 'https://www.youtube.com/watch?v=test12345', 'test12345', 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
