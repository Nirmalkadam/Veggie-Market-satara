
import { supabase, validateUUID, generateDeterministicUUID, sanitizeProductId } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { toast } from 'sonner';

// Add products to the database
export const addProductsToDatabase = async (products: Product[]): Promise<void> => {
  try {
    console.log("Adding products to database:", products);
    
    // Process each product
    for (const product of products) {
      // Ensure the product has a valid UUID
      const productId = validateUUID(product.id) 
        ? product.id 
        : generateDeterministicUUID(product.id);
      
      console.log(`Processing product ${product.name} with ID: ${productId}`);
      
      // Check if the product already exists
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .single();
      
      if (!existingProduct) {
        // Insert new product
        const { error, data } = await supabase
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
          ])
          .select();
        
        console.log(`Insert result for ${product.name}:`, { error, data });
        
        if (error) {
          console.error(`Error adding product ${product.name}:`, error);
          throw error;
        }
      } else {
        console.log(`Product ${product.name} already exists, skipping`);
      }
    }
    
    toast.success('Products added to database successfully');
  } catch (error) {
    console.error('Error adding products to database:', error);
    toast.error('Failed to add products to database: ' + error.message);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    console.log("Getting product with ID:", productId);
    
    // Ensure the product ID is a valid UUID
    const validProductId = sanitizeProductId(productId);
    
    console.log("Sanitized product ID:", validProductId);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', validProductId)
      .single();
    
    if (error) {
      console.error(`Error fetching product ${productId}:`, error);
      return null;
    }
    
    console.log("Fetched product:", data);
    return data as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

// Seed the database with products
export const seedProducts = async (products: Product[]): Promise<void> => {
  try {
    console.log("Seeding database with products:", products);
    await addProductsToDatabase(products);
    console.log('Database seeded with products');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
