-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE admin_level AS ENUM ('high', 'low');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE earning_type AS ENUM ('task', 'referral', 'bonus', 'purchase', 'upgrade');
CREATE TYPE suspension_status AS ENUM ('active', 'appealed', 'reversed', 'expired');

-- Then include all your table creation SQL from your original design
-- (users, admins, vip_levels, purchase_requests, etc.)