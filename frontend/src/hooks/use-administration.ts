
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

// Define the type for the Supabase administration response
interface AdministrationResponse {
  id: string;
  member_id: string;
  role: string;
  status: 'Ativo' | 'Inativo' | 'Licença';
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
      
      // First get members of administration type
      const { data: membersData, error: membersError } = await supabase
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

      if (membersError) throw membersError;

      // Then get their administration details
      const { data: adminData, error: adminError } = await supabase
        .from('administration')
        .select('*');

      if (adminError) throw adminError;

      // Map the member IDs to administration data
      const adminMap = new Map();
      if (adminData) {
        adminData.forEach((admin: AdministrationResponse) => {
          adminMap.set(admin.member_id, admin);
        });
      }

      if (membersData) {
        // Cast to the correct type
        const memberData = membersData as unknown as MemberResponse[];
        
        const transformedMembers: AdministrationMember[] = memberData.map((member) => {
          const adminDetails = adminMap.get(member.id);

          return {
            id: member.id,
            nome: member.name || 'Desconhecido',
            memberNumber: member.member_number || '-',
            cargo: adminDetails?.role || 'Membro da Administração',
            // Use status from administration table if available, otherwise default based on is_active
            status: adminDetails?.status || (member.is_active ? 'Ativo' : 'Inativo'),
            email: member.email || '-',
            telefone: member.phone_main || '-',
            mandato: adminDetails?.term || '2024-2026',
            inicioMandato: adminDetails?.term_start || '', 
            fimMandato: adminDetails?.term_end || ''
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
