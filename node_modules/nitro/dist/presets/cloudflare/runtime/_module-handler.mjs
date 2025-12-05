import "#nitro-internal-pollyfills";
import { runCronTasks } from "nitro/~internal/runtime/task";
import { useNitroApp, useNitroHooks } from "nitro/app";
export function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			const ctxExt = {};
			const url = new URL(request.url);
			// Preset-specific logic
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) {
					return res;
				}
			}
			return fetchHandler(request, env, context, url, nitroApp, ctxExt);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}));
			if (import.meta._tasks) {
				context.waitUntil(runCronTasks(controller.cron, {
					context: { cloudflare: {
						env,
						context
					} },
					payload: {}
				}));
			}
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}));
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}));
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}));
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}));
		}
	};
}
export async function fetchHandler(cfReq, env, context, url = new URL(cfReq.url), nitroApp = useNitroApp(), ctxExt) {
	// Expose latest env to the global context
	globalThis.__env__ = env;
	// srvx compatibility
	const req = cfReq;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare ??= {
		context,
		env
	};
	req.waitUntil = context.waitUntil.bind(context);
	return nitroApp.fetch(req);
}
