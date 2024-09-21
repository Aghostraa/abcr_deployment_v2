'use client'

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';

interface User {
  id: string;
  email: string;
  role: string;
  last_login: string;
  is_new: boolean;
}

const UsersPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [message, setMessage] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user && user.role === 'Admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, role, last_login, created_at');
      if (error) throw error;
      
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const processedUsers: User[] = data.map(user => ({
        ...user,
        is_new: new Date(user.created_at) > oneWeekAgo
      }));

      setUsers(processedUsers);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.rpc('set_user_role', { user_id: userId, new_role: newRole });
      if (error) throw error;
      fetchUsers();
      setMessage(`User role updated successfully`);
    } catch (err) {
      setError('Failed to update user role');
      console.error(err);
    }
  };

  const handleSetRole = async () => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('email', email);
      if (error) throw error;
      setMessage(`User role set to ${role} successfully`);
      fetchUsers();
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortedUsers = [...users].sort((a, b) => {
    const dateA = new Date(a.last_login).getTime();
    const dateB = new Date(b.last_login).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  if (userLoading) {
    return <DashboardLayout><div>Loading user data...</div></DashboardLayout>;
  }

  if (!user || user.role !== 'Admin') {
    return <DashboardLayout><div>You do not have permission to view this page.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          User Management
        </h1>

        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-6"
          whileHover={{ scale: 1.0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Set User Role
          </h2>
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="User Email"
              className="input-field w-full"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field w-full"
            >
              <option value="Visitor">Visitor</option>
              <option value="Member">Member</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
            <button onClick={handleSetRole} className="btn-secondary w-full">
              Set User Role
            </button>
          </div>
        </motion.div>

        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              User List
            </h2>
            <button
              onClick={toggleSortOrder}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Sort by Last Login {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ul className="space-y-4">
              {sortedUsers.map(user => (
                <motion.li
                  key={user.id}
                  className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md"
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.25)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex justify-between items-center">
                    <p>Email: {user.email}</p>
                    {user.is_new && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">New</span>
                    )}
                  </div>
                  <p>Last Login: {new Date(user.last_login).toLocaleString()}</p>
                  <div className="mt-2">
                    <label htmlFor={`role-${user.id}`} className="mr-2">Role:</label>
                    <select
                      id={`role-${user.id}`}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-white bg-opacity-20 rounded p-1"
                    >
                      <option value="Visitor">Visitor</option>
                      <option value="Member">Member</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-green-500 bg-opacity-20 text-green-100 p-4 rounded-lg"
          >
            {message}
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default UsersPage;