-- Update video URL to match actual storage filename
UPDATE public.projects 
SET video_url = 'Safari Drive Moment.mp4'
WHERE video_url = 'Romina Car.mp4';