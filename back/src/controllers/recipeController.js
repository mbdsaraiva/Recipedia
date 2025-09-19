const {prisma} = require ('../config/database');

// listar todas as receitas
async function getAllRecipes(req,res){
    try{
        const{categoria, autor} = req.query;
        
        const where = {};
        
        if(categoria) where.categoria = categoria;
        if(autor) where.autorId = parseInt(autor);

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
                _count:{
                    select: {
                        ingredientes: true
                    }
                }
            },
            orderBy:{
                id: 'desc'
            }
        });

        res.json({
            total: recipes.length,
            recipes
        });
    } catch(error) {
        console.error('Erro ao buscar receitas:', error);
        res.status(500).json({error: 'Erro ao buscar receitas'});
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
