'use client'

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@/contexts/UserContext';
import { Mail, Briefcase, Award, Calendar, Clock, AlertTriangle, BarChart, Tag, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  role: string;
  points: number;
  created_at: string;
  last_login: string;
}

interface Task {
  id: string;
  name: string;
  points: number;
  status: string;
  urgency: number;
  difficulty: number;
  priority: number;
  deadline: string;
}

const ProfilePage: React.FC = () => {
  const { user: contextUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [awaitingApprovalTasks, setAwaitingApprovalTasks] = useState<Task[]>([]);
  const [suggestedTasks, setSuggestedTasks] = useState<Task[]>([]);
  const supabase = createClientComponentClient()

  const fetchTasks = useCallback(async (userId: string) => {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, name, points, status, urgency, difficulty, priority, deadline')
      .eq('assigned_user_id', userId);

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setCompletedTasks(tasks.filter(task => task.status === 'Complete') || []);
      setInProgressTasks(tasks.filter(task => task.status === 'In Progress') || []);
      setAwaitingApprovalTasks(tasks.filter(task => task.status === 'Awaiting Completion Approval') || []);
    }
  }, [supabase]);

  const fetchSuggestedTasks = useCallback(async () => {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, name, points, status, urgency, difficulty, priority, deadline')
      .eq('status', 'Open')
      .limit(3);

    if (error) {
      console.error('Error fetching suggested tasks:', error);
    } else {
      setSuggestedTasks(tasks || []);
    }
  }, [supabase]);

  const fetchUserData = useCallback(async () => {
    if (contextUser) {
      const { data: role } = await supabase.rpc('get_user_role', { user_email: contextUser.email });
      const { data: userData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', contextUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching user data:', error);
      } else {
        setUser({ 
          id: contextUser.id, 
          email: contextUser.email || '', 
          role: role || 'visitor',
          points: userData?.points || 0,
          created_at: userData?.created_at || '',
          last_login: userData?.last_login || ''
        });
        fetchTasks(contextUser.id);
        fetchSuggestedTasks();
      }
    }
  }, [contextUser, supabase, fetchTasks, fetchSuggestedTasks]);

  useEffect(() => {
    if (contextUser) {
      fetchUserData();
    }
  }, [contextUser, fetchUserData]);

  const markTaskAsDone = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'Awaiting Completion Approval' })
      .eq('id', taskId);
    if (error) {
      console.error('Error marking task as done:', error);
      alert('Failed to mark task as done. Please try again.');
    } else {
      alert('Task marked as done successfully!');
      fetchUserData();
    }
  };

  const getStatusClassName = (status: string) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-semibold";
    switch (status.toLowerCase()) {
      case 'in progress': return `${baseClass} bg-yellow-500 text-black`;
      case 'complete': return `${baseClass} bg-green-500 text-white`;
      case 'awaiting completion approval': return `${baseClass} bg-orange-500 text-white`;
      default: return `${baseClass} bg-gray-500 text-white`;
    }
  };

  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 8) return 'text-red-500';
    if (urgency >= 5) return 'text-yellow-500';
    return 'text-green-500';
  };

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
        className="space-y-6"
      >
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          User Profile
        </h1>
        <motion.div 
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-8"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="mr-3 text-blue-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Briefcase className="mr-3 text-yellow-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Role</p>
                  <p className="font-semibold">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Award className="mr-3 text-green-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Total Points</p>
                  <p className="font-semibold text-2xl">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                      {user.points}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="mr-3 text-purple-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Joined</p>
                  <p className="font-semibold">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="mr-3 text-red-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Last Login</p>
                  <p className="font-semibold">{new Date(user.last_login).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <h2 className="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          In Progress Tasks
        </h2>
        {inProgressTasks.length > 0 ? (
          <div className="space-y-4 mb-8">
            {inProgressTasks.map(task => (
              <motion.div
                key={task.id}
                className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-purple-300">{task.name}</h3>
                  <span className={getStatusClassName(task.status)}>{task.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="flex items-center">
                    <AlertTriangle className={`mr-1 ${getUrgencyColor(task.urgency)}`} size={12} />
                    <span className="text-xs text-gray-400">{task.urgency}/10</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart className="mr-1 text-blue-400" size={12} />
                    <span className="text-xs text-gray-400">{task.difficulty}/10</span>
                  </div>
                  <div className="flex items-center">
                    <Tag className="mr-1 text-green-400" size={12} />
                    <span className="text-xs text-gray-400">{task.priority}/10</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-yellow-400">{task.points} Points</span>
                  <button 
                    onClick={() => markTaskAsDone(task.id)}
                    className="text-xs px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Mark as Done
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-xl text-gray-300 mb-8">No tasks in progress.</p>
        )}

        <h2 className="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Tasks Awaiting Approval
        </h2>
        {awaitingApprovalTasks.length > 0 ? (
          <div className="space-y-4 mb-8">
            {awaitingApprovalTasks.map(task => (
              <motion.div
                key={task.id}
                className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-purple-300">{task.name}</h3>
                  <span className={getStatusClassName(task.status)}>{task.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-yellow-400">{task.points} Points</span>
                  <span className="text-sm text-gray-300">Waiting for approval</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-xl text-gray-300 mb-8">No tasks awaiting approval.</p>
        )}

        <h2 className="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Suggested Tasks
        </h2>
        {suggestedTasks.length > 0 ? (
          <div className="space-y-4 mb-8">
            {suggestedTasks.map(task => (
              <motion.div
                key={task.id}
                className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-purple-300">{task.name}</h3>
                  <span className="font-bold text-yellow-400">{task.points} Points</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="flex items-center">
                    <AlertTriangle className={`mr-1 ${getUrgencyColor(task.urgency)}`} size={12} />
                    <span className="text-xs text-gray-400">{task.urgency}/10</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart className="mr-1 text-blue-400" size={12} />
                    <span className="text-xs text-gray-400">{task.difficulty}/10</span>
                  </div>
                  <div className="flex items-center">
                    <Tag className="mr-1 text-green-400" size={12} />
                    <span className="text-xs text-gray-400">{task.priority}/10</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Link 
                    href={`/dashboard/tasks/${task.id}`}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
                  >
                    View Details <ExternalLink size={12} className="ml-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-xl text-gray-300 mb-8">No suggested tasks available at the moment.</p>
        )}

        <h2 className="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Completed Tasks
        </h2>
        {completedTasks.length > 0 ? (
          <div className="space-y-4 mb-8">
            {completedTasks.map(task => (
              <motion.div
                key={task.id}
                className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-purple-300">{task.name}</h3>
                  <span className={getStatusClassName(task.status)}>{task.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-400">{task.points} Points Earned</span>
                  <CheckCircle className="text-green-500" size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-xl text-gray-300 mb-8">No completed tasks yet.</p>
        )}

        <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block transition-colors">
            View All Tasks
          </Link>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProfilePage;