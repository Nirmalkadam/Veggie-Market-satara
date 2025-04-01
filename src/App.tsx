
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

// Pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

// Create QueryClient instance outside of component to avoid recreation on render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route component for admin-only routes
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setChecking(false);
    }
  }, [loading]);

  if (checking) {
    return <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Checking permissions...</p>
      </div>
    </div>;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Protected route component for authenticated users
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setChecking(false);
    }
  }, [loading]);

  if (checking) {
    return <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/products" element={<Products />} />
    <Route path="/products/:id" element={<ProductDetail />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={
      <ProtectedRoute>
        <Checkout />
      </ProtectedRoute>
    } />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/admin" element={
      <AdminRoute>
        <Admin />
      </AdminRoute>
    } />
    <Route path="/profile" element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    } />
    <Route path="/orders" element={
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    } />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 pt-16">
                  <AppRoutes />
                </main>
                <Footer />
              </div>
            </TooltipProvider>
          </CartProvider>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
