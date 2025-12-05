import "#nitro-internal-pollyfills";
import wsAdapter from "crossws/adapters/cloudflare";
import { useNitroApp } from "nitro/app";
import { isPublicAssetURL } from "#nitro-internal-virtual/public-assets";
import { runCronTasks } from "nitro/~internal/runtime/task";
import { resolveWebsocketHooks } from "nitro/~internal/runtime/app";
import { hasWebSocket } from "#nitro-internal-virtual/feature-flags";
const nitroApp = useNitroApp();
const ws = hasWebSocket ? wsAdapter({ resolve: resolveWebsocketHooks }) : undefined;
export default {
	async fetch(cfReq, env, context) {
		// srvx compatibility
		const req = cfReq;
		req.runtime ??= { name: "cloudflare" };
		req.runtime.cloudflare ??= {
			context,
			env
		};
		req.waitUntil = context.waitUntil.bind(context);
		// Websocket upgrade
		// https://crossws.unjs.io/adapters/cloudflare
		if (hasWebSocket && cfReq.headers.get("upgrade") === "websocket") {
			return ws.handleUpgrade(cfReq, env, context);
		}
		const url = new URL(cfReq.url);
		if (env.ASSETS && isPublicAssetURL(url.pathname)) {
			return env.ASSETS.fetch(cfReq);
		}
		// Expose latest env to the global context
		globalThis.__env__ = env;
		return nitroApp.fetch(req);
	},
	scheduled(event, env, context) {
		if (import.meta._tasks) {
			globalThis.__env__ = env;
			context.waitUntil(runCronTasks(event.cron, {
				context: { cloudflare: {
					env,
					context
				} },
				payload: {}
			}));
		}
	}
};
