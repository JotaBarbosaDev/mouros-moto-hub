
import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Search, User } from 'lucide-react';
import { Sale } from '@/types/bar';
import { mockUsers } from '@/data/bar-mock-data';

interface SalesHistoryProps {
  sales: Sale[];
}

export const SalesHistory = ({ sales }: SalesHistoryProps) => {
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sellerFilter, setSellerFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filter sales based on date, seller, and search term
  const filteredSales = sales.filter(sale => {
    const matchesDate = dateFilter 
      ? format(sale.timestamp, 'yyyy-MM-dd') === dateFilter
      : true;
      
    const matchesSeller = sellerFilter !== 'all'
      ? sale.sellerId === sellerFilter
      : true;
      
    const matchesSearch = searchTerm
      ? sale.items.some(item => 
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
      
    return matchesDate && matchesSeller && matchesSearch;
  });
  
  // Group sales by seller for the summary
  const salesBySeller = filteredSales.reduce((acc, sale) => {
    if (!acc[sale.sellerId]) {
      acc[sale.sellerId] = {
        sellerName: sale.seller,
        totalSales: 0,
        salesCount: 0
      };
    }
    acc[sale.sellerId].totalSales += sale.total;
    acc[sale.sellerId].salesCount += 1;
    return acc;
  }, {} as Record<string, { sellerName: string; totalSales: number; salesCount: number }>);
  
  const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  
  const clearFilters = () => {
    setDateFilter('');
    setSellerFilter('all');
    setSearchTerm('');
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Pesquisar produtos vendidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="relative">
          <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="relative">
          <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
          <Select value={sellerFilter} onValueChange={setSellerFilter}>
            <SelectTrigger className="pl-9">
              <SelectValue placeholder="Vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Vendedores</SelectItem>
              {mockUsers.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {(dateFilter || sellerFilter !== 'all' || searchTerm) && (
        <div>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Limpar Filtros
          </Button>
        </div>
      )}
      
      {filteredSales.length > 0 ? (
        <div className="space-y-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Valor Pago</TableHead>
                  <TableHead className="text-right">Troco</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {format(sale.timestamp, 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {sale.seller}
                    </TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside">
                        {sale.items.map((item, index) => (
                          <li key={index}>
                            {item.quantity}x {item.productName} ({item.unitOfMeasure})
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.total.toFixed(2)}€
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.amountPaid.toFixed(2)}€
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.change.toFixed(2)}€
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Daily Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Diário de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-lg font-medium">
                  Total: {totalSalesAmount.toFixed(2)}€
                </div>
                <h3 className="text-md font-medium">Por Vendedor:</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-right">Nº Vendas</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.values(salesBySeller).map((sellerData, index) => (
                      <TableRow key={index}>
                        <TableCell>{sellerData.sellerName}</TableCell>
                        <TableCell className="text-right">{sellerData.salesCount}</TableCell>
                        <TableCell className="text-right">
                          {sellerData.totalSales.toFixed(2)}€
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-center text-muted-foreground">
              Nenhuma venda encontrada com os filtros selecionados.
            </p>
            {(dateFilter || sellerFilter !== 'all' || searchTerm) && (
              <Button 
                variant="link" 
                className="mt-2"
                onClick={clearFilters}
              >
                Limpar filtros e mostrar todas as vendas
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
