// Simple test to verify dashboard data fetching
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jugfkacnlgdjdosstiks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardData() {
  console.log('Testing dashboard data fetching...');
  
  try {
    // Test all the queries that the dashboard makes
    
    // 1. Members
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('*');
    
    if (membersError) {
      console.error('Members error:', membersError);
    } else {
      console.log('✅ Members loaded:', membersData?.length || 0);
    }
    
    // 2. Fee payments
    const { data: duesData, error: duesError } = await supabase
      .from('fee_payments')
      .select('*');
    
    if (duesError) {
      console.error('Fee payments error:', duesError);
    } else {
      console.log('✅ Fee payments loaded:', duesData?.length || 0);
    }
    
    // 3. Vehicles (our main focus)
    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*');
    
    if (vehiclesError) {
      console.error('Vehicles error:', vehiclesError);
    } else {
      console.log('✅ Vehicles loaded:', vehiclesData?.length || 0);
      if (vehiclesData && vehiclesData.length > 0) {
        console.log('Sample vehicle:', {
          id: vehiclesData[0].id,
          brand: vehiclesData[0].brand,
          model: vehiclesData[0].model,
          type: vehiclesData[0].type,
          displacement: vehiclesData[0].displacement
        });
      }
    }
    
    // 4. Events
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*');
    
    if (eventsError) {
      console.error('Events error:', eventsError);
    } else {
      console.log('✅ Events loaded:', eventsData?.length || 0);
    }
    
    // Show summary
    console.log('\nDashboard data summary:');
    console.log('- Members:', membersData?.length || 0);
    console.log('- Fee payments:', duesData?.length || 0);
    console.log('- Vehicles:', vehiclesData?.length || 0);
    console.log('- Events:', eventsData?.length || 0);
    
    if (vehiclesData && vehiclesData.length > 0) {
      // Calculate vehicle statistics
      const totalVehicles = vehiclesData.length;
      const vehiclesByType = vehiclesData.reduce((acc, vehicle) => {
        const type = vehicle.type || 'Outros';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      const totalDisplacement = vehiclesData.reduce((sum, vehicle) => {
        return sum + (vehicle.displacement || vehicle.engine_size || 0);
      }, 0);
      const averageDisplacement = totalVehicles > 0 ? Math.round(totalDisplacement / totalVehicles) : 0;
      
      console.log('\nVehicle statistics for dashboard:');
      console.log('- Total vehicles:', totalVehicles);
      console.log('- Vehicles by type:', vehiclesByType);
      console.log('- Average displacement:', averageDisplacement, 'cc');
    }
    
    return true;
  } catch (err) {
    console.error('Error testing dashboard data:', err);
    return false;
  }
}

testDashboardData().then(success => {
  console.log(success ? '\n✅ Dashboard data test completed' : '\n❌ Dashboard data test failed');
});
