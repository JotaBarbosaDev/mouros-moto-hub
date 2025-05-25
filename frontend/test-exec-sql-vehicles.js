// Test script to verify exec_sql function works with vehicles
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://jugfkacnlgdjdosstiks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testExecSqlVehicles() {
  console.log('Testing exec_sql function with vehicles...');
  
  try {
    // Test exec_sql function with vehicles query
    const { data, error } = await supabase
      .rpc('exec_sql', { 
        sql: 'SELECT * FROM vehicles ORDER BY created_at DESC' 
      });
    
    if (error) {
      console.error('Error using exec_sql:', error);
      return false;
    }
    
    console.log('exec_sql function works!');
    console.log('Number of vehicles found:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('Sample vehicle:', data[0]);
      
      // Test vehicle statistics calculation
      const totalVehicles = data.length;
      const vehiclesByType = data.reduce((acc, vehicle) => {
        const type = vehicle.type || 'Outros';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      const totalDisplacement = data.reduce((sum, vehicle) => {
        return sum + (vehicle.displacement || vehicle.engine_size || 0);
      }, 0);
      const averageDisplacement = totalVehicles > 0 ? Math.round(totalDisplacement / totalVehicles) : 0;
      
      console.log('Statistics calculated:');
      console.log('- Total vehicles:', totalVehicles);
      console.log('- Vehicles by type:', vehiclesByType);
      console.log('- Average displacement:', averageDisplacement, 'cc');
    }
    
    return true;
  } catch (err) {
    console.error('Exception testing exec_sql:', err);
    return false;
  }
}

// Test function
testExecSqlVehicles().then(success => {
  if (success) {
    console.log('✅ exec_sql vehicles test successful');
  } else {
    console.log('❌ exec_sql vehicles test failed');
  }
});
