// src/hooks/useNewRecipeAlerts.js
// Listens for "recipe:new" on the socket and keeps a list of popups to show.
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../contexts/SocketContext.jsx';

const POPUP_SECONDS = 15;

export function useNewRecipeAlerts() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [alerts, setAlerts] = useState([]);

  const dismiss = useCallback(
    (id) => setAlerts((list) => list.filter((a) => a.id !== id)),
    []
  );

  useEffect(() => {
    if (!socket) return;

    const onNewRecipe = (recipe) => {
      setAlerts((list) => [...list, recipe]);
      // The home page list refetches so the new card appears too
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Popups clear themselves after a while
      setTimeout(() => dismiss(recipe.id), POPUP_SECONDS * 1000);
    };

    socket.on('recipe:new', onNewRecipe);
    return () => socket.off('recipe:new', onNewRecipe);
  }, [socket, queryClient, dismiss]);

  // Logging out (no socket) hides any open popups
  return { alerts: socket ? alerts : [], dismiss };
}
