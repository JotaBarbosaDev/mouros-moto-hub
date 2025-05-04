
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberBasicInfoTab } from "./tabs/MemberBasicInfoTab";
import { MemberStatusTab } from "./tabs/MemberStatusTab";
import { MemberVehiclesTab } from "./tabs/MemberVehiclesTab";
import { MemberDuesTab } from "./tabs/MemberDuesTab";
import { FormProps } from "./MemberFormTypes";

interface MemberFormTabsProps extends FormProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  vehicles: any[];
  setVehicles: (vehicles: any[]) => void;
  duesPayments: {year: number, paid: boolean, exempt: boolean}[];
  setDuesPayments: (payments: {year: number, paid: boolean, exempt: boolean}[]) => void;
  isAddVehicleOpen: boolean;
  setIsAddVehicleOpen: (open: boolean) => void;
  handleDeleteVehicle: (vehicleId: string) => void;
  handleDuesPaymentChange: (year: number, field: 'paid' | 'exempt', value: boolean) => void;
}

export function MemberFormTabs({
  form,
  member,
  activeTab,
  setActiveTab,
  vehicles,
  setVehicles,
  duesPayments,
  setDuesPayments,
  isAddVehicleOpen,
  setIsAddVehicleOpen,
  handleDeleteVehicle,
  handleDuesPaymentChange
}: MemberFormTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
        <TabsTrigger value="status">Status</TabsTrigger>
        <TabsTrigger value="vehicles">Veículos</TabsTrigger>
        <TabsTrigger value="dues">Quotas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic">
        <MemberBasicInfoTab form={form} member={member} />
      </TabsContent>
      
      <TabsContent value="status">
        <MemberStatusTab form={form} />
      </TabsContent>
      
      <TabsContent value="vehicles">
        <MemberVehiclesTab 
          vehicles={vehicles}
          setIsAddVehicleOpen={setIsAddVehicleOpen}
          handleDeleteVehicle={handleDeleteVehicle}
        />
      </TabsContent>
      
      <TabsContent value="dues">
        <MemberDuesTab 
          duesPayments={duesPayments} 
          handleDuesPaymentChange={handleDuesPaymentChange} 
        />
      </TabsContent>
    </Tabs>
  );
}
