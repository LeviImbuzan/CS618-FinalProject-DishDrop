// src/contexts/SocketContext.jsx
// Opens an authenticated Socket.io connection while a user is logged in,
// and closes it when they log out.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

// In development the socket goes through Vite's proxy (same origin). A
// production build talks to the backend's origin, taken from its API URL.
const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
const SOCKET_URL = backendUrl.startsWith('http')
  ? new URL(backendUrl).origin
  : undefined;

const SocketContext = createContext({ socket: null, status: 'waiting' });

export function SocketContextProvider({ children }) {
  const { token } = useAuth();

  // One socket per login. The JWT travels in the handshake, and the server
  // checks it before accepting the connection.
  const socket = useMemo(
    () =>
      token ? io(SOCKET_URL, { auth: { token }, autoConnect: false }) : null,
    [token]
  );

  // Status is remembered per socket, so a new login starts at "connecting"
  const [state, setState] = useState({ socket: null, status: 'waiting' });

  useEffect(() => {
    if (!socket) return;
    const update = (status) => setState({ socket, status });
    socket.on('connect', () => update('connected'));
    socket.on('disconnect', () => update('disconnected'));
    socket.on('connect_error', () => update('error'));
    socket.connect();
    // Runs on logout (new token) or unmount
    return () => socket.disconnect();
  }, [socket]);

  let status = 'waiting';
  if (socket) status = state.socket === socket ? state.status : 'connecting';

  return (
    <SocketContext.Provider value={{ socket, status }}>
      {children}
    </SocketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket() {
  return useContext(SocketContext);
}
