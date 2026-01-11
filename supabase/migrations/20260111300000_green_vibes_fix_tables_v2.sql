-- Fix Green Vibes tables - properly delete and recreate with correct numbers

-- First delete ALL Green Vibes tables (use CASCADE approach)
DELETE FROM cafe_tables WHERE restaurant_id = 'c0000000-0000-0000-0000-000000000003';

-- Insert 4 tables with NEW unique IDs and correct numbers
INSERT INTO cafe_tables (id, number, qr_code, section, status, restaurant_id) VALUES
  ('c3100000-0000-0000-0000-000000000001', '1', 'VIBES-01', 'Main', 'available', 'c0000000-0000-0000-0000-000000000003'),
  ('c3100000-0000-0000-0000-000000000002', '2', 'VIBES-02', 'Main', 'available', 'c0000000-0000-0000-0000-000000000003'),
  ('c3100000-0000-0000-0000-000000000003', '3', 'VIBES-03', 'Main', 'available', 'c0000000-0000-0000-0000-000000000003'),
  ('c3100000-0000-0000-0000-000000000004', '4', 'VIBES-04', 'Main', 'available', 'c0000000-0000-0000-0000-000000000003');
