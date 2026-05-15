const parseTimer = (time: string) => {
  let initialTime = 0;
  let additionalTime = 0;
  if (time.includes('+')) {
    const res = time.split('+');
    if (res[0] && res[1]) {
      initialTime = Number(res[0]) * 60; // into a seconds
      additionalTime = Number(res[1]);
    }
  } else {
    initialTime = Number(time) * 60; // into a seconds
  }
  return {
    initialTime,
    additionalTime,
  };
};
export default parseTimer;
