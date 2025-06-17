-- VIP Levels Data
INSERT INTO vip_levels (
    level_id, 
    investment_amount, 
    daily_earning, 
    per_task_earning, 
    min_withdrawal, 
    max_total_withdrawal, 
    investment_area,
    daily_tasks
) VALUES
(0, 0, 20, 5.00, 60, 300, 'Free Trial', 
 '[{"name": "View ad", "value": 5.00}, {"name": "Spin reward", "value": 5.00}, {"name": "Share post", "value": 5.00}, {"name": "Watch video", "value": 5.00}]'),

(1, 1200, 40, 10.00, 40, 4800, 'Digital Advertising',
 '[{"name": "Click ad", "value": 10.00}, {"name": "Comment on promo", "value": 10.00}, {"name": "Share promotion", "value": 10.00}, {"name": "Claim reward", "value": 10.00}]'),

(2, 3000, 100, 25.00, 100, 12000, 'E-commerce',
 '[{"name": "View product", "value": 25.00}, {"name": "Simulate order", "value": 25.00}, {"name": "Track delivery", "value": 25.00}, {"name": "Rate item", "value": 25.00}]'),

(3, 6000, 200, 50.00, 200, 24000, 'Retail Strategy',
 '[{"name": "Analyze prices", "value": 50.00}, {"name": "Wishlist item", "value": 50.00}, {"name": "Read tip", "value": 50.00}, {"name": "Give feedback", "value": 50.00}]'),

(4, 12000, 400, 100.00, 400, 48000, 'Marketing Pools',
 '[{"name": "Review brand", "value": 100.00}, {"name": "Share campaign", "value": 100.00}, {"name": "Answer poll", "value": 100.00}, {"name": "Referral action", "value": 100.00}]'),

(5, 21000, 700, 175.00, 700, 84000, 'Franchise Simulation',
 '[{"name": "Register order", "value": 175.00}, {"name": "Watch launch", "value": 175.00}, {"name": "Simulate traffic", "value": 175.00}, {"name": "Rate ad", "value": 175.00}]'),

(6, 33000, 1100, 275.00, 1100, 132000, 'Fintech Engagement',
 '[{"name": "Simulate invest", "value": 275.00}, {"name": "Track return", "value": 275.00}, {"name": "Report result", "value": 275.00}, {"name": "Take quiz", "value": 275.00}]'),

(7, 60000, 2000, 500.00, 2000, 240000, 'Tech Startup Projects',
 '[{"name": "Budget simulation", "value": 500.00}, {"name": "Review startup", "value": 500.00}, {"name": "Vote project", "value": 500.00}, {"name": "Submit strategy", "value": 500.00}]'),

(8, 120000, 4000, 1000.00, 4000, 480000, 'Global Equity Markets',
 '[{"name": "Sim portfolio", "value": 1000.00}, {"name": "Read earnings report", "value": 1000.00}, {"name": "Analyze trends", "value": 1000.00}, {"name": "Predict outlook", "value": 1000.00}]');