# AI To-Do Manager

A comprehensive full-stack task management application with intelligent AI-powered task generation, built with React, TypeScript, Express.js, and MongoDB. This application combines traditional task management functionality with the power of Google's Gemini API to help users create well-structured, actionable tasks with real-time due date tracking and interactive subtask management.

## ✨ Features

### 🔐 Authentication & Security
- User registration and login system
- JWT-based authentication
- Secure password hashing with bcryptjs
- Protected API routes with authentication middleware

### 📝 Advanced Task Management
- Create, edit, delete, and organize tasks
- **Interactive subtasks** with clickable checkboxes
- **Real-time due date tracking** with automatic status updates
- Priority levels (low, medium, high) with visual indicators
- Categories for better organization
- Tags system for flexible labeling
- Estimated time tracking in minutes
- Notes field for additional context
- Task completion status with visual feedback

### 🤖 Intelligent AI Task Generation
- **Context-aware task creation** using Google Gemini API
- **Smart task quantity** - AI decides optimal number of tasks
- **Future-only due dates** - never creates overdue tasks
- **Comprehensive subtasks** (3-6 detailed actionable steps)
- **Priority-based scheduling** with realistic timeframes
- **Rich task details** including descriptions, categories, tags, and time estimates
- **Project breakdown** - complex requests split into multiple related tasks

### ⏰ Real-Time Features
- **Live due date status** with automatic updates every minute
- **Smart alerts** for overdue and urgent tasks
- **Color-coded urgency** levels (red for overdue, orange for urgent, etc.)
- **Time-remaining calculations** (due soon, due today, due tomorrow, X days left)
- **Interactive dashboard** with clickable overdue/urgent task alerts

### 📊 Analytics & Insights
- Task statistics and progress tracking
- Visual completion rates
- Priority distribution analytics
- Category-based organization metrics

### 🔍 Search & Filter
- Real-time search functionality
- Filter by priority levels
- Filter by categories
- Show/hide completed tasks
- Advanced sorting options

### 🎨 Modern UI/UX
- **Responsive design** with Tailwind CSS
- **Professional styling** with consistent color schemes
- **Interactive elements** with hover effects and transitions
- **Mobile-optimized** touch-friendly interfaces
- **Real-time visual feedback** for all user actions
- **Error boundaries** for graceful error handling

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for lightning-fast build tooling
- **Tailwind CSS** for utility-first styling
- **Lucide React** for beautiful icons
- **Axios** for HTTP client with interceptors
- **Custom React Hooks** for state management
- **Context API** for global state

### Backend
- **Express.js** RESTful API
- **MongoDB** with Mongoose ODM
- **JWT** authentication system
- **bcryptjs** for password security
- **CORS** enabled for cross-origin requests
- **Environment-based configuration**

### AI Integration
- **Google Gemini API** (gemini-1.5-flash model)
- **Intelligent prompt engineering**
- **Structured JSON responses**
- **Error handling and fallbacks**

## 📋 Prerequisites

Before running this application, ensure you have:

1. **Node.js** (v16 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **Google Gemini API Key** (for AI task generation)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-to-do-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/to-do-manager
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   VITE_GEMINI_API_KEY=your-gemini-api-key-here
   ```

   **Important Configuration Notes:**
   - Replace `your-super-secret-jwt-key-change-this-in-production` with a strong, random secret key
   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - For MongoDB Atlas, replace the URI with your connection string
   - Database name will be automatically set to `to-do-manager`

4. **Start MongoDB**
   
   **Local MongoDB:**
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   ```

   **MongoDB Atlas:**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string and update the `MONGODB_URI` in your `.env` file

## ▶️ Running the Application

1. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the frontend (Vite) and backend (Express) servers concurrently:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5000

2. **Access the application**
   
   Open your browser and navigate to **http://localhost:5173**

## 📁 Project Structure

```
ai-to-do-manager/
├── server/
│   └── index.js                    # Express server and API routes
├── src/
│   ├── components/                 # React components
│   │   ├── AITaskGenerator.tsx     # Intelligent AI task generation
│   │   ├── AuthPage.tsx           # Authentication page
│   │   ├── ErrorBoundary.tsx      # Error handling component
│   │   ├── LoginForm.tsx          # Login form
│   │   ├── RegisterForm.tsx       # Registration form
│   │   ├── TaskCard.tsx           # Interactive task display with subtasks
│   │   ├── TaskForm.tsx           # Enhanced task creation/editing
│   │   └── TaskStats.tsx          # Analytics and statistics
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication state management
│   ├── hooks/
│   │   ├── useTasks.ts            # Task management with subtask support
│   │   └── useRealTimeDate.ts     # Real-time date calculations
│   ├── services/
│   │   ├── api.ts                 # API service with interceptors
│   │   └── geminiService.ts       # Enhanced Gemini AI integration
│   ├── types/
│   │   └── index.ts               # Complete TypeScript definitions
│   ├── App.tsx                    # Main application with real-time features
│   ├── main.tsx                   # Application entry point with providers
│   └── index.css                  # Global styles
├── .env.example                   # Environment variables template
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## 📜 Available Scripts

- `npm run dev` - Start both frontend and backend servers concurrently
- `npm run client` - Start the Vite development server only
- `npm run server` - Start the Express backend server only
- `npm run build` - Build the frontend for production
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview the production build

## 🤖 AI Task Generation Features

The application uses Google's Gemini API with advanced prompt engineering to generate comprehensive, well-structured tasks:

### Intelligent Task Creation
- **Context-aware analysis** - understands simple vs complex requests
- **Smart quantity decisions** - creates 1 task for simple requests, multiple for projects
- **Future-only scheduling** - never creates overdue tasks
- **Priority-based due dates**:
  - High priority: Tomorrow or day after tomorrow
  - Medium priority: 3-7 days from today
  - Low priority: 1-3 weeks from today

### Rich Task Details
Each generated task includes:
- **Clear, specific title** (2-8 words)
- **Detailed description** (1-2 sentences)
- **Smart priority level** (low/medium/high)
- **Appropriate category** (Work, Personal, Health, Learning, etc.)
- **Realistic due date** (always in the future)
- **Estimated time** in minutes
- **Relevant tags** (2-3 contextual tags)
- **Comprehensive subtasks** (3-6 specific actionable steps)

### Example AI Behaviors
- **Simple request**: "Call dentist" → 1 task with detailed subtasks
- **Project request**: "Learn Python" → 3-4 related tasks covering setup, learning, practice
- **Multiple areas**: "Exercise and organize home" → 2 separate focused tasks

## ⏰ Real-Time Due Date System

### Live Status Updates
- **Automatic refresh** every minute
- **Dynamic status calculation**:
  - 🔴 **Overdue** - Tasks past their due date
  - 🔴 **Due soon** - Tasks due within 2 hours
  - 🟠 **Due today** - Tasks due today (more than 2 hours)
  - 🟡 **Due tomorrow** - Tasks due tomorrow
  - 🔵 **X days left** - Tasks due within a week
  - ⚪ **Future** - Tasks due later

### Smart Dashboard Alerts
- **Overdue tasks banner** - Red alert with clickable task buttons
- **Urgent tasks banner** - Orange alert for tasks due soon/today
- **Interactive alerts** - Click to quickly edit overdue/urgent tasks
- **Real-time updates** - Alerts appear/disappear as deadlines change

## ✅ Interactive Subtask Management

### Clickable Checkboxes
- **Visual feedback** - Green checkmarks for completed subtasks
- **Strikethrough text** for completed items
- **Hover effects** for better user experience
- **Instant updates** - Changes reflect immediately

### MongoDB Integration
- **Persistent storage** - All subtask states saved to database
- **Real-time sync** - Changes update across all components
- **Secure API** - Authentication required for all operations

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion
- `PATCH /api/tasks/:taskId/subtasks/:subtaskId/toggle` - Toggle subtask completion

### Health Check
- `GET /api/health` - Server health status

## 💾 Enhanced Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed with bcryptjs),
  name: String,
  createdAt: Date
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to Users),
  title: String,
  description: String,
  completed: Boolean,
  priority: String (low|medium|high),
  category: String,
  dueDate: Date,                    // Real-time due date tracking
  estimatedTime: Number,            // Time in minutes
  tags: [String],                   // Flexible tagging system
  subtasks: [{                      // Interactive subtasks
    id: String,
    title: String,
    completed: Boolean
  }],
  notes: String,                    // Additional context
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **Password hashing** with bcryptjs (salt rounds: 10)
- **JWT tokens** for stateless authentication
- **Protected API routes** with authentication middleware
- **CORS configuration** for secure cross-origin requests
- **Input validation** and sanitization
- **User isolation** - users can only access their own data
- **Token expiration** handling with automatic logout

## 🚨 Error Handling & Reliability

### Frontend Error Handling
- **Error boundaries** for React component errors
- **API interceptors** for authentication errors
- **Graceful fallbacks** for AI service unavailability
- **Form validation** with user-friendly messages
- **Loading states** and progress indicators

### Backend Error Handling
- **Try-catch blocks** for all async operations
- **Detailed error logging** for debugging
- **HTTP status codes** for proper client communication
- **Database connection error handling**
- **Validation middleware** for request data

## 📱 Responsive Design

### Mobile-Optimized
- **Touch-friendly** button sizes and tap targets
- **Responsive grid** layouts for all screen sizes
- **Mobile-first** CSS approach with Tailwind
- **Swipe-friendly** interfaces
- **Optimized typography** for mobile reading

### Desktop Enhanced
- **Hover effects** and transitions
- **Keyboard navigation** support
- **Multi-column layouts** for larger screens
- **Advanced interactions** with mouse/trackpad

## 🎯 Usage Guide

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Explore the AI Task Generator** - describe what you want to accomplish
3. **Create tasks manually** using the enhanced task form
4. **Interact with subtasks** by clicking checkboxes to mark them complete
5. **Monitor due dates** with real-time status updates
6. **Organize tasks** with priorities, categories, and tags
7. **Track progress** with built-in analytics
8. **Search and filter** tasks as needed

### AI Task Generation Tips
- **Be specific** about your goals and context
- **Simple requests** get 1 comprehensive task with detailed subtasks
- **Complex projects** get broken into multiple related tasks
- **Multiple areas** mentioned get separate focused tasks
- **AI automatically** determines the right number of tasks

### Real-Time Features Usage
- **Watch due dates** update automatically as time passes
- **Click overdue alerts** to quickly address urgent tasks
- **Use color coding** to prioritize your work
- **Check subtasks** to track detailed progress

## 🛠 Development

### Development Workflow
```bash
# Start development servers
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

### Code Quality
- **TypeScript** for type safety throughout
- **ESLint** for code quality and consistency
- **Custom hooks** for reusable logic
- **Component composition** for maintainability
- **Error boundaries** for fault tolerance

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB service is running
   - Check connection string in `.env`
   - Verify network access for MongoDB Atlas
   - Check firewall settings

2. **Authentication Issues**
   - Verify JWT_SECRET is set in `.env`
   - Check token expiration and refresh
   - Clear browser localStorage if needed

3. **AI Task Generation Not Working**
   - Verify VITE_GEMINI_API_KEY is set correctly
   - Check API key permissions in Google AI Studio
   - Ensure API key has sufficient quota
   - Check browser console for error messages

4. **Real-Time Features Not Updating**
   - Check browser console for JavaScript errors
   - Verify component mounting and unmounting
   - Check network connectivity
   - Clear browser cache if needed

5. **Subtask Checkboxes Not Working**
   - Verify authentication token is valid
   - Check network requests in browser dev tools
   - Ensure task has valid _id field
   - Check MongoDB connection

6. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes: `npx kill-port 5000`
   - Use different ports for development

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add proper error handling
- Include responsive design considerations
- Test on multiple browsers and devices
- Update documentation for new features

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent task generation
- **MongoDB** for robust data storage
- **React Team** for the amazing frontend framework
- **Tailwind CSS** for beautiful, responsive styling
- **Open Source Community** for the incredible tools and libraries

---

**Built with ❤️ for productive task management and AI-powered productivity**