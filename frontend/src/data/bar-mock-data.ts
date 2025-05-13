
import { Product, Sale } from '@/types/bar';

export const mockProducts: Product[] = [
  { 
    id: 'p1', 
    name: 'Imperial', 
    price: 1.5, 
    description: 'Cerveja de pressão 20cl',
    unitOfMeasure: 'Un',
    imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=300',
    stock: 100 
  },
  { 
    id: 'p2', 
    name: 'Caneca', 
    price: 3.0, 
    description: 'Cerveja de pressão 50cl',
    unitOfMeasure: 'Un',
    imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=300',
    stock: 80 
  },
  { 
    id: 'p3', 
    name: 'Fino', 
    price: 2.0, 
    description: 'Cerveja de pressão 33cl',
    unitOfMeasure: 'Un',
    imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=300',
    stock: 120 
  },
  { 
    id: 'p4', 
    name: 'Coca-Cola', 
    price: 2.0, 
    description: 'Refrigerante 33cl',
    unitOfMeasure: 'Un',
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=300', 
    stock: 50 
  },
  { 
    id: 'p5', 
    name: 'Água', 
    price: 1.0, 
    description: 'Água mineral 33cl',
    unitOfMeasure: 'Un',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=300',
    stock: 30 
  },
  { 
    id: 'p6', 
    name: 'Café', 
    price: 0.8, 
    description: 'Café expresso',
    unitOfMeasure: 'Un',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=300',
    stock: 200 
  },
  { 
    id: 'p7', 
    name: 'Whisky', 
    price: 5.0, 
    description: 'Whisky dose',
    unitOfMeasure: 'Un',
    imageUrl: 'https://images.unsplash.com/photo-1527281400682-1c449c4a367e?q=80&w=300',
    stock: 25 
  },
  { 
    id: 'p8', 
    name: 'Sandes Mista', 
    price: 3.5, 
    description: 'Sandes de queijo e fiambre',
    unitOfMeasure: 'Un',
    imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?q=80&w=300',
    stock: 15 
  },
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

export const mockSales: Sale[] = [
  {
    id: 's1',
    items: [
      { 
        productId: 'p1', 
        productName: 'Imperial', 
        price: 1.5, 
        quantity: 3, 
        total: 4.5, 
        unitOfMeasure: 'Un',
        imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=300'
      },
      { 
        productId: 'p6', 
        productName: 'Café', 
        price: 0.8, 
        quantity: 1, 
        total: 0.8,
        unitOfMeasure: 'Un',
        imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=300'
      }
    ],
    seller: 'João Silva',
    sellerId: 'user1',
    timestamp: new Date(today.setHours(14, 32, 0)),
    total: 5.3,
    amountPaid: 10,
    change: 4.7
  },
  {
    id: 's2',
    items: [
      { 
        productId: 'p4', 
        productName: 'Coca-Cola', 
        price: 2.0, 
        quantity: 2, 
        total: 4.0,
        unitOfMeasure: 'Un',
        imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=300'
      },
      { 
        productId: 'p8', 
        productName: 'Sandes Mista', 
        price: 3.5, 
        quantity: 1, 
        total: 3.5,
        unitOfMeasure: 'Un',
        imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?q=80&w=300'
      }
    ],
    seller: 'Maria Costa',
    sellerId: 'user2',
    timestamp: new Date(today.setHours(17, 15, 0)),
    total: 7.5,
    amountPaid: 10,
    change: 2.5
  },
  {
    id: 's3',
    items: [
      { 
        productId: 'p7', 
        productName: 'Whisky', 
        price: 5.0, 
        quantity: 2, 
        total: 10.0,
        unitOfMeasure: 'Un',
        imageUrl: 'https://images.unsplash.com/photo-1527281400682-1c449c4a367e?q=80&w=300'
      }
    ],
    seller: 'João Silva',
    sellerId: 'user1',
    timestamp: new Date(yesterday.setHours(20, 45, 0)),
    total: 10.0,
    amountPaid: 20,
    change: 10.0
  }
];

export const mockUsers = [
  { id: 'user1', name: 'João Silva' },
  { id: 'user2', name: 'Maria Costa' },
  { id: 'user3', name: 'António Machado' },
  { id: 'user4', name: 'Carlos Santos' }
];
