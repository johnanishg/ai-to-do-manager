import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, CheckSquare, Sparkles, LogOut, User, AlertTriangle, Clock } from 'lucide-react';
import { Task } from './types';
import { useTasks } from './hooks/useTasks';
import { useAuth } from './contexts/AuthContext';
import { useRealTimeDate, getDueDateStatus } from './hooks/useRealTimeDate';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import AITaskGenerator from './components/AITaskGenerator';
import TaskStats from './components/TaskStats';
import AuthPage from './components/AuthPage';

function App() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, toggleSubtask, loading } = useTasks();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const currentTime = useRealTimeDate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center animate-spin">
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication page if not logged in
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Get unique categories from tasks
  const categories = Array.from(new Set(tasks.map(task => task.category || '').filter(Boolean)));

  // Calculate real-time overdue and urgent tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const status = getDueDateStatus(task.dueDate, currentTime);
    return status.status === 'overdue';
  });

  const urgentTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const status = getDueDateStatus(task.dueDate, currentTime);
    return status.status === 'due-soon' || status.status === 'due-today';
  });

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    if (!task || !task.title) return false;
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesCompletion = showCompleted || !task.completed;

    return matchesSearch && matchesPriority && matchesCategory && matchesCompletion;
  });

  // Sort tasks by priority and completion status
  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = a.priority || 'medium';
    const bPriority = b.priority || 'medium';
    return priorityOrder[bPriority] - priorityOrder[aPriority];
  });

  const handleFormSubmit = async (taskData: Omit<Task, '_id' | 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id || editingTask.id || '', taskData);
      } else {
        await addTask(taskData);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleTasksGenerated = async (generatedTasks: any[]) => {
    if (!Array.isArray(generatedTasks)) {
      console.error('Invalid generated tasks format:', generatedTasks);
      return;
    }
    
    for (const taskData of generatedTasks) {
      if (taskData && taskData.title) {
        try {
          // Handle both new GeneratedTask format and legacy string format
          if (typeof taskData === 'string') {
            // Legacy format - just a string
            await addTask({
              title: taskData.trim(),
              description: '',
              priority: 'medium',
              category: 'AI Generated',
              completed: false,
            });
          } else {
            // New GeneratedTask format
            await addTask({
              title: taskData.title,
              description: taskData.description || '',
              priority: taskData.priority || 'medium',
              category: taskData.category || 'AI Generated',
              dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
              estimatedTime: taskData.estimatedTime,
              tags: taskData.tags || [],
              subtasks: taskData.subtasks ? taskData.subtasks.map((subtask: string) => ({
                id: crypto.randomUUID(),
                title: subtask,
                completed: false
              })) : [],
              notes: taskData.notes || '',
              completed: false,
            });
          }
        } catch (error) {
          console.error('Error creating AI generated task:', error);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                <CheckSquare className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI To-Do Manager
              </h1>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-5 h-5" />
                <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-lg">
            Organize your tasks with the power of artificial intelligence
          </p>
        </div>

        {/* AI Task Generator */}
        <div className="mb-8">
          <AITaskGenerator onTasksGenerated={handleTasksGenerated} />
        </div>

        {/* Stats */}
        <TaskStats tasks={tasks} />

        {/* Real-time Overdue/Urgent Tasks Alert */}
        {(overdueTasks.length > 0 || urgentTasks.length > 0) && (
          <div className="mb-8 space-y-3">
            {overdueTasks.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">
                    {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {overdueTasks.slice(0, 3).map(task => (
                    <button
                      key={task._id || task.id}
                      onClick={() => handleEdit(task)}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      {task.title}
                    </button>
                  ))}
                  {overdueTasks.length > 3 && (
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm">
                      +{overdueTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {urgentTasks.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">
                    {urgentTasks.length} Urgent Task{urgentTasks.length > 1 ? 's' : ''}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {urgentTasks.slice(0, 3).map(task => (
                    <button
                      key={task._id || task.id}
                      onClick={() => handleEdit(task)}
                      className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      {task.title}
                    </button>
                  ))}
                  {urgentTasks.length > 3 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-sm">
                      +{urgentTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                Show completed
              </label>

              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        {sortedTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onToggleSubtask={toggleSubtask}
                onEdit={handleEdit}
                onDelete={deleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="p-4 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CheckSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterPriority !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first task or use AI to generate some tasks'}
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Task
            </button>
          </div>
        )}

        {/* Task Form Modal */}
        <TaskForm
          task={editingTask}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          existingTasks={tasks}
        />
      </div>
    </div>
  );
}

export default App;