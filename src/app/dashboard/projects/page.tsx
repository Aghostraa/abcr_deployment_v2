'use client'

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Task {
  id: string;
  name: string;
  status: string;
  assigned_user_id: string | null;
}

const ProjectsPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!userLoading && user && ['Admin', 'Manager'].includes(user.role)) {
      fetchProjects();
    }
  }, [user, userLoading]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
      await fetchTasksForProjects(data || []);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForProjects = async (projects: Project[]) => {
    const taskPromises = projects.map(async (project) => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, name, status, assigned_user_id')
        .eq('project_id', project.id);
      if (error) {
        console.error(`Error fetching tasks for project ${project.id}:`, error);
        return { [project.id]: [] };
      }
      return { [project.id]: data || [] };
    });

    const taskResults = await Promise.all(taskPromises);
    const combinedTasks = taskResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    setTasks(combinedTasks);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .single();
      if (error) throw error;
      setProjects([data, ...projects]);
      setNewProject({ name: '', description: '' });
    } catch (err) {
      setError('Failed to create project');
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setProjects(projects.filter(project => project.id !== id));
    } catch (err) {
      setError('Failed to delete project');
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
            {loading ? (
              <p>Loading projects...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : projects.length === 0 ? (
              <p>No projects found.</p>
            ) : (
              <ul className="space-y-4">
                {projects.map(project => (
                  <li key={project.id} className="bg-white bg-opacity-20 rounded-lg p-4">
                    <h3 className="text-xl font-semibold">{project.name}</h3>
                    <p>{project.description}</p>
                    <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
                    <button
                      onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                      className="btn-secondary mt-2"
                    >
                      {selectedProject === project.id ? 'Hide Tasks' : 'Show Tasks'}
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="btn-secondary mt-2 ml-2"
                    >
                      Delete Project
                    </button>
                    {selectedProject === project.id && (
                      <div className="mt-4">
                        <h4 className="text-lg font-semibold mb-2">
                          {showAllTasks ? 'All Tasks' : 'Open Tasks'}
                        </h4>
                        <button
                          onClick={() => setShowAllTasks(!showAllTasks)}
                          className="btn-secondary mb-2"
                        >
                          {showAllTasks ? 'Show Open Tasks' : 'Show All Tasks'}
                        </button>
                        {tasks[project.id] && tasks[project.id].length > 0 ? (
                          <ul className="space-y-2">
                            {tasks[project.id]
                              .filter(task => showAllTasks || task.status !== 'Complete')
                              .map(task => (
                                <li key={task.id} className="bg-white bg-opacity-10 rounded p-2">
                                  {task.name} - Status: {task.status}
                                  {task.assigned_user_id && <span> (Assigned to: {task.assigned_user_id})</span>}
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <p>No tasks found for this project.</p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProjectsPage;