const getTargetSquare = (e: any) => {
  const dropTarget = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
  return dropTarget?.closest(".square") as HTMLElement | null;
};
export default getTargetSquare;
