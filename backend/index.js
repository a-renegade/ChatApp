const express=require("express");
const app=express();
const mongoose=require("mongoose");
const user_model= require("./models/user_model");
const auth_routes=require("./routes/auth.routes")
const bcrypt=require("bcryptjs")
const servers_config=require("./config/servers.config")
const salt=8;
const server_model = require("./models/server_model");
const server_mw=require("./socket/socket.mw")
const WebSocket = require('ws');
const group_routes=require("./routes/group.routes")
const unstMessage_model=require("./models/unsent_messages.model")
const cors=require("cors");
const server_port_number=8888;
const cookieParser =require("cookie-parser")

let first_port=50000;
const servers=servers_config.servers;
const totalNumberOfPorts=servers_config.total_number;


const messageObject={
    from:"user3",
    userID:"user4",
    message:"hello"
};
const createFakeUnsentMessages=async(messageObject)=>{
    const unstMessageSaved=await unstMessage_model.create(messageObject);
    
}

app.listen(server_port_number,async()=>{
    // for(let ind=0;ind<1000;ind++){
    //     await createFakeUnsentMessages(messageObject);
    // }
    
    await server_model.updateMany(
        { status:"CONNECTED" }, 
        { $set: { status: "DISCONNECTED" } }  
    );
    console.log("SERVER IS RUNNING AT PORT:",server_port_number);
})

const DB_URL="mongodb://0.0.0.0/personal";
mongoose.connect(DB_URL);
const db=mongoose.connection;
db.on("error",()=>{
    console.log("ERROR OCCURED WHILE CONNECTING TO DATABASE")
})
db.once("open",()=>{
    console.log("Connected to MongoDB");
    init()
}) 
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
// console.log(servers_config.total_number); 
async function init(){
    try{
        
        let user=await user_model.findOne({userID:"abhishek_55"})
        
        if(user){
            console.log("ADMIN IS ALREADY PRESENT->",user.fullName)
            return;
        }
        // console.log("WORKING");
        
        
    }catch(err){
        console.log(err,"ERROR OCCURED WHILE CHECKING ADMIN")
    }
    try{
        
        user_model.create({
            fullName:"Abhishek Yadav",
            userID:"abhishek_55",
            password:bcrypt.hashSync("abhi123",salt),
            email:"abhishek908489@gmail.com",
            userType:"ADMIN",  
            friends:[{name:"piyush",userID:"piyush123"},{name:"ankit",userID:"ankit123"}]
        })
        let user=await user_model.findOne({userID:"abhishek_55"})
        console.log("ADMIN CREATED",user);

        let Server_Number=50000+Math.floor(Math.random()*servers_config.total_number); 
        const server_details={  
            userID:"abhishek_55", 
            server_number:Server_Number
        }
        let ret2=await server_model.create(server_details);
        console.log("Server alloted",ret2)


    }catch(err){ 
        let user=await user_model.findOne({userID:"abhishek_55"}); 
        await user_model.findOneAndDelete(user)
        console.log(err,"ERROR OCCURED WHILE CREATING ADMIN") 
    }
} 
try{
    for(server_num=0;server_num<totalNumberOfPorts;server_num++){
        // const wss = new WebSocket.Server({ port:first_port+ server_num });
        
        const wss = new WebSocket.Server({ port:first_port+ server_num });
        servers.push(wss); 
        let mpp=new Map();
        mpp.set(0,0);
        servers_config.socketMapping.push(mpp)
        
        wss.on('connection',(ws,request) => {
            // console.log(server_mw.authenticateConnection(request));
            const result=server_mw.authenticateConnection(ws,request);
        });
    }
}catch(err){
    console.log()
}

app.post("/",(req,res)=>{
    
    res.send("HELLO FROM SERVER");
    
})
app.use("/personal/api/auth",auth_routes); 
app.use("/personal/api/group",group_routes);
