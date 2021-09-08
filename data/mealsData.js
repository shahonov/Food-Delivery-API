const { getDb, ObjectID } = require("./db")

const name = 'meals';

const getOwnerMeals = async (ownerId, from, to) => {
    const count = await getDb()
        .collection(name)
        .find({ ownerId })
        .count();

    if (!isNaN(from) && !isNaN(to)) {
        const result = await getDb()
            .collection(name)
            .find({ ownerId })
            .skip(+from)
            .limit(+to)
            .toArray();

        return {
            all: result,
            totalCount: count
        };
    } else {
        const result = await getDb()
            .collection(name)
            .find({ ownerId })
            .toArray();

        return {
            all: result,
            totalCount: count
        };
    }
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

module.exports = {
    getOwnerMeals,
    addOwnerMeal,
    deleteOwnerMeal
}
