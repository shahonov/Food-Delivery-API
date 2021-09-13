const roles = require("../global/roles");
const { getDb, ObjectID } = require("./db")

const name = 'users';

const getUser = async (email, password) => {
    const result = await getDb()
        .collection(name)
        .findOne({ email, password });

    return result;
}

const isUserExists = async email => {
    const result = await getDb()
        .collection(name)
        .findOne({ email });

    return result;
}

const setUser = async (email, password, role) => {
    const user = await isUserExists(email);
    if (user) {
        throw Error('user with given email already exists');
    }

    const obj = (role === roles.restaurantOwner) ? {
        email,
        password,
        role: role,
        blockedUsers: [],
        isActivated: false,
        favoriteRestaurants: []
    } : {
        email,
        password,
        role: role,
        isActivated: false,
        favoriteRestaurants: []
    }

    const result = await getDb()
        .collection(name)
        .insertOne(obj);

    return result.insertedId;
}

const setExpiration = async (userId, expiration) => {
    const result = await getDb()
        .collection(name)
        .updateOne(
            { _id: ObjectID(userId) },
            { $set: { expiration } }
        );

    return result.modifiedCount > 0 || result.matchedCount > 0;
}

const getUserById = async _id => {
    const result = await getDb()
        .collection(name)
        .findOne({ _id: ObjectID(_id) });

    return result;
}

const activateUser = async userId => {
    const result = await getDb()
        .collection(name)
        .updateOne(
            { _id: ObjectID(userId) },
            {
                $set: {
                    isActivated: true
                }
            }
        );

    return result.modifiedCount > 0;
}

const updateRegularUserProfile = async userInfo => {
    const { _id, ...rest } = userInfo;
    const result = await getDb()
        .collection(name)
        .updateOne(
            { _id: ObjectID(_id), role: roles.regularUser },
            {
                $set: {
                    ...rest
                }
            }
        );

    return result.modifiedCount > 0;
}

const updateRestaurantOwnerProfile = async ownerInfo => {
    const { _id, ...rest } = ownerInfo;
    const result = await getDb()
        .collection(name)
        .updateOne(
            { _id: ObjectID(_id), role: roles.restaurantOwner },
            { $set: rest }
        );

    return result.modifiedCount > 0;
}

const addFavoriteRestaurant = async (userId, restaurantInfo) => {
    const result = await getDb()
        .collection(name)
        .updateOne(
            { _id: ObjectID(userId) },
            {
                $push: {
                    favoriteRestaurants: restaurantInfo
                }
            }
        );

    return result.modifiedCount > 0;
}

const removeFavoriteRestaurant = async (userId, restaurantId) => {
    const result = await getDb()
        .collection(name)
        .updateOne(
            { _id: ObjectID(userId) },
            {
                $pull: {
                    favoriteRestaurants: {
                        _id: restaurantId
                    }
                }
            }
        );

    return result.modifiedCount > 0;
}

const setResetId = async (email, resetId) => {
    const result = await getDb()
        .collection(name)
        .updateOne(
            { email },
            {
                $set: {
                    passwordResetId: resetId
                }
            }
        );

    return result.modifiedCount > 0;
}

const resetPassword = async (resetId, newPassword) => {
    const result = await getDb()
        .collection(name)
        .updateOne(
            { passwordResetId: resetId },
            {
                $set: {
                    password: newPassword
                },
                $unset: {
                    passwordResetId: ''
                }
            }
        );

    return result.modifiedCount > 0;
}

const validateResetId = async resetId => {
    const result = await getDb()
        .collection(name)
        .findOne({ passwordResetId: resetId });

    return result ? !!result._id : false;
}

const blockForRestaurant = async (restaurantId, userId) => {
    const result = await getDb()
        .collection(name)
        .updateOne(
            { _id: ObjectID(restaurantId) },
            {
                $push: {
                    blockedUsers: userId
                }
            }
        );

    return result.modifiedCount > 0;
}

const unblockFromRestaurant = async (restaurantId, userId) => {
    const result = await getDb()
        .collection(name)
        .updateOne(
            { _id: ObjectID(restaurantId) },
            {
                $pull: {
                    blockedUsers: userId
                }
            }
        );

    return result.modifiedCount > 0;
}

const isBlockedForRestaurant = async (restaurantId, userId) => {
    const result = await getDb()
        .collection(name)
        .findOne({ _id: ObjectID(restaurantId) })

    return result.blockedUsers.includes(userId);
}

module.exports = {
    getUser,
    setUser,
    setResetId,
    getUserById,
    activateUser,
    setExpiration,
    resetPassword,
    validateResetId,
    blockForRestaurant,
    unblockFromRestaurant,
    addFavoriteRestaurant,
    isBlockedForRestaurant,
    removeFavoriteRestaurant,
    updateRegularUserProfile,
    updateRestaurantOwnerProfile
}
