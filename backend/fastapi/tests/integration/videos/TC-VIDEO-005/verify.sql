-- Verify that the video was created
SELECT
    COUNT(*) as video_count,
    title_ja,
    youtube_video_id,
    order_number,
    course_id
FROM videos
WHERE title_ja = 'Python入門 第4回'
GROUP BY title_ja, youtube_video_id, order_number, course_id;
