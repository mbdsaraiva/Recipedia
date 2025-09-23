# 💻 Recipedia Frontend

<div align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/Axios-671ddf?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
</div>

<br />

Modern React application for ingredient inventory management and recipe discovery. Built with Vite for fast development and optimized performance.

## 🛠️ Tech Stack

- **React 18** - UI library with modern hooks ⚛️
- **Vite** - Fast build tool and dev server ⚡
- **React Router DOM** - Client-side routing 🛣️
- **Axios** - HTTP client for API communication 🌐
- **CSS3** - Custom styling with modern features 🎨
- **Date-fns** - Date manipulation utilities 📅

## 📁 Project Structure

```
frontend/
├── 📂 src/
│   ├── 🧩 components/          # Reusable UI components
│   │   └── Header.jsx      # Navigation header
│   ├── 📄 pages/              # Main application pages
│   │   ├── Dashboard.jsx   # Home dashboard 📊
│   │   ├── MyStock.jsx     # Inventory management 📦
│   │   ├── Recipes.jsx     # Recipe management 📋
│   │   └── CanMake.jsx     # Smart recipe suggestions 🎯
│   ├── 🌐 services/           # API communication layer
│   │   └── api.js         # Axios configuration and services
│   ├── 🎣 hooks/             # Custom React hooks (if any)
│   ├── 🔧 utils/             # Utility functions
│   ├── 🏠 App.jsx            # Main application component
│   ├── 🚀 main.jsx           # Application entry point
│   └── 🎨 index.css          # Global styles
├── 📂 public/                # Static assets
├── 📝 index.html            # HTML template
├── 📦 package.json
└── ⚙️ vite.config.js        # Vite configuration
```

## ✨ Features

### 📊 Dashboard
- Real-time statistics overview 📈
- Expiration alerts for ingredients ⚠️
- Smart recipe suggestions based on current stock 💡
- Quick actions and navigation 🚀

### 📦 Inventory Management
- Add, edit, and remove ingredients from stock ➕✏️❌
- Track quantities and expiration dates 📅
- Visual status indicators (fresh, expiring, expired) 🟢🟡🔴
- Smart filtering and search capabilities 🔍

### 📋 Recipe Management
- Browse all available recipes 📚
- Create new recipes with multiple ingredients 🍳
- Filter by category, author, or search terms 🏷️
- Detailed recipe view with ingredients and instructions 📝

### 🎯 Smart Recipe Suggestions
- Intelligent algorithm showing recipes you can make 🧠
- "Almost can make" feature for recipes missing few ingredients 📝
- Shopping list generation for incomplete recipes 🛒
- One-click recipe preparation with automatic ingredient consumption 🍽️

## 🚀 Installation & Setup

### 📋 Prerequisites
- Node.js 18 or higher ⚡
- npm or yarn 📦
- Backend API running on port 3000 🔧

### 📥 Installation Steps

1. **Install dependencies** 📦
```bash
npm install
```

2. **Configure API endpoint** 🌐
Update `src/services/api.js` if your backend runs on a different port:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000', // Update if needed
  timeout: 10000,
});
```

3. **Start development server** 🚀
```bash
npm run dev
```

The application will be available at `http://localhost:5173` 🌐

## 📜 Available Scripts

```bash
# Start development server 🚀
npm run dev

# Build for production 🏗️
npm run build

# Preview production build 👁️
npm run preview

# Lint code 🔍
npm run lint
```

## 🔗 API Integration

The frontend communicates with the backend through organized service modules:

### 🌐 API Services
- **👤 userService**: User management operations
- **🥕 ingredientService**: Ingredient CRUD operations
- **📋 recipeService**: Recipe management and smart suggestions
- **📦 stockService**: Inventory management with expiration tracking

### 💡 Example API Usage
```javascript
import { stockService } from '../services/api';

// Add item to stock 📦
await stockService.addToStock(userId, {
  ingredientId: 1,
  quantidade: 2.5,
  validade: '2024-12-31'
});

// Get recipes user can make 🎯
const canMakeRecipes = await recipeService.getCanMake(userId);
```

## 🏗️ Component Architecture

### 📄 Page Components
Each page is a self-contained component with:
- Local state management using useState 🎛️
- Side effects with useEffect 🔄
- API integration 🌐
- Error handling and loading states ⚠️

### 🧩 Component Features
- **📱 Responsive Design**: Mobile-first approach
- **⏳ Loading States**: Smooth user experience during API calls
- **⚠️ Error Handling**: User-friendly error messages
- **🔄 Real-time Updates**: Automatic data refresh after operations

## 🎛️ State Management

The application uses React's built-in state management:
- **useState** for local component state 📊
- **useEffect** for side effects and data fetching 🔄
- **Props** for parent-child component communication 👨‍👩‍👧‍👦
- **Event handlers** for user interactions 🖱️

### 🔑 Key State Patterns
```javascript
// Loading and error states ⏳⚠️
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Data states 📊
const [recipes, setRecipes] = useState([]);
const [stockData, setStockData] = useState(null);

// UI states 🖥️
const [showModal, setShowModal] = useState(false);
const [filter, setFilter] = useState('all');
```

## 🎨 Styling and Design

### 🏗️ CSS Architecture
- **Global styles** in `index.css` 🌐
- **Component-specific styles** using inline styles 🎯
- **Utility classes** for common patterns 🔧
- **Responsive design** with CSS Grid and Flexbox 📱

### ✨ Design Features
- **Modern gradient header** with purple theme 💜
- **Card-based layouts** for content organization 📇
- **Interactive hover effects** for better UX 🖱️
- **Status indicators** with color coding 🟢🟡🔴
- **Modal overlays** for detailed views 🪟

### 🎨 Color Palette
- Primary: Purple gradient (#667eea to #764ba2) 💜
- Success: Green (#10b981) 🟢
- Warning: Orange (#f59e0b) 🟡
- Danger: Red (#ef4444) 🔴
- Neutral: Gray shades ⚪

## 👤 User Experience Features

### 🎯 Smart Interactions
- **One-click recipe preparation** with confirmation dialogs 🍽️
- **Real-time filtering** without page reloads 🔍
- **Contextual actions** based on data state 🎯
- **Visual feedback** for all user actions ✅

### 📱 Responsive Features
- **Mobile-optimized** layouts 📱
- **Touch-friendly** buttons and interactions 👆
- **Adaptive grid** systems 📐
- **Flexible typography** scaling 📝

### ♿ Accessibility
- **Semantic HTML** structure 📄
- **Keyboard navigation** support ⌨️
- **Screen reader** friendly 📢
- **High contrast** ratios for readability 👁️

## ⚡ Performance Optimizations

### 🔧 Development Optimizations
- **Vite** for fast hot module replacement ⚡
- **Code splitting** for smaller bundle sizes 📦
- **Lazy loading** for non-critical components 💤
- **Efficient re-renders** with proper dependencies 🔄

### 🏃‍♂️ Runtime Optimizations
- **Debounced search** to reduce API calls 🔍
- **Optimistic updates** for better perceived performance ⚡
- **Error boundaries** for graceful error handling 🛡️
- **Memoization** for expensive calculations 🧠

## 🏗️ Build and Deployment

### 📦 Production Build
```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### 🚀 Deployment Options
- **Vercel**: Automatic deployments from Git 🔄
- **Netlify**: Static site hosting with CI/CD ⚡
- **GitHub Pages**: Free hosting for static sites 🆓
- **Traditional hosting**: Any web server serving static files 🌐

### 🔐 Environment Variables
For production deployments, configure:
- `VITE_API_URL`: Backend API URL 🌐
- `VITE_APP_NAME`: Application name 🏷️

## 🌐 Browser Support

- **Chrome** 90+ 🟢
- **Firefox** 88+ 🟠
- **Safari** 14+ 🔵
- **Edge** 90+ 🔷

## 📋 Development Guidelines

### 📝 Code Style
- Use functional components with hooks ⚛️
- Implement proper error boundaries 🛡️
- Follow consistent naming conventions 📛
- Add comments for complex logic 💭

### 🎛️ State Management
- Keep state as local as possible 🏠
- Use controlled components for forms 📋
- Implement proper loading states ⏳
- Handle edge cases gracefully 🤝

### 🌐 API Integration
- Implement proper error handling ⚠️
- Use loading states for better UX ⏳
- Validate data before sending requests ✅
- Handle network failures gracefully 🔄

---
