
import { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, CalendarIcon, ChevronDown } from 'lucide-react';
import { Sale } from '@/types/bar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useBarSales } from '@/hooks/use-bar-sales';

export const SalesHistory = () => {
  const { sales, isLoading, isError } = useBarSales();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  // Filter sales based on search and date
  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.seller.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sale.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = dateFilter
      ? sale.timestamp.getDate() === dateFilter.getDate() &&
        sale.timestamp.getMonth() === dateFilter.getMonth() &&
        sale.timestamp.getFullYear() === dateFilter.getFullYear()
      : true;
    
    return matchesSearch && matchesDate;
  });

  // Toggle expanded sale details
  const toggleExpandSale = (saleId: string) => {
    setExpandedSaleId(expandedSaleId === saleId ? null : saleId);
  };

  if (isLoading) {
    return <div className="text-center p-6">Carregando histórico de vendas...</div>;
  }

  if (isError) {
    return <div className="text-center p-6 text-red-500">Erro ao carregar o histórico de vendas.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por vendedor ou produto..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter ? (
                format(dateFilter, "PPP", { locale: ptBR })
              ) : (
                "Filtrar por data"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={(date) => setDateFilter(date)}
              initialFocus
            />
            {dateFilter && (
              <div className="border-t p-2 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setDateFilter(undefined)}
                >
                  Limpar filtro
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {filteredSales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-2">Nenhuma venda encontrada</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || dateFilter ? "Tente outros filtros de busca" : "Ainda não há vendas registradas no sistema"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="hidden md:table-cell">Itens</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Detalhe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <>
                  <TableRow key={sale.id}>
                    <TableCell>
                      {format(sale.timestamp, "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{sale.seller}</TableCell>
                    <TableCell className="hidden md:table-cell">{sale.items.length} produtos</TableCell>
                    <TableCell className="text-right font-semibold">
                      {sale.total.toFixed(2)}€
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpandSale(sale.id)}
                      >
                        Detalhes
                        <ChevronDown 
                          className={`ml-1 h-4 w-4 transition-all ${expandedSaleId === sale.id ? 'rotate-180' : ''}`} 
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedSaleId === sale.id && (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-slate-50 p-0">
                        <div className="p-4">
                          <h4 className="text-sm font-semibold mb-2">Itens da venda</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead className="text-right">Qtd</TableHead>
                                <TableHead className="text-right">Preço</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sale.items.map((item, index) => (
                                <TableRow key={`${sale.id}-item-${index}`}>
                                  <TableCell>
                                    <div className="flex items-center">
                                      {item.imageUrl && (
                                        <div className="h-8 w-8 mr-3 rounded overflow-hidden">
                                          <img 
                                            src={item.imageUrl} 
                                            alt={item.productName} 
                                            className="h-full w-full object-cover" 
                                          />
                                        </div>
                                      )}
                                      {item.productName}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">{item.quantity}</TableCell>
                                  <TableCell className="text-right">{item.price.toFixed(2)}€</TableCell>
                                  <TableCell className="text-right">{item.total.toFixed(2)}€</TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell colSpan={3} className="text-right font-semibold">Total</TableCell>
                                <TableCell className="text-right font-semibold">{sale.total.toFixed(2)}€</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={3} className="text-right">Valor pago</TableCell>
                                <TableCell className="text-right">{sale.amountPaid.toFixed(2)}€</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={3} className="text-right">Troco</TableCell>
                                <TableCell className="text-right">{sale.change.toFixed(2)}€</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
