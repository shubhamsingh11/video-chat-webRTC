const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
//const { Socket } = require("dgram");

const io= require("socket.io")(server, {
    cors: {
        origin : "*",
        methods : ["GET" , "POST"]
    }
})

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/",(req,res) => {
    res.send('Server is running');
});

io.on('connection',(socket) => {   //Connection with the client : Handshake , web socket object received
    socket.emit('me', socket.id);

    socket.on('disconnect',() => {
        socket.broadcast.emit("callended");
    });

    socket.on('calluser', ({ userToCall , signalData , from , name}) => {
        io.to('userToCall').emit("calluser", { signal: signalData , from , name});
    });
    
    socket.on('answercall', (data) => {
        io.to(data.io).emit("callaccepted", data.signal);
    })
})

server.listen(PORT, ()=> console.log(`Server listening on ${PORT}`));