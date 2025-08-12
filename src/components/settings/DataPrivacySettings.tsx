'use client'

import { Shield, Download, Trash2, Eye } from 'lucide-react'

export default function DataPrivacySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Data Privacy & Control
        </h3>
        <p className="text-gray-600 mb-6">Manage your data privacy preferences and control your information</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <Eye className="h-5 w-5 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Data Collection</div>
              <div className="text-sm text-gray-500">Control what data we collect about your usage</div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
              <span className="text-sm text-gray-700">Analytics and performance data</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
              <span className="text-sm text-gray-700">Marketing and promotional data</span>
            </label>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <Download className="h-5 w-5 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Export Your Data</div>
              <div className="text-sm text-gray-500">Download a copy of all your data</div>
            </div>
          </div>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">
            Request Data Export
          </button>
        </div>

        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center space-x-3 mb-3">
            <Trash2 className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-sm font-medium text-red-900">Delete Your Account</div>
              <div className="text-sm text-red-600">Permanently delete your account and all associated data</div>
            </div>
          </div>
          <button className="border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 text-sm">
            Delete Account
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          <strong>Privacy Policy:</strong> Learn more about how we handle your data by reading our{' '}
          <a href="/privacy" className="underline hover:no-underline">Privacy Policy</a>.
        </div>
      </div>
    </div>
  )
}