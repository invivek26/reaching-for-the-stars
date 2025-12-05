import "#nitro-internal-pollyfills";
import { useNitroApp } from "nitro/app";
const nitroApp = useNitroApp();
export default { fetch(req, context) {
	// Check for ISR request
	const query = req.headers.get("x-now-route-matches");
	if (query) {
		const urlParam = new URLSearchParams(query).get("url");
		if (urlParam) {
			const url = new URL(decodeURIComponent(urlParam), req.url).href;
			req = new Request(url, req);
		}
	}
	// srvx compatibility
	req.runtime ??= { name: "vercel" };
	// @ts-expect-error (add to srvx types)
	req.runtime.vercel = { context };
	req.waitUntil = context?.waitUntil;
	return nitroApp.fetch(req);
} };
