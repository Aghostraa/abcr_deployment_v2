'use client'

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import ProjectList from '@/components/ProjectList';

const ProjectsPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('projects')
        .insert([{ ...newProject, status: 'active', start_date: new Date().toISOString() }]);
      if (error) throw error;
      setNewProject({ name: '', description: '' });
      // Refresh the ProjectList component
      // You might want to implement a callback function to refresh the ProjectList
    } catch (err) {
      setError('Failed to create project');
      console.error(err);
    }
  };

  if (userLoading) {
    return <DashboardLayout><div>Loading user data...</div></DashboardLayout>;
  }

  if (!user || !['Admin', 'Manager'].includes(user.role)) {
    return <DashboardLayout><div>You do not have permission to view this page.</div></DashboardLayout>;
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
          Project Management
        </h1>

        <Card>
          <CardHeader>Create New Project</CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Project Name"
                className="input-field w-full"
                required
              />
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Project Description"
                className="input-field w-full"
                required
              />
              <button type="submit" className="btn-primary w-full">
                Create Project
              </button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Project List</CardHeader>
          <CardContent>
            <ProjectList defaultFilter="all" />
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProjectsPage;