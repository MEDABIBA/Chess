import { Socket } from 'socket.io-client';
import notify from '../components/ui/notify';

const onSocket = <T>(
  socket: Socket,
  event: string,
  handler: (data: T) => void,
) => {
  socket?.on(event, (res: T | { error: string }) => {
    if ('error' in (res as unknown as object)) {
      notify((res as { error: string }).error, 'error');
    } else {
      handler(res as T);
    }
  });
};
export default onSocket;
