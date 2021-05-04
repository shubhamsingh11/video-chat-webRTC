import React, { createContext , useRef , useState , useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();

const socket = io('http://localhost:5000');

const ContextProvider = ({children}) => {
    const [stream , setStream] = useState();
    const [me , setMe] = useState('');
    const [call , setCall] = useState({})
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded , setCallEnded ] = useState(false);
    const [name, setName] = useState('');

    const myVideo = useRef()
    const userVideo = useRef()
    const connectionRef = useRef()

    useEffect(() => {
        //Ask for access for video and audio from user
        navigator.mediaDevices.getUserMedia({video: true, audio: true})
                 .then((currentStream) => {
                    setStream(currentStream);

                    myVideo.current.srcObject = currentStream;
                 });
                 
        //Listening for specific action
        socket.on('me', (id) => setMe(id));

        socket.on('callUser', ({from , name : callerName , signal }) => { 
            setCall({ isReceivingCall : true , from , name : callerName , signal }) //signal is the strength of the signal
        });
    }, []);

    const answerCall = () => {
        setCallAccepted(true)
        const peer = new Peer ({ initiator : false , trickle : false , stream})

        peer.on('signal',(data) => {
            //Using socket intetwined with our peer to establish that video connection
            socket.emit('answerCall', {signal : data , to : call.from })
        })

        peer.on('stream', (currentStream) =>{
            //Stream for the other user
            userVideo.current.srcObject = currentStream;
        })

        peer.signal(call.signal);

        //Current connection is set for the current peer inside this connection
        connectionRef.current = peer;

    }

    const callUser = (id) => {
        const peer = new Peer ({ initiator : true , trickle : false , stream})
        peer.on('signal', (data) => {
            socket.emit('callUser',{userToCall : id , signalData : data , from : me, name});
        });
        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream;
        });

        socket.on('callAccepted', (signal) => {
            setCallAccepted(true);

            peer.signal(signal);

            
        })
        connectionRef.current = peer;
    }

    const leaveCall = () => {
        setCallEnded(true);

        connectionRef.current.destroy();

        //Reloads the page and provides a new id at line 31
        window.location.reload();
    }

    return (
        <SocketContext.Provider value={{call,callAccepted,myVideo,userVideo,stream,name,setName,callEnded,me,callUser,leaveCall,answerCall}}>
            {children}
        </SocketContext.Provider>
    )
}

export { ContextProvider , SocketContext }