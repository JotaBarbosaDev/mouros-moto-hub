
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from '@/types/bar';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Product) => void;
}

const UNITS_OF_MEASURE = ['Un', 'g', 'Kg', 'L', 'ml', 'cl'];

export const AddProductDialog = ({ open, onOpenChange, onAddProduct }: AddProductDialogProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('Un');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // In a real app, you would upload this file to a storage service
      // and get back a URL that you would set to imageUrl
      setImageUrl('https://example.com/placeholder-image.jpg');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct: Product = {
      id: '', // This will be replaced in the parent component
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      description,
      unitOfMeasure,
      imageUrl: imagePreview || imageUrl // Use the preview if it exists, otherwise use the URL
    };
    
    onAddProduct(newProduct);
    
    // Reset form
    setName('');
    setPrice('');
    setStock('');
    setDescription('');
    setUnitOfMeasure('Un');
    setImageUrl('');
    setImagePreview('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Produto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="image">Imagem do Produto</Label>
            <div className="flex items-center gap-4">
              <div className="border rounded-md w-24 h-24 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs text-center">
                    Sem imagem
                  </span>
                )}
              </div>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Café"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 1.50"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock">Quantidade em Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Ex: 100"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unitOfMeasure">Unidade de Medida</Label>
            <div className="flex flex-wrap gap-2">
              {UNITS_OF_MEASURE.map(unit => (
                <Button
                  key={unit}
                  type="button"
                  variant={unitOfMeasure === unit ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUnitOfMeasure(unit)}
                  className="flex-grow-0"
                >
                  {unit}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do produto..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-mouro-red hover:bg-mouro-red/90">
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
