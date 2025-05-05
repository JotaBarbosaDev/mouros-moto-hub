
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdministrationMember } from '@/components/administration/AdministrationTable';
import { MemberType } from '@/types/member';

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

// Define the type for the Supabase members response
interface MemberResponse {
  id: string;
  name: string;
  member_number: string;
  email: string;
  phone_main: string;
  is_active: boolean;
  member_type: MemberType;
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
        .from('members')
        .select(`
          id,
          name,
          member_number,
          email,
          phone_main,
          is_active,
          member_type
        `)
        .eq('member_type', 'Administração')
        .order('name');

      if (error) throw error;

      if (data) {
        // Cast to the correct type
        const memberData = data as unknown as MemberResponse[];
        
        const transformedMembers: AdministrationMember[] = memberData.map((member) => ({
          id: member.id,
          nome: member.name || 'Desconhecido',
          memberNumber: member.member_number || '-',
          cargo: 'Membro da Administração', // Default role since we don't have specific roles in members table
          // Map is_active to the proper status format
          status: member.is_active 
            ? 'Ativo' 
            : 'Inativo',
          email: member.email || '-',
          telefone: member.phone_main || '-',
          mandato: '2024-2026', // Default term values since we don't have specific terms in members table
          inicioMandato: '', 
          fimMandato: ''
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
