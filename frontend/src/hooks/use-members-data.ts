import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function useMembersData() {
  // Buscar todos os membros
  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('firstName', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    return data;
  };
  
  // Configuração do react-query
  const { data: members, isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers
  });
  
  return {
    members,
    isLoading,
    error
  };
}
