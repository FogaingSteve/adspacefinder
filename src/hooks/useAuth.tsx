
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    is_admin?: boolean;
    phone?: string;
    address?: string;
  };
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: { name?: string; avatar_url?: string; phone?: string; address?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Récupérer la session depuis le localStorage au chargement
    const savedSession = localStorage.getItem('userSession')
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession)
        setUser(parsedSession)
      } catch (error) {
        console.error('Error parsing saved session:', error)
        localStorage.removeItem('userSession')
      }
    }

    // Vérifier la session active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email!,
          user_metadata: session.user.user_metadata
        }
        setUser(userData)
        localStorage.setItem('userSession', JSON.stringify(userData))
      }
    })

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email!,
          user_metadata: session.user.user_metadata
        }
        setUser(userData)
        localStorage.setItem('userSession', JSON.stringify(userData))
      } else {
        setUser(null)
        localStorage.removeItem('userSession')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // Try MongoDB auth first
      try {
        const response = await axios.post('http://localhost:5000/api/users/login', {
          email,
          password
        });
        
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          
          // Create user object from MongoDB response
          const mongoUser: User = {
            id: response.data.user.id,
            email: response.data.user.email,
            user_metadata: {
              name: response.data.user.name
            }
          };
          
          setUser(mongoUser);
          localStorage.setItem('userSession', JSON.stringify(mongoUser));
          
          toast.success('Connexion réussie');
          navigate('/dashboard');
          return;
        }
      } catch (mongoError) {
        console.error("MongoDB auth failed:", mongoError);
        // Continue to Supabase auth if MongoDB fails
      }
      
      // If MongoDB auth fails, try Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success('Connexion réussie');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la connexion");
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Starting signup process with email:", email);
      
      // Try MongoDB signup first
      try {
        console.log("Attempting MongoDB signup");
        const response = await axios.post('http://localhost:5000/api/users/register', {
          name: email.split('@')[0], // Basic name from email
          email,
          password
        });
        
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          
          // Create user object from MongoDB response
          const mongoUser: User = {
            id: response.data.user.id,
            email: response.data.user.email,
            user_metadata: {
              name: response.data.user.name
            }
          };
          
          setUser(mongoUser);
          localStorage.setItem('userSession', JSON.stringify(mongoUser));
          
          toast.success('Compte créé avec succès.');
          navigate('/dashboard');
          return;
        }
      } catch (mongoError: any) {
        console.error("MongoDB signup error:", mongoError);
        
        // If MongoDB fails with duplicate user error, show specific message
        if (mongoError.response?.status === 400 && 
            mongoError.response?.data?.message?.includes("existe déjà")) {
          toast.error(mongoError.response.data.message);
          return;
        }
        // Continue to try Supabase
      }
      
      // If MongoDB signup fails, try Supabase signup
      console.log("Attempting Supabase signup");
      
      // First check if user_with_email table exists and if the email already exists
      try {
        const { data: existingUsers, error: queryError } = await supabase
          .from('user_with_email')
          .select('email')
          .eq('email', email);
        
        if (!queryError && existingUsers && existingUsers.length > 0) {
          toast.error("Un utilisateur avec cet email existe déjà dans la base de données.");
          return;
        }
      } catch (tableError) {
        console.log("Table user_with_email might not exist or is not accessible:", tableError);
        // Continue with signup even if table check fails
      }
      
      // Proceed with Supabase signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: email.split('@')[0]
          }
        }
      });
      
      console.log("Supabase signup response:", data, error);
      
      if (error) {
        // If there's an error with "User already registered", handle this case
        if (error.message.includes("already registered")) {
          toast.error("Un utilisateur avec cet email existe déjà.");
          return;
        }
        throw error;
      }
      
      // If signup successful, try to create entry in user_with_email table
      if (data.user) {
        try {
          const { error: insertError } = await supabase
            .from('user_with_email')
            .insert([{ 
              id: data.user.id,
              email: email,
              created_at: new Date().toISOString()
            }]);
            
          if (insertError) {
            console.error("Error inserting into user_with_email:", insertError);
            // Don't throw error here, just log it - the signup already succeeded
          }
        } catch (tableError) {
          console.error("Error with user_with_email table:", tableError);
          // Continue as the auth signup has already succeeded
        }
        
        toast.success('Compte créé avec succès. Vous pouvez maintenant vous connecter.');
        navigate('/auth/signin');
      } else {
        toast.success('Compte créé avec succès. Veuillez vérifier votre email pour confirmer votre compte.');
      }
      
    } catch (error: any) {
      console.error('Erreur de signup:', error);
      toast.error(error.message || "Erreur lors de l'inscription");
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Also clear MongoDB token if exists
      localStorage.removeItem('token');
      localStorage.removeItem('userSession')
      localStorage.removeItem('adminToken'); // Also clear admin token if exists
      
      toast.success('Déconnexion réussie')
      navigate('/')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      toast.success('Instructions envoyées par email')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const updateProfile = async (data: { name?: string; avatar_url?: string; phone?: string; address?: string }) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          avatar_url: data.avatar_url,
          phone: data.phone,
          address: data.address
        }
      })
      if (authError) throw authError

      // Update user data in the users table
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          full_name: data.name,
          avatar_url: data.avatar_url,
          phone: data.phone,
          address: data.address,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (dbError) throw dbError
      
      // Update local user state
      const updatedUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          ...data
        }
      }
      setUser(updatedUser)
      localStorage.setItem('userSession', JSON.stringify(updatedUser))
      
      toast.success('Profil mis à jour avec succès')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du profil')
      console.error('Erreur mise à jour profil:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      signIn, 
      signUp, 
      signInWithGoogle, 
      signOut, 
      resetPassword,
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
