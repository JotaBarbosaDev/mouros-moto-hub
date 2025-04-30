
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from '@/types/bar';

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onDeleteProduct: () => void;
}

export const DeleteProductDialog = ({ open, onOpenChange, product, onDeleteProduct }: DeleteProductDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remover Produto</DialogTitle>
          <DialogDescription>
            Tem a certeza que deseja remover o produto "{product.name}"? Esta ação não pode ser revertida.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={onDeleteProduct}
          >
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
