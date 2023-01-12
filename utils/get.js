const fs = require('fs');

const getData = (path) => {
    const file = fs.readFileSync(path, {encoding:'utf8'});
    const fileData = JSON.parse(file);
    return fileData
}

const getContact = (userID) => {
    const userData = getData("./data/contactList.json");

    return userData[userID]
}


module.exports = { getData, getContact}
