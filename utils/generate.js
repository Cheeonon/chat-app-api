const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

const generateMessage = (content, from, to) => {
    const date = new Date().getTime();

    return {
        "from": from,
        "to": to,
        "content": content,
        "createdAt": moment(date).format('LT')
    }
}


const generateUser = (userID, userPassword, userName) => {
    const date = new Date().getTime();
    
    return {
        "id": userID,
        "pwd": userPassword,
        "name": userName,
        "joined": moment(date).format('LL'),
        "profile": "profile.png",
        "contactsID": uuidv4()
    }
}

module.exports = { generateMessage, generateUser}