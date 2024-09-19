'use client'

import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface User {
  id: string;
  email: string;
  role: string;
  points: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({ user: null, loading: true });

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: role } = await supabase.rpc('get_user_role', { user_email: user.email });
        const { data: userData, error } = await supabase
          .from('user_profiles')
          .select('points')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user data:', error);
        } else {
          setUser({ 
            id: user.id, 
            email: user.email || '', 
            role: role || 'visitor',
            points: userData?.points || 0
          });
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [supabase]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);