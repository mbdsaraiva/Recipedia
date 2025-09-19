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
        const {id} = req.params;
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

// criar novo ingrediente
async function createIngredient(req,res) {
    try{
        const{nome, unidade} = req.body;

        if(!nome || !unidade){
            return res.status(400).json({error: 'Nome e unidade sao obrigatorios'});
        }

        const existingIngredient = await prisma.ingredient.findFirst({
            where: {
                nome: {
                    equals: nome,
                    mode: 'insensitive'
                }
            }
        });

        if(!existingIngredient){
            return res.status(409).json({
                error: 'Ingrediente com nome ja cadastrado',
                existing: existingIngredient
            });
        }

        const ingredient = await prisma.ingredient.create({
            data: {
                nome: nome.trim(),
                unidade: unidade.toLowerCase().trim()
            }
        });

        res.status(201).json({message: 'Ingrediente adicionado', ingredient});
    } catch(error){
        console.error('Erro ao adicionar:', error);
        res.status(500).json({error: 'Erro ao criar ingrediente'});
    }
}

// atualizar ingrediente
async function updateIngredient(req, res) {
    try {
        const {id} = req.params;
        const {nome, unidade} = req.body;

        const ingredientExists = await prisma.ingredient.findUnique({
            where: { id: parseInt(id) }
        });

        if (!ingredientExists) {
            return res.status(404).json({ error: 'Ingrediente não encontrado' });
        }

        if (nome && nome !== ingredientExists.nome) {
            const nameConflict = await prisma.ingredient.findFirst({
                where: {
                    nome: {
                        equals: nome,
                        mode: 'insensitive'
                    },
                    NOT: {
                        id: parseInt(id)
                    }
                }
            });

            if (nameConflict) {
                return res.status(409).json({
                    error: 'Já existe outro ingrediente com este nome'
                });
            }
        }

        const updateData = {};
        if (nome) updateData.nome = nome.trim();
        if (unidade) updateData.unidade = unidade.toLowerCase().trim();

        const ingredient = await prisma.ingredient.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json({
            message: 'Ingrediente atualizado',
            ingredient
        });
    } catch (error) {
        console.error('Erro ao atualizar ingrediente:', error);
        res.status(500).json({ error: 'Erro ao atualizar ingrediente' });
    }
}

// deletar ingrediente
async function deleteIngredient(req, res) {
    try {
        const {id} = req.params;

        const ingredient = await prisma.ingredient.findUnique({
            where: { id: parseInt(id) },
            include: {
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


        if (ingredient._count.receitas > 0 || ingredient._count.estoque > 0) {
            return res.status(409).json({
                error: 'Não é possível deletar: ingrediente está sendo usado',
                usage: {
                    receitas: ingredient._count.receitas,
                    estoque: ingredient._count.estoque
                }
            });
        }

        await prisma.ingredient.delete({
            where: { id: parseInt(id) }
        });


        res.json({ 
            message: 'Ingrediente deletado',
            deleted: ingredient.nome 
        });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar' });
    }

}

async function searchIngredients(req,res){
    try{

        const {q} = req.query;

        if(!q || q.length < 2){
            return res.status(400).json({error: 'a query deve ter 2 caracteres'});
        }

        const ingredients = await prisma.ingredient.findMany({
            where: {
                nome: {
                    contains: q,
                    mode: 'insensitive'
                }
            },
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
            },
            take: 20

        });

        res.json({
            query: q,
            results: ingredients.length,
            ingredients
        });
    } catch (error){
        console.error('Error ao buscar ingredientes', error);
        res.status(500).json({error: 'Erro ao buscar'})
    }
}


// estatisticas dos ingredientes

async function getIngredientStats(){
    try{
        const stats = await prisma.$transaction([

            prisma.ingredient.count(),

            //  retornando ingrediente mais usado nas receitas
            prisma.ingredient.findMany({
                include: {
                    _count:{
                        select: {receitas: true}
                    }
                },
                orderBy: {
                    receitas: {
                        _count: 'desc'
                    }
                }
            }),

            // retornando o ingrediente mais comum nos estoques
            prisma.ingredient.findFirst({
                include: {
                    _count:{
                        select: {estoque: true}
                    }
                },
                orderBy: {
                    estoque: {
                        _count: 'desc'
                    }
                }
            })
        ]);

        res.json({
            totalIngredients: stats[0],
            mostUsedInRecipes: stats[1],
            mostCommonInStock: stats[2]  
        });
    }catch (error) {
        console.error('Erro ao buscar dados', error);
        res.stats(500).json({error: 'Erro ao buscar dados'});
    }
}

module.exports = {
    getAllIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    searchIngredients,
    getIngredientStats
};