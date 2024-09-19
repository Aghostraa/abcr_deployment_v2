import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@/contexts/UserContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface Task {
  id?: string;
  name: string;
  instructions: string;
  urgency: number;
  difficulty: number;
  priority: number;
  points: number;
  project_id: string;
  category_id: string;
  status: string;
  assigned_user_id?: string;
  created_by: string;
  created_at?: string;
  deadline?: string;
}

interface FormData {
  name: string;
  instructions: string;
  project_id: string;
  category_id: string;
  urgency: string;
  difficulty: string;
  priority: string;
  deadline: Date | null;
}

interface Project {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface TaskFormProps {
  onTaskCreated: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    instructions: '',
    project_id: '',
    category_id: '',
    urgency: '2',
    difficulty: '2',
    priority: '2',
    deadline: null,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('projects').select('id, name');
    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('id, name');
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, deadline: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, instructions, project_id, category_id, urgency, difficulty, priority, deadline } = formData;
    const points = (parseInt(urgency) + parseInt(difficulty) + parseInt(priority)) * 10;

    if (!user) {
      console.error('User not logged in');
      return;
    }

    const newTask: Task = {
      name,
      instructions,
      urgency: parseInt(urgency),
      difficulty: parseInt(difficulty),
      priority: parseInt(priority),
      points,
      project_id,
      category_id,
      status: 'Open',
      created_by: user.id,
      deadline: deadline ? deadline.toISOString() : undefined,
    };

    const { error } = await supabase.from('tasks').insert(newTask);
    if (error) {
      console.error('Error creating task:', error);
    } else {
      setFormData({
        name: '',
        instructions: '',
        project_id: '',
        category_id: '',
        urgency: '2',
        difficulty: '2',
        priority: '2',
        deadline: null,
      });
      onTaskCreated();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Task Name"
        className="input-field w-full"
        required
      />
      <textarea
        name="instructions"
        value={formData.instructions}
        onChange={handleChange}
        placeholder="Task Instructions"
        className="input-field w-full"
        required
      />
      <select
        name="project_id"
        value={formData.project_id}
        onChange={handleChange}
        className="input-field w-full"
        required
      >
        <option value="">Select Project</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>{project.name}</option>
        ))}
      </select>
      <select
        name="category_id"
        value={formData.category_id}
        onChange={handleChange}
        className="input-field w-full"
        required
      >
        <option value="">Select Category</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
      <div className="flex space-x-4">
        <select
          name="urgency"
          value={formData.urgency}
          onChange={handleChange}
          className="input-field w-full"
        >
          <option value="1">Low Urgency</option>
          <option value="2">Medium Urgency</option>
          <option value="3">High Urgency</option>
        </select>
        <select
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
          className="input-field w-full"
        >
          <option value="1">Low Difficulty</option>
          <option value="2">Medium Difficulty</option>
          <option value="3">High Difficulty</option>
        </select>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="input-field w-full"
        >
          <option value="1">Low Priority</option>
          <option value="2">Medium Priority</option>
          <option value="3">High Priority</option>
        </select>
      </div>
      <DatePicker
        selected={formData.deadline}
        onChange={handleDateChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="time"
        dateFormat="MMMM d, yyyy h:mm aa"
        placeholderText="Select Deadline"
        className="input-field w-full"
      />
      <button type="submit" className="btn-primary w-full">
        Create Task
      </button>
    </form>
  );
};

export default TaskForm;