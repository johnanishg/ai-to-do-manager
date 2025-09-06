import React, { useState } from 'react';
import { Sparkles, Brain, Target } from 'lucide-react';
import { GeminiService, GeneratedTask } from '../services/geminiService';

interface AITaskGeneratorProps {
  onTasksGenerated: (tasks: GeneratedTask[]) => void;
}

const AITaskGenerator: React.FC<AITaskGeneratorProps> = ({ onTasksGenerated }) => {
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState('');
  
  const isApiKeyConfigured = !!import.meta.env.VITE_GEMINI_API_KEY;

  const generateTasks = async () => {
    if (!context.trim()) return;

    setIsGenerating(true);
    setError('');
    try {
      const tasks = await GeminiService.generateTasks(context);
      onTasksGenerated(tasks);
      setContext('');
      setIsExpanded(false);
    } catch (error: any) {
      console.error('Failed to generate tasks:', error);
      setError(error.message || 'Failed to generate tasks. Please check your API configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI Task Generator</h3>
            <p className="text-blue-100">Intelligent task creation with smart breakdowns</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              disabled={!isApiKeyConfigured}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 font-medium"
              title={!isApiKeyConfigured ? "Gemini API key not configured" : ""}
            >
              <Sparkles className="w-4 h-4" />
              Generate Tasks
            </button>
          )}
        </div>
      </div>


      {isExpanded && (
        <div className="space-y-4">
          {!isApiKeyConfigured && (
            <div className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-100 px-4 py-3 rounded-xl">
              <p className="text-sm">
                <strong>Gemini API key not configured.</strong> Add VITE_GEMINI_API_KEY to your .env file to use AI task generation.
              </p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-100 px-4 py-3 rounded-xl">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2 text-blue-100">
              What would you like to accomplish?
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
              placeholder="e.g., Prepare for a job interview, Plan a weekend trip, Organize my home office, Learn a new skill, Start a fitness routine..."
              rows={4}
            />
          </div>


          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsExpanded(false)}
              className="px-6 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={generateTasks}
              disabled={!context.trim() || isGenerating || !isApiKeyConfigured}
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Tasks
                </>
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Tips for Better Results
            </h4>
            <ul className="text-xs text-blue-100 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5 flex-shrink-0"></span>
                Be specific about your goals and context
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5 flex-shrink-0"></span>
                AI will create the right number of tasks automatically
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5 flex-shrink-0"></span>
                Simple requests get 1 task with detailed subtasks
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5 flex-shrink-0"></span>
                Complex projects get broken into multiple tasks
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITaskGenerator;