// Debug script to test admin authentication
// Run this in browser console on http://localhost:3000/admin/login

async function testAdminLogin() {
  console.log('🔍 Testing admin login...');
  
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'saurabh2000@gmail.com',
        password: 'Admin@2025!'
      })
    });

    const result = await response.json();
    console.log('📤 Login response:', result);
    
    if (result.success) {
      console.log('✅ Login successful! Testing admin verification...');
      
      // Test verification endpoint
      const verifyResponse = await fetch('/api/admin/verify');
      const verifyResult = await verifyResponse.json();
      console.log('🔍 Verify response:', verifyResult);
      
      if (verifyResult.success) {
        console.log('✅ Admin verification successful!');
        console.log('🚀 You should now be able to access admin routes');
        console.log('Try: window.location.href = "/admin/dashboard"');
      } else {
        console.log('❌ Admin verification failed');
      }
    } else {
      console.log('❌ Login failed:', result.message);
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

// Check current cookies
console.log('🍪 Current cookies:', document.cookie);

// Run the test
testAdminLogin();