import notify from '../components/ui/notify';

export const checkValidValue = (value: string) => {
  const trimmed = value.trim();
  if (value.length === 0) {
    notify('Field cant be empty', 'error');
    return false;
  } else if (!/^[A-Za-z0-9 ]{1,30}$/.test(trimmed)) {
    notify('Maximum 30 characters (Latin letters only)', 'error');
    return false;
  }
  return true;
};

export default checkValidValue;
