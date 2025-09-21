const express = require('express');
const cors = require('cors');
require('dotenv').config();


const {connectDatabase, disconnectDatabase} = require('./src/config/database');

const userRoutes = require('./src/routes/userRoutes');
const ingredientRoutes = require('./src/routes/ingredientRoutes');
const recipeRoutes = require('./src/routes/recipeRoutes');
const stockRoutes = require('./src/routes/stockRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));
app.use(express.json());

app.use((req,res,next)=> {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
})

app.get('/', (req,res)=> {
    res.json({
        message: 'Api rodando',
        timestamp: new Date().toISOString(),
        endpoints: {
            users: '/api/users',
            ingredients: '/api/ingredients',
            recipes: '/api/recipes',
            stock: '/api/stock'
        }
    });
});

app.use('/api/users', userRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/stock', stockRoutes);

// caso a rota nao seja encontrada
app.use(/.*/, (req,res)=> {
  res.status(404).json({
    error: 'Rota nao encontrada',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3000;

async function startServer(){
    try{
        await connectDatabase();

        app.listen(PORT, ()=> {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Acesse: http://localhost:${PORT}`);
        });
    } catch(error){
        console.error('Erro ao iniciar servidor', error);
        process.exit(1);
    }
}

// tratamento para fechamento da aplicacao
process.on('SIGINT', async()=> {
    console.log('\n Encerrando o servidor');
    await disconnectDatabase();
    process.exit(0);
})

startServer();

