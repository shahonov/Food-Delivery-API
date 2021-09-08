const { getDb } = require("./db");
const roles = require("../global/roles");

const name = 'users';

const getRestaurants = async (from, to) => {
    const result = await getDb()
        .collection(name)
        .find(
            { role: roles.restaurantOwner },
            {
                expiration: 0,
                password: 0,
                email: 0,
                role: 0
            }
        )
        .skip(+from)
        .limit(+to)
        .toArray();

    const count = await getDb()
        .collection(name)
        .find({
            role: roles.restaurantOwner,
            isActivated: true,
            restaurantName: { $exists: true, $ne: null },
            kitchenType: { $exists: true, $ne: null },
            slogan: { $exists: true, $ne: null },
            address: { $exists: true, $ne: null },
            freeDeliveryThreshold: { $exists: true, $ne: null }
        })
        .count();

    return {
        all: result,
        totalCount: count
    };
}

module.exports = {
    getRestaurants
}
