const express = require('express');
const router = express.Router();

// importando o controller
const userController = require ('../controllers/userController');

// definicao das rotas
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/:id/recipes', userController.getUserRecipes);

module.exports = router;
