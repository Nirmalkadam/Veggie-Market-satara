
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

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10]);
  const [organicOnly, setOrganicOnly] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
        // Fallback to mock products if database fetch fails
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesOrganic = !organicOnly || product.organic === true;

    return matchesSearch && matchesCategory && matchesPrice && matchesOrganic;
  });

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
            It looks like there are no products in the database yet.
          </p>
          <Button onClick={() => navigate('/seed-products')}>
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
        </>
      )}
    </div>
  );
};

export default Products;
