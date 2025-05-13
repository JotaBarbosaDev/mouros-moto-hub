
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdministrationStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  onLeaveMembers: number;
  currentTerm: string;
  nextElection: string;
}

export function AdministrationStats({
  totalMembers,
  activeMembers,
  inactiveMembers,
  onLeaveMembers,
  currentTerm,
  nextElection,
}: AdministrationStats) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mandato Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Período</p>
          <p className="text-xl font-semibold">{currentTerm}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total de Dirigentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalMembers}</p>
          <div className="text-sm text-gray-500 mt-1">
            <span className="text-green-600 mr-2">{activeMembers} ativos</span>
            <span className="text-amber-600 mr-2">{onLeaveMembers} licença</span>
            <span className="text-red-600">{inactiveMembers} inativos</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Próxima Eleição</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Data</p>
          <p className="text-xl font-semibold">{nextElection}</p>
        </CardContent>
      </Card>
    </div>
  );
}
