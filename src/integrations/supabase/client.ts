
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jugfkacnlgdjdosstiks.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize the storage buckets
const initializeStorage = async () => {
  // Function to create bucket if it doesn't exist
  const createBucketIfNotExists = async (bucketName: string, isPublic: boolean = true) => {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.find(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Create bucket
      await supabase.storage.createBucket(bucketName, {
        public: isPublic
      });
    }
  };
  
  // Create the required buckets
  await Promise.all([
    createBucketIfNotExists('members'),
    createBucketIfNotExists('vehicles'),
    createBucketIfNotExists('inventory'),
    createBucketIfNotExists('bar')
  ]);
};

// Initialize storage buckets
initializeStorage().catch(console.error);
