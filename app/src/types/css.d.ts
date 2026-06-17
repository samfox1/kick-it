// Allow side-effect and module CSS imports (used by Expo web / NativeWind-style templates).
declare module '*.css';
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
