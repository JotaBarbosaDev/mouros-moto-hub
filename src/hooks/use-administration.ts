
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdministrationMember } from '@/components/administration/AdministrationTable';
import { MemberType, AdminStatus } from '@/types/member';

export interface AdminMember {
  id: string;
  name: string;
  memberNumber: string;
  role: string;
  status: AdminStatus;
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
  admin_status?: AdminStatus;
}

// Define the type for the Supabase administration response
interface AdminResponse {
  id: string;
  member_id: string;
  role: string;
  status: AdminStatus;
  term: string;
  term_start: string;
  term_end: string;
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
      
      // Get all admin members from the administration table
      const { data: adminData, error: adminError } = await supabase
        .from('administration')
        .select('*')
        .order('role');
        
      if (adminError) throw adminError;
      
      // Get all members with member_type = 'Administração'
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select(`
          id,
          name,
          member_number,
          email,
          phone_main,
          is_active,
          member_type,
          admin_status
        `)
        .eq('member_type', 'Administração')
        .order('name');

      if (membersError) throw membersError;

      if (membersData) {
        // Cast to the correct type
        const memberData = membersData as unknown as MemberResponse[];
        const adminRolesData = adminData as unknown as AdminResponse[];
        
        const transformedMembers: AdministrationMember[] = memberData.map((member) => {
          // Find this member's admin record
          const adminRecord = adminRolesData?.find(a => a.member_id === member.id);
          
          return {
            id: member.id,
            nome: member.name || 'Desconhecido',
            memberNumber: member.member_number || '-',
            cargo: adminRecord?.role || 'Membro da Administração',
            status: member.admin_status || adminRecord?.status || 'Ativo',
            email: member.email || '-',
            telefone: member.phone_main || '-',
            mandato: adminRecord?.term || '2024-2026',
            inicioMandato: adminRecord?.term_start || '', 
            fimMandato: adminRecord?.term_end || ''
          };
        });

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
