-- Common setup for all integration tests
-- This script initializes the database with basic test data

-- Clean up existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE course_comments;
TRUNCATE TABLE video_progress;
TRUNCATE TABLE videos;
TRUNCATE TABLE courses;
TRUNCATE TABLE categories;
TRUNCATE TABLE profiles;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert test categories
INSERT INTO categories (id, name_ja, name_en, slug, created_at, updated_at) VALUES
('cat-programming-001', 'プログラミング', 'Programming', 'programming', NOW(), NOW()),
('cat-design-002', 'デザイン', 'Design', 'design', NOW(), NOW()),
('cat-business-003', 'ビジネス', 'Business', 'business', NOW(), NOW());

-- Note: profiles will be created via API (signup)
-- Note: courses, videos, progress, comments will be created in individual test setups
