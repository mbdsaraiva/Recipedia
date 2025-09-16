const express = require('express');
const cors = require('cors');
const { PrismaClient } = require ('./generated/prisma');

const app = express();
const prisma = new PrismaClient;

app.use(cors());
app.use(express.json());

// app.get('/', (req,res) => {
//     res.json({
//         message: "API recipedia funcionando!",
//         timestamp: new Date().toISOString
//     });
// })

app.get('/api/users', async(req,res) => {
    try{
        const users = await prisma.user.findMany();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({error: "Erro ao buscar usuários"});
    }
});

app.post('/api/users', async(req,res) => {
    try{
        const {nome, email, senha, tipo} = req.body;
        const user = await prisma.user.create({
            data: {nome, email, senha, tipo}
        })
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({erro: 'Erro ao criar usuário'});
    }
});

app.listen(3000,() => {
    console.log(`Servidor rodando na porta 3000`)
});