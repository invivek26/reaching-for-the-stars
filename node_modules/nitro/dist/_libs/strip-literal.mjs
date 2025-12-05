import { i as __toESM } from "../_chunks/Bqks5huO.mjs";
import { t as require_js_tokens } from "./js-tokens.mjs";

//#region node_modules/.pnpm/strip-literal@3.1.0/node_modules/strip-literal/dist/index.mjs
var import_js_tokens = /* @__PURE__ */ __toESM(require_js_tokens(), 1);
const FILL_COMMENT = " ";
function stripLiteralFromToken(token, fillChar, filter) {
	if (token.type === "SingleLineComment") return FILL_COMMENT.repeat(token.value.length);
	if (token.type === "MultiLineComment") return token.value.replace(/[^\n]/g, FILL_COMMENT);
	if (token.type === "StringLiteral") {
		if (!token.closed) return token.value;
		const body = token.value.slice(1, -1);
		if (filter(body)) return token.value[0] + fillChar.repeat(body.length) + token.value[token.value.length - 1];
	}
	if (token.type === "NoSubstitutionTemplate") {
		const body = token.value.slice(1, -1);
		if (filter(body)) return `\`${body.replace(/[^\n]/g, fillChar)}\``;
	}
	if (token.type === "RegularExpressionLiteral") {
		const body = token.value;
		if (filter(body)) return body.replace(/\/(.*)\/(\w?)$/g, (_, $1, $2) => `/${fillChar.repeat($1.length)}/${$2}`);
	}
	if (token.type === "TemplateHead") {
		const body = token.value.slice(1, -2);
		if (filter(body)) return `\`${body.replace(/[^\n]/g, fillChar)}\${`;
	}
	if (token.type === "TemplateTail") {
		const body = token.value.slice(0, -2);
		if (filter(body)) return `}${body.replace(/[^\n]/g, fillChar)}\``;
	}
	if (token.type === "TemplateMiddle") {
		const body = token.value.slice(1, -2);
		if (filter(body)) return `}${body.replace(/[^\n]/g, fillChar)}\${`;
	}
	return token.value;
}
function optionsWithDefaults(options) {
	return {
		fillChar: options?.fillChar ?? " ",
		filter: options?.filter ?? (() => true)
	};
}
function stripLiteral(code, options) {
	let result = "";
	const _options = optionsWithDefaults(options);
	for (const token of (0, import_js_tokens.default)(code, { jsx: false })) result += stripLiteralFromToken(token, _options.fillChar, _options.filter);
	return result;
}

//#endregion
export { stripLiteral as t };