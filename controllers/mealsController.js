const router = require('express').Router();

const roles = require('../global/roles');
const authorize = require('../middlewares/authorizationMiddleware');
const authenticate = require('../middlewares/authenticationMiddleware');
const { getOwnerMeals, addOwnerMeal, deleteOwnerMeal } = require('../data/mealsData');

router.get('/owner/:ownerId/:from/:to', authenticate, async (req, res, next) => {
    try {
        const { ownerId } = req.params;
        const result = await getOwnerMeals(ownerId);
        res.json(result);
    } catch (err) {
        next(err);
    }
})

router.post('/owner/add-meal', authorize(roles.restaurantOwner), async (req, res, next) => {
    try {
        const { meal, ownerId } = req.body;
        const result = await addOwnerMeal({ ownerId, ...meal });
        if (result) {
            res.json({ isSuccess: true, _id: result });
        } else {
            res.json({ isSuccess: true, message: 'could not add meal' });
        }
    } catch (err) {
        next(err);
    }
})

router.delete('/owner/delete-meal', authorize(roles.restaurantOwner), async (req, res, next) => {
    try {
        const { mealId, ownerId } = req.body;
        const result = await deleteOwnerMeal(ownerId, mealId);
        if (result) {
            res.json({ isSuccess: true });
        } else {
            res.json({ isSuccess: false, message: 'could not delete meal' });
        }
    } catch (err) {
        next(err);
    }
})

module.exports = router;
