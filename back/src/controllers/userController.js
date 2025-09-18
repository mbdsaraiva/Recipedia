const {prisma} = require('../config/database')

// lista todos os usuarios
async function getAllUsers(req,res){
    try{
        const users = await prisma.user.findMany();
        res.json(users);
    }
    catch(error){
        console.error('Erro ao buscar usuarios:', error);
        res.status(500).json({error:'Erro ao buscar usuarios'});
    }
}

// lista usuario por id
async function getUserById(req,res){
    try{
        const {id} = req.params;
        const user = await prisma.user.findUnique({
            where: {id: parseInt(id)},
            include: {
                receitas: true,
                estoque:{
                    include:{
                        ingredient: true
                    }
                }
            }
        });

        if(!user){
            return res.status(404).json({error: 'Usuario nao encontrado'});
        }

        res.json(user);

    }
    catch(error){
        console.error('Erro ao buscar usuario', error);
        res.status(500).json({error: 'Erro ao buscar usuario'});
    }

}

async function createUser(req,res){

    try{
        const {nome, email, senha, tipo} = req.body;

        if(!nome || !email || !senha){
            return res.status(400).json({
                error: 'Nome, senha e email sao obrigatorios'
            });
        }
        
        const user = await prisma.user.create({
            data: {nome, email, senha, tipo: tipo || 'user'}
        });

        res.status(201).json({
            message: 'Usuario nao encontrado',
            user
        });
    }
    catch (error){
        console.error('Erro ao criar usuario', error);
        if(error.code === 'P2002'){
            res.status(400).json({
                error: 'Email ja em uso'
            })

        } else{
            res.status(500).json({error: 'Erro ao criar o usuario'});
        }
    }
}

async function updateUser(req,res){

    try{
        const {id} = req.params;
        const {nome, email, senha, tipo} = req.body;

        const userExists = await prisma.user.findUnique({
            where: {id: parseInt(id)}
        });

        if(!userExists){
            return res.status(404).json({error: 'Usuario nao encontrado'});
        }

        const updateData = {};

        if(nome) updateData.nome = nome;
        if(email) updateData.email = email;
        if(senha) updateData.senha = senha;
        if(tipo) updateData.tipo = tipo;
        
        const user = await prisma.user.update({
            where: {id: parseInt(id)},
            data: updateData
        });

        res.json({
            message: 'Usuario atualiado com sucesso',
            user
        });
    } catch(error){
        console.error('Erro ao atualizar o usuario:', error);

        if(error.code === 'P2002'){
            res.status(400).json({error: 'Email ja esta em uso'})
        }
        else{
            res.status(500).json({error: 'Erro ao atualizar o usuario'});
        }
    }
}

async function deleteUser(req,res){
    try{

        const {id} = req.params;

        const userExists = await prisma.user.findUnique({
            where: {id: parseInt(id)}
        });

        if(!userExists){
            res.status(400).json({error: 'Usuario nao encontrado'})
        }

        await prisma.user.delete({
            where: {id: parseInt(id)}
        });

        res.json({message: 'Usuario deletado com sucesso'});
    }
    catch (error) {
        console.error('Erro ao deletar usuario:', error);
        res.status(500).json({error: 'Erro ao deletar o usuario'});
    }
}