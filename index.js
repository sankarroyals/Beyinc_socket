const io = require("socket.io")(8900, {
    cors: {
        origin: ["http://localhost:3000", "https://beyinc-frontend.onrender.com", "https://beyinc-frontend.vercel.app"],
    },
});

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    //when ceonnect
    console.log("a user connected.");

    //take userId and socketId from user
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, message, fileSent, conversationId }) => {
        const user = getUser(receiverId);
        console.log(senderId);
        console.log(user);
        console.log(receiverId);
        console.log(fileSent);
        console.log(conversationId);
        io.to(user?.socketId).emit("getMessage", {
            senderId,
            message,
            fileSent,
            conversationId
        });
    });


    socket.on("seenMessage", ({ senderId, receiverId, conversationId }) => {
        const user = getUser(receiverId);
        console.log(senderId);
        console.log(receiverId);
        console.log({ message: 'seen just now' });
        console.log(user?.socketId);
        io.to(user?.socketId).emit("sendseenMessage", {
            senderId, receiverId,
            conversationId,
            message: 'seen just now'
        });
    });


    socket.on("chatBlocking", ({ senderId, receiverId }) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit("sendchatBlockingInfo", {
            senderId, receiverId,
        });
    });


    socket.on("sendNotification", ({ senderId, receiverId }) => {
        const user = getUser(receiverId);
        console.log(user);
        console.log(receiverId);
        io.to(user?.socketId).emit("getNotification", {
            senderId
        });
    });

    //when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});
 