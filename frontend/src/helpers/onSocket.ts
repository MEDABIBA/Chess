import { Socket } from 'socket.io-client';
import notify from '../components/ui/notify';
import { RootStore } from '../store/RootStore';

const onSocket = <T>(
  socket: Socket,
  event: string,
  handler: (data: T) => void,
  store?: RootStore,
) => {
  socket?.on(event, (res: T | { error: string }) => {
    if ('error' in (res as unknown as object)) {
      if ((res as { error: string }).error.includes('user didnt exist')) {
        localStorage.clear();
        store?.navigate('registration-form');
      }
      notify((res as { error: string }).error, 'error');
    } else {
      handler(res as T);
    }
  });
};
export default onSocket;
