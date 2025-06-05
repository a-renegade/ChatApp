const server_model=require("../models/server_model")
const jwt=require("jsonwebtoken")
const servers_config=require("../config/servers.config")
const socket_controller=require("./socket.controller")
require('dotenv/config') 

function parseCookies(cookieHeader = '') {
    return Object.fromEntries(cookieHeader.split(';').map(cookie => {
        const [key, val] = cookie.trim().split('=');
        return [key, decodeURIComponent(val)];
    }));
}
const authenticateConnection=async function(ws,req){
    
    // return false;
    try{

        
        const rawCookies = req.headers.cookie;
        const cookies = parseCookies(rawCookies);
        const token = cookies.jwt;
        
        if(!token){
            ws.send(JSON.stringify({ message: 'Token not provided' }));
            console.log("Token not provided for websoket connection")
            return ws.close();
        }
        console.log("token for socket:",token)
        
        const token_details=jwt.verify(token,process.env.JWT_SECRET);
        console.log(token_details)
        const serverDetails=await server_model.findOne({userID:token_details.userID});
        
        const port = req.socket.localPort;
        console.log("websocket connection requested at:",port);
        console.log("User's server detail:",serverDetails);
        
        if(serverDetails.server_number!=port){
            console.log('Request on wrong server');
            ws.send(JSON.stringify({ message: 'Request on wrong server' }));
            return ws.close();
        }
        // serverDetails.status="CONNECTED";
        req.details=serverDetails;
    }catch(err){
        console.log(err.message,"Not a valid token for Websocket")
        ws.send(JSON.stringify({ message: 'Not a valid token for Websocket' }));
        return ws.close();
    }
    try{

        
        servers_config.socketMapping[req.socket.localPort-50000].set(req.details.userID,ws)
        await server_model.updateOne({ userID: req.details.userID }, { $set: { status: "CONNECTED" } });
        console.log(req.details.userID);
        return socket_controller.socketController(ws,req);
    }catch(err){
        await server_model.updateOne({ userID: req.details.userID }, { $set: { status: "DISCONNECTED" } });
        console.log(err,"Error occured while mapping webSocket to userID");
        ws.send(JSON.stringify({ message: 'Error occured while mapping webSocket to userID' }))
        return ws.close();
    }
    
}
module.exports={
    authenticateConnection:authenticateConnection,
}