const { prisma } = require('../config/database');

// listar todos os ingredientes
async function getAllIngredients(req,res){
    try{
        const ingredients = await prisma.ingredient.findMany({
            include: {
                _count: {
                    select: {
                        receitas: true,
                        estoque: true
                    }
                }
            },
            orderBy: {
                nome: 'asc'
            }
        });

        res.json(ingredients);
    } catch(error){
        console.error('Erro ao buscar ingrediente:', error);
        res.status(500).json({error: 'Erro ao buscar ingredientes'});
        }
}