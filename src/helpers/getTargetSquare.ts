const getTargetSquare = (e: any) => {
  if (!e.clientX || !e.clientY) return null;
  const dropTarget = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
  return dropTarget?.closest(".square") as HTMLElement | null;
};
export default getTargetSquare;
