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
}

const UsersPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [message, setMessage] = useState('');
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
        .select('id, email, role, last_login');
      if (error) throw error;
      setUsers(data);
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
          whileHover={{ scale: 1.02 }}
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
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            User List
          </h2>
          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ul className="space-y-4">
              {users.map(user => (
                <motion.li
                  key={user.id}
                  className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md"
                  whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.25)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p>Email: {user.email}</p>
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