// White-label customization system for branding and theming
export interface BrandingConfig {
  id: string
  name: string
  isDefault?: boolean
  
  // Logo configuration
  logo: {
    primary: string // URL to primary logo
    secondary?: string // URL to secondary logo (light theme)
    favicon?: string // URL to favicon
    width?: number
    height?: number
  }
  
  // Color scheme
  colors: {
    primary: string // Main brand color
    primaryDark: string // Dark variant of primary
    primaryLight: string // Light variant of primary
    secondary: string // Secondary brand color
    accent: string // Accent color
    success: string
    warning: string
    error: string
    info: string
    
    // Background colors
    background: string
    surface: string
    surfaceLight: string
    
    // Text colors
    textPrimary: string
    textSecondary: string
    textMuted: string
    
    // Border colors
    border: string
    borderLight: string
  }
  
  // Typography
  fonts: {
    primary: string // Main font family
    secondary?: string // Secondary font family
    mono?: string // Monospace font family
    headingWeight: 'normal' | 'medium' | 'semibold' | 'bold'
    bodyWeight: 'normal' | 'medium'
  }
  
  // Layout settings
  layout: {
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    spacing: 'compact' | 'normal' | 'comfortable'
    sidebar: {
      width: number
      collapsed: boolean
    }
    header: {
      height: number
      showBreadcrumbs: boolean
    }
  }
  
  // Custom CSS
  customCss?: string
  
  // Feature visibility
  features: {
    showPoweredBy: boolean
    allowExport: boolean
    allowSharing: boolean
    showHelp: boolean
    customFooter?: string
    customLinks?: {
      label: string
      url: string
      external: boolean
    }[]
  }
  
  // Company information
  company: {
    name: string
    tagline?: string
    website?: string
    supportEmail?: string
    address?: string
  }
  
  createdAt: Date
  updatedAt: Date
}

export interface ThemePreset {
  id: string
  name: string
  description: string
  preview: string // URL to preview image
  colors: BrandingConfig['colors']
  category: 'corporate' | 'creative' | 'minimal' | 'bold' | 'dark' | 'light'
}

// Predefined theme presets
const themePresets: ThemePreset[] = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional blue theme perfect for corporate environments',
    preview: '/themes/corporate-blue.png',
    category: 'corporate',
    colors: {
      primary: '#2563eb',
      primaryDark: '#1d4ed8',
      primaryLight: '#3b82f6',
      secondary: '#64748b',
      accent: '#0ea5e9',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7',
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceLight: '#f1f5f9',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#94a3b8',
      border: '#e2e8f0',
      borderLight: '#f1f5f9'
    }
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natural green theme inspired by nature',
    preview: '/themes/forest-green.png',
    category: 'creative',
    colors: {
      primary: '#059669',
      primaryDark: '#047857',
      primaryLight: '#10b981',
      secondary: '#6b7280',
      accent: '#0d9488',
      success: '#059669',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      background: '#ffffff',
      surface: '#f0fdf4',
      surfaceLight: '#ecfdf5',
      textPrimary: '#064e3b',
      textSecondary: '#374151',
      textMuted: '#9ca3af',
      border: '#d1fae5',
      borderLight: '#ecfdf5'
    }
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm and energetic orange theme',
    preview: '/themes/sunset-orange.png',
    category: 'bold',
    colors: {
      primary: '#ea580c',
      primaryDark: '#c2410c',
      primaryLight: '#f97316',
      secondary: '#78716c',
      accent: '#f59e0b',
      success: '#16a34a',
      warning: '#eab308',
      error: '#dc2626',
      info: '#0ea5e9',
      background: '#ffffff',
      surface: '#fffbeb',
      surfaceLight: '#fef3c7',
      textPrimary: '#431407',
      textSecondary: '#57534e',
      textMuted: '#a8a29e',
      border: '#fed7aa',
      borderLight: '#fef3c7'
    }
  },
  {
    id: 'purple-pro',
    name: 'Purple Pro',
    description: 'Modern purple theme for creative professionals',
    preview: '/themes/purple-pro.png',
    category: 'creative',
    colors: {
      primary: '#7c3aed',
      primaryDark: '#6d28d9',
      primaryLight: '#8b5cf6',
      secondary: '#6b7280',
      accent: '#a855f7',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      background: '#ffffff',
      surface: '#faf5ff',
      surfaceLight: '#f3e8ff',
      textPrimary: '#581c87',
      textSecondary: '#374151',
      textMuted: '#9ca3af',
      border: '#e9d5ff',
      borderLight: '#f3e8ff'
    }
  },
  {
    id: 'dark-mode',
    name: 'Dark Professional',
    description: 'Elegant dark theme for modern interfaces',
    preview: '/themes/dark-mode.png',
    category: 'dark',
    colors: {
      primary: '#3b82f6',
      primaryDark: '#2563eb',
      primaryLight: '#60a5fa',
      secondary: '#6b7280',
      accent: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      background: '#0f172a',
      surface: '#1e293b',
      surfaceLight: '#334155',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      border: '#334155',
      borderLight: '#475569'
    }
  },
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    description: 'Clean and minimal gray theme',
    preview: '/themes/minimal-gray.png',
    category: 'minimal',
    colors: {
      primary: '#374151',
      primaryDark: '#1f2937',
      primaryLight: '#4b5563',
      secondary: '#6b7280',
      accent: '#9ca3af',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7',
      background: '#ffffff',
      surface: '#f9fafb',
      surfaceLight: '#f3f4f6',
      textPrimary: '#111827',
      textSecondary: '#374151',
      textMuted: '#6b7280',
      border: '#e5e7eb',
      borderLight: '#f3f4f6'
    }
  }
]

// Sample branding configurations
const sampleBrandingConfigs: BrandingConfig[] = [
  {
    id: 'default',
    name: 'Default Theme',
    isDefault: true,
    logo: {
      primary: '/logos/default-logo.svg',
      favicon: '/logos/favicon.ico',
      width: 120,
      height: 32
    },
    colors: themePresets[0].colors,
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      mono: 'Fira Code, Monaco, monospace',
      headingWeight: 'semibold',
      bodyWeight: 'normal'
    },
    layout: {
      borderRadius: 'md',
      spacing: 'normal',
      sidebar: {
        width: 256,
        collapsed: false
      },
      header: {
        height: 64,
        showBreadcrumbs: true
      }
    },
    features: {
      showPoweredBy: true,
      allowExport: true,
      allowSharing: true,
      showHelp: true,
      customFooter: 'Powered by Analytics Pro'
    },
    company: {
      name: 'Analytics Pro',
      tagline: 'Professional Analytics Platform',
      website: 'https://analyticspro.com',
      supportEmail: 'support@analyticspro.com'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'techcorp',
    name: 'TechCorp Analytics',
    logo: {
      primary: '/logos/techcorp-logo.svg',
      secondary: '/logos/techcorp-logo-light.svg',
      favicon: '/logos/techcorp-favicon.ico',
      width: 140,
      height: 36
    },
    colors: themePresets[1].colors,
    fonts: {
      primary: 'Roboto, system-ui, sans-serif',
      secondary: 'Open Sans, system-ui, sans-serif',
      mono: 'Source Code Pro, Monaco, monospace',
      headingWeight: 'bold',
      bodyWeight: 'normal'
    },
    layout: {
      borderRadius: 'lg',
      spacing: 'comfortable',
      sidebar: {
        width: 280,
        collapsed: false
      },
      header: {
        height: 72,
        showBreadcrumbs: true
      }
    },
    features: {
      showPoweredBy: false,
      allowExport: true,
      allowSharing: true,
      showHelp: true,
      customFooter: '© 2024 TechCorp Inc. All rights reserved.',
      customLinks: [
        { label: 'Support', url: 'https://techcorp.com/support', external: true },
        { label: 'Documentation', url: 'https://docs.techcorp.com', external: true }
      ]
    },
    company: {
      name: 'TechCorp Inc.',
      tagline: 'Enterprise Analytics Solutions',
      website: 'https://techcorp.com',
      supportEmail: 'analytics@techcorp.com',
      address: '123 Tech Street, Silicon Valley, CA 94000'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  }
]

// White-label customization manager
export class WhiteLabelManager {
  private brandingConfigs: BrandingConfig[] = sampleBrandingConfigs
  private activeConfig: BrandingConfig
  private themePresets: ThemePreset[] = themePresets

  constructor() {
    this.activeConfig = this.brandingConfigs.find(c => c.isDefault) || this.brandingConfigs[0]
  }

  // Get all branding configurations
  getBrandingConfigs(): BrandingConfig[] {
    return [...this.brandingConfigs]
  }

  // Get active branding configuration
  getActiveBranding(): BrandingConfig {
    return { ...this.activeConfig }
  }

  // Set active branding configuration
  setActiveBranding(configId: string): BrandingConfig {
    const config = this.brandingConfigs.find(c => c.id === configId)
    if (!config) {
      throw new Error(`Branding configuration ${configId} not found`)
    }
    
    this.activeConfig = config
    this.applyBranding(config)
    return { ...config }
  }

  // Create new branding configuration
  createBrandingConfig(config: Omit<BrandingConfig, 'id' | 'createdAt' | 'updatedAt'>): BrandingConfig {
    const newConfig: BrandingConfig = {
      ...config,
      id: `branding_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    this.brandingConfigs.push(newConfig)
    return newConfig
  }

  // Update existing branding configuration
  updateBrandingConfig(configId: string, updates: Partial<BrandingConfig>): BrandingConfig {
    const configIndex = this.brandingConfigs.findIndex(c => c.id === configId)
    if (configIndex === -1) {
      throw new Error(`Branding configuration ${configId} not found`)
    }
    
    const updatedConfig: BrandingConfig = {
      ...this.brandingConfigs[configIndex],
      ...updates,
      updatedAt: new Date()
    }
    
    this.brandingConfigs[configIndex] = updatedConfig
    
    // If this is the active config, apply changes
    if (this.activeConfig.id === configId) {
      this.activeConfig = updatedConfig
      this.applyBranding(updatedConfig)
    }
    
    return updatedConfig
  }

  // Delete branding configuration
  deleteBrandingConfig(configId: string): boolean {
    const configIndex = this.brandingConfigs.findIndex(c => c.id === configId)
    if (configIndex === -1 || this.brandingConfigs[configIndex].isDefault) {
      return false
    }
    
    this.brandingConfigs.splice(configIndex, 1)
    
    // If this was the active config, switch to default
    if (this.activeConfig.id === configId) {
      const defaultConfig = this.brandingConfigs.find(c => c.isDefault)
      if (defaultConfig) {
        this.setActiveBranding(defaultConfig.id)
      }
    }
    
    return true
  }

  // Get theme presets
  getThemePresets(): ThemePreset[] {
    return [...this.themePresets]
  }

  // Apply theme preset to configuration
  applyThemePreset(configId: string, presetId: string): BrandingConfig {
    const preset = this.themePresets.find(p => p.id === presetId)
    if (!preset) {
      throw new Error(`Theme preset ${presetId} not found`)
    }
    
    return this.updateBrandingConfig(configId, {
      colors: preset.colors
    })
  }

  // Generate CSS variables from branding config
  generateCssVariables(config: BrandingConfig): string {
    const { colors, fonts, layout } = config
    
    return `
      :root {
        /* Brand Colors */
        --color-primary: ${colors.primary};
        --color-primary-dark: ${colors.primaryDark};
        --color-primary-light: ${colors.primaryLight};
        --color-secondary: ${colors.secondary};
        --color-accent: ${colors.accent};
        
        /* Status Colors */
        --color-success: ${colors.success};
        --color-warning: ${colors.warning};
        --color-error: ${colors.error};
        --color-info: ${colors.info};
        
        /* Background Colors */
        --color-background: ${colors.background};
        --color-surface: ${colors.surface};
        --color-surface-light: ${colors.surfaceLight};
        
        /* Text Colors */
        --color-text-primary: ${colors.textPrimary};
        --color-text-secondary: ${colors.textSecondary};
        --color-text-muted: ${colors.textMuted};
        
        /* Border Colors */
        --color-border: ${colors.border};
        --color-border-light: ${colors.borderLight};
        
        /* Fonts */
        --font-primary: ${fonts.primary};
        --font-secondary: ${fonts.secondary || fonts.primary};
        --font-mono: ${fonts.mono || 'monospace'};
        --font-weight-heading: ${fonts.headingWeight};
        --font-weight-body: ${fonts.bodyWeight};
        
        /* Layout */
        --border-radius: ${this.getBorderRadiusValue(layout.borderRadius)};
        --sidebar-width: ${layout.sidebar.width}px;
        --header-height: ${layout.header.height}px;
        --spacing-scale: ${this.getSpacingScale(layout.spacing)};
      }
    `.trim()
  }

  // Apply branding to DOM
  private applyBranding(config: BrandingConfig): void {
    if (typeof window === 'undefined') return
    
    // Update CSS variables
    const cssVariables = this.generateCssVariables(config)
    let styleElement = document.getElementById('white-label-styles')
    
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'white-label-styles'
      document.head.appendChild(styleElement)
    }
    
    styleElement.textContent = cssVariables + (config.customCss || '')
    
    // Update favicon
    if (config.logo.favicon) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (favicon) {
        favicon.href = config.logo.favicon
      }
    }
    
    // Update document title
    if (config.company.name) {
      document.title = `Analytics Dashboard - ${config.company.name}`
    }
  }

  // Helper methods
  private getBorderRadiusValue(radius: BrandingConfig['layout']['borderRadius']): string {
    const values = {
      none: '0px',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    }
    return values[radius]
  }

  private getSpacingScale(spacing: BrandingConfig['layout']['spacing']): string {
    const scales = {
      compact: '0.8',
      normal: '1.0',
      comfortable: '1.2'
    }
    return scales[spacing]
  }

  // Export configuration as JSON
  exportConfig(configId: string): string {
    const config = this.brandingConfigs.find(c => c.id === configId)
    if (!config) {
      throw new Error(`Configuration ${configId} not found`)
    }
    
    return JSON.stringify(config, null, 2)
  }

  // Import configuration from JSON
  importConfig(jsonConfig: string): BrandingConfig {
    const config = JSON.parse(jsonConfig) as BrandingConfig
    
    // Generate new ID and timestamps
    config.id = `imported_${Date.now()}`
    config.createdAt = new Date()
    config.updatedAt = new Date()
    config.isDefault = false
    
    this.brandingConfigs.push(config)
    return config
  }

  // Generate branding preview URL
  generatePreviewUrl(configId: string): string {
    return `/preview?branding=${configId}`
  }

  // Validate branding configuration
  validateConfig(config: Partial<BrandingConfig>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (config.colors) {
      // Validate hex colors
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
      Object.entries(config.colors).forEach(([key, value]) => {
        if (typeof value === 'string' && !hexColorRegex.test(value)) {
          errors.push(`Invalid color format for ${key}: ${value}`)
        }
      })
    }
    
    if (config.logo?.primary && !this.isValidUrl(config.logo.primary)) {
      errors.push('Invalid primary logo URL')
    }
    
    if (config.company?.website && !this.isValidUrl(config.company.website)) {
      errors.push('Invalid company website URL')
    }
    
    if (config.company?.supportEmail && !this.isValidEmail(config.company.supportEmail)) {
      errors.push('Invalid support email address')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Helper validation methods
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// Export singleton instance
export const whiteLabelManager = new WhiteLabelManager()
export default whiteLabelManager