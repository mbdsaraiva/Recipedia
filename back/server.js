const express = require('express');
const cors = require('cors');
const { PrismaClient } = require ('./generated/prisma');

const app = express();
const prisma = new PrismaClient;

app.use(cors());
app.use(express.json());

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

app.get('/api/ingredients', async(req,res)=>{
    try{
        const ingredients = await prisma.ingredient.findMany();
        res.json(ingredients);
    }
    catch(error){
        res.status(500).json({error: 'Erro ao buscar o ingrediente'})
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
