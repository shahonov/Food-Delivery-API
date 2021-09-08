const router = require('express').Router();

const { getRestaurants } = require('../data/restaurantsData');

router.get('/:from/:to', async (req, res, next) => {
    try {
        const { from, to } = req.params;
        const result = await getRestaurants(from, to);
        res.json(result);
    } catch (err) {
        next(err);
    }
})

module.exports = router;
