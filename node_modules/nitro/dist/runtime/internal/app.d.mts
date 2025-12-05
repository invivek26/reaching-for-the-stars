import type { NitroApp, NitroRuntimeHooks } from "nitro/types";
import type { ServerRequest, ServerRequestContext } from "srvx";
import type { H3EventContext, WebSocketHooks } from "h3";
import { HookableCore } from "hookable";
declare global {
	var __nitro__: NitroApp | undefined;
}
export declare function useNitroApp(): NitroApp;
export declare function useNitroHooks(): HookableCore<NitroRuntimeHooks>;
export declare function serverFetch(resource: string | URL | Request, init?: RequestInit, context?: ServerRequestContext | H3EventContext): Promise<Response>;
export declare function resolveWebsocketHooks(req: ServerRequest): Promise<Partial<WebSocketHooks>>;
export declare function fetch(resource: string | URL | Request, init?: RequestInit, context?: ServerRequestContext | H3EventContext): Promise<Response>;
