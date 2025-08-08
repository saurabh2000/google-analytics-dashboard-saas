'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  whiteLabelManager,
  BrandingConfig,
  ThemePreset
} from '@/lib/white-label'
import {
  Palette,
  Upload,
  Download,
  Eye,
  Settings,
  Save,
  RefreshCw,
  Copy,
  Trash2,
  Plus,
  Image as ImageIcon,
  Type,
  Layout,
  Globe,
  Smartphone,
  Monitor,
  Moon,
  Sun
} from 'lucide-react'

export default function BrandingDashboard() {
  const [brandingConfigs, setBrandingConfigs] = useState<BrandingConfig[]>([])
  const [activeConfig, setActiveConfig] = useState<BrandingConfig | null>(null)
  const [themePresets, setThemePresets] = useState<ThemePreset[]>([])
  const [editingConfig, setEditingConfig] = useState<BrandingConfig | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'colors' | 'logos' | 'typography' | 'layout'>('overview')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load data
    const configs = whiteLabelManager.getBrandingConfigs()
    setBrandingConfigs(configs)
    
    const active = whiteLabelManager.getActiveBranding()
    setActiveConfig(active)
    setEditingConfig({ ...active })
    
    const presets = whiteLabelManager.getThemePresets()
    setThemePresets(presets)
    
    setLoading(false)
  }, [])

  const handleConfigChange = (field: string, value: string | number | boolean) => {
    if (!editingConfig) return
    
    setEditingConfig({
      ...editingConfig,
      [field]: value,
      updatedAt: new Date()
    })
  }

  const handleNestedChange = (parent: string, field: string, value: string | number | boolean | object) => {
    if (!editingConfig) return
    
    setEditingConfig({
      ...editingConfig,
      [parent]: {
        ...(editingConfig as Record<string, any>)[parent], // eslint-disable-line @typescript-eslint/no-explicit-any
        [field]: value
      },
      updatedAt: new Date()
    })
  }

  const handleColorChange = (colorKey: string, value: string) => {
    if (!editingConfig) return
    
    setEditingConfig({
      ...editingConfig,
      colors: {
        ...editingConfig.colors,
        [colorKey]: value
      },
      updatedAt: new Date()
    })
  }

  const saveConfiguration = () => {
    if (!editingConfig) return
    
    try {
      whiteLabelManager.updateBrandingConfig(editingConfig.id, editingConfig)
      setActiveConfig({ ...editingConfig })
      
      // Update the configs list
      setBrandingConfigs(prev => 
        prev.map(config => config.id === editingConfig.id ? editingConfig : config)
      )
      
      // Apply the branding
      whiteLabelManager.setActiveBranding(editingConfig.id)
    } catch (error) {
      console.error('Failed to save configuration:', error)
    }
  }

  const applyThemePreset = (presetId: string) => {
    const preset = themePresets.find(p => p.id === presetId)
    if (!preset || !editingConfig) return
    
    setEditingConfig({
      ...editingConfig,
      colors: preset.colors,
      updatedAt: new Date()
    })
  }

  const ColorPicker = ({ label, value, onChange, description }: {
    label: string
    value: string
    onChange: (value: string) => void
    description?: string
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-md border-2 border-gray-300 cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'color'
            input.value = value
            input.onchange = (e) => onChange((e.target as HTMLInputElement).value)
            input.click()
          }}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono"
        />
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  )

  const ThemePresetCard = ({ preset }: { preset: ThemePreset }) => (
    <Card 
      className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
      onClick={() => applyThemePreset(preset.id)}
    >
      <div className="mb-3">
        <h4 className="font-semibold text-sm mb-1">{preset.name}</h4>
        <p className="text-xs text-gray-600 mb-2">{preset.description}</p>
        <Badge className={`text-xs ${
          preset.category === 'corporate' ? 'bg-blue-100 text-blue-800 border-blue-200' :
          preset.category === 'creative' ? 'bg-purple-100 text-purple-800 border-purple-200' :
          preset.category === 'minimal' ? 'bg-gray-100 text-gray-800 border-gray-200' :
          preset.category === 'bold' ? 'bg-orange-100 text-orange-800 border-orange-200' :
          preset.category === 'dark' ? 'bg-gray-800 text-white' :
          'bg-green-100 text-green-800 border-green-200'
        }`}>
          {preset.category}
        </Badge>
      </div>
      
      <div className="flex gap-1 mb-3">
        {['primary', 'secondary', 'accent', 'success', 'warning'].map(colorKey => (
          <div
            key={colorKey}
            className="w-6 h-6 rounded-full border border-gray-200"
            style={{ backgroundColor: (preset.colors as Record<string, string>)[colorKey] }}
            title={colorKey}
          />
        ))}
      </div>
      
      <Button size="sm" className="w-full">Apply Theme</Button>
    </Card>
  )

  if (loading || !editingConfig) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Customization</h1>
              <p className="text-gray-600">
                Customize the look and feel of your analytics dashboard
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-2 flex items-center gap-2 ${
                    previewMode === 'desktop' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Monitor size={16} />
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-2 flex items-center gap-2 ${
                    previewMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Smartphone size={16} />
                  Mobile
                </button>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Export
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Eye size={16} />
                Preview
              </Button>
              <Button onClick={saveConfiguration} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Save size={16} />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { key: 'overview', label: 'Overview', icon: Layout },
              { key: 'colors', label: 'Colors', icon: Palette },
              { key: 'logos', label: 'Logos', icon: ImageIcon },
              { key: 'typography', label: 'Typography', icon: Type },
              { key: 'layout', label: 'Layout', icon: Settings }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === key 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Current Configuration */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Current Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Configuration Name</Label>
                      <Input
                        value={editingConfig.name}
                        onChange={(e) => handleConfigChange('name', e.target.value)}
                        placeholder="Enter configuration name"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Company Name</Label>
                      <Input
                        value={editingConfig.company.name}
                        onChange={(e) => handleNestedChange('company', 'name', e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium mb-2 block">Company Tagline</Label>
                      <Input
                        value={editingConfig.company.tagline || ''}
                        onChange={(e) => handleNestedChange('company', 'tagline', e.target.value)}
                        placeholder="Enter company tagline"
                      />
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center gap-2"
                      onClick={() => setActiveTab('colors')}
                    >
                      <Palette size={24} />
                      <span className="text-sm">Customize Colors</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center gap-2"
                      onClick={() => setActiveTab('logos')}
                    >
                      <ImageIcon size={24} />
                      <span className="text-sm">Upload Logos</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center gap-2"
                      onClick={() => setActiveTab('typography')}
                    >
                      <Type size={24} />
                      <span className="text-sm">Set Fonts</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center gap-2"
                      onClick={() => setActiveTab('layout')}
                    >
                      <Layout size={24} />
                      <span className="text-sm">Adjust Layout</span>
                    </Button>
                  </div>
                </Card>

                {/* Theme Presets */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Theme Presets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themePresets.map(preset => (
                      <ThemePresetCard key={preset.id} preset={preset} />
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6">Color Scheme</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Colors */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Primary Colors</h4>
                    <ColorPicker
                      label="Primary"
                      value={editingConfig.colors.primary}
                      onChange={(value) => handleColorChange('primary', value)}
                      description="Main brand color used for buttons and highlights"
                    />
                    <ColorPicker
                      label="Primary Dark"
                      value={editingConfig.colors.primaryDark}
                      onChange={(value) => handleColorChange('primaryDark', value)}
                      description="Darker variant for hover states"
                    />
                    <ColorPicker
                      label="Primary Light"
                      value={editingConfig.colors.primaryLight}
                      onChange={(value) => handleColorChange('primaryLight', value)}
                      description="Lighter variant for backgrounds"
                    />
                  </div>

                  {/* Secondary Colors */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Secondary Colors</h4>
                    <ColorPicker
                      label="Secondary"
                      value={editingConfig.colors.secondary}
                      onChange={(value) => handleColorChange('secondary', value)}
                    />
                    <ColorPicker
                      label="Accent"
                      value={editingConfig.colors.accent}
                      onChange={(value) => handleColorChange('accent', value)}
                    />
                  </div>

                  {/* Status Colors */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Status Colors</h4>
                    <ColorPicker
                      label="Success"
                      value={editingConfig.colors.success}
                      onChange={(value) => handleColorChange('success', value)}
                    />
                    <ColorPicker
                      label="Warning"
                      value={editingConfig.colors.warning}
                      onChange={(value) => handleColorChange('warning', value)}
                    />
                    <ColorPicker
                      label="Error"
                      value={editingConfig.colors.error}
                      onChange={(value) => handleColorChange('error', value)}
                    />
                  </div>

                  {/* Background Colors */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Background Colors</h4>
                    <ColorPicker
                      label="Background"
                      value={editingConfig.colors.background}
                      onChange={(value) => handleColorChange('background', value)}
                    />
                    <ColorPicker
                      label="Surface"
                      value={editingConfig.colors.surface}
                      onChange={(value) => handleColorChange('surface', value)}
                    />
                    <ColorPicker
                      label="Surface Light"
                      value={editingConfig.colors.surfaceLight}
                      onChange={(value) => handleColorChange('surfaceLight', value)}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Logos Tab */}
            {activeTab === 'logos' && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6">Logo Configuration</h3>
                
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Primary Logo</Label>
                    <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                      {editingConfig.logo.primary ? (
                        <img 
                          src={editingConfig.logo.primary} 
                          alt="Primary Logo"
                          className="max-h-12 max-w-32"
                        />
                      ) : (
                        <div className="w-32 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          value={editingConfig.logo.primary}
                          onChange={(e) => handleNestedChange('logo', 'primary', e.target.value)}
                          placeholder="Enter logo URL or upload file"
                          className="mb-2"
                        />
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Upload size={14} />
                          Upload Logo
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Logo Width (px)</Label>
                      <Input
                        type="number"
                        value={editingConfig.logo.width || ''}
                        onChange={(e) => handleNestedChange('logo', 'width', parseInt(e.target.value))}
                        placeholder="120"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Logo Height (px)</Label>
                      <Input
                        type="number"
                        value={editingConfig.logo.height || ''}
                        onChange={(e) => handleNestedChange('logo', 'height', parseInt(e.target.value))}
                        placeholder="32"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Favicon URL</Label>
                    <Input
                      value={editingConfig.logo.favicon || ''}
                      onChange={(e) => handleNestedChange('logo', 'favicon', e.target.value)}
                      placeholder="Enter favicon URL"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Typography Tab */}
            {activeTab === 'typography' && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6">Typography Settings</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Primary Font</Label>
                      <Input
                        value={editingConfig.fonts.primary}
                        onChange={(e) => handleNestedChange('fonts', 'primary', e.target.value)}
                        placeholder="Inter, system-ui, sans-serif"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Monospace Font</Label>
                      <Input
                        value={editingConfig.fonts.mono || ''}
                        onChange={(e) => handleNestedChange('fonts', 'mono', e.target.value)}
                        placeholder="Fira Code, Monaco, monospace"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Heading Weight</Label>
                      <select
                        value={editingConfig.fonts.headingWeight}
                        onChange={(e) => handleNestedChange('fonts', 'headingWeight', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="semibold">Semibold</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Body Weight</Label>
                      <select
                        value={editingConfig.fonts.bodyWeight}
                        onChange={(e) => handleNestedChange('fonts', 'bodyWeight', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6">Layout Settings</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Border Radius</Label>
                      <select
                        value={editingConfig.layout.borderRadius}
                        onChange={(e) => handleNestedChange('layout', 'borderRadius', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="none">None</option>
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                        <option value="xl">Extra Large</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Spacing</Label>
                      <select
                        value={editingConfig.layout.spacing}
                        onChange={(e) => handleNestedChange('layout', 'spacing', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="compact">Compact</option>
                        <option value="normal">Normal</option>
                        <option value="comfortable">Comfortable</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Sidebar Width (px)</Label>
                      <Input
                        type="number"
                        value={editingConfig.layout.sidebar.width}
                        onChange={(e) => handleNestedChange('layout', 'sidebar', { 
                          ...editingConfig.layout.sidebar,
                          width: parseInt(e.target.value) 
                        })}
                        placeholder="256"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Header Height (px)</Label>
                      <Input
                        type="number"
                        value={editingConfig.layout.header.height}
                        onChange={(e) => handleNestedChange('layout', 'header', { 
                          ...editingConfig.layout.header,
                          height: parseInt(e.target.value) 
                        })}
                        placeholder="64"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                
                <div className={`bg-white rounded-lg border-2 overflow-hidden ${
                  previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
                }`}>
                  {/* Header Preview */}
                  <div 
                    className="p-4 border-b"
                    style={{ 
                      backgroundColor: editingConfig.colors.background,
                      borderColor: editingConfig.colors.border 
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {editingConfig.logo.primary && (
                        <img 
                          src={editingConfig.logo.primary} 
                          alt="Logo"
                          className="h-8"
                          style={{
                            maxWidth: editingConfig.logo.width || 120,
                            maxHeight: editingConfig.logo.height || 32
                          }}
                        />
                      )}
                      <div>
                        <h4 
                          className="font-semibold text-sm"
                          style={{ 
                            color: editingConfig.colors.textPrimary,
                            fontFamily: editingConfig.fonts.primary,
                            fontWeight: editingConfig.fonts.headingWeight
                          }}
                        >
                          {editingConfig.company.name}
                        </h4>
                        {editingConfig.company.tagline && (
                          <p 
                            className="text-xs"
                            style={{ color: editingConfig.colors.textSecondary }}
                          >
                            {editingConfig.company.tagline}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="p-4 space-y-4">
                    <div 
                      className="p-3 rounded"
                      style={{ 
                        backgroundColor: editingConfig.colors.surface,
                        borderRadius: editingConfig.layout.borderRadius === 'none' ? '0' :
                                     editingConfig.layout.borderRadius === 'sm' ? '0.125rem' :
                                     editingConfig.layout.borderRadius === 'md' ? '0.375rem' :
                                     editingConfig.layout.borderRadius === 'lg' ? '0.5rem' : '0.75rem'
                      }}
                    >
                      <div 
                        className="text-2xl font-bold mb-2"
                        style={{ 
                          color: editingConfig.colors.primary,
                          fontFamily: editingConfig.fonts.primary 
                        }}
                      >
                        12.5K
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: editingConfig.colors.textSecondary }}
                      >
                        Total Users
                      </div>
                    </div>

                    <button 
                      className="w-full p-2 text-white text-sm font-medium rounded transition-colors"
                      style={{ 
                        backgroundColor: editingConfig.colors.primary,
                        borderRadius: editingConfig.layout.borderRadius === 'none' ? '0' :
                                     editingConfig.layout.borderRadius === 'sm' ? '0.125rem' :
                                     editingConfig.layout.borderRadius === 'md' ? '0.375rem' :
                                     editingConfig.layout.borderRadius === 'lg' ? '0.5rem' : '0.75rem'
                      }}
                    >
                      Primary Button
                    </button>
                    
                    <button 
                      className="w-full p-2 text-sm font-medium rounded border transition-colors"
                      style={{ 
                        color: editingConfig.colors.textPrimary,
                        borderColor: editingConfig.colors.border,
                        borderRadius: editingConfig.layout.borderRadius === 'none' ? '0' :
                                     editingConfig.layout.borderRadius === 'sm' ? '0.125rem' :
                                     editingConfig.layout.borderRadius === 'md' ? '0.375rem' :
                                     editingConfig.layout.borderRadius === 'lg' ? '0.5rem' : '0.75rem'
                      }}
                    >
                      Secondary Button
                    </button>

                    {/* Status Colors */}
                    <div className="flex gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: editingConfig.colors.success }}
                        title="Success"
                      />
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: editingConfig.colors.warning }}
                        title="Warning"
                      />
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: editingConfig.colors.error }}
                        title="Error"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}