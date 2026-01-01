-- Verify no orphaned categories (categories with invalid data)
SELECT
    id,
    name_ja,
    name_en,
    slug,
    CASE
        WHEN id IS NULL OR id = '' THEN 'NO_ID'
        WHEN name_ja IS NULL OR name_ja = '' THEN 'NO_NAME_JA'
        WHEN name_en IS NULL OR name_en = '' THEN 'NO_NAME_EN'
        WHEN slug IS NULL OR slug = '' THEN 'NO_SLUG'
        ELSE 'VALID'
    END as integrity_status
FROM categories
ORDER BY id;
