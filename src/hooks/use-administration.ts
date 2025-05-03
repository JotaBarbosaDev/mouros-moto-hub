
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdministrationMember } from '@/components/administration/AdministrationTable';

export function useAdministration() {
  const [administrationMembers, setAdministrationMembers] = useState<AdministrationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAdministration = async () => {
    try {
      setIsLoading(true);
      
      // Fetch administration data with member details
      const { data: admins, error } = await supabase
        .from('administration')
        .select(`
          id,
          role,
          term,
          term_start,
          term_end,
          status,
          members (
            id,
            member_number,
            name,
            email,
            phone_main
          )
        `)
        .order('term_start', { ascending: false });
        
      if (error) {
        throw error;
      }
        
      if (admins) {
        // Transform the data to match our component's expected format
        const transformedData: AdministrationMember[] = admins.map(admin => ({
          id: admin.id,
          nome: admin.members ? admin.members.name || 'Desconhecido' : 'Desconhecido',
          memberNumber: admin.members ? admin.members.member_number || '-' : '-',
          cargo: admin.role,
          mandato: admin.term,
          status: admin.status as AdministrationMember['status'],
          email: admin.members ? admin.members.email || '-' : '-',
          telefone: admin.members ? admin.members.phone_main || '-' : '-',
          inicioMandato: admin.term_start,
          fimMandato: admin.term_end
        }));
        
        setAdministrationMembers(transformedData);
      }
    } catch (error) {
      console.error('Error fetching administration data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da administração.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdministration();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('administration-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'administration' 
        }, 
        () => {
          fetchAdministration();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  const calculateStats = () => {
    const activeMembers = administrationMembers.filter(m => m.status === 'Ativo').length;
    const inactiveMembers = administrationMembers.filter(m => m.status === 'Inativo').length;
    const onLeaveMembers = administrationMembers.filter(m => m.status === 'Licença').length;
    
    const currentTerm = administrationMembers.length > 0 
      ? administrationMembers[0].mandato 
      : "2023 - 2025";
      
    const nextElection = administrationMembers.length > 0 
      ? new Date(administrationMembers[0].fimMandato).toLocaleDateString('pt-PT', {month: 'long', year: 'numeric'})
      : "Outubro de 2025";
      
    return {
      totalMembers: administrationMembers.length,
      activeMembers,
      inactiveMembers,
      onLeaveMembers,
      currentTerm,
      nextElection
    };
  };

  return {
    administrationMembers,
    isLoading,
    fetchAdministration,
    stats: calculateStats(),
  };
}
