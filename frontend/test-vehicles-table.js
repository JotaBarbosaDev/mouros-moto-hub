// Test script to check if vehicles table exists and query it directly
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://jugfkacnlgdjdosstiks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testVehiclesTable() {
  console.log('Testing vehicles table...');
  
  try {
    // First, let's try to query the table directly
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error querying vehicles table:', error);
      return false;
    }
    
    console.log('Vehicles table exists!');
    console.log('Number of vehicles found:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('Sample vehicle:', data[0]);
    }
    
    return true;
  } catch (err) {
    console.error('Exception testing vehicles table:', err);
    return false;
  }
}

// Test function
testVehiclesTable().then(success => {
  if (success) {
    console.log('✅ Vehicles table test successful');
  } else {
    console.log('❌ Vehicles table test failed');
  }
});
