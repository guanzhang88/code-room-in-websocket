import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';

const ChatPage = ({ socket }) => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [typingStatus, setTypingStatus] = useState('');
    const [isRoomIdValid, setIsRoomIdValid] = useState(true);
    const lastMessageRef = useRef(null);

    useEffect(() => {
        socket.on('messageResponse', (data) => setMessages([...messages, data]));
        return () => socket.off('messageResponse', (data) => setMessages([...messages, data]));;
    }, [socket, messages]);

    useEffect(() => {
        // 👇️ 每当消息文字变动，都会往下滚动
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        socket.on('typingResponse', (data) => setTypingStatus(data));
        socket.on('cancelTypingResponse', (data) => setTypingStatus(data));
        socket.on('joinRoomResponse', (data) => {
            if (data) {
                navigate('/chatRoom');
            } else {
                setIsRoomIdValid(false);
            }
        })
        return () => {
            socket.off('typingResponse', (data) => setTypingStatus(data));
            socket.off('cancelTypingResponse', (data) => setTypingStatus(data));
            socket.off('joinRoomResponse', (checked) => {
                if (checked) {
                    navigate('/chatRoom');
                } else {
                    setIsRoomIdValid(false);
                }
            })
        }
    }, [socket]);

    function handleJoinRoom (roomId) {
        socket.emit('joinRoom', { roomId: roomId });
    }

    return (
        <div className="chat">
            <ChatBar socket={socket} handleJoinRoom={handleJoinRoom} isRoomIdValid={isRoomIdValid} />
            <div className="chat__main">
                <ChatBody
                    messages={messages}
                    typingStatus={typingStatus}
                    lastMessageRef={lastMessageRef} />
                <ChatFooter socket={socket} />
            </div>
        </div>
    );
};

export default ChatPage;
