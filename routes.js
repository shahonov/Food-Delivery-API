const router = require('express').Router();
const rateLimit = require("express-rate-limit");

// const defaultLimit = rateLimit({
//     windowMs: 60 * 1000, // 1 minute
//     max: 30 // limit each IP to 30 requests per windowMs
// });

const allowHighFrequencyLimit = rateLimit({
    windowMs: 5 * 1000, // 5 seconds
    max: 5 // limit each IP to 5 requests per windowMs
});

const allowLowFrequencyLimit = rateLimit({
    windowMs: 600 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

router.use('/users', allowHighFrequencyLimit, require('./controllers/usersController'));
router.use('/meals', allowHighFrequencyLimit, require('./controllers/mealsController'));
router.use('/crypto', allowLowFrequencyLimit, require('./controllers/cryptoController'));
router.use('/orders', allowHighFrequencyLimit, require('./controllers/ordersController'));
router.use('/restaurants', allowHighFrequencyLimit, require('./controllers/restaurantsController'));

module.exports = router;
