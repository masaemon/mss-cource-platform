-- Verify that the user was created in the database
SELECT
    COUNT(*) as user_count,
    email,
    display_name,
    role,
    (hashed_password IS NOT NULL AND hashed_password != '') as password_is_hashed
FROM profiles
WHERE email = 'newuser@example.com'
GROUP BY email, display_name, role;
