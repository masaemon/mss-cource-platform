-- Verify timestamp fields in database
SELECT
    id,
    slug,
    created_at,
    updated_at,
    CASE
        WHEN created_at IS NOT NULL AND updated_at IS NOT NULL THEN 'VALID'
        ELSE 'INVALID'
    END as timestamp_status
FROM categories
ORDER BY created_at;
