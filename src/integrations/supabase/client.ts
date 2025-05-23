
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yiwbtrwfyygzhhsjcaqi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpd2J0cndmeXlnemhoc2pjYXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2Mjk4NDEsImV4cCI6MjA1ODIwNTg0MX0.120qLHBT6_pPVL3g6tNOesL3n_HL4py9lZVgqF1mg3I";

// Create a configured Supabase client with options
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    global: {
      headers: {
        'Content-Type': 'application/json'
      }
    },
    db: {
      schema: 'public'
    }
  }
);

// Helper function to ensure UUIDs are valid
export const validateUUID = (id: string): boolean => {
  // More robust UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Generate a deterministic UUID from a string that follows the proper UUID format
export const generateDeterministicUUID = (text: string): string => {
  // If input is already a valid UUID, return it
  if (validateUUID(text)) {
    return text;
  }
  
  // Hash the text to create a consistent UUID-like string
  const hash = function(s: string) {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      const char = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  };
  
  const cleanText = text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const part1 = hash(cleanText).substring(0, 8);
  const part2 = hash(cleanText + '1').substring(0, 4);
  const part3 = '4' + hash(cleanText + '2').substring(0, 3); // Ensures version 4 UUID
  const part4 = '8' + hash(cleanText + '3').substring(0, 3); // Ensures variant 8
  const part5 = hash(cleanText + '4').substring(0, 12);
  
  // Format as proper UUID
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
};

// Helper function to ensure product IDs are valid before database operations
export const sanitizeProductId = (productId: string): string => {
  return validateUUID(productId) ? productId : generateDeterministicUUID(productId);
};

// Log connection status
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth state change event:", event);
  if (session) {
    console.log("User authenticated:", session.user.id);
  }
});
