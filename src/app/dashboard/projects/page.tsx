'use client'

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import ProjectList from '@/components/ProjectList';

// Define the structure of a Project (if needed elsewhere)
// interface Project {
//   id: string;
//   name: string;
//   description: string;
//   status: string;
//   start_date: string;
//   // Add other relevant fields
// }

const ProjectsPage: React.FC = () => {
  // Retrieve the current user and loading state from the UserContext
  const { user, loading: userLoading } = useUser();

  // State variables to manage the new project's details and any potential errors
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [error, setError] = useState<string | null>(null);

  // Initialize the Supabase client for interacting with the backend
  const supabase = createClientComponentClient();

  /**
   * Handles the creation of a new project.
   * @param e - The form submission event.
   */
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
      // Insert a new project into the 'projects' table with the provided name and description
      // Sets the status to 'active' and records the current date as the start_date
      const { error } = await supabase
        .from('projects')
        .insert([{ 
          ...newProject, 
          status: 'active', 
          start_date: new Date().toISOString() 
        }]);

      // If there's an error during insertion, throw it to be caught in the catch block
      if (error) throw error;

      // Reset the newProject state to clear the form fields
      setNewProject({ name: '', description: '' });

      // Optionally, you can implement a callback function to refresh the ProjectList component
      // For example, by lifting the state up or using a global state management solution
    } catch (err) {
      // If an error occurs, set the error state to display an error message to the user
      setError('Failed to create project');
      console.error(err); // Log the error for debugging purposes
    }
  };

  // While the user data is loading, display a loading message
  if (userLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  // If the user is not logged in or does not have the 'Admin' or 'Manager' role, restrict access
  if (!user || !['Admin', 'Manager'].includes(user.role)) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-500 font-semibold">
          You do not have permission to view this page.
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
          Project Management
        </h1>

        {/* Conditional Rendering: Show Project Creation Form only to Admins and Managers */}
        <Card>
          <CardHeader>Create New Project</CardHeader>
          <CardContent>
            {/* Project Creation Form */}
            <form onSubmit={handleCreateProject} className="space-y-4">
              {/* Project Name Input Field */}
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Project Name"
                className="input-field w-full p-2 rounded-md bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg"
                required // Makes the field mandatory
              />
              
              {/* Project Description Textarea */}
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Project Description"
                className="input-field w-full p-2 rounded-md bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg"
                required // Makes the field mandatory
              />
              
              {/* Submit Button */}
              <button type="submit" className="btn-primary w-full py-2 rounded-md">
                Create Project
              </button>
            </form>

            {/* Display error message if project creation fails */}
            {error && (
              <div className="mt-4 text-red-500">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project List Section */}
        <Card>
          <CardHeader>Project List</CardHeader>
          <CardContent>
            {/* ProjectList Component: Displays a list of all projects with optional filtering */}
            <ProjectList defaultFilter="all" />
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProjectsPage;
