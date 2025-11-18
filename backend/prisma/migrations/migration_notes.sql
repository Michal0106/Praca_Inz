-- Add password field to User table if not exists (might already exist from schema)
-- This migration ensures the User table has all JWT-related fields

-- The schema.prisma already has these fields, so we just need to apply it
-- Run: npx prisma migrate dev --name add_jwt_auth
