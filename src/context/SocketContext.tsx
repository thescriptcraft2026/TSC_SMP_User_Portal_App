import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { addMessage } from '../redux/slices/chatSlice';
import Config from 'react-native-config';

const DEFAULT_SOCKET_URL = 'https://betatscapi.thescriptcraft.com';
const SOCKET_URL = Config.SOCKET_URL || DEFAULT_SOCKET_URL;

interface TypingUser {
  chat_id: string;
  sender_id: number;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (data: any) => void;
  emitTyping: (data: any) => void;
  emitStopTyping: (data: any) => void;
  markMessageAsRead: (data: any) => void;
  typingUsers: Map<string, TypingUser>;
  onlineUsers: Set<number>;
  notificationCount: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: number | null;
}) => {
  const dispatch = useDispatch();

  const socketRef = useRef<Socket | null>(null);
  const typingTimeouts = useRef<NodeJS.Timeout[]>([]);

  const [isConnected, setIsConnected] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(
    new Map(),
  );

  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!userId) {
      console.log('⛔ No userId for socket');
      return;
    }

    console.log('🔥 SOCKET INIT FOR USER:', userId);

    // ✅ prevent multiple socket instances
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: false,
        autoConnect: false,
      });
    }

    const socket = socketRef.current;

    if (!socket.connected) {
      socket.connect();
    }

    /* ---------------- CONNECT ---------------- */

    const onConnect = () => {
      console.log('✅ SOCKET CONNECTED');

      setIsConnected(true);
      console.log('JOINING ROOM:', String(userId));
      socket.emit('join', String(userId));
    };

    /* ---------------- DISCONNECT ---------------- */

    const onDisconnect = () => {
      console.log('❌ SOCKET DISCONNECTED');

      setIsConnected(false);
    };

    /* ---------------- NEW MESSAGE ---------------- */

    const onNewMessage = (data: any) => {
      console.log('📩 SOCKET NEW MESSAGE:', data);
      console.log('🔥 SOCKET NEW MESSAGE:', JSON.stringify(data, null, 2));

      const normalizedMessage = {
        id: data.id,

        tempId: data.tempId || null,

        message: data.message || '',

        file: data.file || null,

        sender_id: Number(data.sender_id),

        receiver_id: Number(data.receiver_id),

        chat_id: data.chat_id,

        is_read: data.is_read || false,

        isEdited: data.isEdited || false,

        message_type: data.message_type || (data.file ? 'image' : 'text'),

        createdAt:
          data.createdAt || data.created_at || new Date().toISOString(),
      };

      // ✅ CHAT ROOM
      dispatch(addMessage(normalizedMessage));

      // ✅ CHAT LIST
      dispatch({
        type: 'chat/updateChatListFromSocket',
        payload: normalizedMessage,
      });
    };

    /* ---------------- USER STATUS ---------------- */

    const onUserStatus = ({ user_id, is_online }: any) => {
      console.log('USER STATUS:', user_id, is_online);

      setOnlineUsers(prev => {
        const updated = new Set(prev);

        if (is_online) {
          updated.add(Number(user_id));
        } else {
          updated.delete(Number(user_id));
        }

        return updated;
      });
    };

    /* ---------------- TYPING ---------------- */

    const onTyping = (data: TypingUser) => {
      const key = `${data.chat_id}_${data.sender_id}`;

      setTypingUsers(prev => {
        const updated = new Map(prev);

        updated.set(key, data);

        return updated;
      });

      const timeout = setTimeout(() => {
        setTypingUsers(prev => {
          const updated = new Map(prev);

          updated.delete(key);

          return updated;
        });
      }, 2000);

      typingTimeouts.current.push(timeout);
    };

    const onStopTyping = (data: TypingUser) => {
      setTypingUsers(prev => {
        const updated = new Map(prev);

        updated.delete(`${data.chat_id}_${data.sender_id}`);

        return updated;
      });
    };

    /* ---------------- SEEN ---------------- */

    const onMessagesSeen = (data: any) => {
      console.log("seen message res", data)
      dispatch({
        type: 'chat/markMessagesSeen',
        payload: data,
      });
    };

    /* ---------------- EDIT ---------------- */

    const onMessageEdited = (data: any) => {
      dispatch({
        type: 'chat/editLocalMessage',
        payload: {
          message_id: data.message_id,
          message: data.message,
        },
      });
    };

    /* ---------------- DELETE ---------------- */

    const onMessageDeleted = (data: any) => {
      dispatch({
        type: 'chat/deleteLocalMessage',
        payload: data.message_id,
      });
    };

    /* ---------------- NOTIFICATION ---------------- */

    const onNotification = (data: any) => {
      console.log('🔔 SOCKET NOTIFICATION:', data);

      // ✅ increase notification badge count
      setNotificationCount(prev => prev + 1);

      // ✅ optional redux dispatch
      dispatch({
        type: 'notification/addNotification',
        payload: data,
      });
    };

    /* ---------------- REGISTER EVENTS ---------------- */

    socket.on('connect', onConnect);

    socket.on('disconnect', onDisconnect);

    const onConnectError = (err: any) => {
      console.log('❌ SOCKET CONNECT ERROR:', err);
    };

    socket.on('connect_error', onConnectError);

    socket.on('new_message', onNewMessage);

    socket.on('notification', onNotification);

    socket.on('user_status', onUserStatus);

    socket.on('typing', onTyping);

    socket.on('stop_typing', onStopTyping);

    socket.on('messages_seen', onMessagesSeen);

    socket.on('message_edited', onMessageEdited);

    socket.on('message_deleted', onMessageDeleted);

    /* ---------------- CLEANUP ---------------- */

    return () => {
      // Clear all typing timeouts
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current = [];

      // Remove all listeners
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('new_message', onNewMessage);
      socket.off('notification', onNotification);
      socket.off('user_status', onUserStatus);
      socket.off('typing', onTyping);
      socket.off('stop_typing', onStopTyping);
      socket.off('messages_seen', onMessagesSeen);
      socket.off('message_edited', onMessageEdited);
      socket.off('message_deleted', onMessageDeleted);

      // Disconnect socket completely
      socket.removeAllListeners();
      socket.disconnect();

      // Reset socket reference
      socketRef.current = null;
    };
  }, [userId]);

  /* ---------------- SEND MESSAGE ---------------- */

  const sendMessage = (data: any) => {
    socketRef.current?.emit('new_message', data);
  };

  const emitTyping = (data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', data);
    }
  };

  const emitStopTyping = (data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('stop_typing', data);
    }
  };

  const markMessageAsRead = (data: any) => {
    socketRef.current?.emit('messages_seen', data);
  };

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      isConnected,
      notificationCount,
      sendMessage,
      emitTyping,
      emitStopTyping,
      markMessageAsRead,
      typingUsers,
      onlineUsers,
    }),
    [isConnected, notificationCount, typingUsers, onlineUsers],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }

  return context;
};
