const express = require('express');
const router = express.Router();

const recipeController = require('../controllers/recipeController');

router.get('/can-make/:userId', recipeController.getRecipesUserCanMake);
router.get('/category/:categoria', recipeController.getRecipesByCategory); 

router.get('/', recipeController.getAllRecipes);             
router.get('/:id', recipeController.getRecipeById);       
router.post('/', recipeController.createRecipe);                
router.put('/:id', recipeController.updateRecipe);                         

module.exports = router;