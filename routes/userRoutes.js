const express = require('express');
const router = express.Router();
const { generateUser } = require('../utils/generate');
const { getData, getContact } = require('../utils/get');
const fs = require('fs');
const path = require("path");
const { v4: uuidv4 } = require('uuid');
  

router.post('/sign-up', (req, res) => {
    const { userID, userPassword, userName } = req.body;
    const userData = getData("./data/userList.json");
    const contactData = getData("./data/contactList.json");
    const roomData = getData("./data/roomList.json");

    // return if the user is exist
    if(userData[userID]){
        return res.status(409).json({message: "User already exists"})
    }

    // rewrite the json file with the new user data
    try{

        const newUser = generateUser(userID, userPassword, userName);
        userData[userID] = newUser;
        contactData[userID] = [];
        roomData[userID] = [];

        fs.writeFileSync("./data/userList.json", JSON.stringify(userData));
        fs.writeFileSync("./data/contactList.json", JSON.stringify(contactData));
        fs.writeFileSync("./data/roomList.json", JSON.stringify(roomData));
        
        res.json({message: "Successfully signed up"});

    } catch(err){
        console.log(err)
        return res.status(500).json({message: "Server has failed to push data."})

    }
})

router.post('/login', (req, res) => {
    const { userID, userPassword } = req.body;
    const userData = getData("./data/userList.json");

    // Check if the username exists
    if(!userData[userID]){
        return res.status(403).json({message: "User doesn't exist."})
    }

    if(userData[userID].pwd !== userPassword){
        return res.status(403).json({message: "Password doesn't match."})
    } 

    res.json({message: "Successfully loged in.", user: userData[userID]});
})


router.post('/friends', (req, res) => {
    const { userID } = req.body;
    const contacts = getContact(userID);


    if(contacts){
        return res.json({message: "Successfully fetch data.", friends: contacts})
    } else{
        return res.status(500).json({message: "Failed to fetch data."})
    }

})

router.post('/room-list', (req, res) => {
    let roomData = getData("./data/roomList.json");
    const messageList = getData("./data/messageList.json");
    const { userID } = req.body;

    if(roomData[userID]){

        roomData[userID].forEach(room => {

            if(messageList[room.roomID].length > 0){
                const lastMessage = messageList[room.roomID].at(-1);
                const content = lastMessage.content;
                const createdAt = lastMessage.createdAt;
        
                room.lastMessage = content;
                room.createdAt = createdAt;
            }
        })

        fs.writeFileSync("./data/roomList.json", JSON.stringify(roomData))

        roomData = getData("./data/roomList.json");

        return res.json({message: "Successfully fetch data.", chatList: roomData[userID]})
    } else{
        return res.status(500).json({message: "Failed to fetch data."})
    }
})

router.post('/message-list', (req, res) => {

    const { roomID } = req.body;
    const messageList = getData("./data/messageList.json");

    if(messageList[roomID]){
        try{
            return res.json({message: "Successfully fetch data.", messageList: messageList[roomID]})
        } catch(err){
            console.log(err)
            return res.status(500).json({message: "Failed to fetch data."})
        }
    }
})

router.post('/change-name', (req, res) => {

    const { newName, userID } = req.body;
    const userList = getData("./data/userList.json");
    
    try{
        userList[userID].name = newName
        fs.writeFileSync("./data/userList.json", JSON.stringify(userList))
        return res.json({message: "Successfully put data.", newName: newName})
    } catch(err){
        console.log(err)
        return res.status(500).json({message: "Failed to put data."})
    }
})

router.post('/add-friend', (req, res) => {
    const { user, friendID } = req.body;
    const userList = getData("./data/userList.json");
    const friendsList = getData("./data/contactList.json");
    const roomList = getData("./data/roomList.json");
    const messageList = getData("./data/messageList.json");

    const userID = user.id;

    if(!userList[friendID]){
        return res.status(409).json({message: "User doesn't exist."})
    }
    

    const friendInfo = {
        id : userList[friendID].id,
        name : userList[friendID].name,
        profile : userList[friendID].profile
    }

    const chatInfo = {
        roomID: uuidv4(),
        roomUsers: {
            [userID]: user.name,
            [friendID]: friendInfo.name
        },
        roomProfiles: {
            [userID]: user.profile,
            [friendID]: friendInfo.profile
        },
        lastMessage: "",
        createdAt: ""
    }


    try{
        friendsList[userID].push(friendInfo);
        roomList[userID].push(chatInfo);
        roomList[friendID].push(chatInfo);
        messageList[chatInfo.roomID] = [];
    } catch(err){
        console.log(err)
        return res.status(500).json({message: "Failed to push data"})
    }

    fs.writeFileSync("./data/contactList.json", JSON.stringify(friendsList));
    fs.writeFileSync("./data/roomList.json", JSON.stringify(roomList));
    fs.writeFileSync("./data/messageList.json", JSON.stringify(messageList));
    return res.json({message: "Successfully put data.", friendsList: friendsList[userID], roomList: roomList[userID]})
 
})


module.exports = router;