-- Create Admin User Script for Veezet Platform
-- =============================================
-- This script creates an admin user for the Veezet platform
-- 
-- Instructions:
-- 1. Replace the password hash below with a properly hashed password
-- 2. Change the email if needed
-- 3. Run this script in your PostgreSQL database
--
-- To generate a password hash, you can use:
-- - Online bcrypt generators (search "bcrypt generator online")
-- - Node.js: bcrypt.hash('yourpassword', 12)
-- - Or use the provided Node.js scripts in this directory

-- Insert admin user
INSERT INTO "User" (
    id,
    name,
    email,
    password,
    role,
    "createdAt",
    "updatedAt"
) VALUES (
    -- Generate a CUID-like ID (PostgreSQL extension needed for gen_random_uuid)
    'admin_' || replace(gen_random_uuid()::text, '-', ''),
    'Admin User',
    'admin@veezet.com',
    -- This is a bcrypt hash for password 'admin123' (cost factor 12)
    -- SECURITY: Replace this with your own secure password hash!
    '$2b$12$LQv3c1yqBwEHXGokqBp8W.O6T3p/JWCdUFD5UrG2D4ZYHANKnqLBi',
    'ADMIN',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    "updatedAt" = NOW();

-- Verify the admin user was created
SELECT 
    id, 
    name, 
    email, 
    role, 
    "createdAt",
    "updatedAt"
FROM "User" 
WHERE email = 'admin@veezet.com';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Admin user created successfully!';
    RAISE NOTICE '📧 Email: admin@veezet.com';
    RAISE NOTICE '🔒 Password: admin123 (CHANGE THIS IMMEDIATELY!)';
    RAISE NOTICE '🔑 Role: ADMIN';
    RAISE NOTICE '⚠️  Remember to change the default password after first login!';
END $$;
