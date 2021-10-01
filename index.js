const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const { SocketAddress } = require("net");

const io = require("socket.io")(server, { 
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

app.use(cors());

const PORT = process.env.port || 5000;

app.get("/", (req, res) => {
    res.send("Server is running.");
});

io.on('connection', (socket) => {
    console.log('connection');

    socket.emit('me', socket.id);

    socket.on('disconnect', () => {
        console.log('disconnect');
        socket.broadcast.emit("callended");
    });
    socket.on("calluser", ({ userToCall, signalData, from, name }) => {
        console.log('calluser');
        io.to(userToCall).emit("calluser", { userToCall, signalData, from, name });
    });
    socket.on("answercall", (data) => {
        console.log('answercall');
        io.to(data.to).emit("callaccepted", data.signal);
    })
});

server.listen(PORT, () => console.log("Server listening on port 5000"));