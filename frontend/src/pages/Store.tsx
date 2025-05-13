
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Lock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { getSafeImageUrl, getFallbackImage } from '@/utils/image-utils';
import { Product, ProductSize, ProductType } from '@/types/product';

// Mock data para produtos públicos - Seria substituído por chamadas reais ao Supabase
const publicProducts: Product[] = [
  {
    id: '1',
    name: "T-Shirt 'Os Mouros'",
    description: "T-Shirt oficial do moto clube em algodão premium",
    price: 19.99,
    membersOnly: true,
    imageUrl: "/placeholders/tshirt.jpg",
    publishedOnLandingPage: true,
    type: "T-Shirt" as ProductType,
    size: "L" as ProductSize,
    color: "Preto",
    stock: 25,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: "Caneca Personalizada",
    description: "Caneca em cerâmica com logo do clube",
    price: 9.99,
    membersOnly: false,
    imageUrl: "/placeholders/mug.jpg",
    publishedOnLandingPage: true,
    type: "Caneca" as ProductType,
    size: "Único" as ProductSize,
    color: "Branco",
    stock: 15,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: "Boné Trucker",
    description: "Boné estilo trucker com malha e logo bordado",
    price: 14.99,
    membersOnly: false,
    imageUrl: "/placeholders/cap.jpg",
    publishedOnLandingPage: true,
    type: "Boné" as ProductType,
    size: "Único" as ProductSize,
    color: "Preto/Vermelho",
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: "Pin Oficial",
    description: "Pin metálico com o logo do clube",
    price: 4.99,
    membersOnly: false,
    imageUrl: "/placeholders/pin.jpg",
    publishedOnLandingPage: true,
    type: "Pin" as ProductType,
    size: "Único" as ProductSize,
    color: "Metálico",
    stock: 50,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const Store = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(publicProducts.filter(p => p.publishedOnLandingPage));
  
  useEffect(() => {
    if (searchQuery) {
      setFilteredProducts(publicProducts.filter(product => 
        product.publishedOnLandingPage &&
        (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ));
    } else {
      setFilteredProducts(publicProducts.filter(product => product.publishedOnLandingPage));
    }
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-4xl font-display text-mouro-black mb-8">
          Nossa <span className="text-mouro-red">Loja</span>
        </h1>
        
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Procurar produtos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden flex flex-col h-full">
                <div className="aspect-square relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackImage('product');
                    }}
                  />
                  {product.membersOnly && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive" className="flex items-center space-x-1 bg-mouro-red">
                        <Lock className="h-3 w-3" />
                        <span>Apenas Sócios</span>
                      </Badge>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-2xl font-medium text-mouro-red">{product.price.toFixed(2)}€</p>
                </CardContent>
                <CardFooter className="mt-auto">
                  {product.membersOnly ? (
                    <Button className="w-full bg-gray-700 hover:bg-gray-800" asChild>
                      <Link to="/membros">
                        <Lock className="mr-2 h-4 w-4" />
                        Fazer Login
                      </Link>
                    </Button>
                  ) : (
                    <Button className="w-full bg-mouro-red hover:bg-mouro-red/90">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Comprar
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-4">Nenhum produto encontrado para "{searchQuery}".</p>
            <Button onClick={() => setSearchQuery("")} variant="outline">Limpar pesquisa</Button>
          </div>
        )}

        {/* Mensagem para o caso de loja vazia */}
        {publicProducts.filter(p => p.publishedOnLandingPage).length === 0 && (
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xl text-muted-foreground mb-8">
              Em breve, nossa loja estará disponível com produtos exclusivos do Moto Clube Os Mouros.
            </p>
            <Button className="bg-mouro-red hover:bg-mouro-red/90">
              <ShoppingCart className="mr-2" />
              Volte em breve
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Store;
