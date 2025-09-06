const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GeneratedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  estimatedTime?: number;
  tags: string[];
  subtasks: string[];
}

export class GeminiService {
  static async generateTasks(context: string): Promise<GeneratedTask[]> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // Get current date for relative due date calculation
      const currentDate = new Date();
      const todayStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      const tomorrowStr = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const prompt = `You are an expert productivity coach and task management specialist. Based on this request: "${context}", intelligently create the appropriate number of tasks.

IMPORTANT: Today's date is ${todayStr}. Set due dates relative to TODAY, not any fixed date.

TASK CREATION GUIDELINES:
- If the request is simple/specific (e.g., "call dentist", "buy groceries"): Create 1 main task with detailed subtasks
- If the request is a project (e.g., "plan wedding", "learn Python"): Create 2-4 related tasks that break down the project
- If the request mentions multiple things (e.g., "organize home and start exercising"): Create separate tasks for each area
- Always include comprehensive subtasks to make each task actionable

For each task, provide:
1. A clear, specific title (2-8 words)
2. A detailed description (1-2 sentences explaining what needs to be done)
3. Priority level (low/medium/high based on urgency and importance)
4. Category (Work, Personal, Health, Learning, Finance, Home, etc.)
5. Due date (YYYY-MM-DD format) - IMPORTANT: Only create FUTURE tasks, never overdue ones:
   - High priority urgent tasks: Tomorrow (${tomorrowStr}) or day after tomorrow
   - Medium priority tasks: Within 3-7 days from today (starting from day after tomorrow)
   - Low priority tasks: Within 1-3 weeks from today (starting from 1 week out)
   - NEVER set due dates for today (${todayStr}) or any past dates
   - ALL tasks must have future due dates to ensure they remain actionable
6. Estimated time in minutes (realistic estimate)
7. 2-3 relevant tags (single words or short phrases)
8. 3-6 detailed subtasks (specific actionable steps that make the task easy to complete)

Format your response as a JSON array where each task is an object with these exact fields:
{
  "title": "Task title",
  "description": "Detailed description",
  "priority": "low|medium|high",
  "category": "Category name",
  "dueDate": "YYYY-MM-DD",
  "estimatedTime": number,
  "tags": ["tag1", "tag2", "tag3"],
  "subtasks": ["subtask1", "subtask2", "subtask3", "subtask4"]
}

Be intelligent about the number of tasks - create what makes sense for the request, not a fixed number. Focus on making tasks actionable with comprehensive subtasks.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to generate tasks: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        // Try to parse as JSON first
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const tasks = JSON.parse(jsonMatch[0]);
          // Post-process to ensure dates are relative to today
          const processedTasks = tasks.map((task: any, index: number) => {
            // Validate and fix due dates to ensure they are always in the future
            if (task.dueDate) {
              const taskDate = new Date(task.dueDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
              const diffDays = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              
              // If the date is today, past, or unrealistically far in the future, regenerate it
              if (diffDays <= 0 || diffDays > 365) {
                const newDate = new Date();
                const priority = task.priority || 'medium';
                
                if (priority === 'high') {
                  // High priority: tomorrow or day after tomorrow
                  newDate.setDate(newDate.getDate() + 1 + (index % 2));
                } else if (priority === 'medium') {
                  // Medium priority: 3-7 days from today
                  newDate.setDate(newDate.getDate() + 3 + (index % 5));
                } else {
                  // Low priority: 7-21 days from today
                  newDate.setDate(newDate.getDate() + 7 + (index % 15));
                }
                
                task.dueDate = newDate.toISOString().split('T')[0];
              }
            } else {
              // If no due date provided, generate a future one
              const newDate = new Date();
              const priority = task.priority || 'medium';
              
              if (priority === 'high') {
                newDate.setDate(newDate.getDate() + 1 + (index % 2)); // tomorrow or day after
              } else if (priority === 'medium') {
                newDate.setDate(newDate.getDate() + 3 + (index % 5)); // 3-7 days
              } else {
                newDate.setDate(newDate.getDate() + 7 + (index % 15)); // 1-3 weeks
              }
              
              task.dueDate = newDate.toISOString().split('T')[0];
            }
            return task;
          });
          
          // Final safety check: ensure no tasks are overdue
          const finalTasks = processedTasks.filter((task: any) => {
            if (task.dueDate) {
              const taskDate = new Date(task.dueDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return taskDate.getTime() > today.getTime(); // Only future tasks
            }
            return true; // Keep tasks without due dates
          });
          
          return finalTasks;
        }
        
        // Fallback to simple text parsing
        return this.parseSimpleTasks(text, context);
      } catch (parseError) {
        console.warn('Failed to parse JSON, falling back to simple parsing:', parseError);
        return this.parseSimpleTasks(text, context);
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
      throw error;
    }
  }

  private static parseSimpleTasks(text: string, context: string): GeneratedTask[] {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\./));

    // Intelligently determine how many tasks to create based on context
    const isSimpleTask = context.length < 50 && !context.includes(' and ') && !context.includes(',');
    const maxTasks = isSimpleTask ? 1 : Math.min(lines.length, 4);
    const selectedLines = lines.slice(0, maxTasks);

    const generatedTasks = selectedLines.map((line, index) => {
      const priority = index < 2 ? 'high' : index < 4 ? 'medium' : 'low' as 'low' | 'medium' | 'high';
      
      // Generate realistic FUTURE due date based on priority (never today or past)
      const dueDate = new Date();
      if (priority === 'high') {
        // High priority: tomorrow or day after tomorrow (never today)
        dueDate.setDate(dueDate.getDate() + 1 + (index % 2));
      } else if (priority === 'medium') {
        // Medium priority: 3-7 days from now
        dueDate.setDate(dueDate.getDate() + 3 + (index % 5));
      } else {
        // Low priority: 7-21 days from now
        dueDate.setDate(dueDate.getDate() + 7 + (index % 15));
      }
      
      return {
        title: line,
        description: `AI-generated task based on your request`,
        priority,
        category: 'AI Generated',
        dueDate: dueDate.toISOString().split('T')[0], // YYYY-MM-DD format
        estimatedTime: 30,
        tags: ['ai-generated'],
        subtasks: []
      };
    });

    // Final safety check: ensure no overdue tasks in fallback mode
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return generatedTasks.filter((task: GeneratedTask) => {
      if (!task.dueDate) return true; // Keep tasks without due dates
      const taskDate = new Date(task.dueDate);
      return taskDate.getTime() > today.getTime(); // Only future tasks
    });
  }

  static async getTaskRecommendations(taskTitle: string, existingTasks: string[]): Promise<string[]> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const prompt = `You are a productivity expert. Given this task: "${taskTitle}" and these existing tasks: ${existingTasks.join(', ')}.
      
      Provide 3 specific, actionable recommendations to improve productivity or task completion for this task.
      Consider:
      - Breaking down complex tasks
      - Time management strategies
      - Resource requirements
      - Potential obstacles and solutions
      - Integration with existing tasks
      
      Each recommendation should be practical and immediately actionable.
      Return only the recommendations as a simple list, each on a new line.
      Do not include numbering or bullet points.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.6,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 512,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get recommendations: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return text.split('\n')
        .map((rec: string) => rec.trim())
        .filter((rec: string) => rec.length > 0)
        .slice(0, 3);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  static async generateSmartTaskBreakdown(taskTitle: string, context: string): Promise<{
    subtasks: string[];
    estimatedTime: number;
    priority: 'low' | 'medium' | 'high';
    category: string;
    tags: string[];
  }> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const prompt = `You are a project management expert. Break down this task into actionable subtasks: "${taskTitle}"

Context: ${context}

Provide a JSON response with:
{
  "subtasks": ["specific step 1", "specific step 2", "specific step 3", "specific step 4"],
  "estimatedTime": total_minutes,
  "priority": "low|medium|high",
  "category": "appropriate category",
  "tags": ["tag1", "tag2", "tag3"]
}

Make subtasks specific, actionable, and in logical order. Estimate realistic time requirements.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.5,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to generate task breakdown: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Failed to parse task breakdown JSON:', parseError);
      }

      // Fallback response
      return {
        subtasks: [`Break down: ${taskTitle}`],
        estimatedTime: 60,
        priority: 'medium',
        category: 'General',
        tags: ['breakdown']
      };
    } catch (error) {
      console.error('Error generating task breakdown:', error);
      throw error;
    }
  }

  static async suggestTaskImprovements(taskTitle: string, description: string): Promise<{
    improvedTitle: string;
    improvedDescription: string;
    suggestions: string[];
  }> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const prompt = `You are a task optimization expert. Review and improve this task:

Title: "${taskTitle}"
Description: "${description}"

Provide a JSON response with:
{
  "improvedTitle": "more specific and actionable title",
  "improvedDescription": "enhanced description with clear objectives",
  "suggestions": ["improvement 1", "improvement 2", "improvement 3"]
}

Focus on making the task more specific, measurable, and actionable.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.6,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to suggest improvements: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Failed to parse improvements JSON:', parseError);
      }

      // Fallback response
      return {
        improvedTitle: taskTitle,
        improvedDescription: description,
        suggestions: ['Consider adding specific deadlines', 'Break into smaller steps', 'Define success criteria']
      };
    } catch (error) {
      console.error('Error suggesting improvements:', error);
      throw error;
    }
  }
}