// Test registration API without database connection
export async function testRegistration() {
  const testData = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    confirmPassword: "password123",
    accountType: "tenant",
    role: "TENANT_OWNER",
    plan: "professional",
    organizationName: "Test Company",
    organizationSlug: "test-company",
    industry: "technology",
    teamSize: "1-5",
    agreeToTerms: true
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    console.log('Test registration result:', result)
    return result
  } catch (error) {
    console.error('Test registration error:', error)
    return { error: 'Test failed' }
  }
}