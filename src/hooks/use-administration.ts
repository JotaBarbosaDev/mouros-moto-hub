
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminMember {
  id: string;
  name: string;
  memberNumber: string;
  role: string;
  status: string;
  email: string;
  phone: string;
}

export interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  onLeaveMembers: number;
  currentTerm: string;
  nextElection: string;
}

export const useAdministration = () => {
  const [administrationMembers, setAdministrationMembers] = useState<AdminMember[]>([]);
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
        const transformedMembers = data.map((admin) => ({
          id: admin.id,
          name: admin.members?.name || 'Desconhecido',
          memberNumber: admin.members?.member_number || '-',
          role: admin.role || 'Membro',
          status: admin.status || 'Inativo',
          email: admin.members?.email || '-',
          phone: admin.members?.phone_main || '-',
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
