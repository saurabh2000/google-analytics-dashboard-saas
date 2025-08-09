-- Seed: 001_demo_data
-- Created: 2025-08-09
-- Description: Demo data for development and testing

-- Insert demo user
INSERT INTO "User" (id, email, name, image, "createdAt", "updatedAt")
VALUES (
    'demo-user-1',
    'demo@example.com',
    'Demo User',
    'https://lh3.googleusercontent.com/a/default-user=s96-c',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert demo subscription
INSERT INTO "Subscription" (id, "userId", "planType", status, "startDate", "endDate", "billingCycle", "createdAt", "updatedAt")
VALUES (
    'demo-sub-1',
    'demo-user-1',
    'PROFESSIONAL',
    'ACTIVE',
    NOW() - INTERVAL '30 days',
    NOW() + INTERVAL '335 days',
    'YEARLY',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert demo dashboards
INSERT INTO "Dashboard" (id, "userId", name, description, layout, settings, "isDefault", "createdAt", "updatedAt")
VALUES 
(
    'demo-dash-1',
    'demo-user-1',
    'Main Analytics Dashboard',
    'Primary dashboard for website analytics',
    '{"version": 1, "layout": []}'::jsonb,
    '{"theme": "light", "refreshInterval": 300}'::jsonb,
    true,
    NOW(),
    NOW()
),
(
    'demo-dash-2',
    'demo-user-1',
    'E-commerce Dashboard',
    'Track sales and conversion metrics',
    '{"version": 1, "layout": []}'::jsonb,
    '{"theme": "light", "refreshInterval": 300}'::jsonb,
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert demo widgets
INSERT INTO "Widget" (id, "dashboardId", type, title, configuration, position, size, "dataSource", "refreshRate", "createdAt", "updatedAt")
VALUES 
(
    'demo-widget-1',
    'demo-dash-1',
    'KPI_CARD',
    'Total Users',
    '{"format": "number", "comparison": "previousPeriod"}'::jsonb,
    '{"x": 0, "y": 0}'::jsonb,
    '{"w": 3, "h": 2}'::jsonb,
    '{"metric": "totalUsers", "dimensions": []}'::jsonb,
    300,
    NOW(),
    NOW()
),
(
    'demo-widget-2',
    'demo-dash-1',
    'LINE_CHART',
    'User Trend',
    '{"showLegend": true, "showGrid": true}'::jsonb,
    '{"x": 3, "y": 0}'::jsonb,
    '{"w": 6, "h": 4}'::jsonb,
    '{"metric": "activeUsers", "dimensions": ["date"]}'::jsonb,
    300,
    NOW(),
    NOW()
),
(
    'demo-widget-3',
    'demo-dash-1',
    'PIE_CHART',
    'Traffic Sources',
    '{"showLabels": true, "showPercentages": true}'::jsonb,
    '{"x": 9, "y": 0}'::jsonb,
    '{"w": 3, "h": 4}'::jsonb,
    '{"metric": "sessions", "dimensions": ["source"]}'::jsonb,
    300,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert demo payment record
INSERT INTO "Payment" (id, "subscriptionId", amount, currency, status, "stripeId", "invoiceId", description, "createdAt")
VALUES (
    'demo-payment-1',
    'demo-sub-1',
    99.00,
    'usd',
    'COMPLETED',
    'pi_demo_123456',
    'in_demo_123456',
    'Annual subscription - Professional Plan',
    NOW() - INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;