import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from "socket.io-client";
import Peer from 'simple-peer';

const SocketContext = createContext();
const socket = io("http://localhost:5000");

const ContextProvider = ({ children}) => {
    const [stream, setStream] = useState(null);
    const [me, setMe] = useState("");
    const [call, setCall] = useState({});
    const [name, setName] = useState("");
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);

    const myVideo = useRef();
    const connectionRef = useRef();
    const userVideo = useRef();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((currentStream) => {
            setStream(currentStream);
            myVideo.current.srcObject = currentStream;
        })

        socket.on('me', (id) => {
            setMe(id);    
        });
        socket.on('calluser', ({ from, name: callerName, signalData}) => {
            console.log({ from, name: callerName, signalData})
            setCall({ isReceivedCall: true, from, name: callerName, signalData })
        })
    }, []);
    
    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({ initiator: false, trickle: false, stream });
        console.log('answerCall')
        peer.on('signal', (data) => {
            socket.emit('answercall', { signal: data, to: call.from });
        });

        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream;
        });
        console.log(call)
        peer.signal(call.signalData);
        connectionRef.current = peer;
    };

    const callUser = (id) => {
        const peer = new Peer({ initiator: true, trickle: false, stream });

        console.log('callUser')
        peer.on('signal', (data) => {
            console.log(data);
            console.log({ userToCall: id, signal: data, from: me })
            socket.emit('calluser', { userToCall: id, name, signalData: data, from: me });
        });

        peer.on('stream', (currentStream) => {
            console.log('stream')
            userVideo.current.srcObject = currentStream;
        });

        socket.on('callaccepted', (signal) => {
            console.log('callaccepted')
            console.log(signal)
            setCallAccepted(true);
            peer.signal(signal);
        })

        connectionRef.current = peer;
    };
    const leaveCall = () => {
        setCallEnded(true);
        connectionRef.current.destroy();

        window.location.reload();
    };

    return (
        <SocketContext.Provider value={{ 
            call,
            callAccepted,
            myVideo,
            userVideo,
            stream,
            name,
            setName,
            callEnded,
            me,
            leaveCall,
            callUser,
            answerCall
        }}>
            {children}
        </SocketContext.Provider>
    )
}

export { ContextProvider, SocketContext };