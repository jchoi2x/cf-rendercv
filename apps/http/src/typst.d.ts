declare module "*.typ" {
  const content: string;
  export default content;
}

declare module "*.j2.typ" {
  const content: string;
  export default content;
}

declare module "@jchoi2x/minijinja/minijinja_bg.wasm" {
  const content: WebAssembly.Module;
  export default content;
}
