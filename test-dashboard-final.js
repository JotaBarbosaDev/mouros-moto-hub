// Final test to verify dashboard statistics calculation
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jugfkacnlgdjdosstiks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateDashboardCalculations() {
  console.log('🔄 Simulating dashboard calculations...');
  
  try {
    // Simulate the exact queries the dashboard makes
    
    // Fetch vehicles
    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*');

    if (vehiclesError) {
      console.warn('Erro ao buscar veículos:', vehiclesError);
      return false;
    }

    // Calculate statistics exactly like the dashboard
    const safeVehiclesData = vehiclesData || [];
    const totalVehicles = safeVehiclesData.length;
    
    const vehiclesByType = safeVehiclesData.reduce((acc, vehicle) => {
      const type = vehicle.type || 'Outros';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate average displacement from vehicles
    const totalDisplacement = safeVehiclesData.reduce((sum, vehicle) => {
      return sum + (vehicle.displacement || vehicle.engine_size || 0);
    }, 0);
    const averageDisplacement = totalVehicles > 0 ? Math.round(totalDisplacement / totalVehicles) : 0;
    
    // Show results as they would appear in the dashboard
    console.log('📊 Dashboard Statistics:');
    console.log('═══════════════════════════════════════');
    console.log(`🚗 Total de Veículos: ${totalVehicles}`);
    console.log(`🔧 Cilindrada Média: ${averageDisplacement}cc`);
    console.log('🏷️  Veículos por Tipo:');
    
    for (const [type, count] of Object.entries(vehiclesByType)) {
      console.log(`   • ${type}: ${count}`);
    }
    
    if (totalVehicles > 0) {
      console.log('\n📋 Detalhes dos Veículos:');
      safeVehiclesData.forEach((vehicle, index) => {
        console.log(`   ${index + 1}. ${vehicle.brand} ${vehicle.model} (${vehicle.type || 'N/A'}) - ${vehicle.displacement || vehicle.engine_size || 0}cc`);
      });
    }
    
    console.log('\n✅ Dashboard calculations completed successfully!');
    console.log('The dashboard should now display:');
    console.log(`- "Total de Veículos" card showing: ${totalVehicles}`);
    console.log(`- "Cilindrada Média" card showing: ${averageDisplacement}cc`);
    
    return true;
  } catch (err) {
    console.error('❌ Error in dashboard calculations:', err);
    return false;
  }
}

simulateDashboardCalculations().then(success => {
  if (success) {
    console.log('\n🎉 Dashboard is ready with real vehicle data!');
  } else {
    console.log('\n💥 Dashboard calculation failed');
  }
});
