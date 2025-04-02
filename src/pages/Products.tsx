
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { createMockProduct } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { seedProducts } from '@/services/productService';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 20]);
  const [organicOnly, setOrganicOnly] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log("Fetching products from Supabase...");
        
        // Simple query without any filters
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        console.log("Fetched products:", data);
        
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          console.log("No products found in database");
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products: ' + error.message);
        setError(error.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    // Convert to lowercase for case-insensitive search
    const productName = product.name ? product.name.toLowerCase() : '';
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = productName.includes(searchLower);
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesOrganic = !organicOnly || product.organic === true;

    return matchesSearch && matchesCategory && matchesPrice && matchesOrganic;
  });

  const handleAddSampleProducts = () => {
    navigate('/seed-products');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-4">Our Products</h1>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-medium mb-4">No Products Found</h2>
          <p className="text-muted-foreground mb-6">
            No products found in the database. Click below to add some sample products.
          </p>
          <Button onClick={handleAddSampleProducts}>
            Add Sample Products
          </Button>
        </div>
      ) : (
        <>
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
                max={200}  // Increased for more realistic prices
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
              <h3 className="text-lg font-medium">No products match your filters</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter options.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
