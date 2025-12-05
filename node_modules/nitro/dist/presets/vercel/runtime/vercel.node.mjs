import "#nitro-internal-pollyfills";
import { toNodeHandler } from "srvx/node";
import { useNitroApp } from "nitro/app";
const nitroApp = useNitroApp();
const handler = toNodeHandler(nitroApp.fetch);
export default function nodeHandler(req, res) {
	const query = req.headers["x-now-route-matches"];
	if (query) {
		const url = new URLSearchParams(query).get("url");
		if (url) {
			req.url = decodeURIComponent(url);
		}
	}
	return handler(req, res);
}
