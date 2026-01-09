const checkValidNickname = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 && /^[A-Za-z0-9 ]{1,30}$/.test(trimmed);
};

export default checkValidNickname;
