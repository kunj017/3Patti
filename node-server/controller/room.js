const { GameModel, PlayerDataModel, GameSchema } = require("../models/game");


/**Adds new player into a room. 
 * 
 * @param newPlayerData Data for the new player to be added. Should contain userId, userName.
 * @param {String} roomId Room Id in where this player is supposed to be added.
 * @return {Promise<Boolean>} Whether player was added successfully or not.
*/
async function addNewPlayer(newPlayerData, roomId) {
    try {
        const seatNumber = await findSeatNumber(roomId);
        const isDuplicatePlayer = await isPlayerAlreadyPresent(
            roomId,
            newPlayerData.userId
        );
        if (isDuplicatePlayer) {
            console.log(`Player is already Present!`);
            return true;
        } else if (seatNumber > 7) {
            // Return something to client
            console.log(`Room is full!!`);
            return false;
        } else {
            const data = await GameModel.findOne({ _id: roomId }).lean();
            const entryAmount = data.entryAmount;
            if (entryAmount == null) {
                console.log(`Error while getting EntryAmount!`);
                return false;
            }
            console.log(`AddNewPlayer: ${newPlayerData}`)
            console.log(newPlayerData);
            newPlayerData.seatNumber = seatNumber;
            newPlayerData.balance = newPlayerData.balance ?? entryAmount;
            newPlayerData.totalAmount = newPlayerData.totalAmount ?? entryAmount;
            const newPlayer = await PlayerDataModel.create(newPlayerData);
            return await GameModel.findByIdAndUpdate(
                roomId, // ID of the document to update
                { $push: { playerData: newPlayer } }, // Use $push to add 'new-tag' to the 'tags' array
                { new: true } // Optionally return the updated document
            )
                .then((res) => {
                    return true;
                })
                .catch((err) => {
                    console.log(`Error while adding new player: ${err}`);
                    return false
                });
        }
    } catch (err) {
        console.log(`Error while adding new Player: ${err}`);
        return false
    }
}

/**Removes a player from a room.
 * 
 * @param {String} playerId Id for the player to be removed.
 * @param {String} roomId Room Id for the room from where the player is to be removed.
*/
async function removePlayer(playerId, roomId) {
    try {
        await GameModel.updateOne(
            { _id: roomId }, // ID of the document to update
            { $pull: { playerData: { userId: playerId } } } // Use $push to add 'new-tag' to the 'tags' array
        );
    } catch (err) {
        console.log(
            `Error while removing player: ${playerId} from room: ${roomId}`
        );
    }
}
/**Determines if a room is valid.
 * 
 * @param {String} roomId Room Id for the room to be verified.
 * @return {Promise<Boolean>} If the room is valid.
*/
async function isValidRoomId(roomId) {
    try {
        // Check if a document with the given ID exists
        const data = await GameModel.exists({ _id: roomId });
        if (data) {
            return true; // Return the data if found
        } else {
            console.log("No data found with the given ID");
            return false; // Return null if no data is found
        }
    } catch (error) {
        console.error("Error fetching data by ID:", error);
        throw error;
    }
}

/**Finds a seat number in a room. In case of a filled room, a seat number of 8 will be returned.
 * 
 * @param {String} roomId Room Id.
 * @return {Promise<Number>} Seat number.
*/
async function findSeatNumber(roomId) {
    try {
        const playerData = await GameModel.findOne(
            { _id: roomId },
            "playerData"
        ).lean();

        const seatsOccupied = playerData.playerData.map(
            (playerData) => playerData.seatNumber
        );
        seatsOccupied.sort();
        let availableSeat = 8;
        for (let i = 0; i < 8; i++) {
            if (!seatsOccupied.includes(i)) {
                availableSeat = i;
                break;
            }
        }
        console.log(
            `Seats Occupied for RoomId: ${roomId}: [${seatsOccupied}. Available Seat: ${availableSeat}]`
        );
        return availableSeat;
    } catch (err) {
        console.log(`Error while finding seatNumber: ${err}`);
    }
}

/**Determines if a player is already in the room.
 * 
 * @param {String} roomId Room Id.
 * @param {String} userId Id for the player.
 * 
 * @return {Promise<Boolean>} If the userId is already present.
*/
async function isPlayerAlreadyPresent(roomId, userId) {
    const data = await GameModel.findById(roomId).lean();
    return data.playerData
        .map((playerData) => playerData.userId)
        .includes(userId);
}

/** Fetches the Game data for a roomId.
 * 
 * @param {String} roomId Room Id 
 * @returns {Promise<GameSchema>} GameData in the DB.
 */
async function getRoomData(roomId) {
    const roomData = await GameModel.findOne({ _id: roomId });
    console.log(roomData);
    return roomData;
}

module.exports = { isValidRoomId, getRoomData, removePlayer, addNewPlayer }