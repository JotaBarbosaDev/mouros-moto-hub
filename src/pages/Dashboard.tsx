
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { CardHeader, CardContent, CardTitle, Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useMembers } from '@/hooks/use-members';

const Dashboard = () => {
  const { members, isLoading, isError } = useMembers();
  
  // Calculate statistics
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.isActive !== false).length;
  const inactiveMembers = totalMembers - activeMembers;
  
  // Group members by type
  const memberTypes = members.reduce<Record<string, number>>((acc, member) => {
    const type = member.memberType || 'Desconhecido';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate members joined by month
  const currentYear = new Date().getFullYear();
  const joinedThisYear = members.filter(member => {
    const joinDate = new Date(member.joinDate);
    return joinDate.getFullYear() === currentYear;
  });
  
  const membersByMonth = Array(12).fill(0);
  joinedThisYear.forEach(member => {
    const joinDate = new Date(member.joinDate);
    const month = joinDate.getMonth();
    membersByMonth[month] += 1;
  });
  
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  
  const chartData = membersByMonth.map((count, index) => ({
    month: monthNames[index],
    members: count
  }));
  
  if (isLoading) {
    return (
      <MembersLayout>
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <div className="flex justify-center items-center h-64">
            <p>A carregar dados...</p>
          </div>
        </div>
      </MembersLayout>
    );
  }
  
  if (isError) {
    return (
      <MembersLayout>
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <p className="text-red-800">
              Ocorreu um erro ao carregar os dados. Por favor, tente novamente mais tarde.
            </p>
          </div>
        </div>
      </MembersLayout>
    );
  }
  
  return (
    <MembersLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-display text-mouro-black mb-6">
          <span className="text-mouro-red">Dashboard</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Membros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Ativos: {activeMembers} ({totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0}%)
              </p>
              <Progress
                value={totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0}
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tipos de Membros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(memberTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="text-sm">{type}</div>
                    <div className="flex items-center">
                      <div className="text-sm font-medium">{count}</div>
                      <div className="text-xs text-muted-foreground ml-2">
                        ({totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Membros Inativos</div>
                  <div className="font-medium">{inactiveMembers}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Entradas este ano</div>
                  <div className="font-medium">{joinedThisYear.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold">Novos Membros (Este Ano)</h3>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Line
                    type="monotone"
                    dataKey="members"
                    stroke="#e11d48"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </MembersLayout>
  );
};

export default Dashboard;
