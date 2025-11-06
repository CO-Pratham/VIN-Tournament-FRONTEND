// API Connection Test Utility
// Use this to test if your API is accessible

export const testApiConnection = async () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL ||
        (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:8000'
            : 'https://vin-tournament-backend.up.railway.app');

    console.log('🔍 Testing API connection...');
    console.log('📍 API URL:', apiUrl);

    try {
        // Test a simple endpoint (usually admin or health check)
        const testUrl = `${apiUrl}/api/auth/login/`;
        console.log('🌐 Testing:', testUrl);

        const response = await fetch(testUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@test.com',
                password: 'test',
            }),
        });

        console.log('✅ API is reachable!');
        console.log('📊 Status:', response.status);
        console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));

        // Try to parse response
        try {
            const data = await response.json();
            console.log('📦 Response Data:', data);
        } catch (e) {
            console.log('⚠️ Response is not JSON (this is OK for some endpoints)');
        }

        return {
            success: true,
            status: response.status,
            url: testUrl,
            message: 'API is reachable',
        };
    } catch (error) {
        console.error('❌ API connection failed!');
        console.error('Error:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('1. Check if backend is running');
        console.error('2. Verify URL is correct:', apiUrl);
        console.error('3. If using Railway:');
        console.error('   - Go to Railway dashboard → Settings');
        console.error('   - Click "Generate Domain" under Public Networking');
        console.error('   - Update VITE_API_BASE_URL with the generated URL');
        console.error('4. Check CORS settings if backend is running locally');
        console.error('5. Check browser console for CORS errors');

        return {
            success: false,
            error: error.message,
            url: apiUrl,
            message: 'API connection failed',
        };
    }
};

// Call this in browser console to test: window.testApiConnection()
if (typeof window !== 'undefined') {
    window.testApiConnection = testApiConnection;
}


