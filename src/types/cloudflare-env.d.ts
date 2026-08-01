export {};

declare global {
  interface CloudflareEnv {
    AI_ASSIST_ENABLED?: string;
    AI_RATE_LIMITER?: {
      limit: (options: { key: string }) => Promise<{ success: boolean }>;
    };
    AI?: {
      run: (
        model: string,
        input: {
          messages: Array<{ role: "system" | "user"; content: string }>;
          response_format?: unknown;
          max_tokens?: number;
          temperature?: number;
        },
      ) => Promise<unknown>;
    };
  }
}
