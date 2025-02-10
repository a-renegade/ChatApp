const server_model=require("../models/server_model")
const jwt=require("jsonwebtoken")
const secret=require("../config/auth.config");
const servers_config=require("../config/servers.config")
const socket_controller=require("./server_socket.controller")
const authenticateConnection=async function(ws,request){
    // return false;
    try{

        
        const token=request.headers['token'];
        if(!token){
            ws.send(JSON.stringify({ message: 'Token not provided' }));
            return ws.close();
        }
        console.log("token for socket:",token)
        
        const token_details=jwt.verify(token,secret.tokenSecret);
        console.log(token_details)
        const serverDetails=await server_model.findOne({userID:token_details.userID});
        
        const port = request.socket.localPort;
        console.log("websocket connection request at:",port);
        console.log("User's server detail:",serverDetails);
        
        if(serverDetails.server_number!=port){
            console.log('Request on wrong server');
            ws.send(JSON.stringify({ message: 'Request on wrong server' }));
            return ws.close();
        }
        // serverDetails.status="CONNECTED";
        request.details=serverDetails;
    }catch(err){
        console.log(err,"Not a valid token for Websocket")
        ws.send(JSON.stringify({ message: 'Not a valid token for Websocket' }));
        return ws.close();
    }
    try{

        
        servers_config.socketMapping[request.socket.localPort-50000].set(request.details.userID,ws)
        await server_model.updateOne({ userID: request.details.userID }, { $set: { status: "CONNECTED" } });
        console.log(request.details.userID);
        return socket_controller.socketController(ws,request);
    }catch(err){
        await server_model.updateOne({ userID: request.details.userID }, { $set: { status: "DISCONNECTED" } });
        console.log(err,"Error occured while mapping webSocket to userID");
        ws.send(JSON.stringify({ message: 'Error occured while mapping webSocket to userID' }))
        return ws.close();
    }
    
}
module.exports={
    authenticateConnection:authenticateConnection,
}