export {};

declare global {
  interface CloudflareEnv {
    AI_ASSIST_ENABLED?: string;
    AI?: {
      run: (
        model: string,
        input: {
          messages: Array<{ role: "system" | "user"; content: string }>;
          max_tokens?: number;
          temperature?: number;
        },
      ) => Promise<unknown>;
    };
  }
}
