-- Migration: 002_add_tenant_support
-- Created: 2025-08-09
-- Description: Add multi-tenant support with organizations

-- Create Organization table
CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL, -- URL-friendly identifier
    "domain" TEXT, -- Custom domain if any
    "logo" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Create OrganizationMember table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- Add organizationId to existing tables
ALTER TABLE "Dashboard" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Organization_slug_key" ON "Organization"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Organization_domain_key" ON "Organization"("domain");
CREATE INDEX IF NOT EXISTS "Organization_name_idx" ON "Organization"("name");

CREATE UNIQUE INDEX IF NOT EXISTS "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");
CREATE INDEX IF NOT EXISTS "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");
CREATE INDEX IF NOT EXISTS "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

CREATE INDEX IF NOT EXISTS "Dashboard_organizationId_idx" ON "Dashboard"("organizationId");
CREATE INDEX IF NOT EXISTS "Subscription_organizationId_idx" ON "Subscription"("organizationId");

-- Add foreign key constraints
ALTER TABLE "OrganizationMember" DROP CONSTRAINT IF EXISTS "OrganizationMember_organizationId_fkey";
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" 
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrganizationMember" DROP CONSTRAINT IF EXISTS "OrganizationMember_userId_fkey";
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Dashboard" DROP CONSTRAINT IF EXISTS "Dashboard_organizationId_fkey";
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_organizationId_fkey" 
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_organizationId_fkey";
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" 
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data: Create default organization for each user
INSERT INTO "Organization" (id, name, slug)
SELECT 
    'org-' || "User".id,
    COALESCE("User".name, "User".email, 'Personal Workspace'),
    'personal-' || "User".id
FROM "User"
WHERE NOT EXISTS (
    SELECT 1 FROM "OrganizationMember" 
    WHERE "OrganizationMember"."userId" = "User".id
);

-- Add users as owners of their personal organizations
INSERT INTO "OrganizationMember" ("id", "organizationId", "userId", "role")
SELECT 
    'member-' || "User".id,
    'org-' || "User".id,
    "User".id,
    'owner'
FROM "User"
WHERE NOT EXISTS (
    SELECT 1 FROM "OrganizationMember" 
    WHERE "OrganizationMember"."userId" = "User".id
);

-- Update existing dashboards to belong to user's personal organization
UPDATE "Dashboard" 
SET "organizationId" = 'org-' || "userId"
WHERE "organizationId" IS NULL;

-- Update existing subscriptions to belong to user's personal organization  
UPDATE "Subscription"
SET "organizationId" = 'org-' || "userId"
WHERE "organizationId" IS NULL;

-- Record migration
INSERT INTO schema_migrations (version) VALUES ('002_add_tenant_support') ON CONFLICT DO NOTHING;