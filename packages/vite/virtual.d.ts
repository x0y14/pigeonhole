declare module "virtual:pigeonhole/components" {
  export const components: Record<string, (props: Record<string, unknown>, children: string) => string | Promise<string>>;
  export const propsSchemas: Record<string, import("@pigeonhole/render").PropsSchema>;
}

declare module "virtual:pigeonhole/client" {
  export const islands: Record<string, string>;
}
