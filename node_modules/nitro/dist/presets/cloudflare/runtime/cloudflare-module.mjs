import "#nitro-internal-pollyfills";
import wsAdapter from "crossws/adapters/cloudflare";
import { isPublicAssetURL } from "#nitro-internal-virtual/public-assets";
import { createHandler } from "./_module-handler.mjs";
import { resolveWebsocketHooks } from "nitro/~internal/runtime/app";
import { hasWebSocket } from "#nitro-internal-virtual/feature-flags";
const ws = hasWebSocket ? wsAdapter({ resolve: resolveWebsocketHooks }) : undefined;
export default createHandler({ fetch(request, env, context, url) {
	// Static assets fallback (optional binding)
	if (env.ASSETS && isPublicAssetURL(url.pathname)) {
		return env.ASSETS.fetch(request);
	}
	// Websocket upgrade
	// https://crossws.unjs.io/adapters/cloudflare
	if (hasWebSocket && request.headers.get("upgrade") === "websocket") {
		return ws.handleUpgrade(request, env, context);
	}
} });
