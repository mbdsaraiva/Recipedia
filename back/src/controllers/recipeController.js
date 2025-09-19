const { prisma } = require('../config/database');

// listar todas as receitas
async function getAllRecipes(req, res) {
    try {
        const { categoria, autor } = req.query;

        const where = {};

        if (categoria) where.categoria = categoria;
        if (autor) where.autorId = parseInt(autor);

        const recipes = await prisma.recipe.findMany({

            where,
            include: {
                autor: {
                    select: {
                        id: true,
                        nome: true
                    }
                },
                ingredientes: {
                    include: {
                        ingredient: true
                    }
                },
                _count: {
                    select: {
                        ingredientes: true
                    }
                }
            },
            orderBy: {
                id: 'desc'
            }
        });

        res.json({
            total: recipes.length,
            recipes
        });
    } catch (error) {
        console.error('Erro ao buscar receitas:', error);
        res.status(500).json({ error: 'Erro ao buscar receitas' });
    }
}

// listar por id
async function getRecipeById(req, res) {
    try {
        const { id } = req.params;

        const recipe = await prisma.recipe.findUnique({
            where: { id: parseInt(id) },
            include: {
                autor: {
                    select: {
                        id: true,
                        nome: true
                    }
                },
                ingredientes: {
                    include: {
                        ingredient: true
                    },
                    orderBy: {
                        ingredient: {
                            nome: 'asc'
                        }
                    }
                }
            }
        });

        if (!recipe) {
            return res.status(404).json({ error: 'Receita não encontrada' });
        }

        res.json(recipe);
    } catch (error) {
        console.error('Erro ao buscar receita:', error);
        res.status(500).json({ error: 'Erro ao buscar receita' });
    }
}

async function createRecipe(req, res) {
    try {
        const { nome, instrucoes, categoria, autorId, ingredientes } = req.body;

        // validação básica
        if (!nome || !instrucoes || !categoria || !autorId || !ingredientes || ingredientes.length === 0) {
            return res.status(400).json({
                error: 'Nome, instruções, categoria, autor e pelo menos 1 ingrediente são obrigatórios'
            });
        }

        // verificar se autor existe
        const autor = await prisma.user.findUnique({
            where: { id: parseInt(autorId) }
        });

        if (!autor) {
            return res.status(404).json({ error: 'Autor não encontrado' });
        }

        // verificar se todos os ingredientes existem
        const ingredientIds = ingredientes.map(ing => ing.ingredientId);
        const existingIngredients = await prisma.ingredient.findMany({
            where: { id: { in: ingredientIds } }
        });

        if (existingIngredients.length !== ingredientIds.length) {
            return res.status(400).json({
                error: 'Um ou mais ingredientes não foram encontrados'
            });
        }

        // validando quantidades
        for (let ing of ingredientes) {
            if (!ing.ingredientId || !ing.quantidade || ing.quantidade <= 0) {
                return res.status(400).json({
                    error: 'Todos os ingredientes devem ter ID e quantidade válidos'
                });
            }
        }

        const recipe = await prisma.$transaction(async (tx) => {
            // criar a receita
            const newRecipe = await tx.recipe.create({
                data: {
                    nome: nome.trim(),
                    instrucoes: instrucoes.trim(),
                    categoria: categoria.trim(),
                    autorId: parseInt(autorId)
                }
            });

            // adicionar ingredientes
            const recipeIngredients = ingredientes.map(ing => ({
                recipeId: newRecipe.id,
                ingredientId: parseInt(ing.ingredientId),
                quantidade: parseFloat(ing.quantidade)
            }));

            await tx.recipeIngredient.createMany({
                data: recipeIngredients
            });

            return newRecipe;
        });

        // buscar receita criada com todos os dados
        const fullRecipe = await prisma.recipe.findUnique({
            where: { id: recipe.id },
            include: {
                autor: {
                    select: { id: true, nome: true }
                },
                ingredientes: {
                    include: {
                        ingredient: true
                    }
                }
            }
        });

        res.status(201).json({
            message: 'Receita criada com sucesso',
            recipe: fullRecipe
        });
    } catch (error) {
        console.error('Erro ao criar receita:', error);
        res.status(500).json({ error: 'Erro ao criar receita' });
    }
}