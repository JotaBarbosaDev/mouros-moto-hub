
import { createClient } from "@supabase/supabase-js";
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Credenciais do Supabase não estão configuradas. Por favor, verifique o arquivo .env.local');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

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
