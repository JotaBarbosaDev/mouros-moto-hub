-- Migration: Create Advanced Audit System
-- Created: 2025-05-25
-- Description: Creates comprehensive audit logging system with GDPR compliance

-- =====================================================
-- 1. SYSTEM AUDIT LOGS TABLE (Main audit table)
-- =====================================================

CREATE TABLE IF NOT EXISTS system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic audit information
    action VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'authentication', 'member_management', 'financial', 'inventory', 
        'events', 'vehicles', 'system', 'security', 'data_access', 
        'communication', 'compliance'
    )),
    severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN (
        'low', 'medium', 'high', 'critical'
    )),
    
    -- User and session information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    username VARCHAR(255),
    user_role VARCHAR(50),
    session_id VARCHAR(255),
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url TEXT,
    request_headers JSONB,
    request_body JSONB,
    
    -- Response details
    response_status INTEGER,
    response_body JSONB,
    
    -- Resource information
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    
    -- Additional context
    description TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    
    -- GDPR and compliance
    contains_personal_data BOOLEAN DEFAULT false,
    retention_category VARCHAR(50) DEFAULT 'standard',
    anonymized_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_user_id ON system_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_category ON system_audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_severity ON system_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_created_at ON system_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_action ON system_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_ip_address ON system_audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_resource ON system_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_retention ON system_audit_logs(retention_category, created_at);

-- =====================================================
-- 2. AUDIT LOG ACCESS RULES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_log_access_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Rule identification
    rule_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    
    -- Access control
    user_role VARCHAR(50) NOT NULL,
    allowed_categories TEXT[] NOT NULL DEFAULT '{}',
    allowed_severities TEXT[] NOT NULL DEFAULT '{}',
    
    -- Permissions
    can_view BOOLEAN DEFAULT true,
    can_export BOOLEAN DEFAULT false,
    can_configure_alerts BOOLEAN DEFAULT false,
    can_manage_retention BOOLEAN DEFAULT false,
    
    -- Filters and restrictions
    max_records_per_request INTEGER DEFAULT 1000,
    max_export_records INTEGER DEFAULT 10000,
    time_range_limit_days INTEGER DEFAULT 90,
    
    -- GDPR permissions
    can_access_personal_data BOOLEAN DEFAULT false,
    can_anonymize_data BOOLEAN DEFAULT false,
    can_export_personal_data BOOLEAN DEFAULT false,
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default access rules
INSERT INTO audit_log_access_rules (
    rule_name, description, user_role, allowed_categories, allowed_severities,
    can_view, can_export, can_configure_alerts, can_manage_retention,
    max_records_per_request, max_export_records, time_range_limit_days,
    can_access_personal_data, can_anonymize_data, can_export_personal_data
) VALUES 
-- Super Admin - Full access
('super_admin_access', 'Full system access for super administrators', 'super_admin',
 ARRAY['authentication', 'member_management', 'financial', 'inventory', 'events', 'vehicles', 'system', 'security', 'data_access', 'communication', 'compliance'],
 ARRAY['low', 'medium', 'high', 'critical'],
 true, true, true, true, 10000, 50000, 365, true, true, true),

-- System Admin - Almost full access
('system_admin_access', 'System administration access', 'system_admin',
 ARRAY['authentication', 'member_management', 'financial', 'inventory', 'events', 'vehicles', 'system', 'security', 'data_access', 'communication'],
 ARRAY['low', 'medium', 'high', 'critical'],
 true, true, true, false, 5000, 25000, 180, true, false, true),

-- Financial Admin - Financial focus
('financial_admin_access', 'Financial administration access', 'financial_admin',
 ARRAY['financial', 'member_management', 'authentication', 'data_access'],
 ARRAY['low', 'medium', 'high', 'critical'],
 true, true, false, false, 2000, 10000, 90, true, false, true),

-- Event Manager - Events and members
('event_manager_access', 'Event management access', 'event_manager',
 ARRAY['events', 'member_management', 'authentication'],
 ARRAY['low', 'medium', 'high'],
 true, true, false, false, 1000, 5000, 60, false, false, false),

-- Security Officer - Security focus
('security_officer_access', 'Security monitoring access', 'security_officer',
 ARRAY['authentication', 'security', 'system', 'data_access'],
 ARRAY['medium', 'high', 'critical'],
 true, true, true, false, 3000, 15000, 120, false, false, false),

-- Club Admin - General management
('club_admin_access', 'Club administration access', 'club_admin',
 ARRAY['member_management', 'events', 'vehicles', 'inventory', 'communication'],
 ARRAY['low', 'medium', 'high'],
 true, false, false, false, 1000, 2000, 30, false, false, false),

-- Regular Member - Limited access
('member_access', 'Regular member access', 'member',
 ARRAY['events', 'communication'],
 ARRAY['low', 'medium'],
 true, false, false, false, 100, 0, 7, false, false, false);

-- =====================================================
-- 3. AUDIT ALERT RULES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Rule identification
    rule_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    
    -- Alert conditions
    category VARCHAR(50),
    action VARCHAR(100),
    severity VARCHAR(20),
    user_role VARCHAR(50),
    
    -- Threshold conditions
    threshold_count INTEGER DEFAULT 1,
    threshold_time_window_minutes INTEGER DEFAULT 60,
    
    -- Pattern matching
    ip_pattern VARCHAR(255),
    user_agent_pattern TEXT,
    resource_pattern VARCHAR(255),
    
    -- Alert configuration
    alert_type VARCHAR(50) NOT NULL DEFAULT 'email' CHECK (alert_type IN (
        'email', 'webhook', 'slack', 'dashboard', 'sms'
    )),
    alert_recipients TEXT[] DEFAULT '{}',
    alert_webhook_url TEXT,
    
    -- Alert message
    alert_title VARCHAR(255),
    alert_message TEXT,
    
    -- Rule control
    is_active BOOLEAN DEFAULT true,
    cooldown_minutes INTEGER DEFAULT 60,
    max_alerts_per_day INTEGER DEFAULT 10,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    last_triggered_at TIMESTAMPTZ,
    trigger_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default alert rules
INSERT INTO audit_alert_rules (
    rule_name, description, category, action, severity,
    threshold_count, threshold_time_window_minutes,
    alert_type, alert_title, alert_message, is_active
) VALUES 
-- Security alerts
('failed_login_attempts', 'Alert on multiple failed login attempts', 'authentication', 'login_failed', 'high',
 5, 15, 'email', 'Multiple Failed Login Attempts', 'Multiple failed login attempts detected from the same IP address.', true),

('admin_access_alert', 'Alert on admin access outside business hours', 'authentication', 'admin_login', 'medium',
 1, 60, 'email', 'Admin Access After Hours', 'Administrator login detected outside normal business hours.', true),

('critical_security_event', 'Alert on critical security events', 'security', '%', 'critical',
 1, 1, 'email', 'Critical Security Alert', 'A critical security event has been detected in the system.', true),

-- Financial alerts
('large_financial_transaction', 'Alert on large financial transactions', 'financial', '%payment%', 'high',
 1, 1, 'email', 'Large Financial Transaction', 'A large financial transaction has been processed.', true),

-- System alerts
('system_error_burst', 'Alert on system error bursts', 'system', '%error%', 'high',
 10, 5, 'email', 'System Error Burst', 'Multiple system errors detected in a short time period.', true),

-- Data access alerts
('bulk_data_export', 'Alert on bulk data exports', 'data_access', 'export_%', 'medium',
 1, 60, 'email', 'Bulk Data Export', 'A bulk data export operation has been performed.', true);

-- =====================================================
-- 4. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_system_audit_logs_updated_at
    BEFORE UPDATE ON system_audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_log_access_rules_updated_at
    BEFORE UPDATE ON audit_log_access_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_alert_rules_updated_at
    BEFORE UPDATE ON audit_alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. GDPR COMPLIANCE FUNCTIONS
-- =====================================================

-- Function to anonymize personal data in audit logs
CREATE OR REPLACE FUNCTION anonymize_audit_log_personal_data(log_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE system_audit_logs 
    SET 
        username = 'ANONYMIZED_' || EXTRACT(EPOCH FROM created_at)::TEXT,
        user_agent = 'ANONYMIZED',
        request_headers = '{"anonymized": true}',
        request_body = CASE 
            WHEN request_body IS NOT NULL THEN '{"anonymized": true}'
            ELSE NULL
        END,
        response_body = CASE 
            WHEN response_body IS NOT NULL THEN '{"anonymized": true}'
            ELSE NULL
        END,
        old_values = CASE 
            WHEN old_values IS NOT NULL THEN '{"anonymized": true}'
            ELSE NULL
        END,
        new_values = CASE 
            WHEN new_values IS NOT NULL THEN '{"anonymized": true}'
            ELSE NULL
        END,
        metadata = jsonb_build_object('anonymized', true, 'anonymized_at', NOW()),
        anonymized_at = NOW()
    WHERE id = log_id AND anonymized_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's personal audit data for GDPR export
CREATE OR REPLACE FUNCTION get_user_audit_data_for_export(target_user_id UUID)
RETURNS TABLE(
    audit_id UUID,
    action VARCHAR,
    category VARCHAR,
    created_at TIMESTAMPTZ,
    description TEXT,
    ip_address INET,
    anonymized BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sal.id,
        sal.action,
        sal.category,
        sal.created_at,
        sal.description,
        sal.ip_address,
        (sal.anonymized_at IS NOT NULL) as anonymized
    FROM system_audit_logs sal
    WHERE sal.user_id = target_user_id
    ORDER BY sal.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. AUTOMATIC DATA RETENTION CLEANUP
-- =====================================================

-- Function to clean up old audit logs based on retention policies
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete logs based on retention categories
    -- Critical: 7 years
    DELETE FROM system_audit_logs 
    WHERE retention_category = 'critical' 
    AND created_at < NOW() - INTERVAL '7 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Financial: 5 years
    DELETE FROM system_audit_logs 
    WHERE retention_category = 'financial' 
    AND created_at < NOW() - INTERVAL '5 years';
    
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    -- Security: 3 years
    DELETE FROM system_audit_logs 
    WHERE retention_category = 'security' 
    AND created_at < NOW() - INTERVAL '3 years';
    
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    -- Standard: 1 year
    DELETE FROM system_audit_logs 
    WHERE retention_category = 'standard' 
    AND created_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    -- Temporary: 30 days
    DELETE FROM system_audit_logs 
    WHERE retention_category = 'temporary' 
    AND created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. RLS (Row Level Security) POLICIES
-- =====================================================

-- Enable RLS on all audit tables
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log_access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_alert_rules ENABLE ROW LEVEL SECURITY;

-- Policy for system_audit_logs: Users can only see logs they have permission for
CREATE POLICY "audit_logs_access_policy" ON system_audit_logs
    FOR SELECT
    USING (
        -- Super admins can see everything
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'super_admin'
        )
        OR
        -- Other users based on access rules
        EXISTS (
            SELECT 1 FROM audit_log_access_rules alar
            WHERE alar.user_role = (
                SELECT raw_user_meta_data->>'role' 
                FROM auth.users 
                WHERE id = auth.uid()
            )
            AND alar.is_active = true
            AND (
                cardinality(alar.allowed_categories) = 0 
                OR category = ANY(alar.allowed_categories)
            )
            AND (
                cardinality(alar.allowed_severities) = 0 
                OR severity = ANY(alar.allowed_severities)
            )
        )
    );

-- Policy for audit_log_access_rules: Only admins can see access rules
CREATE POLICY "audit_access_rules_policy" ON audit_log_access_rules
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('super_admin', 'system_admin')
        )
    );

-- Policy for audit_alert_rules: Only admins can see alert rules
CREATE POLICY "audit_alert_rules_policy" ON audit_alert_rules
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('super_admin', 'system_admin', 'security_officer')
        )
    );

-- =====================================================
-- 8. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE system_audit_logs IS 'Comprehensive audit logging system with GDPR compliance';
COMMENT ON TABLE audit_log_access_rules IS 'Role-based access control rules for audit logs';
COMMENT ON TABLE audit_alert_rules IS 'Configurable alert rules for audit events';

COMMENT ON COLUMN system_audit_logs.retention_category IS 'Data retention category: critical(7y), financial(5y), security(3y), standard(1y), temporary(30d)';
COMMENT ON COLUMN system_audit_logs.contains_personal_data IS 'Flag indicating if log contains personal data subject to GDPR';
COMMENT ON COLUMN system_audit_logs.anonymized_at IS 'Timestamp when personal data was anonymized for GDPR compliance';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'Advanced Audit System Migration Completed Successfully' AS migration_status;
