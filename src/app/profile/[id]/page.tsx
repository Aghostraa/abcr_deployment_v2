'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';

interface User {
  id: string;
  email: string;
  role: string;
  points: number;
  completed_tasks: string[];
}

interface Task {
  id: string;
  name: string;
  points: number;
  status: string;
}

const UserProfilePage: React.FC = () => {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles_public')
        .select('id, email, role, points, completed_tasks')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setUser(data);

      if (data.completed_tasks && data.completed_tasks.length > 0) {
        const { data: completedTasksData, error: completedTasksError } = await supabase
          .from('tasks')
          .select('id, name, points, status')
          .in('id', data.completed_tasks);

        if (completedTasksError) throw completedTasksError;
        setCompletedTasks(completedTasksData || []);
      }

      const { data: inProgressData, error: inProgressError } = await supabase
        .from('tasks')
        .select('id, name, points, status')
        .eq('assigned_user_id', userId)
        .in('status', ['in_progress', 'pending_approval']);

      if (inProgressError) throw inProgressError;
      setInProgressTasks(inProgressData || []);

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardLayout><div>Loading user data...</div></DashboardLayout>;
  }

  if (error || !user) {
    return <DashboardLayout><div>Error: {error || 'User not found'}</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          User Profile
        </h1>
        <motion.div 
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-8"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <p className="mb-2 text-xl"><span className="font-semibold">Email:</span> {user.email}</p>
          <p className="mb-2 text-xl"><span className="font-semibold">Role:</span> {user.role}</p>
          <p className="mb-2 text-2xl"><span className="font-semibold">Total Points:</span> 
            <span className="ml-2 inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
              {user.points}
            </span>
          </p>
        </motion.div>
        <h2 className="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Completed Tasks
        </h2>
        {completedTasks.length > 0 ? (
          <ul className="space-y-4 mb-8">
            {completedTasks.map(task => (
              <motion.li 
                key={task.id}
                className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md flex justify-between items-center"
                whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.15)" }}
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
          <p className="text-xl text-gray-300 mb-8">No completed tasks yet.</p>
        )}
        <h2 className="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          In Progress Tasks
        </h2>
        {inProgressTasks.length > 0 ? (
          <ul className="space-y-4">
            {inProgressTasks.map(task => (
              <motion.li 
                key={task.id}
                className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md flex justify-between items-center"
                whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.15)" }}
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
    </DashboardLayout>
  );
};

export default UserProfilePage;