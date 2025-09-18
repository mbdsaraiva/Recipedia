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