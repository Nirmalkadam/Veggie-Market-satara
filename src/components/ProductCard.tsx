
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

const ProductCard = ({ product, featured = false }: ProductCardProps) => {
  const { addItem } = useCart();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <div 
      className={cn(
        'product-card group',
        featured ? 'md:col-span-2 bg-accent/30' : ''
      )}
    >
      <Link to={`/products/${product.id}`} className="block">
        {/* Image container */}
        <div className={cn(
          'blur-load relative overflow-hidden',
          featured ? 'aspect-[21/9] md:aspect-[2/1]' : 'aspect-square',
          isImageLoaded ? 'loaded' : ''
        )}>
          <img 
            src={product.image} 
            alt={product.name}
            className={cn(
              'hover-card-img w-full h-full object-cover',
              featured ? 'md:object-contain' : 'object-cover'
            )}
            onLoad={() => setIsImageLoaded(true)}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
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
          
          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add to wishlist</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/products/${product.id}`;
                    }}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex flex-wrap justify-between items-start mb-2">
            <h3 className="text-base font-medium">{product.name}</h3>
            <div className="text-base font-semibold text-primary">
              {formattedPrice}
              <span className="text-xs text-muted-foreground ml-1">/ {product.unit}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground capitalize">
              {product.category}
            </span>
            <Button 
              onClick={handleAddToCart}
              size="sm" 
              className="group-hover:opacity-100 opacity-80 transition-opacity"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
