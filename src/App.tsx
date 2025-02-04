import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen">
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listings/create" element={<CreateListing />} />
              <Route path="/listings/my-searches" element={<MySearches />} />
              <Route path="/listings/favorites" element={<Favorites />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/auth/signin" element={<SignIn />} />
              <Route path="/auth/signup" element={<SignUp />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/categories/:categoryId" element={<CategoryPage />} />
              <Route path="/categories/:categoryId/:subcategoryId" element={<SubcategoryPage />} />
            </Routes>
            <Footer />
            <Toaster />
          </div>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;