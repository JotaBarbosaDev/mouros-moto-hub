// Test script to verify vehicles table query with updated types
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://jugfkacnlgdjdosstiks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testVehiclesWithTypes() {
  console.log('Testing vehicles table with updated types...');
  
  try {
    // Test direct query to vehicles table
    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*');
    
    if (vehiclesError) {
      console.error('Error querying vehicles:', vehiclesError);
      return false;
    }
    
    console.log('Vehicles query successful!');
    console.log('Number of vehicles found:', vehiclesData?.length || 0);
    
    if (vehiclesData && vehiclesData.length > 0) {
      console.log('Sample vehicle:', vehiclesData[0]);
      
      // Test statistics calculation like in dashboard
      const safeVehiclesData = vehiclesData || [];
      const totalVehicles = safeVehiclesData.length;
      
      const vehiclesByType = safeVehiclesData.reduce((acc, vehicle) => {
        const type = vehicle.type || 'Outros';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      const totalDisplacement = safeVehiclesData.reduce((sum, vehicle) => {
        return sum + (vehicle.displacement || vehicle.engine_size || 0);
      }, 0);
      const averageDisplacement = totalVehicles > 0 ? Math.round(totalDisplacement / totalVehicles) : 0;
      
      console.log('Dashboard statistics:');
      console.log('- Total vehicles:', totalVehicles);
      console.log('- Vehicles by type:', vehiclesByType);
      console.log('- Average displacement:', averageDisplacement, 'cc');
    }
    
    return true;
  } catch (err) {
    console.error('Exception testing vehicles:', err);
    return false;
  }
}

// Test function
testVehiclesWithTypes().then(success => {
  if (success) {
    console.log('✅ Vehicles with types test successful');
  } else {
    console.log('❌ Vehicles with types test failed');
  }
});
