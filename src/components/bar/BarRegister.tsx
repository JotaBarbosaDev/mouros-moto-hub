
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Sale, Product, SaleItem } from '@/types/bar';
import { mockProducts, mockUsers } from '@/data/bar-mock-data';
import { Label } from '@/components/ui/label';

interface CartItem extends SaleItem {
  id: string;
}

export const BarRegister = () => {
  const [products] = useState<Product[]>(mockProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [sellerId, setSellerId] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<string>('');
  
  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate change
  const change = amountPaid ? parseFloat(amountPaid) - total : 0;
  
  // Add product to cart
  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Increase quantity if product already in cart
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${product.id}`,
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
        unitOfMeasure: product.unitOfMeasure,
        imageUrl: product.imageUrl
      };
      
      setCartItems([...cartItems, newItem]);
    }
  };
  
  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };
  
  // Update item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(cartItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          total: item.price * newQuantity
        };
      }
      return item;
    }));
  };
  
  // Handle checkout
  const handleCheckout = () => {
    if (!sellerId) {
      alert('Por favor selecione o vendedor');
      return;
    }
    
    if (!amountPaid || parseFloat(amountPaid) < total) {
      alert('O valor pago deve ser maior ou igual ao total da compra');
      return;
    }
    
    const seller = mockUsers.find(user => user.id === sellerId);
    
    if (!seller) {
      alert('Vendedor inválido');
      return;
    }
    
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      items: cartItems.map(({ id, ...item }) => item),
      seller: seller.name,
      sellerId: seller.id,
      timestamp: new Date(),
      total,
      amountPaid: parseFloat(amountPaid),
      change
    };
    
    // Here you would typically save the sale to a database
    console.log('New sale:', sale);
    
    // Clear cart and form
    setCartItems([]);
    setSellerId('');
    setAmountPaid('');
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Grid */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(product => (
                <Card 
                  key={product.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => addToCart(product)}
                >
                  <div className="aspect-square w-full overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-lg font-bold">{product.price.toFixed(2)}€</p>
                      <Badge variant="outline">{product.unitOfMeasure}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Shopping Cart */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Carrinho de Venda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Clique nos produtos para adicionar ao carrinho
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-80 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-6 w-6" 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center">{item.quantity}</span>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.price.toFixed(2)}€</TableCell>
                          <TableCell className="text-right">{item.total.toFixed(2)}€</TableCell>
                          <TableCell>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 text-red-500"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="pt-4 border-t space-y-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seller">Vendedor</Label>
                      <Select value={sellerId} onValueChange={setSellerId}>
                        <SelectTrigger id="seller">
                          <SelectValue placeholder="Selecione o vendedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount-paid">Valor Pago (€)</Label>
                      <Input
                        id="amount-paid"
                        type="number"
                        step="0.01"
                        min={total}
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                      />
                    </div>
                    
                    {amountPaid && parseFloat(amountPaid) >= total && (
                      <div className="flex justify-between font-medium">
                        <span>Troco:</span>
                        <span>{change.toFixed(2)}€</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              disabled={cartItems.length === 0 || !sellerId || !amountPaid || parseFloat(amountPaid) < total}
              onClick={handleCheckout}
            >
              Finalizar Venda
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
