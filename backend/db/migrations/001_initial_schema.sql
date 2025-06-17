-- Main tables creation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    inviter_id INTEGER REFERENCES users(user_id),
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    vip_level INTEGER DEFAULT 0,
    vip_amount DECIMAL(15,2) DEFAULT 0.00,
    balance DECIMAL(15,2) DEFAULT 0.00,
    total_earnings DECIMAL(15,2) DEFAULT 0.00,
    total_withdrawn DECIMAL(15,2) DEFAULT 0.00,
    total_referral_bonus DECIMAL(15,2) DEFAULT 0.00,
    first_level_invites INTEGER DEFAULT 0,
    second_level_invites INTEGER DEFAULT 0,
    third_level_invites INTEGER DEFAULT 0,
    fourth_level_invites INTEGER DEFAULT 0,
    payment_method VARCHAR(50),
    payment_details TEXT,
    account_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    admin_level VARCHAR(10) CHECK (admin_level IN ('high', 'low')) NOT NULL,
    permissions JSONB,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vip_levels (
    level_id INTEGER PRIMARY KEY,
    investment_amount DECIMAL(15,2) NOT NULL,
    daily_earning DECIMAL(15,2) NOT NULL,
    per_task_earning DECIMAL(15,2) NOT NULL,
    min_withdrawal DECIMAL(15,2) NOT NULL,
    max_total_withdrawal DECIMAL(15,2) NOT NULL,
    investment_area VARCHAR(100) NOT NULL,
    daily_tasks JSONB NOT NULL
);

-- Transaction tables
CREATE TABLE purchase_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) NOT NULL,
    vip_level INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_proof_url TEXT,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_id INTEGER REFERENCES admins(admin_id),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE TABLE withdrawal_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_details TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_id INTEGER REFERENCES admins(admin_id),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    ip_address VARCHAR(45)
);

-- Indexes for performance
CREATE INDEX idx_users_inviter_id ON users(inviter_id);
CREATE INDEX idx_users_vip_level ON users(vip_level);
CREATE INDEX idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);