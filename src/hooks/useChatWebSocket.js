import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function useChatWebSocket(username, setMessages) {
  const clientRef = useRef(null);

  useEffect(() => {
    console.log("Connecting to WebSocket at:", process.env.REACT_APP_WEBSOCKET_URL);
    const socket = new SockJS(process.env.REACT_APP_WEBSOCKET_URL);
    
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ Connected to WebSocket');
        client.subscribe('/topic/public', (msg) => {
          const body = JSON.parse(msg.body);
          setMessages(prev => [...prev, body]);
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [username, setMessages]);

 const sendMessage = (messageObj) => {
  if (clientRef.current && clientRef.current.connected) {
    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(messageObj),
    });
  }
};


  return { sendMessage };
}
