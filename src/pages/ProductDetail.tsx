import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Heart, ShoppingCart, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from '@/components/ProductCard';
import { formatCurrency } from '@/lib/utils';
import { createMockProduct } from '@/types';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  // Mock product for development
  const product = createMockProduct({
    id: id || "prod1",
    name: "Organic Spinach",
    description: "Fresh organic spinach, perfect for salads and cooking. Our spinach is grown without pesticides and harvested at peak freshness to ensure the best flavor and nutritional value. Packed with vitamins A, C, and K, iron, and antioxidants.",
    price: 3.99,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=1000&auto=format&fit=crop",
    category: "greens",
    stock: 30,
    unit: "bunch",
    organic: true
  });
  
  // Mock related products
  const relatedProducts = [
    createMockProduct({
      id: "prod2",
      name: "Organic Kale",
      description: "Fresh organic kale, perfect for salads and cooking.",
      price: 2.99,
      image: "https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?q=80&w=1000&auto=format&fit=crop",
      category: "greens",
      stock: 25,
      unit: "bunch",
      organic: true
    }),
    createMockProduct({
      id: "prod3",
      name: "Red Bell Pepper",
      description: "Sweet and crunchy red bell peppers.",
      price: 1.49,
      image: "https://images.unsplash.com/photo-1526470498-9ae73c665de8?q=80&w=1998&auto=format&fit=crop",
      category: "vegetables",
      stock: 40,
      unit: "each",
      discount: 10
    }),
    createMockProduct({
      id: "prod4",
      name: "Organic Carrots",
      description: "Sweet and nutritious organic carrots.",
      price: 2.49,
      image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?q=80&w=1770&auto=format&fit=crop",
      category: "roots",
      stock: 25,
      unit: "bundle",
      organic: true
    })
  ];

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity} ${product.name} added to cart!`);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center mb-4 text-sm font-medium hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-auto rounded-lg shadow-md" 
          />
          <div className="mt-4 flex justify-between items-center">
            <Button variant="secondary" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <div className="mt-2 flex items-center">
            <Badge variant="secondary" className="mr-2">{product.category}</Badge>
            {product.organic && <Badge variant="outline">Organic</Badge>}
            {product.discount && <Badge variant="destructive">-{product.discount}%</Badge>}
          </div>
          <p className="text-muted-foreground mt-4">{product.description}</p>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">{formatCurrency(product.price)}</div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                -
              </Button>
              <span>{quantity}</span>
              <Button variant="outline" size="icon" onClick={incrementQuantity}>
                +
              </Button>
            </div>
          </div>
          <Button className="w-full mt-4" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>

          <Separator className="my-4" />

          {/* Product Tabs */}
          <Tabs defaultValue="description" className="space-y-4">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="space-y-2">
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </TabsContent>
            <TabsContent value="details">
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                <li>Weight: 1 lb</li>
                <li>Origin: Local Farm</li>
                <li>Organic: Yes</li>
              </ul>
            </TabsContent>
            <TabsContent value="reviews">
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            </TabsContent>
          </Tabs>

          <Separator className="my-4" />

          {/* Accordion for Shipping & Returns */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping Information</AccordionTrigger>
              <AccordionContent>
                We ship to all 50 states. Shipping rates are calculated at checkout.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger>Returns & Exchanges</AccordionTrigger>
              <AccordionContent>
                We accept returns and exchanges within 30 days of purchase.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
