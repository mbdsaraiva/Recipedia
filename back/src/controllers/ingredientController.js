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

// busca por id
async function getIngredientById(req, res) {
    try {
        const { id } = req.params;
        const ingredient = await prisma.ingredient.findUnique({
            where: { id: parseInt(id) },
            include: {
                receitas: {
                    include: {
                        recipe: {
                            select: {
                                id: true,
                                nome: true,
                                categoria: true,
                                autor: {
                                    select: {
                                        nome: true
                                    }
                                }
                            }
                        }
                    }
                },
                estoque: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                nome: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        receitas: true,
                        estoque: true
                    }
                }
            }
        });

        if (!ingredient) {
            return res.status(404).json({ error: 'Ingrediente não encontrado' });
        }

        res.json(ingredient);
    } catch (error) {
        console.error('Erro ao buscar ingrediente:', error);
        res.status(500).json({ error: 'Erro ao buscar ingrediente' });
    }
}