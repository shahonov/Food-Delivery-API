const router = require('express').Router();

const roles = require('../global/roles');
const authorize = require('../middlewares/authorizationMiddleware');
const authenticate = require('../middlewares/authenticationMiddleware');
const {
    createOrder,
    editOrderStatus,
    getRegularUserOrders,
    getRestaurantOwnerOrders
} = require('../data/ordersData');
const { isBlockedForRestaurant } = require('../data/usersData');

router.get('/owner/:ownerId', authorize(roles.restaurantOwner), async (req, res, next) => {
    try {
        const { ownerId } = req.params;
        const result = await getRestaurantOwnerOrders(ownerId);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.get('/user/:userId', authorize(roles.regularUser), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const result = await getRegularUserOrders(userId);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/', authorize(roles.regularUser), async (req, res, next) => {
    try {
        const { orderInfo } = req.body;
        const isBlocked = await isBlockedForRestaurant(orderInfo.restaurantId, orderInfo.clientId);
        if (isBlocked) {
            res.json({ isSuccess: false, message: `you are not allowed to place an order for ${orderInfo.restaurantName}` });
        } else {
            const result = await createOrder(orderInfo);
            if (!!result) {
                res.json({ isSuccess: true, _id: result });
            } else {
                res.json({ isSuccess: false, message: 'could not place an order' });
            }
        }
    } catch (err) {
        next(err);
    }
});

router.patch('/status', authenticate, async (req, res, next) => {
    try {
        const { orderId, status, updateTime } = req.body;
        const result = await editOrderStatus(orderId, status, updateTime);
        if (result) {
            res.json({ isSuccess: true });
        } else {
            res.status(400).json({ isSuccess: false, message: 'could not edit order status' });
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;
