//#region node_modules/.pnpm/knitwork@1.2.0/node_modules/knitwork/dist/index.mjs
function genString(input, options = {}) {
	const str = JSON.stringify(input);
	if (!options.singleQuotes) return str;
	return `'${escapeString(str).slice(1, -1)}'`;
}
const NEEDS_ESCAPE_RE = /[\n\r'\\\u2028\u2029]/;
const QUOTE_NEWLINE_RE = /([\n\r'\u2028\u2029])/g;
const BACKSLASH_RE = /\\/g;
function escapeString(id) {
	if (!NEEDS_ESCAPE_RE.test(id)) return id;
	return id.replace(BACKSLASH_RE, "\\\\").replace(QUOTE_NEWLINE_RE, "\\$1");
}
function genSafeVariableName(name) {
	if (reservedNames.has(name)) return `_${name}`;
	return name.replace(/^\d/, (r) => `_${r}`).replace(/\W/g, (r) => "_" + r.charCodeAt(0));
}
const reservedNames = /* @__PURE__ */ new Set([
	"Infinity",
	"NaN",
	"arguments",
	"await",
	"break",
	"case",
	"catch",
	"class",
	"const",
	"continue",
	"debugger",
	"default",
	"delete",
	"do",
	"else",
	"enum",
	"eval",
	"export",
	"extends",
	"false",
	"finally",
	"for",
	"function",
	"if",
	"implements",
	"import",
	"in",
	"instanceof",
	"interface",
	"let",
	"new",
	"null",
	"package",
	"private",
	"protected",
	"public",
	"return",
	"static",
	"super",
	"switch",
	"this",
	"throw",
	"true",
	"try",
	"typeof",
	"undefined",
	"var",
	"void",
	"while",
	"with",
	"yield"
]);
function _genStatement(type, specifier, names, options = {}) {
	const specifierString = genString(specifier, options);
	if (!names) return `${type} ${specifierString};`;
	const nameArray = Array.isArray(names);
	const namesString = (nameArray ? names : [names]).map((index) => {
		if (typeof index === "string") return { name: index };
		if (index.name === index.as) index = { name: index.name };
		return index;
	}).map((index) => index.as ? `${index.name} as ${index.as}` : index.name).join(", ");
	if (nameArray) return `${type} { ${namesString} } from ${genString(specifier, options)}${_genImportAttributes(type, options)};`;
	return `${type} ${namesString} from ${genString(specifier, options)}${_genImportAttributes(type, options)};`;
}
function _genImportAttributes(type, options) {
	if (type === "import type" || type === "export type") return "";
	if (typeof options.attributes?.type === "string") return ` with { type: ${genString(options.attributes.type)} }`;
	if (typeof options.assert?.type === "string") return ` assert { type: ${genString(options.assert.type)} }`;
	return "";
}
function genImport(specifier, imports, options = {}) {
	return _genStatement("import", specifier, imports, options);
}
function wrapInDelimiters(lines, indent = "", delimiters = "{}", withComma = true) {
	if (lines.length === 0) return delimiters;
	const [start, end] = delimiters;
	return `${start}
` + lines.join(withComma ? ",\n" : "\n") + `
${indent}${end}`;
}
const VALID_IDENTIFIER_RE = /^[$_]?([A-Z_a-z]\w*|\d)$/;
function genObjectKey(key) {
	return VALID_IDENTIFIER_RE.test(key) ? key : genString(key);
}
function genObjectFromRaw(object, indent = "", options = {}) {
	return genObjectFromRawEntries(Object.entries(object), indent, options);
}
function genArrayFromRaw(array, indent = "", options = {}) {
	const newIdent = indent + "  ";
	return wrapInDelimiters(array.map((index) => `${newIdent}${genRawValue(index, newIdent, options)}`), indent, "[]");
}
function genObjectFromRawEntries(array, indent = "", options = {}) {
	const newIdent = indent + "  ";
	return wrapInDelimiters(array.map(([key, value]) => `${newIdent}${genObjectKey(key)}: ${genRawValue(value, newIdent, options)}`), indent, "{}");
}
function genRawValue(value, indent = "", options = {}) {
	if (value === void 0) return "undefined";
	if (value === null) return "null";
	if (Array.isArray(value)) return genArrayFromRaw(value, indent, options);
	if (value && typeof value === "object") return genObjectFromRaw(value, indent, options);
	if (options.preserveTypes && typeof value !== "function") return JSON.stringify(value);
	return value.toString();
}

//#endregion
export { genString as a, genSafeVariableName as i, genObjectFromRaw as n, genObjectKey as r, genImport as t };