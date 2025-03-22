
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Minus, 
  Plus, 
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

// Mock product data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Organic Broccoli",
    description: "Fresh organic broccoli, locally grown and packed with vitamins and minerals. Our broccoli is harvested at peak ripeness to ensure the best flavor and nutritional value. Each bunch typically weighs between 400-500g and is perfect for steaming, stir-frying, or enjoying raw in salads. Rich in vitamins C and K, fiber, and antioxidants, broccoli is an excellent addition to a healthy diet.",
    price: 2.99,
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 50,
    unit: "bunch",
    organic: true,
  },
  {
    id: "2",
    name: "Fresh Carrots",
    description: "Sweet and crunchy organic carrots, perfect for salads, juicing, or cooking. These vibrant orange carrots are grown without synthetic pesticides or fertilizers, ensuring you get pure, natural flavor in every bite. Packed with beta-carotene, fiber, and various nutrients, these carrots are as nutritious as they are delicious.",
    price: 1.49,
    image: "https://images.unsplash.com/photo-1582515073490-39981397c445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 80,
    unit: "kg",
    organic: true,
  },
  {
    id: "3",
    name: "Bell Peppers Mix",
    description: "Colorful mix of fresh bell peppers - red, yellow, and green. Great for stir-fries or salads. Each pack contains 3 bell peppers, one of each color, totaling approximately 500-600g. Bell peppers are excellent sources of vitamins A and C, and their vibrant colors indicate different antioxidant benefits.",
    price: 3.99,
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 35,
    unit: "pack",
    discount: 10,
  },
  {
    id: "4",
    name: "Fresh Spinach",
    description: "Tender and nutritious organic spinach leaves, responsibly grown and harvested. Our spinach is carefully washed and packed to preserve freshness and flavor. Each bunch weighs approximately 250g and is perfect for salads, smoothies, or cooking. Spinach is a nutritional powerhouse, rich in iron, calcium, and vitamins A, C, and K.",
    price: 2.49,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "greens",
    stock: 40,
    unit: "bunch",
    organic: true,
  },
];

const productNutrition = {
  calories: "55 kcal",
  protein: "3.7g",
  carbs: "11.2g",
  fat: "0.6g",
  fiber: "2.6g",
  sugar: "2.2g",
  vitaminC: "135%",
  vitaminK: "116%",
  folate: "16%",
  potassium: "8%"
};

const productReviews = [
  {
    id: 1,
    name: "Alex Johnson",
    rating: 5,
    date: "2 weeks ago",
    comment: "These vegetables are incredibly fresh! The broccoli was crisp and flavorful. Will definitely order again.",
  },
  {
    id: 2,
    name: "Sarah Miller",
    rating: 4,
    date: "1 month ago",
    comment: "Great quality and taste. Arrived fresh and lasted longer than store-bought veggies. Took off one star because the bunch was slightly smaller than expected.",
  },
  {
    id: 3,
    name: "Michael Chen",
    rating: 5,
    date: "2 months ago",
    comment: "Absolutely love the flavor of these organic vegetables. You can taste the difference from conventional produce!",
  },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll use our mock data
    const foundProduct = mockProducts.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      
      // Find related products (same category, excluding current product)
      const related = mockProducts
        .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
        .slice(0, 3);
      setRelatedProducts(related);
    }
    // Reset quantity when product changes
    setQuantity(1);
  }, [id]);

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading product...</p>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  // Calculate discounted price if applicable
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : null;
  
  const formattedDiscountedPrice = discountedPrice
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(discountedPrice)
    : null;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex">
          <Link 
            to="/products" 
            className="text-muted-foreground hover:text-primary transition-colors flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Products
          </Link>
        </nav>
      </div>

      {/* Product Details */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="relative rounded-xl overflow-hidden aspect-square bg-accent/30">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain"
          />
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.organic && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800">
                Organic
              </Badge>
            )}
            {product.discount && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-800">
                {product.discount}% Off
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-6">
            <span className="text-sm text-muted-foreground capitalize">{product.category}</span>
            <h1 className="text-3xl font-semibold tracking-tight mt-1 mb-3">{product.name}</h1>
            
            <div className="flex items-baseline mb-4">
              {discountedPrice ? (
                <>
                  <span className="text-2xl font-semibold text-primary mr-2">
                    {formattedDiscountedPrice}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formattedPrice}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-semibold text-primary">
                  {formattedPrice}
                </span>
              )}
              <span className="text-sm text-muted-foreground ml-2">
                / {product.unit}
              </span>
            </div>

            <p className="text-muted-foreground mb-6">
              {product.description}
            </p>

            <div className="flex items-center space-x-4 mb-6">
              <div className="text-sm font-medium">Availability:</div>
              {product.stock > 0 ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                  In Stock ({product.stock} {product.stock === 1 ? 'item' : 'items'})
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-sm font-medium">Quantity:</div>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-r-none"
                  disabled={quantity <= 1}
                  onClick={decrementQuantity}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="h-9 px-4 flex items-center justify-center border-y border-input bg-transparent text-sm">
                  {quantity}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-l-none"
                  disabled={product.stock <= quantity}
                  onClick={incrementQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Button 
                size="lg" 
                className="flex-1 sm:flex-none sm:min-w-[180px]"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="icon" className="h-11 w-11">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-11 w-11">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center border border-border rounded-lg p-3">
                <div className="mr-3 bg-accent rounded-full p-2">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              
              <div className="flex items-center border border-border rounded-lg p-3">
                <div className="mr-3 bg-accent rounded-full p-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Satisfaction Guarantee</p>
                  <p className="text-xs text-muted-foreground">100% money back</p>
                </div>
              </div>
              
              <div className="flex items-center border border-border rounded-lg p-3">
                <div className="mr-3 bg-accent rounded-full p-2">
                  <RefreshCcw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">Within 14 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-16">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto py-0 mb-6">
            <TabsTrigger 
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 text-base"
            >
              Description
            </TabsTrigger>
            <TabsTrigger 
              value="nutrition"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 text-base"
            >
              Nutrition Facts
            </TabsTrigger>
            <TabsTrigger 
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 text-base"
            >
              Reviews
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-0">
            <div className="prose max-w-none">
              <p>{product.description}</p>
              <p>Our {product.name.toLowerCase()} is sourced from local farms that follow sustainable farming practices. We ensure that all produce is harvested at the peak of freshness and delivered to you within 24-48 hours of harvest.</p>
              <h3>Key Benefits</h3>
              <ul>
                <li>Farm-fresh quality</li>
                <li>No artificial pesticides or fertilizers</li>
                <li>Supports local farmers and sustainable agriculture</li>
                <li>Rich in essential vitamins and nutrients</li>
              </ul>
              <h3>Storage Tips</h3>
              <p>For optimal freshness, store your {product.name.toLowerCase()} in the refrigerator. For best results, {
                product.category === 'greens' ? 'wrap in a paper towel and place in a loosely closed plastic bag.' :
                product.category === 'herbs' ? 'place stems in a glass of water, like a bouquet of flowers, and cover loosely with a plastic bag.' :
                'store in the vegetable crisper drawer of your refrigerator.'
              }</p>
            </div>
          </TabsContent>
          
          <TabsContent value="nutrition" className="mt-0">
            <div className="bg-card border border-border rounded-lg p-6 max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Nutrition Information</h3>
              <p className="text-sm text-muted-foreground mb-4">Typical values per 100g serving</p>
              
              <div className="space-y-3">
                {Object.entries(productNutrition).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-0">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Customer Reviews</h3>
                <Button variant="outline">Write a Review</Button>
              </div>
              
              {productReviews.length > 0 ? (
                <div className="space-y-6">
                  {productReviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-0">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">{review.name}</h4>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Related Products</h2>
            <Button asChild variant="outline">
              <Link to="/products">View All</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
