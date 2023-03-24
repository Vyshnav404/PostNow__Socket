const io = require("socket.io")(8040,{
    cors:{
        origin:"http://localhost:5173",
    }
});

let users = [];

const addUser = (userId,socketId) =>{
    try{
        !users.some((user)=> user.userId === userId) && 
        users.push({ userId, socketId });

    }catch(err){
        console.log(err);
    }
};

const removeUser = (socketId)=>{
    users = users.filter((user)=> user.socketId !== socketId);
};

const getUser = (userId)=>{
    return users.find((user)=> user.userId === userId)
}


io.on("connection",(socket)=>{
    //when connect
    console.log("a user connected.");
    //take userId and socketId from user
    socket.on("addUser",userId=>{
        addUser(userId, socket.id);
        io.emit("getUsers",users)
    });

    //send and get message
    socket.on("sendMessage",({senderId,receiverId,text})=>{
        console.log("receiver id==",receiverId);
        const user = getUser(receiverId)
        if(user && user.socketId){

            io.to(user.socketId).emit("getMessage",{
                senderId,
                text,
            });
        }else{
            console.log("User not found or socket not defined");
        }
    })


    //when disconnect
    socket.on("disconnect",()=>{
        console.log("a user disconnected!");
        removeUser(socket.id)
        io.emit("getUsers",users)

    })
});

