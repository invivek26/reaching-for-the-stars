import { t as __commonJS } from "../_chunks/Bqks5huO.mjs";

//#region node_modules/.pnpm/path-parse@1.0.7/node_modules/path-parse/index.js
var require_path_parse = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/path-parse@1.0.7/node_modules/path-parse/index.js": ((exports, module) => {
	var isWindows = process.platform === "win32";
	var splitWindowsRe = /^(((?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?[\\\/]?)(?:[^\\\/]*[\\\/])*)((\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))[\\\/]*$/;
	var win32 = {};
	function win32SplitPath(filename) {
		return splitWindowsRe.exec(filename).slice(1);
	}
	win32.parse = function(pathString) {
		if (typeof pathString !== "string") throw new TypeError("Parameter 'pathString' must be a string, not " + typeof pathString);
		var allParts = win32SplitPath(pathString);
		if (!allParts || allParts.length !== 5) throw new TypeError("Invalid path '" + pathString + "'");
		return {
			root: allParts[1],
			dir: allParts[0] === allParts[1] ? allParts[0] : allParts[0].slice(0, -1),
			base: allParts[2],
			ext: allParts[4],
			name: allParts[3]
		};
	};
	var splitPathRe = /^((\/?)(?:[^\/]*\/)*)((\.{1,2}|[^\/]+?|)(\.[^.\/]*|))[\/]*$/;
	var posix = {};
	function posixSplitPath(filename) {
		return splitPathRe.exec(filename).slice(1);
	}
	posix.parse = function(pathString) {
		if (typeof pathString !== "string") throw new TypeError("Parameter 'pathString' must be a string, not " + typeof pathString);
		var allParts = posixSplitPath(pathString);
		if (!allParts || allParts.length !== 5) throw new TypeError("Invalid path '" + pathString + "'");
		return {
			root: allParts[1],
			dir: allParts[0].slice(0, -1),
			base: allParts[2],
			ext: allParts[4],
			name: allParts[3]
		};
	};
	if (isWindows) module.exports = win32.parse;
	else module.exports = posix.parse;
	module.exports.posix = posix.parse;
	module.exports.win32 = win32.parse;
}) });

//#endregion
export { require_path_parse as t };