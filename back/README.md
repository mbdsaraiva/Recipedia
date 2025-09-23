# 🔧 Recipedia Backend API

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

<br />

RESTful API built with Node.js, Express, and Prisma ORM for the Recipedia ingredient and recipe management system.

## 🛠️ Tech Stack

- **Node.js 18+** ⚡
- **Express.js** - Web framework 🌐
- **Prisma ORM** - Database ORM and migrations 🗃️
- **PostgreSQL** - Primary database 💾
- **CORS** - Cross-origin resource sharing 🔄
- **dotenv** - Environment configuration ⚙️

## 📁 Project Structure

```
backend/
├── 📂 src/
│   ├── 🎮 controllers/           # Request handlers
│   │   ├── userController.js
│   │   ├── ingredientController.js
│   │   ├── recipeController.js
│   │   └── stockController.js
│   ├── 🛣️ routes/               # Route definitions
│   │   ├── userRoutes.js
│   │   ├── ingredientRoutes.js
│   │   ├── recipeRoutes.js
│   │   └── stockRoutes.js
│   ├── 🔧 services/            # Business logic
│   └── ⚙️ config/              # Configuration files
│       └── database.js
├── 🗃️ prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── 🤖 generated/               # Prisma generated client
├── 🚀 server.js               # Application entry point
├── 📦 package.json
└── 🔐 .env                    # Environment variables
```

## 🗃️ Database Schema

### 📊 Tables
- **👤 User**: User management and authentication
- **🥕 Ingredient**: Available ingredients with units
- **📋 Recipe**: Recipe information and instructions
- **📦 UserIngredient**: User's ingredient inventory
- **🔗 RecipeIngredient**: Recipe-ingredient relationships

### 🔄 Key Relationships
- User → UserIngredient (1:N) 👤→📦
- User → Recipe (1:N, as author) 👤→📋
- Recipe → RecipeIngredient (1:N) 📋→🔗
- Ingredient → RecipeIngredient (1:N) 🥕→🔗
- Ingredient → UserIngredient (1:N) 🥕→📦

## 🚀 Installation & Setup

### 📋 Prerequisites
- Node.js 18 or higher ⚡
- PostgreSQL 14 or higher 💾
- npm or yarn 📦

### 🔐 Environment Variables
Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/recipedia"
PORT=3000
```

### 📥 Installation Steps

1. **Install dependencies** 📦
```bash
npm install
```

2. **Generate Prisma client** 🤖
```bash
npx prisma generate
```

3. **Run database migrations** 🗃️
```bash
npx prisma migrate dev --name init
```

4. **Start development server** 🚀
```bash
npm run dev
```

The API will be available at `http://localhost:3000` 🌐

## 🌐 API Endpoints

### 👤 Users
- `GET /api/users` - Get all users 📋
- `GET /api/users/:id` - Get user by ID 🔍
- `POST /api/users` - Create new user ➕
- `PUT /api/users/:id` - Update user ✏️
- `DELETE /api/users/:id` - Delete user ❌
- `GET /api/users/:id/recipes` - Get user's recipes 📝

### 🥕 Ingredients
- `GET /api/ingredients` - Get all ingredients 📋
- `GET /api/ingredients/:id` - Get ingredient by ID 🔍
- `POST /api/ingredients` - Create new ingredient ➕
- `PUT /api/ingredients/:id` - Update ingredient ✏️
- `DELETE /api/ingredients/:id` - Delete ingredient ❌
- `GET /api/ingredients/search?q=query` - Search ingredients 🔍
- `GET /api/ingredients/stats` - Get ingredient statistics 📊

### 📋 Recipes
- `GET /api/recipes` - Get all recipes 📄
- `GET /api/recipes/:id` - Get recipe by ID 🔍
- `POST /api/recipes` - Create new recipe ➕
- `PUT /api/recipes/:id` - Update recipe ✏️
- `DELETE /api/recipes/:id` - Delete recipe ❌
- `GET /api/recipes/category/:categoria` - Get recipes by category 🏷️
- `GET /api/recipes/can-make/:userId` - Get recipes user can make 🎯

### 📦 Stock Management
- `GET /api/stock/:userId` - Get user's stock 📋
- `POST /api/stock/:userId` - Add item to stock ➕
- `PUT /api/stock/:userId/:ingredientId` - Update stock item ✏️
- `DELETE /api/stock/:userId/:ingredientId` - Remove from stock ❌
- `PATCH /api/stock/:userId/:ingredientId/consume` - Consume ingredient 🍽️
- `GET /api/stock/:userId/expiring` - Get expiring items ⚠️

## 📝 Request/Response Examples

### 🍳 Create Recipe
```bash
POST /api/recipes
Content-Type: application/json

{
  "nome": "Scrambled Eggs",
  "instrucoes": "1. Beat eggs\n2. Cook in pan\n3. Serve hot",
  "categoria": "breakfast",
  "autorId": 1,
  "ingredientes": [
    {
      "ingredientId": 7,
      "quantidade": 3
    },
    {
      "ingredientId": 4,
      "quantidade": 2
    }
  ]
}
```

### 📦 Add to Stock
```bash
POST /api/stock/1
Content-Type: application/json

{
  "ingredientId": 1,
  "quantidade": 2.5,
  "validade": "2024-12-31"
}
```

## ⭐ Key Features

### 🧠 Smart Recipe Matching Algorithm
The `/api/recipes/can-make/:userId` endpoint implements an intelligent algorithm that:
1. Retrieves user's current stock 📦
2. Analyzes all available recipes 📋
3. Compares required ingredients with available stock ⚖️
4. Returns recipes where user has sufficient quantities ✅

### 📦 Stock Management with Expiration Tracking
- Automatic categorization by expiration status 📅
- Bulk operations for ingredient consumption 🔄
- Integration with recipe preparation 🍽️

### ✅ Comprehensive Validation
- Input validation for all endpoints 🔍
- Data integrity checks 🛡️
- Proper error handling and status codes ⚠️

## 🛠️ Development Commands

```bash
# Start development server 🚀
npm run dev

# Run database studio (GUI) 🖥️
npx prisma studio

# Reset database 🔄
npx prisma migrate reset

# Deploy migrations 🚀
npx prisma migrate deploy

# Generate Prisma client 🤖
npx prisma generate
```

## ⚠️ Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "status": 400,
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `200` - Success ✅
- `201` - Created 🆕
- `400` - Bad Request ❌
- `404` - Not Found 🔍
- `409` - Conflict ⚠️
- `500` - Internal Server Error 💥

## 🗃️ Database Migrations

Migrations are managed through Prisma and stored in `prisma/migrations/`. To create a new migration:

```bash
npx prisma migrate dev --name descriptive_name
```

## ⚡ Performance Considerations

- Database queries are optimized with appropriate indexes 📈
- Bulk operations for recipe ingredient management 🔄
- Efficient relationship loading with Prisma includes 🔗
- Connection pooling for database connections 🏊‍♂️

---

<div align="center">
  Built with ❤️ for efficient kitchen management
</div>