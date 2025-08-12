'use client'

import { Palette, Upload, Eye } from 'lucide-react'

export default function BrandingSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Branding & Appearance
        </h3>
        <p className="text-gray-600 mb-6">Customize how your organization appears in the platform</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <Upload className="h-5 w-5 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Organization Logo</div>
              <div className="text-sm text-gray-500">Upload your organization's logo (PNG, JPG, max 2MB)</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <Palette className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">
                Upload Logo
              </button>
              <div className="text-xs text-gray-500 mt-1">No logo uploaded</div>
            </div>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-900 mb-2">Brand Colors</div>
            <div className="text-sm text-gray-500 mb-4">Choose colors that match your brand identity</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-2">
                <input 
                  type="color" 
                  defaultValue="#dc2626" 
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  defaultValue="#dc2626" 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-2">
                <input 
                  type="color" 
                  defaultValue="#374151" 
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  defaultValue="#374151" 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <Eye className="h-5 w-5 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Preview</div>
              <div className="text-sm text-gray-500">See how your branding will appear</div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-medium text-gray-900">Your Organization</span>
            </div>
            <div className="text-sm text-gray-600">This is how your branding will appear in dashboards and reports</div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
          Save Branding Settings
        </button>
      </div>
    </div>
  )
}