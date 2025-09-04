-- Add Romina video project to reels
INSERT INTO public.projects (
  title,
  client,
  date,
  video_url,
  thumbnail_url,
  is_video,
  user_id
) VALUES (
  'Romina Car',
  'Personal Project',
  '2025-08-31',
  'Romina Car.mp4',
  null,
  true,
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT DO NOTHING;