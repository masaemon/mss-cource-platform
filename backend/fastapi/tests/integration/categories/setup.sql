-- Categories API Test Setup
-- This script sets up test data for categories API integration tests
-- Note: common_setup.sql is run by run_all_tests.sh before this file

-- Add more categories for testing
INSERT INTO categories (id, name_ja, name_en, slug, created_at, updated_at) VALUES
('cat-marketing-004', 'マーケティング', 'Marketing', 'marketing', NOW(), NOW()),
('cat-datascience-005', 'データサイエンス', 'Data Science', 'data-science', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
