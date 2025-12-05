import "#nitro-internal-pollyfills";
import type { ServerRequest } from "srvx";
declare const _default: {
	fetch(req: ServerRequest, context: {
		waitUntil: (promise: Promise<any>) => void;
	});
};
export default _default;
