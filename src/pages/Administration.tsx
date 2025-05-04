
import { useState, useEffect } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AdministrationStats } from '@/components/administration/AdministrationStats';
import { AdministrationTable } from '@/components/administration/AdministrationTable';
import { AddAdminDialog } from '@/components/administration/AddAdminDialog';
import { useAdministration } from '@/hooks/use-administration';

const Administration = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { administrationMembers, isLoading, fetchAdministration, stats } = useAdministration();
  
  // Refresh data when component mounts or when dialog closes (potential new member added)
  useEffect(() => {
    fetchAdministration();
  }, [isDialogOpen]);

  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-mouro-black">
            Administração do <span className="text-mouro-red">Clube</span>
          </h1>
          <Button 
            className="bg-mouro-red hover:bg-mouro-red/90"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Administrador
          </Button>
        </div>

        <AdministrationStats
          totalMembers={stats.totalMembers}
          activeMembers={stats.activeMembers}
          inactiveMembers={stats.inactiveMembers}
          onLeaveMembers={stats.onLeaveMembers}
          currentTerm={stats.currentTerm}
          nextElection={stats.nextElection}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>A carregar dados da administração...</p>
          </div>
        ) : (
          <AdministrationTable members={administrationMembers} />
        )}
        
        <AddAdminDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={fetchAdministration}
        />
      </div>
    </MembersLayout>
  );
};

export default Administration;
