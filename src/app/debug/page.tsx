'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [propertiesInfo, setPropertiesInfo] = useState<any>(null)
  const [gaTestInfo, setGaTestInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkSession = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/session')
      const data = await response.json()
      setSessionInfo(data)
    } catch (error) {
      console.error('Failed to check session:', error)
    } finally {
      setLoading(false)
    }
  }

  const testProperties = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analytics/properties')
      const data = await response.json()
      setPropertiesInfo(data)
    } catch (error) {
      console.error('Failed to test properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const testGAComprehensive = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/ga-test')
      const data = await response.json()
      setGaTestInfo(data)
    } catch (error) {
      console.error('Failed to run GA comprehensive test:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      checkSession()
    }
  }, [session])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Google Analytics Integration Debug
        </h1>

        {/* Authentication Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Authentication Status
          </h2>
          
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            {session ? (
              <>
                <p><strong>User:</strong> {session.user?.name || session.user?.email}</p>
                <p><strong>Has Access Token:</strong> {session.accessToken ? 'Yes ✅' : 'No ❌'}</p>
                <p><strong>Has Refresh Token:</strong> {session.refreshToken ? 'Yes ✅' : 'No ❌'}</p>
              </>
            ) : (
              <p className="text-red-600">Not signed in</p>
            )}
          </div>

          <div className="mt-4 space-x-4">
            {!session ? (
              <button
                onClick={() => signIn('google')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Sign in with Google
              </button>
            ) : (
              <>
                <button
                  onClick={checkSession}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Check Session
                </button>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Session Debug Info */}
        {sessionInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Session Debug Info
            </h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Google Analytics Properties Test */}
        {session && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Google Analytics Properties Test
            </h2>
            
            <button
              onClick={testProperties}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 mr-4"
            >
              Test Properties API
            </button>
            
            <button
              onClick={testGAComprehensive}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Run GA Diagnostic Test
            </button>

            {propertiesInfo && (
              <div className="mt-4">
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(propertiesInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* GA Diagnostic Test Results */}
        {gaTestInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              GA Diagnostic Test Results
            </h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(gaTestInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800 dark:text-yellow-200">
            Testing Instructions
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700 dark:text-yellow-300">
            <li>Sign in with a Google account that has access to Google Analytics</li>
            <li>Check that the session has access and refresh tokens</li>
            <li>Test the Properties API to see if it can fetch real GA properties</li>
            <li>If you see "No valid session or access token found", the OAuth flow needs to be fixed</li>
            <li>If you see Google API errors, check the console for detailed error messages</li>
          </ol>

          <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/40 rounded">
            <p className="text-sm">
              <strong>Note:</strong> For real Google Analytics data to work, you need:
            </p>
            <ul className="list-disc list-inside text-sm mt-2">
              <li>A Google account with GA4 properties</li>
              <li>Proper OAuth credentials configured in Google Cloud Console</li>
              <li>The correct redirect URI: <code>http://localhost:3000/api/auth/callback/google</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}