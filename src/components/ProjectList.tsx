import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Task {
  id: string;
  name: string;
  status: string;
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (projectsError) throw projectsError;

      setProjects(projectsData || []);

      const tasksPromises = projectsData?.map(async (project) => {
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('id, name, status')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (tasksError) throw tasksError;

        return { [project.id]: tasksData || [] };
      });

      if (tasksPromises) {
        const tasksResults = await Promise.all(tasksPromises);
        const combinedTasks = tasksResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setTasks(combinedTasks);
      }
    } catch (error) {
      console.error('Error fetching projects and tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClassName = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'task-status task-status-pending';
      case 'in progress':
        return 'task-status task-status-in-progress';
      case 'completed':
        return 'task-status task-status-completed';
      case 'cancelled':
        return 'task-status task-status-cancelled';
      default:
        return 'task-status';
    }
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <motion.div
          key={project.id}
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            {project.name}
          </h3>
          <p className="mb-4">{project.description}</p>
          <h4 className="text-xl font-semibold mb-2">Recent Tasks</h4>
          {tasks[project.id]?.length > 0 ? (
            <ul className="space-y-2">
              {tasks[project.id].map((task) => (
                <li key={task.id} className="bg-white bg-opacity-20 rounded p-2 flex justify-between items-center">
                  <span>{task.name}</span>
                  <span className={getStatusClassName(task.status)}>{task.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No tasks found for this project.</p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ProjectList;