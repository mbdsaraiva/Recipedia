const express = require('express');
const router = express.Router();

const stockController = require('../controllers/stockController');

router.get('/:userId', stockController.getUserStock);                     
router.post('/:userId', stockController.addToStock);                      
router.put('/:userId/:ingredientId', stockController.updateStockItem);    
router.delete('/:userId/:ingredientId', stockController.removeFromStock); 

router.patch('/:userId/:ingredientId/consume', stockController.consumeIngredient); 

module.exports = router;