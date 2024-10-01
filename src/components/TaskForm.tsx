import React, { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@/contexts/UserContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import dynamic from 'next/dynamic';
import { AlertTriangle, BarChart, Tag, Calendar } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});
import 'react-quill/dist/quill.snow.css';

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
    urgency: '5',
    difficulty: '5',
    priority: '5',
    deadline: null,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [points, setPoints] = useState(0);
  const supabase = createClientComponentClient();

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase.from('projects').select('id, name');
    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
  }, [supabase]);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from('categories').select('id, name');
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, [fetchProjects, fetchCategories]);

  useEffect(() => {
    const { urgency, difficulty, priority } = formData;
    const calculatedPoints = (parseInt(urgency) + parseInt(difficulty) + parseInt(priority)) * 10;
    setPoints(calculatedPoints);
  }, [formData.urgency, formData.difficulty, formData.priority]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInstructionsChange = (content: string) => {
    setFormData(prev => ({ ...prev, instructions: content }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, deadline: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, instructions, project_id, category_id, urgency, difficulty, priority, deadline } = formData;

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
        urgency: '5',
        difficulty: '5',
        priority: '5',
        deadline: null,
      });
      onTaskCreated();
    }
  };

  const CustomDatePickerInput = React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<'input'>
  >(({ value, onClick }, ref) => (
    <div className="relative">
      <input
        value={value as string}
        onClick={onClick}
        readOnly
        ref={ref}
        placeholder="Select Deadline"
        className="input-field w-full pl-10 bg-white bg-opacity-10 text-white cursor-pointer"
      />
      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
    </div>
  ));

  CustomDatePickerInput.displayName = 'CustomDatePickerInput';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-purple-800 bg-opacity-30 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">Task Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter task name"
          className="input-field w-full bg-white bg-opacity-10 text-white"
          required
        />
      </div>
      
      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-200 mb-1">Task Instructions</label>
        <div className="bg-white bg-opacity-10 rounded-md overflow-hidden">
          <ReactQuill
            theme="snow"
            value={formData.instructions}
            onChange={handleInstructionsChange}
            modules={{
              toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                ['link', 'image'],
                ['clean']
              ],
            }}
            className="bg-transparent text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="project_id" className="block text-sm font-medium text-gray-200 mb-1">Project</label>
          <select
            id="project_id"
            name="project_id"
            value={formData.project_id}
            onChange={handleChange}
            className="input-field w-full bg-white bg-opacity-10 text-white"
            required
          >
            <option value="">Select Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-200 mb-1">Category</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="input-field w-full bg-white bg-opacity-10 text-white"
            required
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="urgency" className="block text-sm font-medium text-gray-200 mb-1">Urgency</label>
          <div className="relative">
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="input-field w-full pl-10 bg-white bg-opacity-10 text-white"
            >
              {[1,2,3,4,5].map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            
          </div>
        </div>
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-200 mb-1">Difficulty</label>
          <div className="relative">
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="input-field w-full pl-10 bg-white bg-opacity-10 text-white"
            >
              {[1,2,3,4,5].map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-200 mb-1">Priority</label>
          <div className="relative">
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input-field w-full pl-10 bg-white bg-opacity-10 text-white"
            >
              {[1,2,3,4,5].map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-200 mb-1">Deadline</label>
        <DatePicker
          selected={formData.deadline}
          onChange={handleDateChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={30}
          timeCaption="time"
          dateFormat="MMMM d, yyyy h:mm aa"
          customInput={<CustomDatePickerInput />}
          portalId="root-portal"
          popperClassName="datepicker-popper"
          popperPlacement="bottom-start"
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold text-yellow-400">
          Points: {points}
        </div>
        <button type="submit" className="btn-primary px-6 py-2">
          Create Task
        </button>
      </div>
    </form>
  );
};

export default TaskForm;