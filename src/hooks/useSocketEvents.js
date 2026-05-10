import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import socket from '@/socket';

/**
 * Hook to listen for Socket.io events and invalidate React Query caches.
 * Attach this once in the top-level layout so all pages benefit from real-time updates.
 */
export function useSocketEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onTaskChange = (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data?.projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    };

    const onProjectChange = () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    };

    const onReportChange = (data) => {
      queryClient.invalidateQueries({ queryKey: ['hourenso', data?.projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    };

    const onGlossaryChange = () => {
      queryClient.invalidateQueries({ queryKey: ['glossary'] });
      queryClient.invalidateQueries({ queryKey: ['glossaryPage'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    };

    socket.on('task:created', onTaskChange);
    socket.on('task:updated', onTaskChange);
    socket.on('task:deleted', onTaskChange);
    socket.on('project:created', onProjectChange);
    socket.on('project:updated', onProjectChange);
    socket.on('project:deleted', onProjectChange);
    socket.on('report:created', onReportChange);
    socket.on('report:updated', onReportChange);
    socket.on('report:deleted', onReportChange);
    socket.on('glossary:changed', onGlossaryChange);

    return () => {
      socket.off('task:created', onTaskChange);
      socket.off('task:updated', onTaskChange);
      socket.off('task:deleted', onTaskChange);
      socket.off('project:created', onProjectChange);
      socket.off('project:updated', onProjectChange);
      socket.off('project:deleted', onProjectChange);
      socket.off('report:created', onReportChange);
      socket.off('report:updated', onReportChange);
      socket.off('report:deleted', onReportChange);
      socket.off('glossary:changed', onGlossaryChange);
    };
  }, [queryClient]);
}
