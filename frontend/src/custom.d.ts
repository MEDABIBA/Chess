declare module '*.css';
declare module '*.png';
declare module '*.svg';
declare module '*.mp3' {
  const src: string;
  export default src;
}
