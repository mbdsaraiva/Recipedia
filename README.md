# 🍳 Recipedia - Recipe & Ingredient Management System

<div align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
</div>

<br />

A full-stack web application for intelligent management of kitchen ingredients and culinary recipes. Built with modern technologies to help users track their ingredients, monitor expiration dates, and discover which recipes they can make with their current stock.

## ✨ Features

- 📦 **Smart Inventory Management**: Track ingredients with quantities and expiration dates
- 📋 **Recipe Management**: Create, view, and organize culinary recipes
- 🧠 **Intelligent Recipe Suggestions**: Algorithm calculates which recipes you can make based on current stock
- ⚠️ **Expiration Alerts**: Notifications for expired or soon-to-expire ingredients
- 🍽️ **Automatic Consumption**: "Make Recipe" feature automatically consumes ingredients from stock
- 📊 **Analytics Dashboard**: Overview with statistics and system insights

## 🛠️ Tech Stack

### Backend 🔧
- **Node.js** with Express.js
- **PostgreSQL** database
- **Prisma ORM** for database management
- RESTful API

### Frontend 💻
- **React 18** with modern hooks
- **Vite** for fast development
- **React Router** for navigation
- **Axios** for API communication
- Responsive CSS design

### Database 🗃️
- 5 related tables: Users, Ingredients, Recipes, UserIngredient, RecipeIngredient
- Complex many-to-many relationships
- Referential integrity and constraints

## 🚀 Quick Start

### Prerequisites 📋
```
- Node.js 18+
- PostgreSQL 14+
- npm or yarn
```

### Installation 📥

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/recipedia.git
cd recipedia
```

2. **Setup Backend** 🔧
```bash
cd back
npm install
cp .env.example .env
# Configure your database URL in .env
npx prisma migrate dev
npm run dev
```

3. **Setup Frontend** 💻
```bash
cd front
npm install
npm run dev
```

4. **Access the application** 🌐
- Frontend: localhost 5173
- Backend API: localhost 3000

## 🎯 Key Features Demonstration

### 🔍 Smart Recipe Matching
The system analyzes your ingredient stock and automatically suggests recipes you can prepare, taking into account quantities and freshness.

### 📈 Inventory Intelligence
- 🔄 Real-time stock tracking
- ⏰ Expiration date monitoring
- 📉 Smart consumption tracking
- 🚨 Low-stock alerts

### 👨‍🍳 Recipe Management
- ➕ Create recipes with multiple ingredients
- 🏷️ Categorize by meal type
- 👥 Share recipes between users
- 🧮 Calculate ingredient requirements

## 🌐 API Endpoints

- `GET/POST /api/users` - 👤 User management
- `GET/POST/PUT/DELETE /api/ingredients` - 🥕 Ingredient CRUD
- `GET/POST/PUT/DELETE /api/recipes` - 📝 Recipe management
- `GET/POST/PUT/DELETE /api/stock/:userId` - 📦 Stock management
- `GET /api/recipes/can-make/:userId` - 🎯 Smart recipe suggestions

## 🙏 Acknowledgments

- Built as a learning project to demonstrate full-stack development skills 🎓
- Inspired by the need for better kitchen inventory management 🏠
- Uses modern web development practices and patterns ⚡

---

<div align="center">
  Made with ❤️ for better kitchen management
</div>


