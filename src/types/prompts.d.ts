declare module 'prompts' {
  interface PromptObject {
    type: string;
    name: string;
    message: string;
    choices?: Array<{ title: string; description?: string; value: any }>;
    initial?: number | boolean | string;
    stdout?: NodeJS.WriteStream;
  }

  interface Options {
    onCancel?: () => void;
  }

  interface Response {
    [key: string]: any;
  }

  function prompts<T = Response>(questions: PromptObject | PromptObject[], options?: Options): Promise<T>;

  export default prompts;
}