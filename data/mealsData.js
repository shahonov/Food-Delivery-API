const { getDb, ObjectID } = require("./db")

const name = 'meals';

const getOwnerMeals = async (ownerId) => {
    const result = await getDb()
        .collection(name)
        .find({ ownerId })
        .toArray();

    return {
        all: result,
        totalCount: result.length
    };
}

const addOwnerMeal = async mealInfo => {
    const result = await getDb()
        .collection(name)
        .insertOne(mealInfo);

    return result.insertedId;
}

const deleteOwnerMeal = async (ownerId, mealId) => {
    const result = await getDb()
        .collection(name)
        .deleteOne({ _id: ObjectID(mealId), ownerId });

    return result.deletedCount > 0;
}

const changeMealOrder = async (mealId, oldOrderId, newOrderId) => {
    const changeSwapMeal = await getDb()
        .collection(name)
        .updateOne(
            { orderId: newOrderId },
            {
                $set: {
                    orderId: oldOrderId
                }
            }
        );

    if (changeSwapMeal.modifiedCount > 0) {
        const changeTargetMeal = await getDb()
            .collection(name)
            .updateOne(
                { _id: ObjectID(mealId) },
                {
                    $set: {
                        orderId: newOrderId
                    }
                }
            );

        return changeTargetMeal.modifiedCount > 0;
    } else {
        return false;
    }
}

module.exports = {
    getOwnerMeals,
    addOwnerMeal,
    deleteOwnerMeal,
    changeMealOrder,
}
