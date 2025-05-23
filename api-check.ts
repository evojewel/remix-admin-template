/**
 * API connection test script
 * 
 * Run this script to check if the API server is accessible.
 * Usage: npx tsx api-check.ts
 */

async function checkApiConnection() {
  const API_URL = 'http://localhost:8000';
  
  console.log('Checking API connection to:', API_URL);
  
  try {
    // First check API status
    console.log('\nTesting /api-status endpoint:');
    const statusResponse = await fetch(`${API_URL}/api-status`);
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ API Status Response:', statusData);
    } else {
      console.error('❌ API Status Error:', statusResponse.status, statusResponse.statusText);
    }
    
    // Then check status endpoint
    console.log('\nTesting /status endpoint:');
    const response = await fetch(`${API_URL}/status`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Status Response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Status Error:', response.status, response.statusText);
    }
    
    // Try WebSocket connection
    console.log('\nTesting WebSocket connection:');
    const ws = new WebSocket(`ws://${API_URL.replace('http://', '')}/ws`);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected successfully');
      setTimeout(() => {
        ws.close();
        console.log('WebSocket connection closed');
      }, 2000);
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket connection failed:', error);
    };
    
  } catch (error) {
    console.error('❌ Connection Error:', error);
    console.log('\nPossible reasons for failure:');
    console.log('1. API server is not running. Start it with: python run_api.py');
    console.log('2. API server is running on a different port (default is 3001)');
    console.log('3. There might be CORS issues preventing connection');
    console.log('4. Network or firewall issues');
  }
}

// Run the check
checkApiConnection(); 