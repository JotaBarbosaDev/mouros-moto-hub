
import { useState, useEffect } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { VehicleCard } from '@/components/garage/VehicleCard';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/common/Spinner';
import { Vehicle } from '@/types/member';

interface VehicleWithOwner extends Vehicle {
  ownerName: string;
}

const Garage = () => {
  const [vehicles, setVehicles] = useState<VehicleWithOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        // Fetch vehicles with member info
        const { data, error } = await supabase
          .from('vehicles')
          .select(`
            *,
            members(name)
          `)
          .order('brand', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          const formattedVehicles = data.map(item => ({
            id: item.id,
            brand: item.brand,
            model: item.model,
            type: item.type,
            displacement: item.displacement,
            nickname: item.nickname || undefined,
            photoUrl: item.photo_url || undefined,
            ownerName: item.members?.name || 'Desconhecido'
          }));
          
          setVehicles(formattedVehicles);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display text-mouro-black mb-8">
          Garagem do <span className="text-mouro-red">Clube</span>
        </h1>
        
        {isLoading ? (
          <div className="h-64">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  ownerName={vehicle.ownerName}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Nenhum veículo encontrado.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MembersLayout>
  );
};

export default Garage;
