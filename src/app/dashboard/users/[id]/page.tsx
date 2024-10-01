'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Award, Clock, CheckCircle, Briefcase } from 'lucide-react';

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
  const { id } = useParams();
  const { user: currentUser } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (profileError) throw profileError;

      // Fetch additional user statistics
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_stats', { user_id: id });

      if (statsError) throw statsError;

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

  if (loading) {
    return <DashboardLayout><div>Loading user profile...</div></DashboardLayout>;
  }

  if (error || !userProfile) {
    return <DashboardLayout><div>Error: {error || 'User not found'}</div></DashboardLayout>;
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
          User Profile
        </h1>

        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="mr-3 text-blue-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">User ID</p>
                  <p className="font-semibold">{userProfile.id}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="mr-3 text-green-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-semibold">{userProfile.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Briefcase className="mr-3 text-yellow-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Role</p>
                  <p className="font-semibold">{userProfile.role}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="mr-3 text-purple-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Joined</p>
                  <p className="font-semibold">{new Date(userProfile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
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

        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            User Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <Award className="mr-3 text-yellow-400" size={24} />
              <div>
                <p className="text-sm text-gray-400">Total Points</p>
                <p className="font-semibold text-2xl">{userProfile.total_points}</p>
              </div>
            </div>
            <div className="flex items-center">
              <CheckCircle className="mr-3 text-green-400" size={24} />
              <div>
                <p className="text-sm text-gray-400">Completed Tasks</p>
                <p className="font-semibold text-2xl">{userProfile.completed_tasks}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="mr-3 text-blue-400" size={24} />
              <div>
                <p className="text-sm text-gray-400">In Progress Tasks</p>
                <p className="font-semibold text-2xl">{userProfile.in_progress_tasks}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
          <motion.div
            className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              Administrative Actions
            </h2>
            {/* Add administrative actions here, such as changing user role, resetting password, etc. */}
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default UserProfilePage;