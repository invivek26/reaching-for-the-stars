import { E as normalizeWindowsPath, w as join } from "./c12.mjs";

//#region node_modules/.pnpm/pathe@2.0.3/node_modules/pathe/dist/utils.mjs
const pathSeparators = /* @__PURE__ */ new Set([
	"/",
	"\\",
	void 0
]);
const normalizedAliasSymbol = Symbol.for("pathe:normalizedAlias");
function normalizeAliases(_aliases) {
	if (_aliases[normalizedAliasSymbol]) return _aliases;
	const aliases = Object.fromEntries(Object.entries(_aliases).sort(([a], [b]) => _compareAliases(a, b)));
	for (const key in aliases) for (const alias in aliases) {
		if (alias === key || key.startsWith(alias)) continue;
		if (aliases[key]?.startsWith(alias) && pathSeparators.has(aliases[key][alias.length])) aliases[key] = aliases[alias] + aliases[key].slice(alias.length);
	}
	Object.defineProperty(aliases, normalizedAliasSymbol, {
		value: true,
		enumerable: false
	});
	return aliases;
}
function resolveAlias(path, aliases) {
	const _path = normalizeWindowsPath(path);
	aliases = normalizeAliases(aliases);
	for (const [alias, to] of Object.entries(aliases)) {
		if (!_path.startsWith(alias)) continue;
		if (hasTrailingSlash(_path[(hasTrailingSlash(alias) ? alias.slice(0, -1) : alias).length])) return join(to, _path.slice(alias.length));
	}
	return _path;
}
function _compareAliases(a, b) {
	return b.split("/").length - a.split("/").length;
}
function hasTrailingSlash(path = "/") {
	const lastChar = path[path.length - 1];
	return lastChar === "/" || lastChar === "\\";
}

//#endregion
export { resolveAlias as t };