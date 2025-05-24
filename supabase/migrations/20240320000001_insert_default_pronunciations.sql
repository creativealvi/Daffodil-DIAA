-- Insert the default DIAA pronunciation
INSERT INTO public.pronunciations 
(word, pronunciation, created_at, updated_at, is_active)
VALUES 
('DIAA', 'diiaa', NOW(), NOW(), true)
ON CONFLICT (word) WHERE is_active = true
DO UPDATE SET 
  pronunciation = EXCLUDED.pronunciation,
  updated_at = NOW(); 