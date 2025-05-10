import { useState } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  ChevronRight, 
  Download, 
  Filter, 
  Calendar as CalendarIcon,
  DollarSign,
  Wallet,
  PieChart,
  BarChart3,
  Banknote,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction, TransactionType, TransactionCategory, PaymentMethod } from '@/types/treasury';
import { useTreasury } from '@/hooks/use-treasury';

// Componente para exibir gráficos
const ChartPlaceholder = ({ title, height = 300 }: { title: string, height?: number }) => (
  <div 
    className="border border-dashed border-gray-300 rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <div className="text-center">
      <PieChart className="h-10 w-10 mx-auto text-gray-400 mb-2" />
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  </div>
);

// Componente para gerar relatórios
const ReportGenerator = () => {
  const [reportType, setReportType] = useState<string>('vendas');
  const [period, setPeriod] = useState<string>('mensal');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerar Relatório</CardTitle>
        <CardDescription>
          Crie relatórios financeiros para análise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Tipo de Relatório</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendas">Relatório de Vendas</SelectItem>
                <SelectItem value="despesas">Relatório de Despesas</SelectItem>
                <SelectItem value="fluxo">Fluxo de Caixa</SelectItem>
                <SelectItem value="estoque">Movimentação de Estoque</SelectItem>
                <SelectItem value="lucro">Lucros e Perdas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">Período</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diário</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {period === 'personalizado' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Data Inicial</label>
                <Input type="date" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Data Final</label>
                <Input type="date" />
              </div>
            </div>
          )}
          
          <Button className="w-full bg-mouro-red hover:bg-mouro-red/90">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para o formulário de transação
const TransactionForm = ({ onClose }: { onClose: () => void }) => {
  const { useCreateTransaction } = useTreasury();
  const { mutate: createTransaction } = useCreateTransaction();
  
  const [transactionType, setTransactionType] = useState<TransactionType>('receita');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState<string>('Bar');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [notes, setNotes] = useState<string>('');
  
  const handleSubmit = () => {
    if (!description || !amount || parseFloat(amount) <= 0) {
      return; // Validação simples
    }
    
    createTransaction({
      description,
      type: transactionType,
      amount: parseFloat(amount),
      date: new Date(date),
      category: category as TransactionCategory,
      paymentMethod,
      notes: notes || undefined
    });
    
    onClose();
  };
  
  return (
    <div className="space-y-4 py-2">
      <div className="flex gap-4 mb-4">
        <Button 
          variant={transactionType === 'receita' ? 'default' : 'outline'}
          className={transactionType === 'receita' ? 'bg-green-600 hover:bg-green-700' : ''}
          onClick={() => setTransactionType('receita')}
        >
          <ArrowUp className="mr-2 h-4 w-4" />
          Receita
        </Button>
        <Button 
          variant={transactionType === 'despesa' ? 'default' : 'outline'}
          className={transactionType === 'despesa' ? 'bg-red-600 hover:bg-red-700' : ''}
          onClick={() => setTransactionType('despesa')}
        >
          <ArrowDown className="mr-2 h-4 w-4" />
          Despesa
        </Button>
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-2">Descrição</label>
        <Input 
          placeholder="Descrição da transação" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-2">Valor (€)</label>
        <Input 
          type="number" 
          step="0.01" 
          min="0" 
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-2">Data</label>
        <Input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-2">Categoria</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bar">Bar</SelectItem>
            <SelectItem value="Loja">Loja</SelectItem>
            <SelectItem value="Evento">Eventos</SelectItem>
            <SelectItem value="Mensalidade">Mensalidades</SelectItem>
            <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Equipamento">Equipamento</SelectItem>
            <SelectItem value="Manutenção">Manutenção</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-2">Método de Pagamento</label>
        <Select 
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="cartao">Cartão de Crédito/Débito</SelectItem>
            <SelectItem value="transferencia">Transferência Bancária</SelectItem>
            <SelectItem value="mbway">MB Way</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-2">Notas (opcional)</label>
        <Input 
          placeholder="Notas adicionais" 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose} className="mr-2">Cancelar</Button>
        <Button 
          className="bg-mouro-red hover:bg-mouro-red/90"
          onClick={handleSubmit}
        >
          Salvar Transação
        </Button>
      </DialogFooter>
    </div>
  );
};

const BudgetSection = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Orçamento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Despesas</span>
              <span className="font-medium">1.800€ / 2.500€</span>
            </div>
            <Progress value={72} className="h-2" />
            <div className="flex justify-end mt-2">
              <span className="text-xs text-gray-500">72% utilizado</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Receitas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">2.275,75€</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
              <span className="text-sm text-green-600">+12% vs mês passado</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Categorias de Despesa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Bar</span>
                <span className="text-sm font-medium">450,75€</span>
              </div>
              <Progress value={25} className="h-1.5" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Infraestrutura</span>
                <span className="text-sm font-medium">800,00€</span>
              </div>
              <Progress value={44} className="h-1.5" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Eventos</span>
                <span className="text-sm font-medium">350,00€</span>
              </div>
              <Progress value={19} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Definir Orçamentos</CardTitle>
          <CardDescription>
            Configure limites de gastos por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium block mb-2">Bar</label>
                <Input type="number" defaultValue="600" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Eventos</label>
                <Input type="number" defaultValue="500" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Infraestrutura</label>
                <Input type="number" defaultValue="1000" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Marketing</label>
                <Input type="number" defaultValue="200" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Inventário</label>
                <Input type="number" defaultValue="300" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Outros</label>
                <Input type="number" defaultValue="400" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-mouro-red hover:bg-mouro-red/90">Salvar Orçamentos</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente principal da página de Tesouraria
const Treasury = () => {
  const { user } = useAuth();
  const { useTransactions, useFinancialSummary } = useTreasury();
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: summary } = useFinancialSummary();
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  
  // Calcular totais com base no resumo financeiro
  const totalRecipes = summary?.totalIncome || 0;
  const totalExpenses = summary?.totalExpenses || 0;
  const balance = summary?.balance || 0;
  
  return (
    <MembersLayout>
      <div className="container px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-display text-mouro-black">
              <span className="text-mouro-red">Tesouraria</span> do Clube
            </h1>
            <p className="text-mouro-gray mt-2">
              Gerencie finanças, compras, vendas e relatórios financeiros
            </p>
          </div>
          <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
            <DialogTrigger asChild>
              <Button className="bg-mouro-red hover:bg-mouro-red/90">
                <Banknote className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nova Transação Financeira</DialogTitle>
                <DialogDescription>
                  Adicione receitas ou despesas do clube
                </DialogDescription>
              </DialogHeader>
              <TransactionForm onClose={() => setIsAddTransactionOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Dashboard principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <ArrowUp className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Receitas</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {totalRecipes.toFixed(2)}€
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-red-100 rounded-full p-3 mr-4">
                <ArrowDown className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Despesas</p>
                <h3 className="text-2xl font-bold text-red-600">
                  {totalExpenses.toFixed(2)}€
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Saldo</p>
                <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {balance.toFixed(2)}€
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="dashboard">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="budget">Orçamentos</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fluxo Financeiro</CardTitle>
                  <CardDescription>
                    Visão do fluxo de caixa dos últimos 30 dias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder title="Gráfico de Fluxo de Caixa" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex justify-between items-start">
                  <div>
                    <CardTitle>Vendas por Categoria</CardTitle>
                    <CardDescription>
                      Distribuição das receitas por tipo
                    </CardDescription>
                  </div>
                  <Select defaultValue="mensal">
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <ChartPlaceholder title="Gráfico de Vendas por Categoria" />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Últimas Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center p-4">
                            Carregando transações...
                          </TableCell>
                        </TableRow>
                      ) : transactions.slice(0, 5).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(transaction.date, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {transaction.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                transaction.type === 'receita' 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-100'
                              }
                            >
                              {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'receita' ? '+' : '-'}{transaction.amount.toFixed(2)}€
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-center mt-4">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Ver Todas
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2">
                <CardTitle>Registro de Transações</CardTitle>
                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center p-4">
                            Carregando transações...
                          </TableCell>
                        </TableRow>
                      ) : transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center p-4">
                            Nenhuma transação encontrada.
                          </TableCell>
                        </TableRow>
                      ) : transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(transaction.date, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {transaction.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                transaction.type === 'receita' 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-100'
                              }
                            >
                              {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'receita' ? '+' : '-'}{transaction.amount.toFixed(2)}€
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="budget">
            <BudgetSection />
          </TabsContent>
          
          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ReportGenerator />
              
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Relatórios Salvos</CardTitle>
                    <CardDescription>
                      Acesse relatórios gerados anteriormente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Relatório de Vendas - Abril 2025</h4>
                          <p className="text-sm text-gray-500">Gerado em 01/05/2025</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Balanço Trimestral - Q1 2025</h4>
                          <p className="text-sm text-gray-500">Gerado em 15/04/2025</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Análise de Despesas - Março 2025</h4>
                          <p className="text-sm text-gray-500">Gerado em 05/04/2025</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Análise de Tendências</CardTitle>
                    <CardDescription>
                      Comparação de receitas e despesas ao longo do tempo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartPlaceholder title="Gráfico de Tendências" />
                    <div className="flex justify-center mt-4 gap-4">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Receitas</Badge>
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Despesas</Badge>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Saldo</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MembersLayout>
  );
};

export default Treasury;
