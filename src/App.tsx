
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import Home from "@/pages/Index";
import CreateListing from "@/pages/CreateListing";
import MySearches from "@/pages/MySearches";
import Favorites from "@/pages/Favorites";
import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import CategoryPage from "@/pages/CategoryPage";
import SubcategoryPage from "@/pages/SubcategoryPage";
import ListingDetail from "@/pages/ListingDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import LegalInfo from "@/pages/LegalInfo";
import FAQ from "@/pages/FAQ";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2
    }
  }
});

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listings/create" element={<CreateListing />} />
            <Route path="/listings/my-searches" element={<MySearches />} />
            <Route path="/listings/favorites" element={<Favorites />} />
            
            {/* Route simplifiée pour les détails d'annonce par ID */}
            <Route path="/listings/:id" element={<ListingDetail />} />
            
            {/* Routes pour les catégories */}
            <Route path="/categories/:categoryId" element={<CategoryPage />} />
            <Route path="/categories/:categoryId/:subcategoryId" element={<SubcategoryPage />} />
            
            {/* Routes pour les pages footer */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/legal" element={<LegalInfo />} />
            <Route path="/faq" element={<FAQ />} />
            
            {/* Autres routes */}
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          <Footer />
          <Toaster />
        </div>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
