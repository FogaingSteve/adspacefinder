import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import AdminLogin from "@/pages/auth/AdminLogin";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Dashboard } from "@/pages/admin/Dashboard";
import { Settings } from "@/pages/admin/Settings";
import { Users } from "@/pages/admin/Users";
import { Listings } from "@/pages/admin/Listings";
import { Categories } from "@/pages/admin/Categories";
import { Reports } from "@/pages/admin/Reports";
import { Analytics } from "@/pages/admin/Analytics";
import Profile from "@/pages/Profile";
import { ListingDetails } from "@/pages/ListingDetails";
import CreateListing from "@/pages/CreateListing";
import { EditListing } from "@/pages/EditListing";
import Messages from "@/pages/Messages";
import Favorites from "@/pages/Favorites";
import { Search } from "@/pages/Search";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import { ResetPassword } from "@/pages/auth/ResetPassword";
import { NotFound } from "@/pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth/admin" element={<AdminLogin />} />
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users" element={<Users />} />
          <Route path="listings" element={<Listings />} />
          <Route path="categories" element={<Categories />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Protected User Routes */}
        <Route path="/profile" element={<ProtectedRoute />}>
          <Route index element={<Profile />} />
        </Route>
        <Route path="/listings" element={<ProtectedRoute />}>
          <Route path="create" element={<CreateListing />} />
          <Route path="edit/:id" element={<EditListing />} />
        </Route>
        <Route path="/messages" element={<ProtectedRoute />}>
          <Route index element={<Messages />} />
        </Route>
        <Route path="/favorites" element={<ProtectedRoute />}>
          <Route index element={<Favorites />} />
        </Route>

        {/* Public Routes */}
        <Route path="/listings/:id" element={<ListingDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
