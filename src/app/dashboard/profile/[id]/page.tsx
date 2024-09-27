'use client'

import React, { useState, useEffect, useCallback } from 'react';
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
  points: number;
  last_login: string;
  created_at: string;
}

interface Task {
  id: number;
  name: string;
  points: number;
  status: string;
}

const IndividualProfilePage: React.FC = () => {
  const { id } = useParams();
  const { user: currentUser } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const fetchUserProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (userError) throw userError;

      // Fetch user role
      const { data: role } = await supabase.rpc('get_user_role', { user_email: userData.email });

      setUserProfile({
        ...userData,
        role: role || 'visitor',
      });

      // Fetch tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, name, points, status')
        .eq('assigned_user_id', id);

      if (tasksError) throw tasksError;

      setCompletedTasks(tasks.filter(task => task.status === 'Complete') || []);
      setInProgressTasks(tasks.filter(task => ['In Progress', 'Awaiting Completion Approval'].includes(task.status)) || []);
    } catch (err) {
      setError('Failed to fetch user profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (loading) {
    return <DashboardLayout><div>Loading profile...</div></DashboardLayout>;
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
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-8"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="mr-3 text-blue-400" size={24} />
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
              <div className="flex items-center">
                <Award className="mr-3 text-green-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Total Points</p>
                  <p className="font-semibold text-2xl">{userProfile.points}</p>
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
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-8"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Completed Tasks
          </h2>
          {completedTasks.length > 0 ? (
            <ul className="space-y-4">
              {completedTasks.map(task => (
                <motion.li 
                  key={task.id}
                  className="bg-white bg-opacity-20 rounded-lg p-4 shadow-md flex justify-between items-center"
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.25)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-lg">{task.name}</span>
                  <span className="text-lg font-semibold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
                    {task.points} points
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-xl text-gray-300">No completed tasks yet.</p>
          )}
        </motion.div>

        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            In Progress Tasks
          </h2>
          {inProgressTasks.length > 0 ? (
            <ul className="space-y-4">
              {inProgressTasks.map(task => (
                <motion.li 
                  key={task.id}
                  className="bg-white bg-opacity-20 rounded-lg p-4 shadow-md flex justify-between items-center"
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.25)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-lg">{task.name}</span>
                  <span className="text-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                    {task.status}
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-xl text-gray-300">No tasks in progress.</p>
          )}
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

export default IndividualProfilePage;