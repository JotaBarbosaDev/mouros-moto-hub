
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdministrationMember } from '@/components/administration/AdministrationTable';

export interface AdminMember {
  id: string;
  name: string;
  memberNumber: string;
  role: string;
  status: string;
  email: string;
  phone: string;
  inicioMandato?: string;
  fimMandato?: string;
  mandato?: string;
}

export interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  onLeaveMembers: number;
  currentTerm: string;
  nextElection: string;
}

// Define the type for the Supabase response to prevent TypeScript errors
interface AdminMemberResponse {
  id: string;
  role: string;
  status: string;
  term: string;
  term_start: string;
  term_end: string;
  members: {
    id: string;
    member_number: string;
    name: string;
    email: string;
    phone_main: string;
  } | null;
}

export const useAdministration = () => {
  const [administrationMembers, setAdministrationMembers] = useState<AdministrationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    onLeaveMembers: 0,
    currentTerm: '2024-2026',
    nextElection: 'Janeiro 2026'
  });

  const fetchAdministration = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('administration')
        .select(`
          id, 
          role, 
          status, 
          term, 
          term_start, 
          term_end, 
          members (
            id, 
            member_number, 
            name, 
            email, 
            phone_main
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const transformedMembers: AdministrationMember[] = (data as AdminMemberResponse[]).map((admin) => ({
          id: admin.id,
          nome: admin.members ? admin.members.name || 'Desconhecido' : 'Desconhecido',
          memberNumber: admin.members ? admin.members.member_number || '-' : '-',
          cargo: admin.role || 'Membro',
          status: admin.status || 'Inativo',
          email: admin.members ? admin.members.email || '-' : '-',
          telefone: admin.members ? admin.members.phone_main || '-' : '-',
          mandato: admin.term || '2024-2026',
          inicioMandato: admin.term_start || '',
          fimMandato: admin.term_end || ''
        }));

        setAdministrationMembers(transformedMembers);

        // Calculate stats
        const totalMembers = transformedMembers.length;
        const activeMembers = transformedMembers.filter(m => m.status === 'Ativo').length;
        const inactiveMembers = transformedMembers.filter(m => m.status === 'Inativo').length;
        const onLeaveMembers = transformedMembers.filter(m => m.status === 'Licença').length;

        setStats({
          ...stats,
          totalMembers,
          activeMembers,
          inactiveMembers,
          onLeaveMembers
        });
      }
    } catch (error) {
      console.error('Error fetching administration data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdministration();
  }, []);

  return {
    administrationMembers,
    isLoading,
    fetchAdministration,
    stats
  };
};
