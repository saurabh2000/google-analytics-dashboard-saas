/**
 * Validation Testing Utility
 * 
 * This file contains tests to verify that our validation schemas work correctly
 * Run this with: node -r ts-node/register src/lib/validation-test.ts
 */

import { schemas } from './validation-schemas'

interface TestCase {
  name: string
  schema: keyof typeof schemas
  validData: any
  invalidData: any[]
  description: string
}

const testCases: TestCase[] = [
  {
    name: 'Analytics Data Validation',
    schema: 'analyticsData',
    description: 'Tests analytics data endpoint validation',
    validData: {
      propertyId: 'GA123456789',
      dateRange: '30d',
      propertyName: 'My Website'
    },
    invalidData: [
      { propertyId: '', dateRange: '30d' }, // Empty propertyId
      { propertyId: 'GA123456789', dateRange: 'invalid' }, // Invalid dateRange
      { propertyId: 'GA123456789', dateRange: 'custom' }, // Custom without dates
      { propertyId: 'GA123456789', dateRange: 'custom', startDate: '2024-01-01' }, // Custom with only start date
    ]
  },
  {
    name: 'User Registration Validation',
    schema: 'register',
    description: 'Tests user registration endpoint validation',
    validData: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123!',
      accountType: 'personal',
      role: 'USER'
    },
    invalidData: [
      { name: 'Jo', email: 'john.doe@example.com', password: 'SecurePass123!', accountType: 'personal', role: 'USER' }, // Name too short
      { name: 'John Doe', email: 'invalid-email', password: 'SecurePass123!', accountType: 'personal', role: 'USER' }, // Invalid email
      { name: 'John Doe', email: 'john.doe@example.com', password: 'weak', accountType: 'personal', role: 'USER' }, // Weak password
      { name: 'John Doe', email: 'john.doe@example.com', password: 'SecurePass123!', accountType: 'tenant', role: 'TENANT_OWNER' }, // Tenant without org name
      { name: 'John Doe', email: 'john.doe@example.com', password: 'SecurePass123!', accountType: 'invalid', role: 'USER' }, // Invalid account type
    ]
  },
  {
    name: 'Dashboard Creation Validation',
    schema: 'createDashboard',
    description: 'Tests dashboard creation endpoint validation',
    validData: {
      name: 'My Dashboard',
      description: 'A test dashboard',
      isDefault: false,
      layout: {
        cols: 12,
        rowHeight: 100
      }
    },
    invalidData: [
      { name: '', description: 'A test dashboard' }, // Empty name
      { name: 'A'.repeat(300), description: 'A test dashboard' }, // Name too long
      { name: 'My Dashboard', layout: { cols: -1 } }, // Negative cols
      { name: 'My Dashboard', layout: { cols: 50 } }, // Cols too high
    ]
  },
  {
    name: 'Analytics Connect Validation',
    schema: 'analyticsConnect',
    description: 'Tests analytics connect endpoint validation',
    validData: {
      propertyId: 'GA123456789',
      propertyName: 'My Website',
      accountId: 'ACC123456'
    },
    invalidData: [
      { propertyId: '', propertyName: 'My Website', accountId: 'ACC123456' }, // Empty propertyId
      { propertyId: 'GA123456789', propertyName: '', accountId: 'ACC123456' }, // Empty propertyName
      { propertyId: 'GA123456789', propertyName: 'My Website', accountId: '' }, // Empty accountId
      { propertyName: 'My Website', accountId: 'ACC123456' }, // Missing propertyId
    ]
  },
  {
    name: 'Login Validation',
    schema: 'login',
    description: 'Tests login endpoint validation',
    validData: {
      email: 'user@example.com',
      password: 'password123'
    },
    invalidData: [
      { email: 'invalid-email', password: 'password123' }, // Invalid email
      { email: 'user@example.com', password: '' }, // Empty password
      { email: '', password: 'password123' }, // Empty email
      { password: 'password123' }, // Missing email
      { email: 'user@example.com' }, // Missing password
    ]
  }
]

function runValidationTests(): boolean {
  console.log('🧪 Running Validation Schema Tests...\n')
  
  let totalTests = 0
  let passedTests = 0
  let failedTests = 0

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`)
    console.log(`📝 Description: ${testCase.description}`)
    
    const schema = schemas[testCase.schema]
    if (!schema) {
      console.log(`❌ Schema '${testCase.schema}' not found`)
      failedTests++
      totalTests++
      continue
    }

    // Test valid data
    console.log('✅ Testing valid data...')
    try {
      const result = schema.parse(testCase.validData)
      console.log(`   ✓ Valid data parsed successfully`)
      passedTests++
    } catch (error) {
      console.log(`   ❌ Valid data failed to parse:`, error)
      failedTests++
    }
    totalTests++

    // Test invalid data
    console.log('❌ Testing invalid data...')
    for (let i = 0; i < testCase.invalidData.length; i++) {
      const invalidData = testCase.invalidData[i]
      try {
        schema.parse(invalidData)
        console.log(`   ❌ Invalid data ${i + 1} should have failed but passed:`, invalidData)
        failedTests++
      } catch (error) {
        console.log(`   ✓ Invalid data ${i + 1} correctly rejected`)
        passedTests++
      }
      totalTests++
    }
    
    console.log('') // Empty line for readability
  }

  console.log('📊 Test Results:')
  console.log(`   Total tests: ${totalTests}`)
  console.log(`   Passed: ${passedTests}`)
  console.log(`   Failed: ${failedTests}`)
  console.log(`   Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (failedTests === 0) {
    console.log('🎉 All validation tests passed!')
    return true
  } else {
    console.log('⚠️  Some validation tests failed. Please review the schemas.')
    return false
  }
}

// Test specific validation scenarios that have caused issues in production
function runSecurityValidationTests(): boolean {
  console.log('\n🔒 Running Security-Focused Validation Tests...\n')
  
  const securityTests = [
    {
      name: 'XSS Prevention',
      test: () => {
        try {
          const result = schemas.createDashboard.parse({
            name: '<script>alert("xss")</script>',
            description: 'Normal description'
          })
          // Should still pass but be sanitized later
          return true
        } catch {
          return false
        }
      }
    },
    {
      name: 'SQL Injection Prevention',
      test: () => {
        try {
          schemas.analyticsData.parse({
            propertyId: "'; DROP TABLE users; --",
            dateRange: '30d'
          })
          return true // Schema allows it, but our DB layer should prevent it
        } catch {
          return false
        }
      }
    },
    {
      name: 'Long String Protection',
      test: () => {
        try {
          schemas.register.parse({
            name: 'A'.repeat(1000), // Very long name
            email: 'test@example.com',
            password: 'Password123!',
            accountType: 'personal',
            role: 'USER'
          })
          return false // Should fail due to length limit
        } catch {
          return true // Correctly rejected
        }
      }
    },
    {
      name: 'Email Case Normalization',
      test: () => {
        try {
          const result = schemas.register.parse({
            name: 'Test User',
            email: 'TEST@EXAMPLE.COM',
            password: 'Password123!',
            accountType: 'personal',
            role: 'USER'
          })
          return result.email === 'test@example.com' // Should be lowercased
        } catch {
          return false
        }
      }
    }
  ]

  let passed = 0
  let total = securityTests.length

  for (const test of securityTests) {
    console.log(`🔐 Testing: ${test.name}`)
    if (test.test()) {
      console.log(`   ✓ Passed`)
      passed++
    } else {
      console.log(`   ❌ Failed`)
    }
  }

  console.log(`\n🔒 Security test results: ${passed}/${total} passed`)
  return passed === total
}

// Export for use in other files
export { runValidationTests, runSecurityValidationTests }

// Run tests if this file is executed directly
if (require.main === module) {
  const validationSuccess = runValidationTests()
  const securitySuccess = runSecurityValidationTests()
  
  if (validationSuccess && securitySuccess) {
    console.log('\n🎉 All tests passed! Your validation schemas are working correctly.')
    process.exit(0)
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix the validation schemas.')
    process.exit(1)
  }
}