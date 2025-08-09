-- Seed: 002_demo_organizations
-- Created: 2025-08-09
-- Description: Update demo data with organization support

-- Update demo user's personal organization
UPDATE "Organization" 
SET name = 'Demo Workspace',
    slug = 'demo-workspace'
WHERE id = 'org-demo-user-1';

-- Update demo dashboards to belong to the organization
UPDATE "Dashboard"
SET "organizationId" = 'org-demo-user-1'
WHERE "userId" = 'demo-user-1' AND "organizationId" IS NULL;

-- Update demo subscription to belong to the organization
UPDATE "Subscription"
SET "organizationId" = 'org-demo-user-1'  
WHERE "userId" = 'demo-user-1' AND "organizationId" IS NULL;