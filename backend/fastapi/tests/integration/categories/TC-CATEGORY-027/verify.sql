-- Verify foreign key relationship between courses and categories
SELECT
    c.id as course_id,
    c.title_ja,
    c.category_id,
    cat.name_ja as category_name,
    CASE
        WHEN cat.id IS NOT NULL THEN 'VALID'
        ELSE 'INVALID'
    END as fk_status
FROM courses c
LEFT JOIN categories cat ON c.category_id = cat.id
ORDER BY c.id;
