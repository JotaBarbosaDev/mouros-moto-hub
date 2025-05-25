/**
 * EXEMPLO: COMPONENTE DE PRODUTO COM INTEGRAÇÃO DE APROVAÇÃO FINANCEIRA
 * Demonstra como integrar o sistema de aprovação com outros módulos
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { financialApprovalService } from '@/services/financial-approval-service';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: string;
  status: 'draft' | 'pending_financial_approval' | 'approved' | 'rejected';
  approval_id?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  cost: number;
  category: string;
}

export const ProductWithApproval: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    category: ''
  });
  const { toast } = useToast();

  /**
   * CRIAR PRODUTO COM APROVAÇÃO FINANCEIRA
   */
  const handleCreateProduct = async () => {
    try {
      setIsCreating(true);

      // 1. Criar produto em estado draft
      const productId = crypto.randomUUID();
      
      // 2. Preparar valores financeiros para aprovação
      const financialValues = {
        price: formData.price,
        cost: formData.cost,
        margin: ((formData.price - formData.cost) / formData.price * 100).toFixed(2),
        profit: formData.price - formData.cost
      };

      // 3. Criar aprovação financeira
      const approval = await financialApprovalService.createApproval({
        title: `Aprovação de produto: ${formData.name}`,
        item_type: 'product',
        item_id: productId,
        total_amount: formData.price,
        description: `Solicitação de aprovação para adicionar o produto "${formData.name}" ao estoque`,
        item_details: financialValues
      });

      // 4. Submeter para aprovação
      await financialApprovalService.submitForApproval(approval.id);

      // 5. Criar produto com status pendente
      const newProduct: Product = {
        id: productId,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        cost: formData.cost,
        category: formData.category,
        status: 'pending_financial_approval',
        approval_id: approval.id
      };

      setProducts(prev => [...prev, newProduct]);

      toast({
        title: 'Produto Criado',
        description: 'Produto criado e enviado para aprovação financeira.',
        variant: 'default'
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: 0,
        cost: 0,
        category: ''
      });

    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar produto.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * RENDERIZAR STATUS DO PRODUTO
   */
  const getProductStatusBadge = (status: Product['status']) => {
    const statusConfig = {
      'draft': { variant: 'secondary' as const, icon: Package, label: 'Rascunho' },
      'pending_financial_approval': { variant: 'default' as const, icon: Clock, label: 'Aguardando Aprovação' },
      'approved': { variant: 'default' as const, icon: CheckCircle, label: 'Aprovado' },
      'rejected': { variant: 'destructive' as const, icon: Package, label: 'Rejeitado' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Produtos com Aprovação Financeira</h2>
        <Badge variant="outline" className="text-sm">
          Integração: Loja + Aprovação
        </Badge>
      </div>

      {/* Formulário de Criação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            Criar Novo Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Camisola Mouros MC"
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Ex: Vestuário"
              />
            </div>

            <div>
              <Label htmlFor="price">Preço de Venda (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="25.00"
              />
            </div>

            <div>
              <Label htmlFor="cost">Custo (€)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                placeholder="15.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição detalhada do produto..."
            />
          </div>

          {/* Preview de Valores Financeiros */}
          {formData.price > 0 && formData.cost > 0 && (
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <DollarSign size={16} />
                Análise Financeira (será enviada para aprovação)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Preço:</span>
                  <p className="font-medium">€{formData.price.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Custo:</span>
                  <p className="font-medium">€{formData.cost.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Lucro:</span>
                  <p className="font-medium text-green-600">€{(formData.price - formData.cost).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Margem:</span>
                  <p className="font-medium">
                    {((formData.price - formData.cost) / formData.price * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleCreateProduct}
            disabled={!formData.name || !formData.price || !formData.cost || isCreating}
            className="w-full"
          >
            {isCreating ? 'Criando...' : 'Criar Produto (Enviar para Aprovação)'}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Produtos Criados</h3>
        
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum produto criado ainda.</p>
              <p className="text-sm text-gray-400">Use o formulário acima para criar o primeiro produto.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {products.map(product => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{product.name}</h4>
                    {getProductStatusBadge(product.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Categoria:</span>
                      <p>{product.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Preço:</span>
                      <p className="font-medium">€{product.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Custo:</span>
                      <p>€{product.cost.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Lucro:</span>
                      <p className="text-green-600 font-medium">
                        €{(product.price - product.cost).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-2">{product.description}</p>

                  {product.approval_id && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                      <strong>ID Aprovação:</strong> {product.approval_id.slice(0, 8)}...
                      <span className="ml-2 text-gray-500">
                        (Verificar no Sistema de Aprovação Financeira)
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Instruções de Integração */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">📋 Como Funciona a Integração</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ol className="list-decimal list-inside space-y-2">
            <li>Produto é criado com valores financeiros</li>
            <li>Sistema automaticamente cria aprovação financeira</li>
            <li>Produto fica com status "Aguardando Aprovação"</li>
            <li>Tesoureiro revisa valores no Sistema de Aprovação</li>
            <li>Após aprovação, produto pode ir para a loja pública</li>
            <li>Se rejeitado, criador pode ajustar valores e reenviar</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductWithApproval;
