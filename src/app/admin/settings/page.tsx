'use client'

import { useState, useEffect } from 'react'
import { 
  Settings,
  Save,
  RefreshCw,
  Shield,
  Database,
  Mail,
  Globe,
  Key,
  Users,
  Bell,
  Palette,
  Monitor,
  Lock,
  CheckCircle,
  AlertTriangle,
  Info,
  Eye,
  EyeOff
} from 'lucide-react'

interface AdminSettings {
  general: {
    siteName: string
    siteUrl: string
    adminEmail: string
    timezone: string
    dateFormat: string
    maintenanceMode: boolean
    debugMode: boolean
  }
  security: {
    sessionTimeout: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireNumbers: boolean
      requireSymbols: boolean
    }
    twoFactorAuth: boolean
    ipWhitelist: string[]
    maxLoginAttempts: number
    accountLockoutDuration: number
  }
  database: {
    connectionPoolSize: number
    queryTimeout: number
    backupEnabled: boolean
    backupFrequency: string
    backupRetention: number
  }
  email: {
    smtpHost: string
    smtpPort: number
    smtpUsername: string
    smtpPassword: string
    smtpEncryption: 'none' | 'tls' | 'ssl'
    fromName: string
    fromEmail: string
  }
  notifications: {
    systemAlerts: boolean
    securityAlerts: boolean
    maintenanceAlerts: boolean
    emailDigest: boolean
    digestFrequency: 'daily' | 'weekly' | 'monthly'
  }
  api: {
    rateLimit: number
    rateLimitWindow: number
    enableCors: boolean
    corsOrigins: string[]
    apiKeyExpiration: number
  }
  ui: {
    brandName: string
    primaryColor: string
    logoUrl: string
    faviconUrl: string
    customCss: string
    showBranding: boolean
  }
}

// Mock settings data
function generateAdminSettings(): AdminSettings {
  return {
    general: {
      siteName: 'Analytics Dashboard',
      siteUrl: 'https://analytics.company.com',
      adminEmail: 'admin@company.com',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      maintenanceMode: false,
      debugMode: false
    },
    security: {
      sessionTimeout: 3600,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: false
      },
      twoFactorAuth: true,
      ipWhitelist: [],
      maxLoginAttempts: 5,
      accountLockoutDuration: 900
    },
    database: {
      connectionPoolSize: 20,
      queryTimeout: 30000,
      backupEnabled: true,
      backupFrequency: 'daily',
      backupRetention: 30
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: 'no-reply@company.com',
      smtpPassword: '••••••••••••',
      smtpEncryption: 'tls',
      fromName: 'Analytics Dashboard',
      fromEmail: 'no-reply@company.com'
    },
    notifications: {
      systemAlerts: true,
      securityAlerts: true,
      maintenanceAlerts: true,
      emailDigest: true,
      digestFrequency: 'daily'
    },
    api: {
      rateLimit: 1000,
      rateLimitWindow: 3600,
      enableCors: true,
      corsOrigins: ['https://dashboard.company.com', 'https://app.company.com'],
      apiKeyExpiration: 365
    },
    ui: {
      brandName: 'Company Analytics',
      primaryColor: '#2563eb',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.ico',
      customCss: '',
      showBranding: true
    }
  }
}

function SettingsSection({ 
  title, 
  description, 
  icon: Icon, 
  children 
}: {
  title: string
  description: string
  icon: any
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Icon className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-6">
        {children}
      </div>
    </div>
  )
}

function FormField({ 
  label, 
  description,
  required = false,
  children 
}: {
  label: string
  description?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  )
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'database' | 'email' | 'notifications' | 'api' | 'ui'>('general')
  const [showPassword, setShowPassword] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setSettings(generateAdminSettings())
      setLoading(false)
    }, 1000)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      setUnsavedChanges(false)
      // Show success message
    }, 2000)
  }

  const updateSettings = (section: keyof AdminSettings, field: string, value: any) => {
    if (!settings) return
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    })
    setUnsavedChanges(true)
  }

  if (loading || !settings) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-gray-200 rounded-lg h-20" />
        <div className="bg-gray-200 rounded-lg h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure system-wide settings and preferences
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {unsavedChanges && (
              <div className="flex items-center text-sm text-yellow-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>Unsaved changes</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !unsavedChanges}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'general', name: 'General', icon: Settings },
              { id: 'security', name: 'Security', icon: Shield },
              { id: 'database', name: 'Database', icon: Database },
              { id: 'email', name: 'Email', icon: Mail },
              { id: 'notifications', name: 'Notifications', icon: Bell },
              { id: 'api', name: 'API', icon: Key },
              { id: 'ui', name: 'UI/Branding', icon: Palette }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <SettingsSection
                title="Site Information"
                description="Basic information about your application"
                icon={Globe}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Site Name" required>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>
                  
                  <FormField label="Site URL" required>
                    <input
                      type="url"
                      value={settings.general.siteUrl}
                      onChange={(e) => updateSettings('general', 'siteUrl', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField label="Admin Email" required>
                    <input
                      type="email"
                      value={settings.general.adminEmail}
                      onChange={(e) => updateSettings('general', 'adminEmail', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField label="Timezone">
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => updateSettings('general', 'timezone', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </FormField>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenance-mode"
                      checked={settings.general.maintenanceMode}
                      onChange={(e) => updateSettings('general', 'maintenanceMode', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="maintenance-mode" className="ml-3 text-sm text-gray-700">
                      Enable maintenance mode
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="debug-mode"
                      checked={settings.general.debugMode}
                      onChange={(e) => updateSettings('general', 'debugMode', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="debug-mode" className="ml-3 text-sm text-gray-700">
                      Enable debug mode
                    </label>
                  </div>
                </div>
              </SettingsSection>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <SettingsSection
                title="Authentication & Security"
                description="Configure security policies and authentication settings"
                icon={Shield}
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      label="Session Timeout (seconds)"
                      description="How long users stay logged in when inactive"
                    >
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </FormField>

                    <FormField 
                      label="Max Login Attempts"
                      description="Number of failed attempts before account lockout"
                    >
                      <input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </FormField>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Password Policy</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Minimum Length">
                        <input
                          type="number"
                          value={settings.security.passwordPolicy.minLength}
                          onChange={(e) => updateSettings('security', 'passwordPolicy', {
                            ...settings.security.passwordPolicy,
                            minLength: parseInt(e.target.value)
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                      </FormField>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="require-uppercase"
                          checked={settings.security.passwordPolicy.requireUppercase}
                          onChange={(e) => updateSettings('security', 'passwordPolicy', {
                            ...settings.security.passwordPolicy,
                            requireUppercase: e.target.checked
                          })}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="require-uppercase" className="ml-3 text-sm text-gray-700">
                          Require uppercase letters
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="require-numbers"
                          checked={settings.security.passwordPolicy.requireNumbers}
                          onChange={(e) => updateSettings('security', 'passwordPolicy', {
                            ...settings.security.passwordPolicy,
                            requireNumbers: e.target.checked
                          })}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="require-numbers" className="ml-3 text-sm text-gray-700">
                          Require numbers
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="require-symbols"
                          checked={settings.security.passwordPolicy.requireSymbols}
                          onChange={(e) => updateSettings('security', 'passwordPolicy', {
                            ...settings.security.passwordPolicy,
                            requireSymbols: e.target.checked
                          })}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="require-symbols" className="ml-3 text-sm text-gray-700">
                          Require symbols
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="two-factor-auth"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => updateSettings('security', 'twoFactorAuth', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="two-factor-auth" className="ml-3 text-sm text-gray-700">
                      Require two-factor authentication for admin users
                    </label>
                  </div>
                </div>
              </SettingsSection>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <SettingsSection
                title="Database Configuration"
                description="Database connection and backup settings"
                icon={Database}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField 
                    label="Connection Pool Size"
                    description="Maximum number of database connections"
                  >
                    <input
                      type="number"
                      value={settings.database.connectionPoolSize}
                      onChange={(e) => updateSettings('database', 'connectionPoolSize', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField 
                    label="Query Timeout (ms)"
                    description="Maximum time to wait for query completion"
                  >
                    <input
                      type="number"
                      value={settings.database.queryTimeout}
                      onChange={(e) => updateSettings('database', 'queryTimeout', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField label="Backup Frequency">
                    <select
                      value={settings.database.backupFrequency}
                      onChange={(e) => updateSettings('database', 'backupFrequency', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </FormField>

                  <FormField 
                    label="Backup Retention (days)"
                    description="How long to keep backup files"
                  >
                    <input
                      type="number"
                      value={settings.database.backupRetention}
                      onChange={(e) => updateSettings('database', 'backupRetention', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>
                </div>

                <div className="mt-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="backup-enabled"
                      checked={settings.database.backupEnabled}
                      onChange={(e) => updateSettings('database', 'backupEnabled', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="backup-enabled" className="ml-3 text-sm text-gray-700">
                      Enable automatic database backups
                    </label>
                  </div>
                </div>
              </SettingsSection>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <SettingsSection
                title="SMTP Configuration"
                description="Email server settings for system notifications"
                icon={Mail}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="SMTP Host" required>
                    <input
                      type="text"
                      value={settings.email.smtpHost}
                      onChange={(e) => updateSettings('email', 'smtpHost', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField label="SMTP Port" required>
                    <input
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => updateSettings('email', 'smtpPort', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField label="Username">
                    <input
                      type="text"
                      value={settings.email.smtpUsername}
                      onChange={(e) => updateSettings('email', 'smtpUsername', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField label="Password">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={settings.email.smtpPassword}
                        onChange={(e) => updateSettings('email', 'smtpPassword', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormField>

                  <FormField label="Encryption">
                    <select
                      value={settings.email.smtpEncryption}
                      onChange={(e) => updateSettings('email', 'smtpEncryption', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">None</option>
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                    </select>
                  </FormField>

                  <FormField label="From Name">
                    <input
                      type="text"
                      value={settings.email.fromName}
                      onChange={(e) => updateSettings('email', 'fromName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField label="From Email" required>
                    <input
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => updateSettings('email', 'fromEmail', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Test Email Configuration</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Send a test email to verify your SMTP settings are working correctly.
                      </p>
                      <button className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                        Send Test Email
                      </button>
                    </div>
                  </div>
                </div>
              </SettingsSection>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <SettingsSection
                title="Notification Preferences"
                description="Configure when and how you receive notifications"
                icon={Bell}
              >
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Alert Types</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">System Alerts</label>
                          <p className="text-sm text-gray-500">Server performance and system issues</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.systemAlerts}
                          onChange={(e) => updateSettings('notifications', 'systemAlerts', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Security Alerts</label>
                          <p className="text-sm text-gray-500">Authentication and security events</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.securityAlerts}
                          onChange={(e) => updateSettings('notifications', 'securityAlerts', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Maintenance Alerts</label>
                          <p className="text-sm text-gray-500">Scheduled maintenance and updates</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.maintenanceAlerts}
                          onChange={(e) => updateSettings('notifications', 'maintenanceAlerts', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Email Digest</h4>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Enable Email Digest</label>
                        <p className="text-sm text-gray-500">Receive periodic summary of system activity</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailDigest}
                        onChange={(e) => updateSettings('notifications', 'emailDigest', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </div>
                    
                    {settings.notifications.emailDigest && (
                      <FormField label="Digest Frequency">
                        <select
                          value={settings.notifications.digestFrequency}
                          onChange={(e) => updateSettings('notifications', 'digestFrequency', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </FormField>
                    )}
                  </div>
                </div>
              </SettingsSection>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <SettingsSection
                title="API Configuration"
                description="API rate limiting and security settings"
                icon={Key}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField 
                    label="Rate Limit (requests)"
                    description="Maximum requests per time window"
                  >
                    <input
                      type="number"
                      value={settings.api.rateLimit}
                      onChange={(e) => updateSettings('api', 'rateLimit', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField 
                    label="Rate Limit Window (seconds)"
                    description="Time window for rate limiting"
                  >
                    <input
                      type="number"
                      value={settings.api.rateLimitWindow}
                      onChange={(e) => updateSettings('api', 'rateLimitWindow', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField 
                    label="API Key Expiration (days)"
                    description="Default expiration for new API keys"
                  >
                    <input
                      type="number"
                      value={settings.api.apiKeyExpiration}
                      onChange={(e) => updateSettings('api', 'apiKeyExpiration', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>
                </div>

                <div className="mt-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="enable-cors"
                      checked={settings.api.enableCors}
                      onChange={(e) => updateSettings('api', 'enableCors', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="enable-cors" className="ml-3 text-sm text-gray-700">
                      Enable CORS (Cross-Origin Resource Sharing)
                    </label>
                  </div>

                  {settings.api.enableCors && (
                    <FormField 
                      label="CORS Origins"
                      description="Allowed origins for CORS requests (one per line)"
                    >
                      <textarea
                        value={settings.api.corsOrigins.join('\n')}
                        onChange={(e) => updateSettings('api', 'corsOrigins', e.target.value.split('\n').filter(Boolean))}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com&#10;https://app.example.com"
                      />
                    </FormField>
                  )}
                </div>
              </SettingsSection>
            </div>
          )}

          {activeTab === 'ui' && (
            <div className="space-y-6">
              <SettingsSection
                title="UI & Branding"
                description="Customize the appearance and branding of your application"
                icon={Palette}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Brand Name">
                    <input
                      type="text"
                      value={settings.ui.brandName}
                      onChange={(e) => updateSettings('ui', 'brandName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField label="Primary Color">
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.ui.primaryColor}
                        onChange={(e) => updateSettings('ui', 'primaryColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.ui.primaryColor}
                        onChange={(e) => updateSettings('ui', 'primaryColor', e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="#2563eb"
                      />
                    </div>
                  </FormField>

                  <FormField label="Logo URL">
                    <input
                      type="url"
                      value={settings.ui.logoUrl}
                      onChange={(e) => updateSettings('ui', 'logoUrl', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/logo.png"
                    />
                  </FormField>

                  <FormField label="Favicon URL">
                    <input
                      type="url"
                      value={settings.ui.faviconUrl}
                      onChange={(e) => updateSettings('ui', 'faviconUrl', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/favicon.ico"
                    />
                  </FormField>
                </div>

                <FormField 
                  label="Custom CSS"
                  description="Additional CSS styles to customize the appearance"
                >
                  <textarea
                    value={settings.ui.customCss}
                    onChange={(e) => updateSettings('ui', 'customCss', e.target.value)}
                    rows={6}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder=".custom-class { color: #333; }"
                  />
                </FormField>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show-branding"
                    checked={settings.ui.showBranding}
                    onChange={(e) => updateSettings('ui', 'showBranding', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="show-branding" className="ml-3 text-sm text-gray-700">
                    Show "Powered by" branding
                  </label>
                </div>
              </SettingsSection>
            </div>
          )}
        </div>
      </div>

      {/* Save Confirmation */}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center">
              <RefreshCw className="h-5 w-5 text-blue-500 animate-spin mr-3" />
              <p className="text-sm text-gray-900">Saving settings...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}