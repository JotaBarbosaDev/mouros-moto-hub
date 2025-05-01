
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Member, MemberType, BloodType } from '@/types/member';

export const useMembers = () => {
  const queryClient = useQueryClient();

  // Fetch all members with their addresses and vehicles
  const getMembers = async (): Promise<Member[]> => {
    // Fetch members
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (membersError) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os membros.',
        variant: 'destructive',
      });
      throw membersError;
    }

    if (!membersData || membersData.length === 0) {
      return [];
    }

    // Get member IDs for batch fetching related data
    const memberIds = membersData.map(member => member.id);

    // Fetch addresses for all members
    const { data: addressesData, error: addressesError } = await supabase
      .from('addresses')
      .select('*')
      .in('member_id', memberIds);

    if (addressesError) {
      console.error('Error fetching addresses:', addressesError);
    }

    // Fetch vehicles for all members
    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .in('member_id', memberIds);

    if (vehiclesError) {
      console.error('Error fetching vehicles:', vehiclesError);
    }

    // Fetch dues payments for all members
    const { data: duesData, error: duesError } = await supabase
      .from('dues_payments')
      .select('*')
      .in('member_id', memberIds);

    if (duesError) {
      console.error('Error fetching dues payments:', duesError);
    }

    // Map the data to our Member type
    return membersData.map(member => {
      // Find address for this member
      const address = (addressesData || []).find(addr => addr.member_id === member.id) || {
        street: '',
        number: '',
        postal_code: '',
        city: '',
        district: '',
        country: ''
      };

      // Find vehicles for this member
      const vehicles = (vehiclesData || [])
        .filter(vehicle => vehicle.member_id === member.id)
        .map(vehicle => ({
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type,
          displacement: vehicle.displacement,
          nickname: vehicle.nickname || undefined,
          photoUrl: vehicle.photo_url || undefined
        }));

      // Find dues payments for this member
      const duesPayments = (duesData || [])
        .filter(dues => dues.member_id === member.id)
        .map(dues => ({
          year: dues.year,
          paid: dues.paid,
          date: dues.payment_date,
          exempt: dues.exempt
        }));

      return {
        id: member.id,
        memberNumber: member.member_number,
        name: member.name,
        nickname: member.nickname || undefined,
        email: member.email,
        phoneMain: member.phone_main,
        phoneAlternative: member.phone_alternative || undefined,
        address: {
          street: address.street,
          number: address.number,
          postalCode: address.postal_code,
          city: address.city,
          district: address.district,
          country: address.country
        },
        bloodType: member.blood_type as BloodType | undefined,
        memberType: member.member_type as MemberType,
        joinDate: member.join_date,
        vehicles,
        legacyMember: member.legacy_member,
        honoraryMember: member.honorary_member,
        registrationFeePaid: member.registration_fee_paid,
        registrationFeeExempt: member.registration_fee_exempt,
        duesPayments,
        inWhatsAppGroup: member.in_whatsapp_group,
        receivedMemberKit: member.received_member_kit,
        photoUrl: member.photo_url || undefined
      };
    });
  };

  // Create a new member
  const createMember = async (memberData: Omit<Member, 'id' | 'vehicles' | 'duesPayments'> & { vehicles?: Omit<Member['vehicles'][0], 'id'>[] }): Promise<Member> => {
    // Start a transaction
    const { data: memberInsertData, error: memberError } = await supabase
      .from('members')
      .insert({
        member_number: memberData.memberNumber,
        name: memberData.name,
        nickname: memberData.nickname || null,
        email: memberData.email,
        phone_main: memberData.phoneMain,
        phone_alternative: memberData.phoneAlternative || null,
        blood_type: memberData.bloodType || null,
        member_type: memberData.memberType,
        join_date: memberData.joinDate,
        legacy_member: memberData.legacyMember || false,
        honorary_member: memberData.honoraryMember || false,
        registration_fee_paid: memberData.registrationFeePaid || false,
        registration_fee_exempt: memberData.registrationFeeExempt || false,
        in_whatsapp_group: memberData.inWhatsAppGroup || false,
        received_member_kit: memberData.receivedMemberKit || false,
        photo_url: memberData.photoUrl || null
      })
      .select()
      .single();

    if (memberError) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o membro.',
        variant: 'destructive',
      });
      throw memberError;
    }

    const memberId = memberInsertData.id;

    // Insert address
    const { error: addressError } = await supabase
      .from('addresses')
      .insert({
        member_id: memberId,
        street: memberData.address.street,
        number: memberData.address.number,
        postal_code: memberData.address.postalCode,
        city: memberData.address.city,
        district: memberData.address.district,
        country: memberData.address.country
      });

    if (addressError) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o endereço do membro.',
        variant: 'destructive',
      });
      // Consider rolling back or handling this error
      console.error('Error inserting address:', addressError);
    }

    // Insert vehicles if provided
    if (memberData.vehicles && memberData.vehicles.length > 0) {
      const vehiclesToInsert = memberData.vehicles.map(vehicle => ({
        member_id: memberId,
        brand: vehicle.brand,
        model: vehicle.model,
        type: vehicle.type,
        displacement: vehicle.displacement,
        nickname: vehicle.nickname || null,
        photo_url: vehicle.photoUrl || null
      }));

      const { error: vehiclesError } = await supabase
        .from('vehicles')
        .insert(vehiclesToInsert);

      if (vehiclesError) {
        console.error('Error inserting vehicles:', vehiclesError);
        // Handle error but continue
      }
    }

    toast({
      title: 'Sucesso',
      description: 'Membro criado com sucesso.',
    });

    // Re-fetch the member to get the complete data with relationships
    return getMembers().then(members => 
      members.find(m => m.id === memberId) || {
        ...memberData,
        id: memberId,
        vehicles: [],
        duesPayments: []
      }
    );
  };

  // Update an existing member
  const updateMember = async (memberData: Member): Promise<Member> => {
    // Update member record
    const { error: memberError } = await supabase
      .from('members')
      .update({
        member_number: memberData.memberNumber,
        name: memberData.name,
        nickname: memberData.nickname || null,
        email: memberData.email,
        phone_main: memberData.phoneMain,
        phone_alternative: memberData.phoneAlternative || null,
        blood_type: memberData.bloodType || null,
        member_type: memberData.memberType,
        join_date: memberData.joinDate,
        legacy_member: memberData.legacyMember,
        honorary_member: memberData.honoraryMember,
        registration_fee_paid: memberData.registrationFeePaid,
        registration_fee_exempt: memberData.registrationFeeExempt,
        in_whatsapp_group: memberData.inWhatsAppGroup,
        received_member_kit: memberData.receivedMemberKit,
        photo_url: memberData.photoUrl || null
      })
      .eq('id', memberData.id);

    if (memberError) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o membro.',
        variant: 'destructive',
      });
      throw memberError;
    }

    // Update address
    const { data: existingAddresses } = await supabase
      .from('addresses')
      .select('id')
      .eq('member_id', memberData.id);

    if (existingAddresses && existingAddresses.length > 0) {
      // Update existing address
      const { error: addressError } = await supabase
        .from('addresses')
        .update({
          street: memberData.address.street,
          number: memberData.address.number,
          postal_code: memberData.address.postalCode,
          city: memberData.address.city,
          district: memberData.address.district,
          country: memberData.address.country
        })
        .eq('member_id', memberData.id);

      if (addressError) console.error('Error updating address:', addressError);
    } else {
      // Insert new address if none exists
      const { error: addressError } = await supabase
        .from('addresses')
        .insert({
          member_id: memberData.id,
          street: memberData.address.street,
          number: memberData.address.number,
          postal_code: memberData.address.postalCode,
          city: memberData.address.city,
          district: memberData.address.district,
          country: memberData.address.country
        });

      if (addressError) console.error('Error inserting address:', addressError);
    }

    toast({
      title: 'Sucesso',
      description: 'Membro atualizado com sucesso.',
    });

    return memberData;
  };

  // Delete a member
  const deleteMember = async (memberId: string): Promise<void> => {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o membro.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Membro excluído com sucesso.',
    });
  };

  // Add a vehicle to a member
  const addVehicle = async (memberId: string, vehicleData: Omit<Member['vehicles'][0], 'id'>): Promise<string> => {
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        member_id: memberId,
        brand: vehicleData.brand,
        model: vehicleData.model,
        type: vehicleData.type,
        displacement: vehicleData.displacement,
        nickname: vehicleData.nickname || null,
        photo_url: vehicleData.photoUrl || null
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o veículo.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Veículo adicionado com sucesso.',
    });

    return data.id;
  };

  // Remove a vehicle
  const removeVehicle = async (vehicleId: string): Promise<void> => {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o veículo.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Veículo removido com sucesso.',
    });
  };

  // Update dues payment
  const updateDuesPayment = async (memberId: string, year: number, isPaid: boolean, isExempt: boolean, paymentDate?: string): Promise<void> => {
    const { data: existingPayment } = await supabase
      .from('dues_payments')
      .select()
      .eq('member_id', memberId)
      .eq('year', year)
      .single();

    if (existingPayment) {
      // Update existing payment
      const { error } = await supabase
        .from('dues_payments')
        .update({
          paid: isPaid,
          exempt: isExempt,
          payment_date: isPaid ? paymentDate || new Date().toISOString() : null
        })
        .eq('member_id', memberId)
        .eq('year', year);

      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o pagamento de quotas.',
          variant: 'destructive',
        });
        throw error;
      }
    } else {
      // Create new payment record
      const { error } = await supabase
        .from('dues_payments')
        .insert({
          member_id: memberId,
          year,
          paid: isPaid,
          exempt: isExempt,
          payment_date: isPaid ? paymentDate || new Date().toISOString() : null
        });

      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível registrar o pagamento de quotas.',
          variant: 'destructive',
        });
        throw error;
      }
    }

    toast({
      title: 'Sucesso',
      description: 'Pagamento de quotas atualizado com sucesso.',
    });
  };

  // React Query hooks
  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: getMembers
  });

  const createMemberMutation = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  const addVehicleMutation = useMutation({
    mutationFn: ({ memberId, vehicleData }: { memberId: string; vehicleData: Omit<Member['vehicles'][0], 'id'> }) =>
      addVehicle(memberId, vehicleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  const removeVehicleMutation = useMutation({
    mutationFn: removeVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  const updateDuesPaymentMutation = useMutation({
    mutationFn: ({ memberId, year, isPaid, isExempt, paymentDate }: 
      { memberId: string; year: number; isPaid: boolean; isExempt: boolean; paymentDate?: string }) =>
      updateDuesPayment(memberId, year, isPaid, isExempt, paymentDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  return {
    members: membersQuery.data || [],
    isLoading: membersQuery.isLoading,
    isError: membersQuery.isError,
    createMember: createMemberMutation.mutate,
    updateMember: updateMemberMutation.mutate,
    deleteMember: deleteMemberMutation.mutate,
    addVehicle: addVehicleMutation.mutate,
    removeVehicle: removeVehicleMutation.mutate,
    updateDuesPayment: updateDuesPaymentMutation.mutate
  };
};
