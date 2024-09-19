'use client'

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@/contexts/UserContext';

interface User {
  id: string;
  email: string;
  role: string;
  points: number;
}

interface Task {
  id: number;
  name: string;
  points: number;
  status: string;
}

const ProfilePage: React.FC = () => {
  const { user: contextUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const supabase = createClientComponentClient()

  const fetchTasks = useCallback(async (userId: string) => {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, name, points, status')
      .eq('assigned_user_id', userId);

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setCompletedTasks(tasks.filter(task => task.status === 'Complete') || []);
      setInProgressTasks(tasks.filter(task => ['In Progress', 'Awaiting Completion Approval'].includes(task.status)) || []);
    }
  }, [supabase]);

  const fetchUserData = useCallback(async () => {
    if (contextUser) {
      const { data: role } = await supabase.rpc('get_user_role', { user_email: contextUser.email });
      const { data: userData, error } = await supabase
        .from('user_profiles')
        .select('points')
        .eq('id', contextUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching user data:', error);
      } else {
        setUser({ 
          id: contextUser.id, 
          email: contextUser.email || '', 
          role: role || 'visitor',
          points: userData?.points || 0
        });
        fetchTasks(contextUser.id);
      }
    }
  }, [contextUser, supabase, fetchTasks]);

  useEffect(() => {
    if (contextUser) {
      fetchUserData();
    }
  }, [contextUser, fetchUserData]);

  if (!contextUser) {
    return <DashboardLayout><div>Loading user data...</div></DashboardLayout>;
  }

  if (!user) {
    return <DashboardLayout><div>Loading profile...</div></DashboardLayout>;
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

export default ProfilePage;