-- Initial database setup script
-- This file is executed when the database container starts for the first time

-- Set character set to utf8mb4 for emoji support
ALTER DATABASE mss_course_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant all privileges to mss_user
GRANT ALL PRIVILEGES ON mss_course_platform.* TO 'mss_user'@'%';
FLUSH PRIVILEGES;
