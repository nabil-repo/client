import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        socket.on('receiveMessage', (messageData) => {
            setMessages((prevMessages) => [...prevMessages, messageData]);
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, []);

    const sendMessage = () => {
        if (message.trim()) {
            const messageData = { sender: 'User1', content: message };
            socket.emit('sendMessage', messageData);
            setMessage('');
        }
    };

    return (
        <div>
            <h2>Chat Room</h2>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.sender}</strong>: {msg.content}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}
