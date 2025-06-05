const servers_config=require("../config/servers.config")
const server_model=require("../models/server_model")
const unstMessage_model=require("../models/unsent_messages.model")
const WebSocket = require('ws');
const saveUnstMessage=async (ws,messageObject)=>{
    ws.send(JSON.stringify({
        message: "Receiver is offline",
        receiver:messageObject.userID
    }));
    const unstMessageSaved=await unstMessage_model.create(messageObject);
    return unstMessageSaved;
}
const sendMessage=async (ws,messageObject) => {
    try{
        console.log('Received message on websocket from:',messageObject);
        const receiver=await server_model.findOne({userID:messageObject.userID});
        if(!receiver){
            console.log("receiver not found for:",messageObject);
            return true;
        }
        // console.log("receiver->",receiver);
        // if(receiver.status==="DISCONNECTED"){
        //     ws.send(JSON.stringify({
        //         message: "Receiver is offline",
        //         receiver:messageObject.userID
        //     }));
        //     const unstMessageSaved=await unstMessage_model.create(messageObject);
        //     console.log("Receiver is offline message saved:",unstMessageSaved);
        //     return true;
        // }
        const ws_receiver=servers_config.socketMapping[receiver.server_number-50000].get(receiver.userID);
        if(!ws_receiver){
            await saveUnstMessage(ws,messageObject);
            console.log("receiver ka socket hi nhi bana hai")
            return false;
        }
        if(ws_receiver.readyState !== WebSocket.OPEN){
            const unstMessageSaved=await saveUnstMessage(ws,messageObject);
            console.log("Receiver is offline message saved:",unstMessageSaved);
            return false;
        }
        ws_receiver.send(JSON.stringify(messageObject));  
        console.log("Message delivered successfully",messageObject);
        if(!messageObject.unsentMessage)ws.send(JSON.stringify({ 
            message: "Message delivered successfully",
            receiver:messageObject.userID
            }))
        return true;
    }catch(err){
        // await server_model.updateOne({ userID: request.details.userID }, { $set: { status: "DISCONNECTED" } });
        // await server_model.updateOne({ userID: messageObject.userID }, { $set: { status: "DISCONNECTED" } });
        console.log("Error occured while processing message",err);
        ws.send(JSON.stringify({ message: `Error occured while sending message`,messageObject}));
        return ws.close();
    }
        
}

module.exports={
    sendMessage:sendMessage
}