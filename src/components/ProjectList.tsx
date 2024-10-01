'use client'

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import TaskList from './TaskList';
import { useUser } from '@/contexts/UserContext';
import Loading from '@/components/Loading';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'concluded';
  start_date: string;
  end_date: string | null;
}

interface Task {
  id: string;
  name: string;
  instructions: string;
  status: string;
  points: number;
  assigned_user_id: string | null;
  created_at: string;
  deadline: string;
  project_id: string;
  project_name: string;
  urgency: number;
  difficulty: number;
  priority: number;
  category_id: string;
  category_name: string;
}

interface ProjectListProps {
  defaultFilter: 'active' | 'concluded' | 'all';
}

const ProjectList: React.FC<ProjectListProps> = ({ defaultFilter }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'active' | 'concluded' | 'all'>(defaultFilter);
  const { user } = useUser();
  const supabase = createClientComponentClient();

  const handleStatusChange = async (projectId: string, newStatus: 'active' | 'concluded') => {
    if (!user || !['Admin', 'Manager'].includes(user.role)) return;

    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId);

    if (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status. Please try again.');
    } else {
      alert('Project status updated successfully!');
      fetchProjects();
    }
  };

  const handleDeleteProject = async (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user || !['Admin', 'Manager'].includes(user.role)) return;

    if (confirm('Are you sure you want to delete this project?')) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete the project. Please try again.');
      } else {
        alert('Project deleted successfully!');
        fetchProjects();
      }
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: projectsData, error: projectsError } = await query;

      if (projectsError) throw projectsError;

      setProjects(projectsData || []);

      // Fetch all tasks for these projects
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*, projects(name)')
        .in('project_id', projectsData.map(p => p.id));

      if (tasksError) throw tasksError;

      const formattedTasks = tasksData.map(task => ({
        ...task,
        project_name: task.projects.name
      }));

      setTasks(formattedTasks);

      // Expand projects with open tasks
      const projectsWithOpenTasks = new Set(
        formattedTasks
          .filter(task => task.status.toLowerCase() === 'open')
          .map(task => task.project_id)
      );
      setExpandedProjects(projectsWithOpenTasks);

    } catch (error) {
      console.error('Error fetching projects and tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleTaskUpdate = () => {
    fetchProjects();
  };

  if (loading) {
    return <Loading message="Loading projects..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
          Projects
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'active' | 'concluded' | 'all')}
          className="bg-white bg-opacity-20 text-white rounded p-2"
        >
          <option value="all">All Projects</option>
          <option value="active">Active Projects</option>
          <option value="concluded">Concluded Projects</option>
        </select>
      </div>
      {projects.map((project) => (
        <motion.div
          key={project.id}
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {user && ['Admin', 'Manager'].includes(user.role) && (
            <button
              onClick={(e) => handleDeleteProject(project.id, e)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              title="Delete Project"
            >
              <X size={20} />
            </button>
          )}
          <div 
            className="p-6 cursor-pointer"
            onClick={() => toggleProjectExpansion(project.id)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                {project.name}
              </h3>
              {expandedProjects.has(project.id) ? <ChevronUp /> : <ChevronDown />}
            </div>
            <p className="mt-2 text-gray-300">{project.description}</p>
            <div className="mt-2 text-sm text-gray-400">
              <span>Start Date: {new Date(project.start_date).toLocaleDateString()}</span>
              {project.end_date && (
                <span className="ml-4">End Date: {new Date(project.end_date).toLocaleDateString()}</span>
              )}
            </div>
            {user && ['Admin', 'Manager'].includes(user.role) && (
              <div className="mt-2">
                <span className="mr-2">Status:</span>
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(project.id, e.target.value as 'active' | 'concluded')}
                  className="bg-white bg-opacity-20 text-white rounded p-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="active">Active</option>
                  <option value="concluded">Concluded</option>
                </select>
              </div>
            )}
          </div>
          <AnimatePresence>
            {expandedProjects.has(project.id) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-6 pb-6">
                  <h4 className="text-xl font-semibold mb-4">Tasks</h4>
                  <TaskList 
                    tasks={tasks.filter(task => task.project_id === project.id)}
                    loading={false}
                    onTaskUpdate={handleTaskUpdate}
                    projectId={project.id}
                    defaultFilterStatus="open"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default ProjectList;