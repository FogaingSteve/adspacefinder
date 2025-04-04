
import Index from "@/pages/Index";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import CreateListing from "@/pages/CreateListing";
import ListingDetail from "@/pages/ListingDetail";
import Dashboard from "@/pages/Dashboard";
import MyListings from "@/pages/MyListings";
import Favorites from "@/pages/Favorites";
import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import ProfileView from "@/pages/ProfileView";
import Settings from "@/pages/Settings";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import LegalInfo from "@/pages/LegalInfo";
import FAQ from "@/pages/FAQ";
import CategoryPage from "@/pages/CategoryPage";
import SubcategoryPage from "@/pages/SubcategoryPage";
import MySearches from "@/pages/MySearches";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/useAuth";

// Add these imports for admin routes
import AdminLogin from "@/pages/admin/Login";
import { AdminDashboard } from "@/pages/admin/Dashboard";

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Router>
            <Navigation />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth/signin" element={<SignIn />} />
                <Route path="/auth/signup" element={<SignUp />} />
                <Route path="/listings/create" element={<CreateListing />} />
                <Route path="/listings/:id" element={<ListingDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<ProfileView />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/legal" element={<LegalInfo />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/categories/:categoryId" element={<CategoryPage />} />
                <Route path="/categories/:categoryId/:subcategoryId" element={<SubcategoryPage />} />
                <Route path="/search" element={<MySearches />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Routes>
            </main>
            <Footer />
            <Toaster />
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
