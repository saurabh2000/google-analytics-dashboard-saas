'use client'

import { Key, Plus, Copy, Trash2 } from 'lucide-react'

export default function APIKeySettings() {
  const apiKeys = [
    {
      id: '1',
      name: 'Production API Key',
      key: 'ak_live_••••••••••••••••••••••••••••••••••••2a3b',
      created: '2024-01-15',
      lastUsed: '2024-01-15'
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'ak_dev_••••••••••••••••••••••••••••••••••••8x9y',
      created: '2024-01-10',
      lastUsed: '2024-01-14'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </h3>
          <p className="text-gray-600">Manage your API keys for programmatic access</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create API Key
        </button>
      </div>

      <div className="space-y-4">
        {apiKeys.map((key) => (
          <div key={key.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm font-medium text-gray-900">{key.name}</div>
                <div className="text-sm text-gray-500 font-mono mt-1">{key.key}</div>
              </div>
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-gray-600" title="Copy API Key">
                  <Copy className="h-4 w-4" />
                </button>
                <button className="text-red-400 hover:text-red-600" title="Delete API Key">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Created: {key.created}</span>
              <span>Last used: {key.lastUsed}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-sm text-yellow-800">
          <strong>Security Note:</strong> Keep your API keys secure and never share them publicly. 
          If you suspect a key has been compromised, delete it immediately and create a new one.
        </div>
      </div>
    </div>
  )
}