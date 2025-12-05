import "#nitro-internal-pollyfills";
import type * as CF from "@cloudflare/workers-types";
import type { ExportedHandler } from "@cloudflare/workers-types";
type MaybePromise<T> = T | Promise<T>;
export declare function createHandler<Env>(hooks: {
	fetch: (...params: [...Parameters<NonNullable<ExportedHandler<Env>["fetch"]>>, url: URL, cfContextExtras: any]) => MaybePromise<Response | CF.Response | undefined>;
}): {
	fetch(request, env, context);
	scheduled(controller, env, context);
	email(message, env, context);
	queue(batch, env, context);
	tail(traces, env, context);
	trace(traces, env, context);
};
export declare function fetchHandler(cfReq: Request | CF.Request, env: unknown, context: CF.ExecutionContext | DurableObjectState, url: URL, nitroApp, ctxExt: any);
export {};
