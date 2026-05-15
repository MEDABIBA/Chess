export default function maybeReverse<T>(arr: T[], condition: boolean) {
  return condition ? arr.slice().reverse() : arr;
}
