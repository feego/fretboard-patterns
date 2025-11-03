// TypeScript configuration for Vanilla Extract
declare module "*.css" {
  const styles: Record<string, string>;
  export default styles;
}

declare module "*.css.ts" {
  const styles: Record<string, string>;
  export = styles;
}