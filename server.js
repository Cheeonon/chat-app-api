// import
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const app = express();

//  socket io
const server = http.createServer(app);
const io = socketIO(server);

// variables
const userRoutes = require('./routes/userRoutes');
const PORT = process.env.PORT || 3030;
const { generateMessage } = require('./utils/generate');
const { getData } = require('./utils/get');

// middlewares
app.use(cors());
app.use(express.json());
app.use('/user', userRoutes);
app.use(express.static(__dirname + '/public/img'));
app.use(fileUpload());

app.get("/", (req, res) => {
    res.send("Server Connected.")
})

app.get('/img/:id', (req, res) => {

    try{
        filepath = `${__dirname}/public/img/${req.params.id}`;
        
        res.sendFile(filepath);
    } catch(err){
        console.log(err)
    }
    
});

io.on('connection', (socket)=>{
    // console.log("Connected to the user.");

    socket.on('join', (roomID)=>{
        socket.join(roomID)
    })
    
    socket.on('newMessage', (message)=>{
        const { content, from, to, roomID } = message;
        const newMessage = generateMessage(content, from, to);

        io.to(roomID).emit('createMessage', newMessage);
        try{
            // rewrite the messageList.json file with updated messageList
            const messageList = getData("./data/messageList.json");
            messageList[roomID].push(newMessage);
            fs.writeFileSync("./data/messageList.json", JSON.stringify(messageList));
        } catch(err){
            console.log(err)
        }
    })

})

server.listen(PORT, ()=>{
    console.log(`The server is running on port ${PORT}`);
});