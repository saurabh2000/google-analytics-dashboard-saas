-- Migration: 003_fix_organization_creation
-- Created: 2025-08-09
-- Description: Fix organization creation for new users

-- Drop the NOT NULL constraint on organizationId temporarily to allow migration
ALTER TABLE "Dashboard" ALTER COLUMN "organizationId" DROP NOT NULL;
ALTER TABLE "Subscription" ALTER COLUMN "organizationId" DROP NOT NULL;

-- Create a function to automatically create organization for new users
CREATE OR REPLACE FUNCTION create_default_organization_for_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id TEXT;
    member_id TEXT;
    org_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Generate IDs
    org_id := 'org-' || NEW.id;
    member_id := 'member-' || NEW.id;
    
    -- Generate unique slug
    org_slug := 'personal-' || NEW.id;
    
    -- Create organization
    INSERT INTO "Organization" (id, name, slug, settings, "createdAt", "updatedAt")
    VALUES (
        org_id,
        COALESCE(NEW.name, NEW.email, 'Personal Workspace'),
        org_slug,
        '{}',
        NOW(),
        NOW()
    );
    
    -- Add user as owner
    INSERT INTO "OrganizationMember" (id, "organizationId", "userId", role, "joinedAt")
    VALUES (member_id, org_id, NEW.id, 'owner', NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new users
DROP TRIGGER IF EXISTS create_org_on_user_insert ON "User";
CREATE TRIGGER create_org_on_user_insert
    AFTER INSERT ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION create_default_organization_for_user();

-- Record migration
INSERT INTO schema_migrations (version) VALUES ('003_fix_organization_creation') ON CONFLICT DO NOTHING;