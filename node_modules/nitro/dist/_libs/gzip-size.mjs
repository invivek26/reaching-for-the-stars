import { i as __toESM } from "../_chunks/Bqks5huO.mjs";
import { t as require_duplexer } from "./duplexer.mjs";
import fs from "node:fs";
import { promisify } from "node:util";
import zlib from "node:zlib";
import "node:stream";

//#region node_modules/.pnpm/gzip-size@7.0.0/node_modules/gzip-size/index.js
var import_duplexer = /* @__PURE__ */ __toESM(require_duplexer(), 1);
const getOptions = (options) => ({
	level: 9,
	...options
});
const gzip = promisify(zlib.gzip);
async function gzipSize(input, options) {
	if (!input) return 0;
	return (await gzip(input, getOptions(options))).length;
}

//#endregion
export { gzipSize as t };