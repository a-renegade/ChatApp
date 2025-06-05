import {create} from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
// import WebSocket from 'ws';
export const useAuthStore= create((set,get)=>({
    authUser:null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,

    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    checkAuth: async ()=>{
        try{
            const res=await axiosInstance.get("/auth/check");
            // console.log(res);
            set({ authUser : res.data })
            set({ isCheckingAuth : false});
            get().connectSocket();
        } catch (err) {
            console.log("Error in checkAuth",err );
            set({ authUser : null });
            set({ isCheckingAuth : false});
        }
    },
    signUp: async (data)=>{
        set({ isSigningUp : true});
        try{
            
            const res=await axiosInstance.post("/auth/signup",data);

            set({ authUser : res.data });
            // get().connectSocket();
        }catch(error){
            console.log(error.response);
            toast.error(error.response.data.message);
        }finally{
            set({ isSigningUp : false});
        }
    },

    login: async (data)=>{
        set({ isLoggingIn : true});
        try{
            
            const res=await axiosInstance.post("/auth/signin",data);

            set({ authUser : res.data });
            // get().connectSocket();
        }catch(error){
            toast.error(error.response.data.message);
        }finally{
            set({ isLoggingIn : false});
        }
    },
    logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          set({ authUser: null });
          toast.success("Logged out successfully");
        //   get().disconnectSocket();
        } catch (error) {
          toast.error(error.response.data.message);
        }
    },
    connectSocket: () => {

        const { authUser } = get();
        if (!authUser ) return;
        const socket = new WebSocket('ws://localhost:50001');
        socket.onopen = () => {
            console.log('Connected to WebSocket');
        };

        socket.onmessage = (event) => {
            console.log('Message from server:', event.data);
        };
        // socket.send("hello from client");
        socket.onclose = () => {
            console.log('WebSocket closed');
        };
        
    },
}));

