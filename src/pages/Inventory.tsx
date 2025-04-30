
import { useState } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InventoryItem {
  id: number;
  name: string;
  quantidade: number;
  categoria: string;
  valor: number;
  disponivel: boolean;
  dataAquisicao: string;
  localizacao: string;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Vestuário': return 'bg-blue-500';
    case 'Equipamento': return 'bg-green-500';
    case 'Acessórios': return 'bg-purple-500';
    case 'Calçado': return 'bg-amber-500';
    case 'Ferramentas': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const mockInventory: InventoryItem[] = [
  { 
    id: 1, 
    name: 'Jaqueta de Couro', 
    quantidade: 15, 
    categoria: 'Vestuário', 
    valor: 250.00,
    disponivel: true,
    dataAquisicao: '2024-02-15',
    localizacao: 'Armário A1'
  },
  { 
    id: 2, 
    name: 'Capacete Custom', 
    quantidade: 8, 
    categoria: 'Equipamento', 
    valor: 350.00,
    disponivel: true,
    dataAquisicao: '2024-03-05',
    localizacao: 'Prateleira B2'
  },
  { 
    id: 3, 
    name: 'Luvas de Proteção', 
    quantidade: 25, 
    categoria: 'Equipamento',
    valor: 45.00,
    disponivel: true,
    dataAquisicao: '2024-01-20',
    localizacao: 'Gaveta C3'
  },
  { 
    id: 4, 
    name: 'Bandeira do Clube', 
    quantidade: 30, 
    categoria: 'Acessórios', 
    valor: 30.00,
    disponivel: true,
    dataAquisicao: '2023-12-10',
    localizacao: 'Estante D4'
  },
  { 
    id: 5, 
    name: 'Botas de Motociclista', 
    quantidade: 12, 
    categoria: 'Calçado', 
    valor: 180.00,
    disponivel: true,
    dataAquisicao: '2024-04-08',
    localizacao: 'Armário E5'
  },
  { 
    id: 6, 
    name: 'Kit de Ferramentas', 
    quantidade: 5, 
    categoria: 'Ferramentas', 
    valor: 120.00,
    disponivel: false,
    dataAquisicao: '2023-11-15',
    localizacao: 'Caixa F6'
  },
  { 
    id: 7, 
    name: 'Camisas Polo', 
    quantidade: 40, 
    categoria: 'Vestuário', 
    valor: 35.00,
    disponivel: true,
    dataAquisicao: '2024-05-01',
    localizacao: 'Armário A2'
  },
  { 
    id: 8, 
    name: 'Chaveiros Personalizados', 
    quantidade: 100, 
    categoria: 'Acessórios', 
    valor: 5.00,
    disponivel: true,
    dataAquisicao: '2024-03-20',
    localizacao: 'Gaveta G7'
  },
];

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(mockInventory.map(item => item.categoria)))];

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.localizacao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.categoria === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const totalItems = filteredInventory.reduce((sum, item) => sum + item.quantidade, 0);
  const totalValue = filteredInventory.reduce((sum, item) => sum + (item.valor * item.quantidade), 0);

  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-mouro-black">
            Inventário do <span className="text-mouro-red">Clube</span>
          </h1>
          <Button className="bg-mouro-red hover:bg-mouro-red/90">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Item
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar no inventário..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64 flex items-center">
            <Filter className="mr-2 h-4 w-4 text-gray-400" />
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'Todas as categorias' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total de Itens</p>
            <p className="text-2xl font-bold">{totalItems}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Valor Total</p>
            <p className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Categorias</p>
            <p className="text-2xl font-bold">{categories.length - 1}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="hidden md:table-cell">Valor Unitário</TableHead>
                <TableHead className="hidden md:table-cell">Data de Aquisição</TableHead>
                <TableHead className="hidden lg:table-cell">Localização</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.quantidade}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(item.categoria)}>
                      {item.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">R$ {item.valor.toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">{new Date(item.dataAquisicao).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="hidden lg:table-cell">{item.localizacao}</TableCell>
                  <TableCell>
                    {item.disponivel ? (
                      <Badge className="bg-green-500">Disponível</Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-500 border-red-500">
                        Indisponível
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MembersLayout>
  );
};

export default Inventory;
