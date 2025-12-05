import { n as __require, t as __commonJS } from "../_chunks/Bqks5huO.mjs";

//#region node_modules/.pnpm/commondir@1.0.1/node_modules/commondir/index.js
var require_commondir = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/commondir@1.0.1/node_modules/commondir/index.js": ((exports, module) => {
	var path = __require("path");
	module.exports = function(basedir, relfiles) {
		if (relfiles) var files = relfiles.map(function(r) {
			return path.resolve(basedir, r);
		});
		else var files = basedir;
		var res = files.slice(1).reduce(function(ps, file) {
			if (!file.match(/^([A-Za-z]:)?\/|\\/)) throw new Error("relative path without a basedir");
			var xs = file.split(/\/+|\\+/);
			for (var i = 0; ps[i] === xs[i] && i < Math.min(ps.length, xs.length); i++);
			return ps.slice(0, i);
		}, files[0].split(/\/+|\\+/));
		return res.length > 1 ? res.join("/") : "/";
	};
}) });

//#endregion
export { require_commondir as t };