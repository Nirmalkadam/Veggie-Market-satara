
import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { createMockProduct } from '@/types';

const Products = () => {
  // Mock products for development
  const products = [
    createMockProduct({
      id: "prod1",
      name: "Organic Spinach",
      description: "Fresh organic spinach, perfect for salads and cooking.",
      price: 3.99,
      image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=1000&auto=format&fit=crop",
      category: "greens",
      stock: 30,
      unit: "bunch",
      organic: true
    }),
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
      unit: "each"
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
    }),
    createMockProduct({
      id: "prod5",
      name: "Fresh Broccoli",
      description: "Crisp and flavorful broccoli crowns.",
      price: 2.29,
      image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=2002&auto=format&fit=crop",
      category: "vegetables",
      stock: 35,
      unit: "head",
      organic: true
    }),
    createMockProduct({
      id: "prod6",
      name: "Cucumber",
      description: "Cool and refreshing cucumbers.",
      price: 0.99,
      image: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?q=80&w=1000&auto=format&fit=crop",
      category: "vegetables",
      stock: 45,
      unit: "each"
    }),
    createMockProduct({
      id: "prod7",
      name: "Organic Tomatoes",
      description: "Juicy and flavorful organic tomatoes.",
      price: 3.49,
      image: "https://images.unsplash.com/photo-1592924357228-91f67e116b13?q=80&w=1000&auto=format&fit=crop",
      category: "vegetables",
      stock: 30,
      unit: "pound",
      organic: true
    }),
    createMockProduct({
      id: "prod8",
      name: "Garlic",
      description: "Fresh aromatic garlic bulbs.",
      price: 0.79,
      image: "https://images.unsplash.com/photo-1615475532358-a6b7e5522902?q=80&w=1000&auto=format&fit=crop",
      category: "herbs",
      stock: 50,
      unit: "bulb"
    }),
    createMockProduct({
      id: "prod9",
      name: "Yellow Onion",
      description: "Versatile yellow onions for cooking.",
      price: 0.89,
      image: "https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=1000&auto=format&fit=crop",
      category: "vegetables",
      stock: 60,
      unit: "each"
    }),
    createMockProduct({
      id: "prod10",
      name: "Green Beans",
      description: "Crisp and fresh green beans.",
      price: 2.99,
      image: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?q=80&w=1000&auto=format&fit=crop",
      category: "vegetables",
      stock: 25,
      unit: "pound"
    }),
    createMockProduct({
      id: "prod11",
      name: "Organic Potatoes",
      description: "Versatile organic potatoes.",
      price: 3.99,
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=1000&auto=format&fit=crop",
      category: "roots",
      stock: 40,
      unit: "bag",
      organic: true
    }),
    createMockProduct({
      id: "prod12",
      name: "Fresh Cilantro",
      description: "Aromatic herb perfect for garnishing.",
      price: 1.29,
      image: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1000&auto=format&fit=crop",
      category: "herbs",
      stock: 20,
      unit: "bunch"
    })
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10]);
  const [organicOnly, setOrganicOnly] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesOrganic = !organicOnly || product.organic === true;

    return matchesSearch && matchesCategory && matchesPrice && matchesOrganic;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-4">Our Products</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Search */}
        <div className="md:col-span-1">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-1">
          <select
            className="w-full p-2 border rounded"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="herbs">Herbs</option>
            <option value="roots">Roots</option>
            <option value="greens">Greens</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
          <Slider
            defaultValue={priceRange}
            max={20}
            step={1}
            onValueChange={value => setPriceRange(value)}
          />
        </div>

        {/* Organic Only */}
        <div className="md:col-span-1 flex items-center">
          <Checkbox
            id="organic"
            checked={organicOnly}
            onCheckedChange={(checked) => setOrganicOnly(checked === true)}
          />
          <label
            htmlFor="organic"
            className="ml-2 text-sm font-medium text-gray-700"
          >
            Organic Only
          </label>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter options.
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
