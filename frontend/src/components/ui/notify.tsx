import { toast, TypeOptions } from 'react-toastify';
import { Toastify } from './Toastify';

const notify = (
  message: string,
  type: TypeOptions,
  action?: (res: boolean) => void,
) => {
  let resolved = false;
  const resolve = (res: boolean) => {
    if (resolved) return;
    resolved = true;
    action?.(res);
  };
  if (type === 'default') {
    toast(<Toastify message={message} {...(action && { resolve })} />, {
      onClose: () => resolve(false),
    });
  } else {
    toast[type](<Toastify message={message} {...(action && { resolve })} />, {
      onClose: () => resolve(false),
    });
  }
};
export default notify;
