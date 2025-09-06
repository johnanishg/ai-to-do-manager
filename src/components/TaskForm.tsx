import React, { useState, useEffect } from 'react';
import { Task, Subtask } from '../types';
import { X, Save, Sparkles, Plus, Trash2, Calendar, Clock, Tag, FileText, CheckSquare, Brain, Zap } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

interface TaskFormProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, '_id' | 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  existingTasks: Task[];
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  isOpen,
  onClose,
  onSubmit,
  existingTasks,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: '',
    completed: false,
    dueDate: '',
    estimatedTime: '',
    tags: [] as string[],
    subtasks: [] as Subtask[],
    notes: '',
  });

  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [loadingImprovements, setLoadingImprovements] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
        completed: task.completed,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        estimatedTime: task.estimatedTime ? task.estimatedTime.toString() : '',
        tags: task.tags || [],
        subtasks: task.subtasks || [],
        notes: task.notes || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        completed: false,
        dueDate: '',
        estimatedTime: '',
        tags: [],
        subtasks: [],
        notes: '',
      });
    }
    setRecommendations([]);
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
    };
    onSubmit(submitData);
    onClose();
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag.trim()]
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addSubtask = () => {
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title: '',
      completed: false
    };
    setFormData({
      ...formData,
      subtasks: [...formData.subtasks, newSubtask]
    });
  };

  const updateSubtask = (id: string, updates: Partial<Subtask>) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.map(subtask =>
        subtask.id === id ? { ...subtask, ...updates } : subtask
      )
    });
  };

  const removeSubtask = (id: string) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter(subtask => subtask.id !== id)
    });
  };

  const getRecommendations = async () => {
    if (!formData.title.trim()) return;

    setLoadingRecommendations(true);
    try {
      const existingTaskTitles = existingTasks.map(t => t.title);
      const recs = await GeminiService.getTaskRecommendations(
        formData.title,
        existingTaskTitles
      );
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const generateSmartBreakdown = async () => {
    if (!formData.title.trim()) return;

    setLoadingBreakdown(true);
    try {
      const breakdown = await GeminiService.generateSmartTaskBreakdown(
        formData.title,
        formData.description || 'No additional context provided'
      );
      
      // Update form with AI suggestions
      setFormData(prev => ({
        ...prev,
        priority: breakdown.priority,
        category: breakdown.category,
        estimatedTime: breakdown.estimatedTime.toString(),
        tags: [...prev.tags, ...breakdown.tags.filter(tag => !prev.tags.includes(tag))],
        subtasks: [
          ...prev.subtasks,
          ...breakdown.subtasks.map(subtask => ({
            id: crypto.randomUUID(),
            title: subtask,
            completed: false
          }))
        ]
      }));
    } catch (error) {
      console.error('Failed to generate breakdown:', error);
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const suggestImprovements = async () => {
    if (!formData.title.trim()) return;

    setLoadingImprovements(true);
    try {
      const improvements = await GeminiService.suggestTaskImprovements(
        formData.title,
        formData.description || ''
      );
      
      // Update form with improved content
      setFormData(prev => ({
        ...prev,
        title: improvements.improvedTitle,
        description: improvements.improvedDescription
      }));
      
      // Show suggestions as recommendations
      setRecommendations(improvements.suggestions);
    } catch (error) {
      console.error('Failed to suggest improvements:', error);
    } finally {
      setLoadingImprovements(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter task title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Add task description..."
              />
            </div>
          </div>

          {/* Task Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Task Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Work, Personal, Shopping..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., 30, 60, 120..."
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </h3>
            
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add a tag..."]') as HTMLInputElement;
                    if (input) {
                      addTag(input.value);
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Subtasks
              </h3>
              <button
                type="button"
                onClick={addSubtask}
                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Subtask
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={(e) => updateSubtask(subtask.id, { completed: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) => updateSubtask(subtask.id, { title: e.target.value })}
                    placeholder="Enter subtask..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(subtask.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Additional Notes
            </h3>
            
            <div>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Add any additional notes or reminders..."
              />
            </div>
          </div>

          {formData.title && (
            <div className="border-t pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Enhancements
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={suggestImprovements}
                    disabled={loadingImprovements}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Zap className="w-4 h-4" />
                    {loadingImprovements ? 'Improving...' : 'Improve Task'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={generateSmartBreakdown}
                    disabled={loadingBreakdown}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Brain className="w-4 h-4" />
                    {loadingBreakdown ? 'Breaking Down...' : 'Smart Breakdown'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={getRecommendations}
                    disabled={loadingRecommendations}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    {loadingRecommendations ? 'Loading...' : 'Get Tips'}
                  </button>
                </div>
              </div>

              {recommendations.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">AI Suggestions:</h4>
                  <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;