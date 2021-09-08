const router = require('express').Router();
const NodeRSA = require('node-rsa');
const { v4: uuid } = require('uuid');

const roles = require('../global/roles');
const { emailService } = require('../services/emailService');
const { readPrivateKey } = require('../inMemory/cryptoPairs');
const authorize = require('../middlewares/authorizationMiddleware');
const { emailTemplates } = require('../emailTemplates/emailTemplates');
const authenticate = require('../middlewares/authenticationMiddleware');
const {
    getUser,
    setUser,
    activateUser,
    setExpiration,
    addFavoriteRestaurant,
    removeFavoriteRestaurant,
    updateRegularUserProfile,
    updateRestaurantOwnerProfile,
    resetPassword,
    setResetId,
    validateResetId,
    unblockFromRestaurant,
    blockForRestaurant,
} = require('../data/usersData');
const { ObjectID } = require('../data/db');

// session will expire four hours after sign in
const generateExpirationDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 4);
    return now.getTime();
}

router.put('/sign-in', async (req, res, next) => {
    try {
        const { email, encryptionId, encryptedPassword } = req.body;

        const privateKey = readPrivateKey(encryptionId);
        if (!privateKey) {
            res.json({ isSuccess: false, message: 'could not get private rsa key' });
        }
        const rsa = new NodeRSA(privateKey);
        const decryptedPassword = rsa.decrypt(encryptedPassword, 'utf8');

        const result = await getUser(email, decryptedPassword);
        if (result) {
            if (result.isActivated) {
                const expiration = generateExpirationDate();
                const setExpirationSuccess = await setExpiration(result._id, expiration);
                if (setExpirationSuccess) {
                    const { password, ...rest } = result;
                    res.json({ isSuccess: true, user: { ...rest, expiration } });
                } else {
                    res.status(500).json({ isSuccess: true, message: 'could not set expiration' });
                }
            } else {
                res.status(403).json({ isSuccess: false, message: 'account is not activated' });
            }
        } else {
            res.status(404).json({ isSuccess: false, message: 'invalid credentials' });
        }
    } catch (err) {
        next(err);
    }
});

router.post('/sign-up', async (req, res, next) => {
    try {
        const { email, encryptionId, encryptedPassword, role } = req.body;

        const privateKey = readPrivateKey(encryptionId);
        if (!privateKey) {
            res.json({ isSuccess: false, message: 'could not get private rsa key' });
        }
        const rsa = new NodeRSA(privateKey);
        const password = rsa.decrypt(encryptedPassword, 'utf8');

        const result = await setUser(email, password, role);
        const emailResult = await emailService.sendEmail({
            to: email,
            subject: 'Food Delivery account activation',
            html: emailTemplates.accountActivation(result)
        });
        if (result) {
            if (emailResult.accepted.includes(email)) {
                res.json({ isSuccess: true });
            } else {
                res.status(500).json({ isSuccess: false, message: 'could not send activation email' });
            }
        } else {
            res.status(400).json({ isSuccess: false, message: 'could not create user' });
        }
    } catch (err) {
        next(err);
    }
});

router.patch('/sign-out', async (req, res, next) => {
    try {
        const { userId } = req.body;
        const result = await setExpiration(userId, 0);
        if (result) {
            res.json({ isSuccess: true });
        } else {
            res.status(500).json({ isSuccess: false, message: 'could not sign out' });
        }
    } catch (err) {
        next(err);
    }
});

router.get('/activate/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const isActivated = await activateUser(userId);
        if (isActivated) {
            res.send('Account has been activated successfully!');
        } else {
            res.status(500).send('could not activate account');
        }
    } catch (err) {
        next(err);
    }
});

router.patch('/regular-user', authorize(roles.regularUser), async (req, res, next) => {
    try {
        const { userInfo } = req.body;
        const result = await updateRegularUserProfile(userInfo);
        if (result) {
            res.json({ isSuccess: true });
        } else {
            res.status(500).send('could not update profile');
        }
    } catch (err) {
        next(err);
    }
});

router.patch('/restaurant-owner', authorize(roles.restaurantOwner), async (req, res, next) => {
    try {
        const { userInfo } = req.body;
        const result = await updateRestaurantOwnerProfile(userInfo);
        if (result) {
            res.json({ isSuccess: true });
        } else {
            res.status(500).send('could not update profile');
        }
    } catch (err) {
        next(err);
    }
});

router.patch('/add-favorite-restaurant', authenticate, async (req, res, next) => {
    try {
        const { userId, restaurantInfo } = req.body;
        const result = await addFavoriteRestaurant(userId, restaurantInfo);
        if (result) {
            res.json({ isSuccess: true });
        } else {
            res.status(500).send('could not add restaurant to favorites');
        }
    } catch (err) {
        next(err);
    }
});

router.delete('/remove-favorite-restaurant', authenticate, async (req, res, next) => {
    try {
        const { userId, restaurantId } = req.body;
        const result = await removeFavoriteRestaurant(userId, restaurantId);
        if (result) {
            res.json({ isSuccess: true });
        } else {
            res.status(500).send('could not remove restaurant from favorites');
        }
    } catch (err) {
        next(err);
    }
});

router.put('/forgotten-password', async (req, res, next) => {
    try {
        const { email } = req.body;
        const resetId = uuid();
        const result = await setResetId(email, resetId);
        if (result) {
            const emailResult = await emailService.sendEmail({
                to: email,
                subject: 'Food Delivery account activation',
                html: emailTemplates.resetPassword(resetId)
            });
            if (emailResult.accepted.includes(email)) {
                res.json({ isSuccess: true, resetId });
            } else {
                res.status(500).send('could not send reset password email');
            }
        } else {
            res.status(500).send('could not send reset password email');
        }
    } catch (err) {
        next(err);
    }
});

router.patch('/reset-password', async (req, res, next) => {
    try {
        const { resetId, newPassword } = req.body;
        const result = await resetPassword(resetId, newPassword);
        if (result) {
            res.json({ isSuccess: true });
        } else {
            res.status(500).send('could not send reset password email');
        }
    } catch (err) {
        next(err);
    }
});

router.get('/validate-reset-id/:resetId', async (req, res, next) => {
    try {
        const { resetId } = req.params;
        const result = await validateResetId(resetId);
        res.json({ isSuccess: result });
    } catch (err) {
        next(err);
    }
});

router.patch('/block-for-restaurant', authorize(roles.restaurantOwner), async (req, res, next) => {
    try {
        const { restaurantId, userId } = req.body;
        const result = await blockForRestaurant(restaurantId, userId);
        res.json({ isSuccess: result });
    } catch (err) {
        next(err);
    }
});

router.patch('/unblock-from-restaurant', authorize(roles.restaurantOwner), async (req, res, next) => {
    try {
        const { restaurantId, userId } = req.body;
        const result = await unblockFromRestaurant(restaurantId, userId);
        res.json({ isSuccess: result });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
