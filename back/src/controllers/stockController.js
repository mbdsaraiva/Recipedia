const { prisma } = require('../config/database');

// ver estoque completo de um usuário
async function getUserStock(req, res) {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { id: true, nome: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // buscar estoque do usuário
        const stock = await prisma.userIngredient.findMany({
            where: { userId: parseInt(userId) },
            include: {
                ingredient: true
            },
            orderBy: {
                validade: 'asc' 
            }
        });

        // separar por status de validade
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const vencidos = stock.filter(item => new Date(item.validade) < hoje);
        const vencendoHoje = stock.filter(item => {
            const validade = new Date(item.validade);
            return validade.toDateString() === hoje.toDateString();
        });
        const vencendoEm3Dias = stock.filter(item => {
            const validade = new Date(item.validade);
            const em3Dias = new Date(hoje);
            em3Dias.setDate(hoje.getDate() + 3);
            return validade > hoje && validade <= em3Dias;
        });
        const frescos = stock.filter(item => {
            const validade = new Date(item.validade);
            const em3Dias = new Date(hoje);
            em3Dias.setDate(hoje.getDate() + 3);
            return validade > em3Dias;
        });

        res.json({
            user,
            summary: {
                total: stock.length,
                vencidos: vencidos.length,
                vencendoHoje: vencendoHoje.length,
                vencendoEm3Dias: vencendoEm3Dias.length,
                frescos: frescos.length
            },
            stock: {
                vencidos,
                vencendoHoje,
                vencendoEm3Dias,
                frescos,
                todos: stock
            }
        });
    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        res.status(500).json({ error: 'Erro ao buscar estoque' });
    }
}

// adicionar ingrediente ao estoque
async function addToStock(req, res) {
    try {
        const { userId } = req.params;
        const { ingredientId, quantidade, validade } = req.body;

        if (!ingredientId || !quantidade || !validade) {
            return res.status(400).json({
                error: 'IngredientId, quantidade e validade são obrigatórios'
            });
        }

        if (quantidade <= 0) {
            return res.status(400).json({
                error: 'Quantidade deve ser maior que zero'
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const ingredient = await prisma.ingredient.findUnique({
            where: { id: parseInt(ingredientId) }
        });

        if (!ingredient) {
            return res.status(404).json({ error: 'Ingrediente não encontrado' });
        }

        // verificar se já existe no estoque (mesmo ingrediente e validade)
        const existing = await prisma.userIngredient.findFirst({
            where: {
                userId: parseInt(userId),
                ingredientId: parseInt(ingredientId),
                validade: new Date(validade)
            }
        });

        let stockItem;

        if (existing) {
            stockItem = await prisma.userIngredient.update({
                where: {
                    userId_ingredientId: {
                        userId: parseInt(userId),
                        ingredientId: parseInt(ingredientId)
                    }
                },
                data: {
                    quantidade: existing.quantidade + parseFloat(quantidade)
                },
                include: {
                    ingredient: true
                }
            });

            res.json({
                message: 'Quantidade adicionada ao estoque existente',
                action: 'updated',
                item: stockItem
            });
        } else {
            // criar novo item no estoque
            stockItem = await prisma.userIngredient.create({
                data: {
                    userId: parseInt(userId),
                    ingredientId: parseInt(ingredientId),
                    quantidade: parseFloat(quantidade),
                    validade: new Date(validade)
                },
                include: {
                    ingredient: true
                }
            });

            res.status(201).json({
                message: 'Ingrediente adicionado ao estoque',
                action: 'created',
                item: stockItem
            });
        }
    } catch (error) {
        console.error('Erro ao adicionar ao estoque:', error);
        res.status(500).json({ error: 'Erro ao adicionar ao estoque' });
    }
}

// atualizar item do estoque
async function updateStockItem(req, res) {
    try {
        const { userId, ingredientId } = req.params;
        const { quantidade, validade } = req.body;

        // verificar se item existe
        const existing = await prisma.userIngredient.findUnique({
            where: {
                userId_ingredientId: {
                    userId: parseInt(userId),
                    ingredientId: parseInt(ingredientId)
                }
            },
            include: {
                ingredient: true
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Item não encontrado no estoque' });
        }

        // dados para atualizar
        const updateData = {};
        if (quantidade !== undefined) {
            if (quantidade <= 0) {
                return res.status(400).json({
                    error: 'Quantidade deve ser maior que zero'
                });
            }
            updateData.quantidade = parseFloat(quantidade);
        }
        if (validade) updateData.validade = new Date(validade);

        const updated = await prisma.userIngredient.update({
            where: {
                userId_ingredientId: {
                    userId: parseInt(userId),
                    ingredientId: parseInt(ingredientId)
                }
            },
            data: updateData,
            include: {
                ingredient: true
            }
        });

        res.json({
            message: 'Item do estoque atualizado',
            item: updated
        });
    } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        res.status(500).json({ error: 'Erro ao atualizar estoque' });
    }
}

// remover do estoque
async function removeFromStock(req, res) {
    try {
        const { userId, ingredientId } = req.params;

        const existing = await prisma.userIngredient.findUnique({
            where: {
                userId_ingredientId: {
                    userId: parseInt(userId),
                    ingredientId: parseInt(ingredientId)
                }
            },
            include: {
                ingredient: true
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Ingrediente nao encontrado no estoque' });
        }

        await prisma.userIngredient.delete({
            where: {
                userId_ingredientId: {
                    userId: parseInt(userId),
                    ingredientId: parseInt(ingredientId)
                }
            }
        });

        res.json({
            message: 'Item removido do estoque',
            removed: {
                ingredient: existing.ingredient.nome,
                quantidade: existing.quantidade
            }
        });
    } catch (error) {
        console.error('Erro ao remover do estoque:', error);
        res.status(500).json({ error: 'Erro ao remover do estoque' });
    }
}

// consumir ingrediente (diminuir quantidade)
async function consumeIngredient(req, res) {
    try {
        const { userId, ingredientId } = req.params;
        const { quantidade } = req.body;

        if (!quantidade || quantidade <= 0) {
            return res.status(400).json({
                error: 'Quantidade a consumir deve ser maior que zero'
            });
        }

        const existing = await prisma.userIngredient.findUnique({
            where: {
                userId_ingredientId: {
                    userId: parseInt(userId),
                    ingredientId: parseInt(ingredientId)
                }
            },
            include: {
                ingredient: true
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Item não encontrado no estoque' });
        }

        const novaQuantidade = existing.quantidade - parseFloat(quantidade);

        if (novaQuantidade < 0) {
            return res.status(400).json({
                error: 'Quantidade insuficiente no estoque',
                disponivel: existing.quantidade,
                solicitado: parseFloat(quantidade)
            });
        }

        if (novaQuantidade === 0) {
            // se chegou a zero, remove do estoque
            await prisma.userIngredient.delete({
                where: {
                    userId_ingredientId: {
                        userId: parseInt(userId),
                        ingredientId: parseInt(ingredientId)
                    }
                }
            });

            res.json({
                message: 'Ingrediente consumido totalmente e removido do estoque',
                consumed: parseFloat(quantidade),
                remaining: 0
            });
        } else {
            // Atualizando a quantidade
            const updated = await prisma.userIngredient.update({
                where: {
                    userId_ingredientId: {
                        userId: parseInt(userId),
                        ingredientId: parseInt(ingredientId)
                    }
                },
                data: {
                    quantidade: novaQuantidade
                },
                include: {
                    ingredient: true
                }
            });

            res.json({
                message: 'Ingrediente consumido',
                consumed: parseFloat(quantidade),
                remaining: novaQuantidade,
                item: updated
            });
        }
    } catch (error) {
        console.error('Erro ao consumir ingrediente:', error);
        res.status(500).json({ error: 'Erro ao consumir ingrediente' });
    }
}

// ingredientes vencendo (alertas)
async function getExpiringItems(req, res) {
    try {
        const { userId } = req.params;
        const { days = 3 } = req.query; // Padrão: 3 dias

        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { id: true, nome: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario nao encontrado' });
        }

        const hoje = new Date();
        const limiteDias = new Date(hoje);
        limiteDias.setDate(hoje.getDate() + parseInt(days));

        const expiring = await prisma.userIngredient.findMany({
            where: {
                userId: parseInt(userId),
                validade: {
                    lte: limiteDias
                }
            },
            include: {
                ingredient: true
            },
            orderBy: {
                validade: 'asc'
            }
        });

        res.json({
            user,
            alertDays: parseInt(days),
            expiringItems: expiring.length,
            items: expiring
        });
    } catch (error) {
        console.error('Erro ao buscar itens vencendo:', error);
        res.status(500).json({ error: 'Erro ao buscar itens vencendo' });
    }
}

module.exports = {
    getUserStock,
    addToStock,
    updateStockItem,
    removeFromStock,
    consumeIngredient,
    getExpiringItems
};