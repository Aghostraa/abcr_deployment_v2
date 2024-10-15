'use client'

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, ArrowUpDown } from 'lucide-react';

// Define the structure of a user profile
interface UserProfile {
  id: string;
  email: string;
  role: string;
  last_login: string;
  is_new: boolean;
}

const UsersPage: React.FC = () => {
  // Retrieve the current user and loading state from context
  const { user, loading: userLoading } = useUser();

  // State variables to manage users, loading state, errors, and form inputs
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [message, setMessage] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Initialize Supabase client
  const supabase = createClientComponentClient();

  // Fetch users when the component mounts or when the user changes
  useEffect(() => {
    if (user && user.role === 'Admin') {
      fetchUsers();
    }
  }, [user]);

  /**
   * Fetches the list of users from the Supabase 'user_profiles' table.
   * Processes the data to determine if a user is new (registered within the last week).
   */
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

      // Map fetched data to include 'is_new' flag
      const processedUsers: UserProfile[] = data.map(user => ({
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

  /**
   * Handles changing a user's role by invoking a Supabase RPC function.
   * After updating, it refetches the users to reflect changes.
   * @param userId - The ID of the user whose role is to be updated.
   * @param newRole - The new role to assign to the user.
   */
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

  /**
   * Handles setting a user's role based on the email input.
   * Updates the user's role in the database and refetches the users.
   */
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

  /**
   * Toggles the sort order between ascending and descending for the user list.
   */
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  /**
   * Sorts the users array based on the last login date.
   * @returns A sorted array of users.
   */
  const sortedUsers = [...users].sort((a, b) => {
    const dateA = new Date(a.last_login).getTime();
    const dateB = new Date(b.last_login).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Display a loading state while user data is being fetched
  if (userLoading) {
    return (
      <DashboardLayout>
        <div>Loading user data...</div>
      </DashboardLayout>
    );
  }

  // Restrict access to Admin users only
  if (!user || user.role !== 'Admin') {
    return (
      <DashboardLayout>
        <div>You do not have permission to view this page.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }} // Initial animation state
        animate={{ opacity: 1, y: 0 }} // Animation target state
        transition={{ duration: 0.5 }} // Animation duration
        className="space-y-6"
      >
        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          User Management
        </h1>

        {/* Set User Role Section */}
        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-6"
          whileHover={{ scale: 1.01 }} // Scale animation on hover
          transition={{ type: "spring", stiffness: 300 }} // Animation properties
        >
          <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Set User Role
          </h2>
          <div className="space-y-4">
            {/* Email Input Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="User Email"
                className="input-field w-full pl-10"
              />
            </div>
            {/* Role Selection Dropdown */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field w-full pl-10"
              >
                <option value="Visitor">Visitor</option>
                <option value="Member">Member</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            {/* Button to Set User Role */}
            <button onClick={handleSetRole} className="btn-secondary w-full">
              Set User Role
            </button>
          </div>
        </motion.div>

        {/* User List Section */}
        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.01 }} // Scale animation on hover
          transition={{ type: "spring", stiffness: 300 }} // Animation properties
        >
          <div className="flex justify-between items-center mb-4">
            {/* Section Title */}
            <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              User List
            </h2>
            {/* Button to Toggle Sort Order */}
            <button
              onClick={toggleSortOrder}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center"
            >
              <ArrowUpDown size={16} className="mr-2" />
              Sort by Last Login {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          {/* Display loading, error, or the list of users */}
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
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.25)" }} // Hover animation
                  transition={{ type: "spring", stiffness: 300 }} // Animation properties
                >
                  {/* User Email and New Badge */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2 text-blue-400" />
                      <p>{user.email}</p>
                    </div>
                    {user.is_new && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">New</span>
                    )}
                  </div>
                  {/* Last Login Information */}
                  <div className="flex items-center mb-2">
                    <Calendar size={16} className="mr-2 text-purple-400" />
                    <p className="text-sm">Last Login: {new Date(user.last_login).toLocaleString()}</p>
                  </div>
                  {/* Role Selection Dropdown */}
                  <div className="flex items-center">
                    <User size={16} className="mr-2 text-yellow-400" />
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-white bg-opacity-20 rounded p-1 text-sm"
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

        {/* Display success message if any */}
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
