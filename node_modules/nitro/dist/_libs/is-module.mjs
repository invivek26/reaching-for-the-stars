import { t as __commonJS } from "../_chunks/Bqks5huO.mjs";

//#region node_modules/.pnpm/is-module@1.0.0/node_modules/is-module/index.js
var require_is_module = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/is-module@1.0.0/node_modules/is-module/index.js": ((exports, module) => {
	var ES6ImportExportRegExp = /(?:^\s*|[}{\(\);,\n]\s*)(import\s+['"]|(import|module)\s+[^"'\(\)\n;]+\s+from\s+['"]|export\s+(\*|\{|default|function|var|const|let|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*))/;
	var ES6AliasRegExp = /(?:^\s*|[}{\(\);,\n]\s*)(export\s*\*\s*from\s*(?:'([^']+)'|"([^"]+)"))/;
	module.exports = function(sauce) {
		return ES6ImportExportRegExp.test(sauce) || ES6AliasRegExp.test(sauce);
	};
}) });

//#endregion
export { require_is_module as t };