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
        .toArray();

    return {
        all: result,
        totalCount: result.length
    };
}

module.exports = {
    getRestaurants
}
