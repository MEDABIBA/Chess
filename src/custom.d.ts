declare module "*.css";
declare module "*.png";
declare module "*.mp3" {
  const src: string;
  export default src;
}
