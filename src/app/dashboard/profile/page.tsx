'use client'

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/contexts/UserContext';
import { Mail, Briefcase, Award, Calendar, Clock, AlertTriangle, BarChart, Tag, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Define the structure of a User
interface User {
  id: string;
  email: string;
  role: string;
  points: number;
  created_at: string;
  last_login: string;
}

// Define the structure of a Task
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

// Main component for the Profile Page
const ProfilePage: React.FC = () => {
  // Retrieve the current user from the UserContext
  const { user: contextUser } = useUser();

  // State variables to manage user data and various task categories
  const [user, setUser] = useState<User | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [awaitingApprovalTasks, setAwaitingApprovalTasks] = useState<Task[]>([]);
  const [suggestedTasks, setSuggestedTasks] = useState<Task[]>([]);
  
  // Initialize the Supabase client for interacting with the backend
  const supabase = createClientComponentClient();

  // Fetches tasks assigned to the user and categorizes them based on their status
  const fetchTasks = useCallback(async (userId: string) => {
    // Query the 'tasks' table for tasks assigned to the user
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, name, points, status, urgency, difficulty, priority, deadline')
      .eq('assigned_user_id', userId);

    if (error) {
      // Log any errors encountered during fetch
      console.error('Error fetching tasks:', error);
    } else {
      // Categorize tasks based on their status
      setCompletedTasks(tasks.filter(task => task.status === 'Complete') || []);
      setInProgressTasks(tasks.filter(task => task.status === 'In Progress') || []);
      setAwaitingApprovalTasks(tasks.filter(task => task.status === 'Awaiting Completion Approval') || []);
    }
  }, [supabase]);

  // Fetches suggested tasks that are currently open and limits to 3
  const fetchSuggestedTasks = useCallback(async () => {
    // Query the 'tasks' table for open tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, name, points, status, urgency, difficulty, priority, deadline')
      .eq('status', 'Open')
      .limit(3);

    if (error) {
      // Log any errors encountered during fetch
      console.error('Error fetching suggested tasks:', error);
    } else {
      // Update the suggestedTasks state with fetched data
      setSuggestedTasks(tasks || []);
    }
  }, [supabase]);

  // Fetches the user's profile data and associated tasks
  const fetchUserData = useCallback(async () => {
    if (contextUser) {
      // Fetch the user's role using a Supabase RPC function
      const { data: role } = await supabase.rpc('get_user_role', { user_email: contextUser.email });

      // Fetch the user's profile from the 'user_profiles' table
      const { data: userData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', contextUser.id)
        .single();
      
      if (error) {
        // Log any errors encountered during fetch
        console.error('Error fetching user data:', error);
      } else {
        // Update the user state with fetched data
        setUser({ 
          id: contextUser.id, 
          email: contextUser.email || '', 
          role: role || 'visitor',
          points: userData?.points || 0,
          created_at: userData?.created_at || '',
          last_login: userData?.last_login || ''
        });

        // Fetch tasks assigned to the user and suggested tasks
        fetchTasks(contextUser.id);
        fetchSuggestedTasks();
      }
    }
  }, [contextUser, supabase, fetchTasks, fetchSuggestedTasks]);

  // useEffect hook to fetch user data when the component mounts or when contextUser changes
  useEffect(() => {
    if (contextUser) {
      fetchUserData();
    }
  }, [contextUser, fetchUserData]);

  // Marks a task as done by updating its status in the database
  const markTaskAsDone = async (taskId: string) => {
    // Update the task's status to 'Awaiting Completion Approval'
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'Awaiting Completion Approval' })
      .eq('id', taskId);
    
    if (error) {
      // Log error and alert the user if the update fails
      console.error('Error marking task as done:', error);
      alert('Failed to mark task as done. Please try again.');
    } else {
      // Alert the user of success and refresh user data
      alert('Task marked as done successfully!');
      fetchUserData(); // Refresh user data to reflect the updated task status
    }
  };

  // Returns the appropriate CSS class names based on the task's status
  const getStatusClassName = (status: string) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-semibold";
    switch (status.toLowerCase()) {
      case 'in progress': return `${baseClass} bg-yellow-500 text-black`;
      case 'complete': return `${baseClass} bg-green-500 text-white`;
      case 'awaiting completion approval': return `${baseClass} bg-orange-500 text-white`;
      default: return `${baseClass} bg-gray-500 text-white`;
    }
  };

  // Determines the text color based on the task's urgency level
  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 8) return 'text-red-500';
    if (urgency >= 5) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Conditional rendering: Show a loading spinner if contextUser is not yet available
  if (!contextUser) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Conditional rendering: Show a loading message if the user profile is being fetched
  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center text-gray-300">
          Loading profile...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }} // Initial animation state: hidden and slightly shifted down
        animate={{ opacity: 1, y: 0 }} // Final animation state: visible and in original position
        transition={{ duration: 0.5 }} // Animation duration: 0.5 seconds
        className="space-y-6" // Adds vertical spacing between child elements
      >
        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          User Profile
        </h1>

        {/* User Information Card */}
        <motion.div 
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-8"
          whileHover={{ scale: 1.02 }} // Slightly scale up on hover for emphasis
          transition={{ type: "spring", stiffness: 300 }} // Animation properties
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Email, Role, and Points */}
            <div className="space-y-4">
              {/* Email Information */}
              <div className="flex items-center">
                <Mail className="mr-3 text-blue-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>

              {/* Role Information */}
              <div className="flex items-center">
                <Briefcase className="mr-3 text-yellow-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Role</p>
                  <p className="font-semibold">{user.role}</p>
                </div>
              </div>

              {/* Total Points Information */}
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

            {/* Right Column: Join Date and Last Login */}
            <div className="space-y-4">
              {/* Join Date Information */}
              <div className="flex items-center">
                <Calendar className="mr-3 text-purple-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Joined</p>
                  <p className="font-semibold">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Last Login Information */}
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

        {/* In Progress Tasks Section */}
        <h2 className="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          In Progress Tasks
        </h2>
        {inProgressTasks.length > 0 ? (
          <div className="space-y-4 mb-8">
            {inProgressTasks.map(task => (
              <motion.div
                key={task.id}
                className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md"
                whileHover={{ scale: 1.02 }} // Slightly scale up on hover for emphasis
                transition={{ type: "spring", stiffness: 300 }} // Animation properties
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-purple-300">{task.name}</h3>
                  <span className={getStatusClassName(task.status)}>{task.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {/* Urgency Indicator */}
                  <div className="flex items-center">
                    <AlertTriangle className={`mr-1 ${getUrgencyColor(task.urgency)}`} size={12} />
                    <span className="text-xs text-gray-400">{task.urgency}/10</span>
                  </div>
                  {/* Difficulty Indicator */}
                  <div className="flex items-center">
                    <BarChart className="mr-1 text-blue-400" size={12} />
                    <span className="text-xs text-gray-400">{task.difficulty}/10</span>
                  </div>
                  {/* Priority Indicator */}
                  <div className="flex items-center">
                    <Tag className="mr-1 text-green-400" size={12} />
                    <span className="text-xs text-gray-400">{task.priority}/10</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  {/* Points Earned */}
                  <span className="font-bold text-yellow-400">{task.points} Points</span>
                  {/* Button to Mark Task as Done */}
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
          // Message displayed when there are no in-progress tasks
          <p className="text-xl text-gray-300 mb-8">No tasks in progress.</p>
        )}

        {/* Tasks Awaiting Approval Section */}
        <h2 className="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Tasks Awaiting Approval
        </h2>
        {awaitingApprovalTasks.length > 0 ? (
          <div className="space-y-4 mb-8">
            {awaitingApprovalTasks.map(task => (
              <motion.div
                key={task.id}
                className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md"
                whileHover={{ scale: 1.02 }} // Slightly scale up on hover for emphasis
                transition={{ type: "spring", stiffness: 300 }} // Animation properties
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-purple-300">{task.name}</h3>
                  <span className={getStatusClassName(task.status)}>{task.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  {/* Points Earned */}
                  <span className="font-bold text-yellow-400">{task.points} Points</span>
                  {/* Status Indicator */}
                  <span className="text-sm text-gray-300">Waiting for approval</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Message displayed when there are no tasks awaiting approval
          <p className="text-xl text-gray-300 mb-8">No tasks awaiting approval.</p>
        )}

        {/* Suggested Tasks Section */}
        <h2 className="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Suggested Tasks
        </h2>
        {suggestedTasks.length > 0 ? (
          <div className="space-y-4 mb-8">
            {suggestedTasks.map(task => (
              <motion.div
                key={task.id}
                className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md"
                whileHover={{ scale: 1.02 }} // Slightly scale up on hover for emphasis
                transition={{ type: "spring", stiffness: 300 }} // Animation properties
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-purple-300">{task.name}</h3>
                  <span className="font-bold text-yellow-400">{task.points} Points</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {/* Urgency Indicator */}
                  <div className="flex items-center">
                    <AlertTriangle className={`mr-1 ${getUrgencyColor(task.urgency)}`} size={12} />
                    <span className="text-xs text-gray-400">{task.urgency}/10</span>
                  </div>
                  {/* Difficulty Indicator */}
                  <div className="flex items-center">
                    <BarChart className="mr-1 text-blue-400" size={12} />
                    <span className="text-xs text-gray-400">{task.difficulty}/10</span>
                  </div>
                  {/* Priority Indicator */}
                  <div className="flex items-center">
                    <Tag className="mr-1 text-green-400" size={12} />
                    <span className="text-xs text-gray-400">{task.priority}/10</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  {/* Link to View Task Details */}
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
          // Message displayed when there are no suggested tasks
          <p className="text-xl text-gray-300 mb-8">No suggested tasks available at the moment.</p>
        )}

        {/* Completed Tasks Section */}
        <h2 className="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Completed Tasks
        </h2>
        {completedTasks.length > 0 ? (
          <div className="space-y-4 mb-8">
            {completedTasks.map(task => (
              <motion.div
                key={task.id}
                className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md"
                whileHover={{ scale: 1.02 }} // Slightly scale up on hover for emphasis
                transition={{ type: "spring", stiffness: 300 }} // Animation properties
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-purple-300">{task.name}</h3>
                  <span className={getStatusClassName(task.status)}>{task.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  {/* Points Earned */}
                  <span className="font-bold text-green-400">{task.points} Points Earned</span>
                  {/* Completion Indicator */}
                  <CheckCircle className="text-green-500" size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Message displayed when there are no completed tasks
          <p className="text-xl text-gray-300 mb-8">No completed tasks yet.</p>
        )}

        {/* Link to View All Tasks */}
        <Link 
          href="/dashboard"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block transition-colors"
        >
          View All Tasks
        </Link>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProfilePage;
