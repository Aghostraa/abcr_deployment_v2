'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Award, Clock, CheckCircle, Briefcase } from 'lucide-react';
import Link from 'next/link';

// Define the structure of a User Profile
interface UserProfile {
  id: string;
  email: string;
  role: string;
  points: number;
  last_login: string;
  created_at: string;
}

// Define the structure of a Task
interface Task {
  id: number;
  name: string;
  points: number;
  status: string;
}


//IndividualProfilePage Component
//
//This component displays the profile of an individual user along with their associated tasks.
//It fetches user profile data and categorizes tasks based on their status.
//Additionally, it provides administrative actions for users with 'Admin' or 'Manager' roles.

const IndividualProfilePage: React.FC = () => {
  // Extract the 'id' parameter from the URL using Next.js's useParams hook
  const { id } = useParams();

  // Retrieve the current user from the UserContext
  const { user: currentUser } = useUser();

  // State variables to manage user profile, tasks, loading state, and errors
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize the Supabase client for interacting with the backend
  const supabase = createClientComponentClient();

  // Fetches the user's profile and associated tasks from Supabase
  const fetchUserProfile = useCallback(async () => {
    if (!id) return; // Exit if no user ID is provided
    setLoading(true); // Set loading state to true before fetching data
    setError(null); // Reset any existing errors

    try {
      // Fetch user profile data from the 'user_profiles' table
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single(); // Fetch a single record matching the provided ID

      if (userError) throw userError; // Throw error if fetching user data fails

      // Fetch user role using a Supabase RPC (Remote Procedure Call) function
      const { data: role } = await supabase.rpc('get_user_role', { user_email: userData.email });

      // Update the userProfile state with fetched data and role
      setUserProfile({
        ...userData,
        role: role || 'visitor', // Default to 'visitor' if role is undefined
      });

      // Fetch tasks assigned to the user from the 'tasks' table
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, name, points, status')
        .eq('assigned_user_id', id); // Filter tasks by assigned_user_id

      if (tasksError) throw tasksError; // Throw error if fetching tasks fails

      // Categorize tasks based on their status
      setCompletedTasks(tasks.filter(task => task.status === 'Complete') || []);
      setInProgressTasks(tasks.filter(task => ['In Progress', 'Awaiting Completion Approval'].includes(task.status)) || []);
    } catch (err) {
      // Handle any errors that occur during data fetching
      setError('Failed to fetch user profile'); // Set error message
      console.error(err); // Log the error for debugging purposes
    } finally {
      setLoading(false); // Set loading state to false after fetching is complete
    }
  }, [id, supabase]);

  // useEffect hook to fetch user profile when the component mounts or when 'id' changes
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Marks a task as done by updating its status in the database
  const markTaskAsDone = async (taskId: string) => {
    try {
      // Update the task's status to 'Awaiting Completion Approval'
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'Awaiting Completion Approval' })
        .eq('id', taskId);

      if (error) throw error; // Throw error if the update fails

      alert('Task marked as done successfully!'); // Notify the user of success
      fetchUserProfile(); // Refresh the user profile to reflect the updated task status
    } catch (err) {
      // Handle any errors that occur during the update
      console.error('Error marking task as done:', err); // Log the error
      alert('Failed to mark task as done. Please try again.'); // Notify the user of failure
    }
  };

  // Returns the appropriate CSS class names based on the task's status
  const getStatusClassName = (status: string) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-semibold";
    switch (status.toLowerCase()) {
      case 'in progress':
        return `${baseClass} bg-yellow-500 text-black`;
      case 'complete':
        return `${baseClass} bg-green-500 text-white`;
      case 'awaiting completion approval':
        return `${baseClass} bg-orange-500 text-white`;
      default:
        return `${baseClass} bg-gray-500 text-white`;
    }
  };

  // Determines the text color based on the task's urgency level
  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 8) return 'text-red-500';
    if (urgency >= 5) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Conditional rendering: Show a loading spinner if data is being fetched
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          {/* Spinner Animation */}
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Conditional rendering: Show an error message if there's an error or if the user profile is not found
  if (error || !userProfile) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-500 font-semibold">
          Error: {error || 'User not found'}
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
          whileHover={{ scale: 1.01 }} // Slightly scale up on hover for emphasis
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
                  <p className="font-semibold">{userProfile.email}</p>
                </div>
              </div>

              {/* Role Information */}
              <div className="flex items-center">
                <Briefcase className="mr-3 text-yellow-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Role</p>
                  <p className="font-semibold">{userProfile.role}</p>
                </div>
              </div>

              {/* Total Points Information */}
              <div className="flex items-center">
                <Award className="mr-3 text-green-400" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Total Points</p>
                  <p className="font-semibold text-2xl">{userProfile.points}</p>
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
                  <p className="font-semibold">{new Date(userProfile.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Last Login Information */}
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

        {/* Completed Tasks Section */}
        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-8"
          whileHover={{ scale: 1.01 }} // Slightly scale up on hover for emphasis
          transition={{ type: "spring", stiffness: 300 }} // Animation properties
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
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.25)" }} // Slight scaling and background change on hover
                  transition={{ type: "spring", stiffness: 300 }} // Animation properties
                >
                  {/* Task Name */}
                  <span className="text-lg">{task.name}</span>
                  
                  {/* Task Points with Gradient Text */}
                  <span className="text-lg font-semibold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
                    {task.points} points
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            // Message displayed when there are no completed tasks
            <p className="text-xl text-gray-300">No completed tasks yet.</p>
          )}
        </motion.div>

        {/* In Progress Tasks Section */}
        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.01 }} // Slightly scale up on hover for emphasis
          transition={{ type: "spring", stiffness: 300 }} // Animation properties
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
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.25)" }} // Slight scaling and background change on hover
                  transition={{ type: "spring", stiffness: 300 }} // Animation properties
                >
                  {/* Task Name */}
                  <span className="text-lg">{task.name}</span>
                  
                  {/* Task Status with Gradient Text */}
                  <span className="text-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                    {task.status}
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            // Message displayed when there are no in-progress tasks
            <p className="text-xl text-gray-300">No tasks in progress.</p>
          )}
        </motion.div>

        {/* Conditional Rendering: Show Administrative Actions for Admins and Managers */}
        {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
          <motion.div
            className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
            whileHover={{ scale: 1.01 }} // Slightly scale up on hover for emphasis
            transition={{ type: "spring", stiffness: 300 }} // Animation properties
          >
            <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              Administrative Actions
            </h2>
            {/* Placeholder for administrative actions such as changing user roles, resetting passwords, etc. */}
            <p className="text-gray-300">
              Administrative actions can be added here, such as changing the user&aposs role, resetting passwords, or other management tasks.
            </p>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default IndividualProfilePage;
