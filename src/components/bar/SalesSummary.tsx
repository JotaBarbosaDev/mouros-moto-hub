
import { useState } from 'react';
import { format, isToday, isSameDay, startOfDay } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from 'lucide-react';
import { Sale } from '@/types/bar';
import { mockUsers } from '@/data/bar-mock-data';

interface SalesSummaryProps {
  sales: Sale[];
}

export const SalesSummary = ({ sales }: SalesSummaryProps) => {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [dateString, setDateString] = useState<string>(format(today, 'yyyy-MM-dd'));
  
  // Filter sales for the selected date
  const salesForDate = sales.filter(sale => 
    isSameDay(sale.timestamp, selectedDate)
  );
  
  // Calculate summary by seller
  const summary = salesForDate.reduce((acc, sale) => {
    if (!acc[sale.sellerId]) {
      acc[sale.sellerId] = {
        seller: sale.seller,
        totalSales: 0,
        totalAmount: 0,
        items: {}
      };
    }
    
    acc[sale.sellerId].totalSales += 1;
    acc[sale.sellerId].totalAmount += sale.total;
    
    // Track items sold by seller
    sale.items.forEach(item => {
      if (!acc[sale.sellerId].items[item.productId]) {
        acc[sale.sellerId].items[item.productId] = {
          name: item.productName,
          quantity: 0,
          total: 0
        };
      }
      
      acc[sale.sellerId].items[item.productId].quantity += item.quantity;
      acc[sale.sellerId].items[item.productId].total += item.total;
    });
    
    return acc;
  }, {} as Record<string, {
    seller: string;
    totalSales: number;
    totalAmount: number;
    items: Record<string, { name: string; quantity: number; total: number; }>;
  }>);
  
  // Calculate overall totals
  const overallTotal = Object.values(summary).reduce(
    (total, sellerData) => total + sellerData.totalAmount, 0
  );
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateString = e.target.value;
    setDateString(newDateString);
    if (newDateString) {
      const newDate = new Date(newDateString);
      setSelectedDate(newDate);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-end">
        <div className="w-full sm:w-64">
          <Label htmlFor="date">Data</Label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="date"
              type="date"
              value={dateString}
              onChange={handleDateChange}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="text-lg font-medium">
          {isToday(selectedDate) ? 'Hoje' : format(selectedDate, 'dd/MM/yyyy')}
        </div>
      </div>
      
      {Object.keys(summary).length > 0 ? (
        <div className="space-y-8">
          {Object.values(summary).map((sellerData) => (
            <Card key={sellerData.seller}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-medium">{sellerData.seller}</h3>
                  <div className="text-xl font-bold text-mouro-red">
                    {sellerData.totalAmount.toFixed(2)}€
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(sellerData.items).map((item) => (
                        <TableRow key={item.name}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.total.toFixed(2)}€</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between text-xl font-bold">
              <span>Total do Dia:</span>
              <span className="text-mouro-red">{overallTotal.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Nenhuma venda registada para {isToday(selectedDate) ? 'hoje' : format(selectedDate, 'dd/MM/yyyy')}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
