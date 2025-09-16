const express = require('express');
const cors = require('cors');
const { PrismaClient } = require ('./generated/prisma');

const app = express();
const prisma = new PrismaClient;

app.use(cors());
app.use(express.json());

// USERS ALL

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

// USERS ID

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }, 
      include: {
        receitas: true,    
        estoque: {         
          include: {
            ingredient: true 
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

app.put('/api/users/:id', async(req,res)=> {
    try{
        const {id} = req.params;
        const {nome, email, senha, tipo} = req.body;
        
        //verificando se o usuario existe
        const userExists = await prisma.user.findUnique({
            where: {id: parseInt(id)}
        });
        
        if (!userExists){
            return res.status(404).json({error: "Usuario nao encontrado"});
        }
        
        const updateData = {};
        if (nome) updateData.nome = nome;
        if(email) updateData.email = email;
        if(senha) updateData.senha = senha;
        if (tipo) updateData.tipo = tipo;

        const user = await prisma.user.update({

            where:{id: parseInt(id)},
            data: updateData
        });

        res.json({
            message: 'Usuario atualizado com sucesso',
            user
        });

    }catch(error){

        console.log('Error: ',error);
        if (error.code === 'P2002'){
            res.status(400).json({error: 'Email ja esta em uso'});
        }else{
            res.status(500).json({error: 'Erro ao atualizar o usuario'});
        }
    }
});

app.delete('/api/users/:id', async(req,res)=> {
    try{
        const {id} = req.params;
        const userExists = await prisma.user.findUnique({
            where: {id: parseInt(id)}
        });

        if(!userExists){
            res.status(404).json({error: 'Usuario nao encontrado'})
        }

        await prisma.user.delete({
            where: {id: parseInt(id)}
        });
        
        res.json({message: 'Usuario deletado com sucesso'})
    }   catch (error){
        console.error('error:', error);
        res.status(500).json({error: 'Erro ao deletar o usuario'});
    }
});


//INGREDIENTS ALL
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

process.on('beforeExit', async()=>{
    await prisma.$disconnect();
})