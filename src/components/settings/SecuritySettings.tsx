'use client'

import { Shield, Key, Smartphone } from 'lucide-react'

export default function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Settings
        </h3>
        <p className="text-gray-600 mb-6">Manage your account security and authentication</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <Key className="h-5 w-5 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Change Password</div>
              <div className="text-sm text-gray-500">Update your account password</div>
            </div>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
            Change Password
          </button>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <Smartphone className="h-5 w-5 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Two-Factor Authentication</div>
              <div className="text-sm text-gray-500">Add an extra layer of security to your account</div>
            </div>
          </div>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">
            Enable 2FA
          </button>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="h-5 w-5 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Active Sessions</div>
              <div className="text-sm text-gray-500">Manage your active login sessions</div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Current session (this device)</span>
              <span className="text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}