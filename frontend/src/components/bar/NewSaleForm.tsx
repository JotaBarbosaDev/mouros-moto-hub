import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { Product, SaleItem, Sale } from '@/types/bar';
import { mockUsers } from '@/data/bar-mock-data';

interface NewSaleFormProps {
  products: Product[];
  onSaleComplete: (sale: Sale) => void;
}

export const NewSaleForm = ({ products, onSaleComplete }: NewSaleFormProps) => {
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [seller, setSeller] = useState<string>('');
  
  const availableProducts = products.filter(p => p.stock > 0);
  
  const handleAddItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    // Check if already in cart
    const existingItemIndex = selectedItems.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
      setSelectedItems(updatedItems);
    } else {
      // Add new item
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        total: product.price * quantity,
        unitOfMeasure: product.unitOfMeasure,  // Added required unitOfMeasure
        imageUrl: product.imageUrl  // Added optional imageUrl
      };
      
      setSelectedItems([...selectedItems, newItem]);
    }
    
    // Reset form
    setSelectedProduct('');
    setQuantity(1);
  };
  
  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };
  
  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + item.total, 0);
  };
  
  const calculateChange = () => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;
    return paid - total;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) return;
    if (!seller) return;
    
    // Validate stock availability
    for (const item of selectedItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        alert(`Quantidade insuficiente de ${item.productName} em stock.`);
        return;
      }
    }
    
    const sellerObj = mockUsers.find(u => u.id === seller);
    if (!sellerObj) return;
    
    const sale: Sale = {
      id: '', // Will be set by parent component
      items: selectedItems,
      sellerId: sellerObj.id,
      seller: sellerObj.name,
      timestamp: new Date(),
      total: calculateTotal(),
      amountPaid: parseFloat(amountPaid),
      change: calculateChange()
    };
    
    onSaleComplete(sale);
    
    // Reset form
    setSelectedItems([]);
    setAmountPaid('');
  };
  
  const totalValue = calculateTotal();
  const change = calculateChange();
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="product">Produto</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger id="product">
                <SelectValue placeholder="Selecionar produto" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - {product.price.toFixed(2)}€ ({product.stock} disponíveis)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
          
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              disabled={!selectedProduct || quantity < 1}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>
        
        {selectedItems.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell className="text-right">{item.price.toFixed(2)}€</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.total.toFixed(2)}€</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {totalValue.toFixed(2)}€
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {selectedItems.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seller">Quem está a vender</Label>
              <Select value={seller} onValueChange={setSeller}>
                <SelectTrigger id="seller">
                  <SelectValue placeholder="Selecionar funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="amount-paid">Valor Recebido (€)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="amount-paid"
                  type="number"
                  step="0.01"
                  min={totalValue}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
          </div>
          
          {parseFloat(amountPaid) > 0 && (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span>{totalValue.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Recebido:</span>
                <span>{(parseFloat(amountPaid) || 0).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-2">
                <span>Troco:</span>
                <span className={change < 0 ? 'text-red-500' : 'text-green-500'}>
                  {change.toFixed(2)}€
                </span>
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-mouro-red hover:bg-mouro-red/90"
            disabled={selectedItems.length === 0 || !seller || parseFloat(amountPaid) < totalValue}
          >
            Completar Venda
          </Button>
        </div>
      )}
    </form>
  );
};
