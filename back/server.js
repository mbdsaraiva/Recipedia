const express = require('express');
const cors = require('cors');
require('dotenv').config();


/* por fazer:
    receitas
    estoque pessoal
    funcionalidades inteligentes
    
    */


// conexcao com o db
const {connectDatabase, disconnectDatabase} = require('./src/config/database');

// importacao das rotas
const userRoutes = require('./src/routes/userRoutes');
const ingredientRoutes = require('./src/routes/ingredientRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req,res,next)=> {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
})

// rota de teste
app.get('/', (req,res)=> {
    res.json({
        message: 'Api rodando',
        timestamp: new Date().toISOString(),
        endpoints: {
            users: '/api/users',
            ingredients: '/api/ingredients',
            recipes: '/api/recipes'
        }
    });
});

app.use('/api/users', userRoutes);
app.use('/api/ingredients', ingredientRoutes);
// caso a rota nao seja encontrada
app.use(/.*/, (req,res)=> {
  res.status(404).json({
    error: 'Rota nao encontrada',
    path: req.originalUrl
  });
});



// para iniciar o servidor
const PORT = process.env.PORT || 3000;

async function startServer(){
    try{
        await connectDatabase();

        app.listen(PORT, ()=> {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Acesse: http://localhost:${PORT}`);
            console.log(`API Users na rota: http://localhost:${PORT}/api/users`);
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

