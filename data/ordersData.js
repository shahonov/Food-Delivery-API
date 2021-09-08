const { getDb, ObjectID } = require("./db");

const name = 'orders';

const createOrder = async orderInfo => {
    const result = await getDb()
        .collection(name)
        .insertOne(
            {
                ...orderInfo,
                statusChangelog: []
            }
        );

    return result.insertedId;
}

const getRestaurantOwnerOrders = async ownerId => {
    const result = await getDb()
        .collection(name)
        .find({ restaurantId: ownerId })
        .toArray();

    return result;
}

const getRegularUserOrders = async userId => {
    const result = await getDb()
        .collection(name)
        .find({ clientId: userId })
        .toArray();

    return result;
}

const editOrderStatus = async (orderId, status, editDateTime) => {
    const result = await getDb()
        .collection(name)
        .updateOne(
            { _id: ObjectID(orderId) },
            {
                $set: {
                    status
                },
                $push: {
                    statusChangelog: {
                        toStatus: status,
                        when: editDateTime
                    }
                }
            }
        )

    return result.modifiedCount > 0;
}

module.exports = {
    createOrder,
    editOrderStatus,
    getRegularUserOrders,
    getRestaurantOwnerOrders
}
