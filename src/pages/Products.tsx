import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  SlidersHorizontal, 
  ChevronDown,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Product, Category, SearchFilters } from '@/types';
import ProductCard from '@/components/ProductCard';
import { formatCurrency } from '@/lib/utils';

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Organic Broccoli",
    description: "Fresh organic broccoli, locally grown and packed with vitamins and minerals.",
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
    description: "Sweet and crunchy organic carrots, perfect for salads, juicing, or cooking.",
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
    description: "Colorful mix of fresh bell peppers - red, yellow, and green. Great for stir-fries or salads.",
    price: 3.99,
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 35,
    unit: "pack",
  },
  {
    id: "4",
    name: "Fresh Spinach",
    description: "Tender and nutritious organic spinach leaves, responsibly grown and harvested.",
    price: 2.49,
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
    price: 3.29,
    image: "https://images.unsplash.com/photo-1592841200221-a6c613d6e87c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 60,
    unit: "kg",
    organic: true,
  },
  {
    id: "6",
    name: "Red Onions",
    description: "Sweet and flavorful red onions, perfect for salads, grilling, or cooking.",
    price: 1.79,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 70,
    unit: "kg",
  },
  {
    id: "7",
    name: "Organic Lettuce",
    description: "Crisp and fresh organic lettuce, perfect for salads and sandwiches.",
    price: 2.19,
    image: "https://images.unsplash.com/photo-1622206151226-18ca2e9c4ba3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "greens",
    stock: 45,
    unit: "head",
    organic: true,
  },
  {
    id: "8",
    name: "Cucumber",
    description: "Fresh and crisp cucumbers, perfect for salads, sandwiches, or snacking.",
    price: 1.29,
    image: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 55,
    unit: "piece",
  },
  {
    id: "9",
    name: "Garlic Bulbs",
    description: "Flavorful garlic bulbs, essential for cooking a wide variety of dishes.",
    price: 0.99,
    image: "https://images.unsplash.com/photo-1615477550927-6ec413a973cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 100,
    unit: "bulb",
  },
  {
    id: "10",
    name: "Sweet Potatoes",
    description: "Nutritious and versatile sweet potatoes, great for roasting, mashing, or frying.",
    price: 2.49,
    image: "https://images.unsplash.com/photo-1596097635121-14b8392d0c1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "roots",
    stock: 65,
    unit: "kg",
  },
  {
    id: "11",
    name: "Fresh Basil",
    description: "Aromatic fresh basil, perfect for pasta dishes, salads, and sauces.",
    price: 2.29,
    image: "https://images.unsplash.com/photo-1527605158555-853f200063e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "herbs",
    stock: 30,
    unit: "bunch",
    organic: true,
  },
  {
    id: "12",
    name: "Zucchini",
    description: "Fresh green zucchini, perfect for grilling, sautéing, or baking.",
    price: 1.99,
    image: "https://images.unsplash.com/photo-1596397249129-ef2be8cc8b52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 40,
    unit: "piece",
  },
];

const categories: Category[] = ['all', 'vegetables', 'fruits', 'herbs', 'roots', 'greens'];

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'name-a-z', label: 'Name: A to Z' },
  { value: 'name-z-a', label: 'Name: Z to A' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('search') || '',
    category: (searchParams.get('category') as Category) || 'all',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    organic: searchParams.get('organic') === 'true',
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10]);
  const [sortBy, setSortBy] = useState('recommended');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    let filteredProducts = [...mockProducts];

    if (filters.query) {
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(filters.query.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.query.toLowerCase())
      );
    }

    if (filters.category && filters.category !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.category === filters.category
      );
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.price >= (filters.minPrice as number)
      );
    }
    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.price <= (filters.maxPrice as number)
      );
    }

    if (filters.organic) {
      filteredProducts = filteredProducts.filter(product => product.organic);
    }

    switch (sortBy) {
      case 'price-low-high':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-a-z':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-z-a':
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setProducts(filteredProducts);

    const newActiveFilters: string[] = [];
    if (filters.category && filters.category !== 'all') {
      newActiveFilters.push(`Category: ${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}`);
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const minP = filters.minPrice !== undefined ? `$${filters.minPrice}` : '$0';
      const maxP = filters.maxPrice !== undefined ? `$${filters.maxPrice}` : '+';
      newActiveFilters.push(`Price: ${minP} - ${maxP}`);
    }
    if (filters.organic) {
      newActiveFilters.push('Organic Only');
    }
    setActiveFilters(newActiveFilters);

  }, [filters, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ query: filters.query });
  };

  const handleCategoryChange = (category: Category) => {
    updateFilters({ category });
  };

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
  };

  const applyPriceRange = () => {
    updateFilters({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
  };

  const handleOrganicChange = (checked: boolean) => {
    updateFilters({ organic: checked });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const removeFilter = (filter: string) => {
    if (filter.startsWith('Category:')) {
      updateFilters({ category: 'all' });
    } else if (filter.startsWith('Price:')) {
      updateFilters({ minPrice: undefined, maxPrice: undefined });
      setPriceRange([0, 10]);
    } else if (filter === 'Organic Only') {
      updateFilters({ organic: false });
    }
  };

  const clearAllFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      minPrice: undefined,
      maxPrice: undefined,
      organic: false,
    });
    setPriceRange([0, 10]);
    setSearchParams({});
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    const params = new URLSearchParams();
    if (updatedFilters.query) params.set('search', updatedFilters.query);
    if (updatedFilters.category && updatedFilters.category !== 'all') params.set('category', updatedFilters.category);
    if (updatedFilters.minPrice !== undefined) params.set('minPrice', updatedFilters.minPrice.toString());
    if (updatedFilters.maxPrice !== undefined) params.set('maxPrice', updatedFilters.maxPrice.toString());
    if (updatedFilters.organic) params.set('organic', 'true');
    
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
          Fresh Vegetables
        </h1>
        <p className="text-muted-foreground">
          Browse our selection of farm-fresh, organic vegetables
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              type="text"
              placeholder="Search vegetables..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              className="pl-9 rounded-r-none"
            />
          </div>
          <Button type="submit" className="rounded-l-none">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 md:ml-auto">
          <div className="flex-1 md:flex-none">
            <Select
              value={sortBy}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <span className="flex items-center">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </span>
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={filters.category === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryChange(category)}
                        className="capitalize"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="px-2">
                    <Slider 
                      defaultValue={[0, 10]} 
                      max={10} 
                      step={0.5}
                      value={priceRange}
                      onValueChange={handlePriceChange}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm">
                      <span>{formatCurrency(priceRange[0])}</span>
                      <span>{formatCurrency(priceRange[1])}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={applyPriceRange}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="organic-mobile" 
                      checked={filters.organic}
                      onCheckedChange={handleOrganicChange}
                    />
                    <Label htmlFor="organic-mobile">Organic Only</Label>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="hidden md:flex flex-wrap gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={filters.category === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="w-[200px] px-2">
              <Slider 
                defaultValue={[0, 10]} 
                max={10} 
                step={0.5}
                value={priceRange}
                onValueChange={handlePriceChange}
                className="mb-4"
              />
              <div className="flex justify-between text-sm">
                <span>{formatCurrency(priceRange[0])}</span>
                <span>{formatCurrency(priceRange[1])}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={applyPriceRange}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-3">Organic</h3>
            <div className="flex items-center space-x-2">
              <Switch 
                id="organic-desktop" 
                checked={filters.organic}
                onCheckedChange={handleOrganicChange}
              />
              <Label htmlFor="organic-desktop">Organic Only</Label>
            </div>
          </div>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active Filters:</span>
            {activeFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="flex items-center gap-1 py-1"
              >
                {filter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeFilter(filter)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-sm"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {products.length > 0 ? (
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria.
          </p>
          <Button onClick={clearAllFilters}>Clear All Filters</Button>
        </div>
      )}
    </div>
  );
};

export default Products;
