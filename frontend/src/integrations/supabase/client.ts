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
    try {
      console.log(`Verificando bucket: ${bucketName}`);
      
      // Verifica se o bucket existe usando um método mais seguro
      const { data: existingBucket, error: getBucketError } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1 });
      
      if (!getBucketError) {
        console.log(`Bucket ${bucketName} está acessível, assumindo que existe.`);
        return;
      }
      
      // Se o bucket não existir, tentamos criá-lo, mas isso pode falhar devido a permissões
      try {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: isPublic
        });
        
        if (createError) {
          // Silenciosamente ignoramos erros de permissão
          console.log(`Nota: Não foi possível criar/verificar bucket ${bucketName}. Assumindo que já existe.`);
        } else {
          console.log(`Bucket ${bucketName} criado com sucesso!`);
        }
      } catch (e) {
        // Captura qualquer erro e continua - os buckets provavelmente já existem
        console.log(`Assumindo que bucket ${bucketName} já existe no servidor.`);
      }
    } catch (err) {
      // Apenas registra o erro mas não falha a aplicação
      console.warn(`Erro não crítico ao processar bucket ${bucketName}:`, err);
    }
  };
  
  // Execute sequencialmente para evitar problemas de concorrência
  try {
    await createBucketIfNotExists('members');
    await createBucketIfNotExists('vehicles');
    await createBucketIfNotExists('inventory');
    await createBucketIfNotExists('bar');
    console.log('Inicialização de buckets concluída');
  } catch (err) {
    console.error('Falha na inicialização de buckets:', err);
  }
};

// Initialize storage buckets - somente se o usuário estiver autenticado
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user?.email) {
    // Atraso de 2 segundos para dar tempo do token ser processado corretamente
    setTimeout(() => {
      console.log('Usuário autenticado, inicializando buckets...');
      initializeStorage().catch(err => {
        console.warn('Erro não crítico na inicialização de buckets:', err.message);
      });
    }, 2000);
  }
});
