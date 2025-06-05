const server_model=require("../models/server_model")
const group_model=require("../models/group.model")
const unstMessage_model=require("../models/unsent_messages.model")
const socket_controller=require("./sendMessage")

const socketController=async (ws,request)=>{
    
    try{

        ws.send(JSON.stringify({ message: 'Welcome to WebSocket server!' }));
        const unstMessages=await unstMessage_model.find({userID:request.details.userID});
        let isSocketActive=true;
        for (const singleMessage of unstMessages) {
            // let messageObject=singleMessage;
            // messageObject.unsentMessage=true;
            const messageObject = {
                // id:singleMessage.message_id,
                from:singleMessage.from,
                userID:singleMessage.userID,
                message:singleMessage.message,
                unsentMessage:true,
            };
            
            isSocketActive=await socket_controller.sendMessage(ws,messageObject);
            await unstMessage_model.deleteOne(singleMessage);
            if(!isSocketActive)break;
        }
        ws.on('message',async(messageArrived)=>{
            ws.send(JSON.stringify({ message: `message received on server` }));
            const messageObject = JSON.parse(messageArrived);
            messageObject.from=request.details.userID;
            if(!messageObject.message){
                console.log("MESSAGE is empty");
                ws.send(JSON.stringify({ message: "message is empty" }))
                return;
            }
            if(messageObject.userID){
                socket_controller.sendMessage(ws,messageObject);
            }else if(messageObject.groupID){
                const groupDetails=await group_model.findOne({groupID:messageObject.groupID,members:request.details.userID});
                if(groupDetails){
                    const groupMembers=groupDetails.members;
                    await Promise.all(
                        groupMembers
                        .filter(member => member !== request.details.userID)
                        .map(async (member) => {
                            const singleMessageObject = {
                                fromGroup:groupDetails.groupID,
                                from:request.details.userID,
                                userID:member,
                                message:messageObject.message,
                            };
                            await socket_controller.sendMessage(ws,singleMessageObject);
                        })
                    )
                    
                }else{
                    console.log("No group found with provided credentials");
                    ws.send(JSON.stringify({ message: "No group found with provided credentials" }))
                    return;
                }
            }else{
                console.log("receiver not provided");
                ws.send(JSON.stringify({ message: "receiver not provided" }))
                return;
            }
        });
        
        ws.on('close',async () => {
            // (servers_config.socketMapping[request.socket.localPort-50000]).delete(request.details.userID);
            // await server_model.updateOne({ userID: request.details.userID }, { $set: { status: "DISCONNECTED" } });
            console.log('A client disconnected');
            return;
        });
    }catch(err){
        // (servers_config.socketMapping[request.socket.localPort-50000]).delete(request.details.userID);
        // await server_model.updateOne({ userID: request.details.userID }, { $set: { status: "DISCONNECTED" } }); 
        console.log("Error Occured on connection request",err);
        return ws.close();
    }
    
}

module.exports={
    socketController:socketController,
}
