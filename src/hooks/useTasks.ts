import { useState, useEffect } from 'react';
import { Task } from '../types';
import { tasksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load tasks from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [isAuthenticated]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const fetchedTasks = await tasksAPI.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: Omit<Task, '_id' | 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = await tasksAPI.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await tasksAPI.updateTask(id, updates);
      setTasks(prev =>
        prev.map(task =>
          (task._id === id || task.id === id) ? updatedTask : task
        )
      );
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await tasksAPI.deleteTask(id);
      setTasks(prev => prev.filter(task => task._id !== id && task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const updatedTask = await tasksAPI.toggleTask(id);
      setTasks(prev =>
        prev.map(task =>
          (task._id === id || task.id === id) ? updatedTask : task
        )
      );
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const updatedTask = await tasksAPI.toggleSubtask(taskId, subtaskId);
      setTasks(prev =>
        prev.map(task =>
          (task._id === taskId || task.id === taskId) ? updatedTask : task
        )
      );
    } catch (error) {
      console.error('Error toggling subtask:', error);
      throw error;
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    toggleSubtask,
    refreshTasks: loadTasks,
  };
};