
import { supabase, validateUUID, generateDeterministicUUID } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { toast } from 'sonner';

// Add products to the database
export const addProductsToDatabase = async (products: Product[]): Promise<void> => {
  try {
    // Process each product
    for (const product of products) {
      // Ensure the product has a valid UUID
      const productId = validateUUID(product.id) 
        ? product.id 
        : generateDeterministicUUID(product.id);
      
      // Check if the product already exists
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .single();
      
      if (!existingProduct) {
        // Insert new product
        const { error } = await supabase
          .from('products')
          .insert([
            {
              id: productId,
              name: product.name,
              description: product.description,
              price: product.price,
              stock: product.stock,
              image: product.image,
              category: product.category,
              organic: product.organic,
              unit: product.unit
            }
          ]);
        
        if (error) {
          console.error(`Error adding product ${product.name}:`, error);
          throw error;
        }
      }
    }
    
    toast.success('Products added to database successfully');
  } catch (error) {
    console.error('Error adding products to database:', error);
    toast.error('Failed to add products to database');
    throw error;
  }
};

// Get product by ID
export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    // Ensure the product ID is a valid UUID
    const validProductId = validateUUID(productId) 
      ? productId 
      : generateDeterministicUUID(productId);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', validProductId)
      .single();
    
    if (error) {
      console.error(`Error fetching product ${productId}:`, error);
      return null;
    }
    
    return data as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

// Seed the database with products
export const seedProducts = async (products: Product[]): Promise<void> => {
  try {
    await addProductsToDatabase(products);
    console.log('Database seeded with products');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
