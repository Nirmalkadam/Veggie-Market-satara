import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Truck, Clock, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

// Mock featured products - updating prices to more realistic INR values
const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Organic Broccoli",
    description: "Fresh organic broccoli, locally grown and packed with vitamins and minerals.",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 50,
    unit: "bunch",
    organic: true,
    featured: true,
  },
  {
    id: "2",
    name: "Fresh Carrots",
    description: "Sweet and crunchy organic carrots, perfect for salads, juicing, or cooking.",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1582515073490-39981397c445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 80,
    unit: "kg",
    organic: true,
  },
  {
    id: "3",
    name: "Bell Peppers Mix",
    description: "Colorful mix of fresh bell peppers - red, yellow, and green. Great for stir-fries or salads.",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 35,
    unit: "pack",
    discount: 10,
  },
  {
    id: "4",
    name: "Fresh Spinach",
    description: "Tender and nutritious organic spinach leaves, responsibly grown and harvested.",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "greens",
    stock: 40,
    unit: "bunch",
    organic: true,
  },
  {
    id: "5",
    name: "Organic Tomatoes",
    description: "Juicy, ripe organic tomatoes, perfect for salads, sandwiches, or cooking.",
    price: 169.99,
    image: "https://images.unsplash.com/photo-1592841200221-a6c613d6e87c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 60,
    unit: "kg",
    organic: true,
  }
];

const categories = [
  {
    name: "Vegetables",
    image: "https://images.unsplash.com/photo-1557844351-5a1668e8f515?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    count: 28,
  },
  {
    name: "Fruits",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    count: 23,
  },
  {
    name: "Herbs",
    image: "https://images.unsplash.com/photo-1620277489055-11113c7c7ac1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    count: 15,
  },
  {
    name: "Roots",
    image: "https://images.unsplash.com/photo-1636659554549-1a64e615eab3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    count: 12,
  },
];

const Index = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-accent py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
                100% Organic Produce
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight mb-6">
                Fresh Vegetables <br />
                <span className="text-primary">Delivered to Your Door</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Discover a wide range of farm-fresh vegetables, sustainably grown and carefully selected for your healthy lifestyle.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-full">
                  <Link to="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative animate-slide-down">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Fresh vegetables"
                className="rounded-3xl shadow-lg aspect-[4/3] w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 glass-panel rounded-2xl p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2 text-primary">
                      <Leaf className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-medium">Farm Fresh Guarantee</p>
                      <p className="text-sm text-muted-foreground">Quality you can trust</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Farm Fresh Vegetables, <span className="text-primary">Delivered Fast</span>
            </h2>
            <p className="text-muted-foreground">
              We're committed to providing the freshest produce with exceptional service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Leaf className="h-6 w-6" />,
                title: "100% Organic",
                description: "All our products are certified organic, free from harmful chemicals."
              },
              {
                icon: <Truck className="h-6 w-6" />,
                title: "Free Delivery",
                description: "Free delivery on all orders over $50 within the city."
              },
              {
                icon: <Clock className="h-6 w-6" />,
                title: "Always Fresh",
                description: "From farm to your doorstep within 24 hours."
              },
              {
                icon: <ThumbsUp className="h-6 w-6" />,
                title: "Quality Support",
                description: "Our dedicated team is here to help you 7 days a week."
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center mb-12">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
                Browse Categories
              </Badge>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Shop by <span className="text-primary">Category</span>
              </h2>
            </div>
            <Button asChild variant="outline" className="mt-4 md:mt-0">
              <Link to="/products">View All Categories</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link 
                key={index} 
                to={`/products?category=${category.name.toLowerCase()}`}
                className="group relative overflow-hidden rounded-xl aspect-[4/3]"
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors z-10"></div>
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-xl font-medium text-white mb-1">{category.name}</h3>
                  <p className="text-white/70 text-sm">{category.count} products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center mb-12">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
                Featured Products
              </Badge>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Our Best <span className="text-primary">Selling Products</span>
              </h2>
            </div>
            <Button asChild variant="outline" className="mt-4 md:mt-0">
              <Link to="/products">View All Products</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard product={featuredProducts[0]} featured />
            {featuredProducts.slice(1, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 hover:text-white">
              Limited Time Offer
            </Badge>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Get 15% Off Your First Order
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Sign up for our newsletter and receive a 15% discount code for your first purchase. Fresh vegetables are just a click away!
            </p>
            <div className="bg-white rounded-full p-2 flex max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-transparent flex-1 px-4 py-2 focus:outline-none text-black" 
              />
              <Button className="rounded-full">
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
