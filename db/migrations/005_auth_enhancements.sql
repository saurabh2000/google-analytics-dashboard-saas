-- Migration 005: Authentication Enhancements - Roles, Tenants, and RBAC
-- Version: 005
-- Date: 2025-01-12

-- Add UserRole enum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TENANT_OWNER', 'USER');

-- Add InvitationStatus enum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- Create Tenant table
CREATE TABLE IF NOT EXISTS "Tenant" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "logo" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes for Tenant
CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_slug_key" ON "Tenant"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_domain_key" ON "Tenant"("domain");
CREATE INDEX IF NOT EXISTS "Tenant_slug_idx" ON "Tenant"("slug");
CREATE INDEX IF NOT EXISTS "Tenant_domain_idx" ON "Tenant"("domain");

-- Update User table with role and tenant support
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "role" "UserRole" DEFAULT 'USER',
ADD COLUMN IF NOT EXISTS "tenantId" TEXT,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

-- Add foreign key constraint for tenantId
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'User_tenantId_fkey') THEN
        ALTER TABLE "User" 
        ADD CONSTRAINT "User_tenantId_fkey" 
        FOREIGN KEY ("tenantId") 
        REFERENCES "Tenant"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Create indexes for User
CREATE INDEX IF NOT EXISTS "User_tenantId_idx" ON "User"("tenantId");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- Create TenantInvitation table
CREATE TABLE IF NOT EXISTS "TenantInvitation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantInvitation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TenantInvitation_tenantId_fkey" 
        FOREIGN KEY ("tenantId") 
        REFERENCES "Tenant"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Create indexes for TenantInvitation
CREATE UNIQUE INDEX IF NOT EXISTS "TenantInvitation_token_key" ON "TenantInvitation"("token");
CREATE INDEX IF NOT EXISTS "TenantInvitation_email_idx" ON "TenantInvitation"("email");
CREATE INDEX IF NOT EXISTS "TenantInvitation_token_idx" ON "TenantInvitation"("token");
CREATE INDEX IF NOT EXISTS "TenantInvitation_tenantId_idx" ON "TenantInvitation"("tenantId");

-- Update existing admin users based on ADMIN_EMAILS environment variable
-- This is a one-time update to set roles for existing admin users
-- Replace 'admin@example.com' with actual admin emails from ADMIN_EMAILS env var
UPDATE "User" 
SET "role" = 'ADMIN' 
WHERE "email" IN (
    -- These should be replaced with actual admin emails from environment
    SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
) AND "role" = 'USER';

-- Create a default tenant for existing users without tenants
DO $$
DECLARE
    default_tenant_id TEXT;
BEGIN
    -- Check if we need to create a default tenant
    IF EXISTS (SELECT 1 FROM "User" WHERE "tenantId" IS NULL LIMIT 1) THEN
        -- Insert default tenant
        INSERT INTO "Tenant" ("id", "name", "slug", "settings")
        VALUES (gen_random_uuid()::text, 'Default Organization', 'default-org', '{}')
        RETURNING "id" INTO default_tenant_id;
        
        -- Assign all users without tenants to the default tenant
        UPDATE "User" 
        SET "tenantId" = default_tenant_id 
        WHERE "tenantId" IS NULL;
    END IF;
END $$;

-- Add trigger to update updatedAt timestamp for Tenant
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tenant_updated_at ON "Tenant";
CREATE TRIGGER update_tenant_updated_at 
    BEFORE UPDATE ON "Tenant"
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE "Tenant" IS 'Multi-tenant organizations';
COMMENT ON TABLE "TenantInvitation" IS 'Invitations to join tenants';
COMMENT ON COLUMN "User"."role" IS 'User role for RBAC';
COMMENT ON COLUMN "User"."tenantId" IS 'Associated tenant/organization';
COMMENT ON COLUMN "User"."isActive" IS 'Whether user account is active';
COMMENT ON COLUMN "User"."lastLoginAt" IS 'Last login timestamp';