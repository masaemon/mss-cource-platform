-- Verify that the course was created
SELECT
    COUNT(*) as course_count,
    title_ja,
    instructor_id,
    is_published,
    category_id
FROM courses
WHERE title_ja = 'Pythonプログラミング入門'
GROUP BY title_ja, instructor_id, is_published, category_id;
