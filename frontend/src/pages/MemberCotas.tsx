import { useState, useEffect } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMembersData } from '@/hooks/use-members-data';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import MemberFeesManager from '@/components/MemberFeesManager';

const MemberCotas = () => {
  const { members, isLoading } = useMembersData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('search');
  
  // Filtragem de membros com base na busca
  const filteredMembers = members?.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    return fullName.includes(lowerQuery) || 
           member.memberNumber?.toString().includes(lowerQuery) || 
           member.email?.toLowerCase().includes(lowerQuery);
  });
  
  // Selecionar o primeiro membro ao carregar se não houver nenhum selecionado
  useEffect(() => {
    if (!selectedMember && members && members.length > 0) {
      setSelectedMember(members[0]);
    }
  }, [members, selectedMember]);
  
  // Manipulador para quando um membro é selecionado na lista
  const handleMemberSelect = (member: any) => {
    setSelectedMember(member);
    setActiveTab('manage');
  };
  
  return (
    <MembersLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          Gestão de Cotas de <span className="text-mouro-red">Membros</span>
        </h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="search">Buscar Membro</TabsTrigger>
            <TabsTrigger value="manage" disabled={!selectedMember}>
              {selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : 'Gerenciar Cotas'}
            </TabsTrigger>
          </TabsList>
          
          {/* Tab de Busca */}
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Encontrar Membro</CardTitle>
                <CardDescription>
                  Busque um membro para gerenciar suas cotas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por nome, número ou email..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin h-8 w-8 border-4 border-mouro-red border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <Card className="border shadow-sm">
                      <ScrollArea className="h-[400px]">
                        <div className="p-0">
                          {filteredMembers && filteredMembers.length > 0 ? (
                            filteredMembers.map((member) => (
                              <div key={member.id} className="border-b last:border-b-0">
                                <button 
                                  onClick={() => handleMemberSelect(member)}
                                  className={`w-full p-3 text-left hover:bg-muted flex items-center ${
                                    selectedMember?.id === member.id ? 'bg-muted' : ''
                                  }`}
                                >
                                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex-shrink-0 overflow-hidden">
                                    {member.photoUrl ? (
                                      <img 
                                        src={member.photoUrl} 
                                        alt={`${member.firstName} ${member.lastName}`}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-mouro-red text-white">
                                        {member.firstName?.[0]}{member.lastName?.[0]}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-grow">
                                    <div className="font-medium">
                                      {member.firstName} {member.lastName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {member.memberNumber && `#${member.memberNumber} • `}
                                      {member.email || 'Sem email'}
                                    </div>
                                  </div>
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center">
                              <p className="text-muted-foreground">
                                {searchQuery ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado'}
                              </p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab de Gestão de Cotas */}
          <TabsContent value="manage">
            {selectedMember ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h2>
                  <Button variant="outline" onClick={() => setActiveTab('search')}>
                    Escolher Outro Membro
                  </Button>
                </div>
                
                <MemberFeesManager 
                  memberId={selectedMember.id}
                  memberName={`${selectedMember.firstName} ${selectedMember.lastName}`}
                  memberJoinDate={selectedMember.joinDate}
                />
              </>
            ) : (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Selecione um membro para gerenciar suas cotas
                    </p>
                    <Button onClick={() => setActiveTab('search')} className="mt-4">
                      Buscar Membro
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MembersLayout>
  );
};

export default MemberCotas;
