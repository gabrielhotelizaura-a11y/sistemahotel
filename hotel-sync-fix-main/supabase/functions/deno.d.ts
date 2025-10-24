/// <reference lib="deno.ns" />

// Type definitions for Deno global - env is already declared in lib.deno.ns.d.ts
// We just add type safety for the methods we use

// Type definitions for serve function
declare module "https://deno.land/std@0.168.0/http/server.ts" {
    export interface ServeInit {
        port?: number;
        hostname?: string;
        signal?: AbortSignal;
        onError?: (error: unknown) => Response | Promise<Response>;
        onListen?: (params: { hostname: string; port: number }) => void;
    }

    export function serve(
        handler: (request: Request) => Response | Promise<Response>,
        options?: ServeInit
    ): Promise<void>;
}

// Type definitions for Supabase JS
declare module "https://esm.sh/@supabase/supabase-js@2" {
    export * from "@supabase/supabase-js";
}
