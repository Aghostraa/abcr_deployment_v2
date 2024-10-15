'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Award, Clock, CheckCircle, Briefcase } from 'lucide-react';

// Define the structure of a user profile with additional statistics
interface UserProfile {
  id: string;
  email: string;
  role: string;
  last_login: string;
  created_at: string;
  total_points: number;
  completed_tasks: number;
  in_progress_tasks: number;
}

const UserProfilePage: React.FC = () => {
  // Extract the 'id' parameter from the URL using Next.js's useParams hook
  const { id } = useParams();

  // Retrieve the current user from the UserContext
  const { user: currentUser } = useUser();

  // State variables to manage the user's profile, loading status, and errors
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize the Supabase client for interacting with the backend
  const supabase = createClientComponentClient();

  // useEffect hook to fetch the user's profile when the component mounts or when 'id' changes
  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * Fetches the user's profile and additional statistics from Supabase.
   * Combines data from the 'user_profiles' table and a custom RPC function 'get_user_stats'.
   */
  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the user's basic profile information from the 'user_profiles' table
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Fetch additional statistics using a Supabase RPC function
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_stats', { user_id: id });

      if (statsError) throw statsError;

      // Combine the profile data with the fetched statistics
      setUserProfile({
        ...profileData,
        ...statsData,
      });
    } catch (err) {
      setError('Failed to fetch user profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Display a loading state while the user profile is being fetched
  if (loading) {
    return (
      <DashboardLayout>
        <div>Loading user profile...</div>
      </DashboardLayout>
    );
  }

  // Display an error message if there's an error or if the user profile is not found
  if (error || !userProfile) {
    return (
      <DashboardLayout>
        <div>Error: {error || 'User not found'}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }} // Initial animation state (hidden and slightly shifted down)
        animate={{ opacity: 1, y: 0 }} // Final animation state (visible and in original position)
        transition={{ duration: 0.5 }} // Animation duration
        className="space-y-6" // Adds vertical spacing between child elements
      >
        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          User Profile
        </h1>

        {/* User Information Section */}
        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.01 }} // Slightly scale up on hover
          transition={{ type: "spring", stiffness: 300 }} // Animation properties
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Basic User Details */}
            <div className="space-y-4">
              {/* User ID */}
              <div className="flex items-center">
                <User className="mr-3 text-blue-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">User ID</p>
                  <p className="font-semibold">{userProfile.id}</p>
                </div>
              </div>
              {/* Email */}
              <div className="flex items-center">
                <Mail className="mr-3 text-green-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-semibold">{userProfile.email}</p>
                </div>
              </div>
              {/* Role */}
              <div className="flex items-center">
                <Briefcase className="mr-3 text-yellow-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Role</p>
                  <p className="font-semibold">{userProfile.role}</p>
                </div>
              </div>
            </div>
            {/* Right Column: Join Date and Last Login */}
            <div className="space-y-4">
              {/* Join Date */}
              <div className="flex items-center">
                <Calendar className="mr-3 text-purple-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Joined</p>
                  <p className="font-semibold">{new Date(userProfile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {/* Last Login */}
              <div className="flex items-center">
                <Clock className="mr-3 text-red-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Last Login</p>
                  <p className="font-semibold">{new Date(userProfile.last_login).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Statistics Section */}
        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.01 }} // Slightly scale up on hover
          transition={{ type: "spring", stiffness: 300 }} // Animation properties
        >
          <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            User Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Points */}
            <div className="flex items-center">
              <Award className="mr-3 text-yellow-400" size={24} />
              <div>
                <p className="text-sm text-gray-400">Total Points</p>
                <p className="font-semibold text-2xl">{userProfile.total_points}</p>
              </div>
            </div>
            {/* Completed Tasks */}
            <div className="flex items-center">
              <CheckCircle className="mr-3 text-green-400" size={24} />
              <div>
                <p className="text-sm text-gray-400">Completed Tasks</p>
                <p className="font-semibold text-2xl">{userProfile.completed_tasks}</p>
              </div>
            </div>
            {/* In Progress Tasks */}
            <div className="flex items-center">
              <Clock className="mr-3 text-blue-400" size={24} />
              <div>
                <p className="text-sm text-gray-400">In Progress Tasks</p>
                <p className="font-semibold text-2xl">{userProfile.in_progress_tasks}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Administrative Actions Section (Visible to Admins and Managers) */}
        {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
          <motion.div
            className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
            whileHover={{ scale: 1.01 }} // Slightly scale up on hover
            transition={{ type: "spring", stiffness: 300 }} // Animation properties
          >
            <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              Administrative Actions
            </h2>
            {/* Placeholder for administrative actions like changing user role, resetting password, etc. */}
            <p className="text-gray-300">
              Administrative actions can be added here, such as changing the user's role, resetting passwords, or other management tasks.
            </p>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default UserProfilePage;
