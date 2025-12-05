import { C as isAbsolute$1, T as normalize$1, k as resolve$2, w as join$1 } from "./c12.mjs";
import { r as tokenizer } from "./acorn.mjs";
import { a as h, o as x } from "./confbox.mjs";
import { builtinModules, createRequire } from "node:module";
import path, { dirname, join, win32 } from "node:path";
import process$1 from "node:process";
import fs, { promises, realpathSync, statSync } from "node:fs";
import { joinURL } from "ufo";
import { URL as URL$1, fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert";
import v8 from "node:v8";
import { format, inspect } from "node:util";
import fsp from "node:fs/promises";

//#region node_modules/.pnpm/pkg-types@1.3.1/node_modules/pkg-types/dist/index.mjs
const defaultFindOptions = {
	startingFrom: ".",
	rootPattern: /^node_modules$/,
	reverse: false,
	test: (filePath) => {
		try {
			if (statSync(filePath).isFile()) return true;
		} catch {}
	}
};
async function findFile(filename, _options = {}) {
	const filenames = Array.isArray(filename) ? filename : [filename];
	const options = {
		...defaultFindOptions,
		..._options
	};
	const basePath = resolve$2(options.startingFrom);
	const leadingSlash = basePath[0] === "/";
	const segments = basePath.split("/").filter(Boolean);
	if (leadingSlash) segments[0] = "/" + segments[0];
	let root = segments.findIndex((r) => r.match(options.rootPattern));
	if (root === -1) root = 0;
	if (options.reverse) for (let index = root + 1; index <= segments.length; index++) for (const filename2 of filenames) {
		const filePath = join$1(...segments.slice(0, index), filename2);
		if (await options.test(filePath)) return filePath;
	}
	else for (let index = segments.length; index > root; index--) for (const filename2 of filenames) {
		const filePath = join$1(...segments.slice(0, index), filename2);
		if (await options.test(filePath)) return filePath;
	}
	throw new Error(`Cannot find matching ${filename} in ${options.startingFrom} or parent directories`);
}
function findNearestFile(filename, _options = {}) {
	return findFile(filename, _options);
}
const FileCache = /* @__PURE__ */ new Map();
async function readPackageJSON(id, options = {}) {
	const resolvedPath = await resolvePackageJSON(id, options);
	const cache$1 = options.cache && typeof options.cache !== "boolean" ? options.cache : FileCache;
	if (options.cache && cache$1.has(resolvedPath)) return cache$1.get(resolvedPath);
	const blob = await promises.readFile(resolvedPath, "utf8");
	let parsed;
	try {
		parsed = x(blob);
	} catch {
		parsed = h(blob);
	}
	cache$1.set(resolvedPath, parsed);
	return parsed;
}
async function resolvePackageJSON(id = process.cwd(), options = {}) {
	return findNearestFile("package.json", {
		startingFrom: isAbsolute$1(id) ? id : await resolvePath(id, options),
		...options
	});
}

//#endregion
//#region node_modules/.pnpm/mlly@1.8.0/node_modules/mlly/dist/index.mjs
const BUILTIN_MODULES = new Set(builtinModules);
function normalizeSlash(path$1) {
	return path$1.replace(/\\/g, "/");
}
function matchAll(regex, string, addition) {
	const matches = [];
	for (const match of string.matchAll(regex)) matches.push({
		...addition,
		...match.groups,
		code: match[0],
		start: match.index,
		end: (match.index || 0) + match[0].length
	});
	return matches;
}
function clearImports(imports) {
	return (imports || "").replace(/\/\/[^\n]*\n|\/\*.*\*\//g, "").replace(/\s+/g, " ");
}
function getImportNames(cleanedImports) {
	const topLevelImports = cleanedImports.replace(/{[^}]*}/, "");
	return {
		namespacedImport: topLevelImports.match(/\* as \s*(\S*)/)?.[1],
		defaultImport: topLevelImports.split(",").find((index) => !/[*{}]/.test(index))?.trim() || void 0
	};
}
/**
* @typedef ErrnoExceptionFields
* @property {number | undefined} [errnode]
* @property {string | undefined} [code]
* @property {string | undefined} [path]
* @property {string | undefined} [syscall]
* @property {string | undefined} [url]
*
* @typedef {Error & ErrnoExceptionFields} ErrnoException
*/
const own$1 = {}.hasOwnProperty;
const classRegExp = /^([A-Z][a-z\d]*)+$/;
const kTypes = new Set([
	"string",
	"function",
	"number",
	"object",
	"Function",
	"Object",
	"boolean",
	"bigint",
	"symbol"
]);
const codes = {};
/**
* Create a list string in the form like 'A and B' or 'A, B, ..., and Z'.
* We cannot use Intl.ListFormat because it's not available in
* --without-intl builds.
*
* @param {Array<string>} array
*   An array of strings.
* @param {string} [type]
*   The list type to be inserted before the last element.
* @returns {string}
*/
function formatList(array, type = "and") {
	return array.length < 3 ? array.join(` ${type} `) : `${array.slice(0, -1).join(", ")}, ${type} ${array[array.length - 1]}`;
}
/** @type {Map<string, MessageFunction | string>} */
const messages = /* @__PURE__ */ new Map();
const nodeInternalPrefix = "__node_internal_";
/** @type {number} */
let userStackTraceLimit;
codes.ERR_INVALID_ARG_TYPE = createError(
	"ERR_INVALID_ARG_TYPE",
	/**
	* @param {string} name
	* @param {Array<string> | string} expected
	* @param {unknown} actual
	*/
	(name, expected, actual) => {
		assert(typeof name === "string", "'name' must be a string");
		if (!Array.isArray(expected)) expected = [expected];
		let message = "The ";
		if (name.endsWith(" argument")) message += `${name} `;
		else {
			const type = name.includes(".") ? "property" : "argument";
			message += `"${name}" ${type} `;
		}
		message += "must be ";
		/** @type {Array<string>} */
		const types = [];
		/** @type {Array<string>} */
		const instances = [];
		/** @type {Array<string>} */
		const other = [];
		for (const value of expected) {
			assert(typeof value === "string", "All expected entries have to be of type string");
			if (kTypes.has(value)) types.push(value.toLowerCase());
			else if (classRegExp.exec(value) === null) {
				assert(value !== "object", "The value \"object\" should be written as \"Object\"");
				other.push(value);
			} else instances.push(value);
		}
		if (instances.length > 0) {
			const pos = types.indexOf("object");
			if (pos !== -1) {
				types.slice(pos, 1);
				instances.push("Object");
			}
		}
		if (types.length > 0) {
			message += `${types.length > 1 ? "one of type" : "of type"} ${formatList(types, "or")}`;
			if (instances.length > 0 || other.length > 0) message += " or ";
		}
		if (instances.length > 0) {
			message += `an instance of ${formatList(instances, "or")}`;
			if (other.length > 0) message += " or ";
		}
		if (other.length > 0) if (other.length > 1) message += `one of ${formatList(other, "or")}`;
		else {
			if (other[0].toLowerCase() !== other[0]) message += "an ";
			message += `${other[0]}`;
		}
		message += `. Received ${determineSpecificType(actual)}`;
		return message;
	},
	TypeError
);
codes.ERR_INVALID_MODULE_SPECIFIER = createError(
	"ERR_INVALID_MODULE_SPECIFIER",
	/**
	* @param {string} request
	* @param {string} reason
	* @param {string} [base]
	*/
	(request, reason, base = void 0) => {
		return `Invalid module "${request}" ${reason}${base ? ` imported from ${base}` : ""}`;
	},
	TypeError
);
codes.ERR_INVALID_PACKAGE_CONFIG = createError(
	"ERR_INVALID_PACKAGE_CONFIG",
	/**
	* @param {string} path
	* @param {string} [base]
	* @param {string} [message]
	*/
	(path$1, base, message) => {
		return `Invalid package config ${path$1}${base ? ` while importing ${base}` : ""}${message ? `. ${message}` : ""}`;
	},
	Error
);
codes.ERR_INVALID_PACKAGE_TARGET = createError(
	"ERR_INVALID_PACKAGE_TARGET",
	/**
	* @param {string} packagePath
	* @param {string} key
	* @param {unknown} target
	* @param {boolean} [isImport=false]
	* @param {string} [base]
	*/
	(packagePath, key, target, isImport = false, base = void 0) => {
		const relatedError = typeof target === "string" && !isImport && target.length > 0 && !target.startsWith("./");
		if (key === ".") {
			assert(isImport === false);
			return `Invalid "exports" main target ${JSON.stringify(target)} defined in the package config ${packagePath}package.json${base ? ` imported from ${base}` : ""}${relatedError ? "; targets must start with \"./\"" : ""}`;
		}
		return `Invalid "${isImport ? "imports" : "exports"}" target ${JSON.stringify(target)} defined for '${key}' in the package config ${packagePath}package.json${base ? ` imported from ${base}` : ""}${relatedError ? "; targets must start with \"./\"" : ""}`;
	},
	Error
);
codes.ERR_MODULE_NOT_FOUND = createError(
	"ERR_MODULE_NOT_FOUND",
	/**
	* @param {string} path
	* @param {string} base
	* @param {boolean} [exactUrl]
	*/
	(path$1, base, exactUrl = false) => {
		return `Cannot find ${exactUrl ? "module" : "package"} '${path$1}' imported from ${base}`;
	},
	Error
);
codes.ERR_NETWORK_IMPORT_DISALLOWED = createError("ERR_NETWORK_IMPORT_DISALLOWED", "import of '%s' by %s is not supported: %s", Error);
codes.ERR_PACKAGE_IMPORT_NOT_DEFINED = createError(
	"ERR_PACKAGE_IMPORT_NOT_DEFINED",
	/**
	* @param {string} specifier
	* @param {string} packagePath
	* @param {string} base
	*/
	(specifier, packagePath, base) => {
		return `Package import specifier "${specifier}" is not defined${packagePath ? ` in package ${packagePath}package.json` : ""} imported from ${base}`;
	},
	TypeError
);
codes.ERR_PACKAGE_PATH_NOT_EXPORTED = createError(
	"ERR_PACKAGE_PATH_NOT_EXPORTED",
	/**
	* @param {string} packagePath
	* @param {string} subpath
	* @param {string} [base]
	*/
	(packagePath, subpath, base = void 0) => {
		if (subpath === ".") return `No "exports" main defined in ${packagePath}package.json${base ? ` imported from ${base}` : ""}`;
		return `Package subpath '${subpath}' is not defined by "exports" in ${packagePath}package.json${base ? ` imported from ${base}` : ""}`;
	},
	Error
);
codes.ERR_UNSUPPORTED_DIR_IMPORT = createError("ERR_UNSUPPORTED_DIR_IMPORT", "Directory import '%s' is not supported resolving ES modules imported from %s", Error);
codes.ERR_UNSUPPORTED_RESOLVE_REQUEST = createError("ERR_UNSUPPORTED_RESOLVE_REQUEST", "Failed to resolve module specifier \"%s\" from \"%s\": Invalid relative URL or base scheme is not hierarchical.", TypeError);
codes.ERR_UNKNOWN_FILE_EXTENSION = createError(
	"ERR_UNKNOWN_FILE_EXTENSION",
	/**
	* @param {string} extension
	* @param {string} path
	*/
	(extension, path$1) => {
		return `Unknown file extension "${extension}" for ${path$1}`;
	},
	TypeError
);
codes.ERR_INVALID_ARG_VALUE = createError(
	"ERR_INVALID_ARG_VALUE",
	/**
	* @param {string} name
	* @param {unknown} value
	* @param {string} [reason='is invalid']
	*/
	(name, value, reason = "is invalid") => {
		let inspected = inspect(value);
		if (inspected.length > 128) inspected = `${inspected.slice(0, 128)}...`;
		return `The ${name.includes(".") ? "property" : "argument"} '${name}' ${reason}. Received ${inspected}`;
	},
	TypeError
);
/**
* Utility function for registering the error codes. Only used here. Exported
* *only* to allow for testing.
* @param {string} sym
* @param {MessageFunction | string} value
* @param {ErrorConstructor} constructor
* @returns {new (...parameters: Array<any>) => Error}
*/
function createError(sym, value, constructor) {
	messages.set(sym, value);
	return makeNodeErrorWithCode(constructor, sym);
}
/**
* @param {ErrorConstructor} Base
* @param {string} key
* @returns {ErrorConstructor}
*/
function makeNodeErrorWithCode(Base, key) {
	return NodeError;
	/**
	* @param {Array<unknown>} parameters
	*/
	function NodeError(...parameters) {
		const limit = Error.stackTraceLimit;
		if (isErrorStackTraceLimitWritable()) Error.stackTraceLimit = 0;
		const error = new Base();
		if (isErrorStackTraceLimitWritable()) Error.stackTraceLimit = limit;
		const message = getMessage(key, parameters, error);
		Object.defineProperties(error, {
			message: {
				value: message,
				enumerable: false,
				writable: true,
				configurable: true
			},
			toString: {
				value() {
					return `${this.name} [${key}]: ${this.message}`;
				},
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		captureLargerStackTrace(error);
		error.code = key;
		return error;
	}
}
/**
* @returns {boolean}
*/
function isErrorStackTraceLimitWritable() {
	try {
		if (v8.startupSnapshot.isBuildingSnapshot()) return false;
	} catch {}
	const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
	if (desc === void 0) return Object.isExtensible(Error);
	return own$1.call(desc, "writable") && desc.writable !== void 0 ? desc.writable : desc.set !== void 0;
}
/**
* This function removes unnecessary frames from Node.js core errors.
* @template {(...parameters: unknown[]) => unknown} T
* @param {T} wrappedFunction
* @returns {T}
*/
function hideStackFrames(wrappedFunction) {
	const hidden = nodeInternalPrefix + wrappedFunction.name;
	Object.defineProperty(wrappedFunction, "name", { value: hidden });
	return wrappedFunction;
}
const captureLargerStackTrace = hideStackFrames(
	/**
	* @param {Error} error
	* @returns {Error}
	*/
	function(error) {
		const stackTraceLimitIsWritable = isErrorStackTraceLimitWritable();
		if (stackTraceLimitIsWritable) {
			userStackTraceLimit = Error.stackTraceLimit;
			Error.stackTraceLimit = Number.POSITIVE_INFINITY;
		}
		Error.captureStackTrace(error);
		if (stackTraceLimitIsWritable) Error.stackTraceLimit = userStackTraceLimit;
		return error;
	}
);
/**
* @param {string} key
* @param {Array<unknown>} parameters
* @param {Error} self
* @returns {string}
*/
function getMessage(key, parameters, self) {
	const message = messages.get(key);
	assert(message !== void 0, "expected `message` to be found");
	if (typeof message === "function") {
		assert(message.length <= parameters.length, `Code: ${key}; The provided arguments length (${parameters.length}) does not match the required ones (${message.length}).`);
		return Reflect.apply(message, self, parameters);
	}
	const regex = /%[dfijoOs]/g;
	let expectedLength = 0;
	while (regex.exec(message) !== null) expectedLength++;
	assert(expectedLength === parameters.length, `Code: ${key}; The provided arguments length (${parameters.length}) does not match the required ones (${expectedLength}).`);
	if (parameters.length === 0) return message;
	parameters.unshift(message);
	return Reflect.apply(format, null, parameters);
}
/**
* Determine the specific type of a value for type-mismatch errors.
* @param {unknown} value
* @returns {string}
*/
function determineSpecificType(value) {
	if (value === null || value === void 0) return String(value);
	if (typeof value === "function" && value.name) return `function ${value.name}`;
	if (typeof value === "object") {
		if (value.constructor && value.constructor.name) return `an instance of ${value.constructor.name}`;
		return `${inspect(value, { depth: -1 })}`;
	}
	let inspected = inspect(value, { colors: false });
	if (inspected.length > 28) inspected = `${inspected.slice(0, 25)}...`;
	return `type ${typeof value} (${inspected})`;
}
const hasOwnProperty$1 = {}.hasOwnProperty;
const { ERR_INVALID_PACKAGE_CONFIG: ERR_INVALID_PACKAGE_CONFIG$1 } = codes;
/** @type {Map<string, PackageConfig>} */
const cache = /* @__PURE__ */ new Map();
/**
* @param {string} jsonPath
* @param {{specifier: URL | string, base?: URL}} options
* @returns {PackageConfig}
*/
function read(jsonPath, { base, specifier }) {
	const existing = cache.get(jsonPath);
	if (existing) return existing;
	/** @type {string | undefined} */
	let string;
	try {
		string = fs.readFileSync(path.toNamespacedPath(jsonPath), "utf8");
	} catch (error) {
		const exception = error;
		if (exception.code !== "ENOENT") throw exception;
	}
	/** @type {PackageConfig} */
	const result = {
		exists: false,
		pjsonPath: jsonPath,
		main: void 0,
		name: void 0,
		type: "none",
		exports: void 0,
		imports: void 0
	};
	if (string !== void 0) {
		/** @type {Record<string, unknown>} */
		let parsed;
		try {
			parsed = JSON.parse(string);
		} catch (error_) {
			const cause = error_;
			const error = new ERR_INVALID_PACKAGE_CONFIG$1(jsonPath, (base ? `"${specifier}" from ` : "") + fileURLToPath(base || specifier), cause.message);
			error.cause = cause;
			throw error;
		}
		result.exists = true;
		if (hasOwnProperty$1.call(parsed, "name") && typeof parsed.name === "string") result.name = parsed.name;
		if (hasOwnProperty$1.call(parsed, "main") && typeof parsed.main === "string") result.main = parsed.main;
		if (hasOwnProperty$1.call(parsed, "exports")) result.exports = parsed.exports;
		if (hasOwnProperty$1.call(parsed, "imports")) result.imports = parsed.imports;
		if (hasOwnProperty$1.call(parsed, "type") && (parsed.type === "commonjs" || parsed.type === "module")) result.type = parsed.type;
	}
	cache.set(jsonPath, result);
	return result;
}
/**
* @param {URL | string} resolved
* @returns {PackageConfig}
*/
function getPackageScopeConfig(resolved) {
	let packageJSONUrl = new URL("package.json", resolved);
	while (true) {
		if (packageJSONUrl.pathname.endsWith("node_modules/package.json")) break;
		const packageConfig = read(fileURLToPath(packageJSONUrl), { specifier: resolved });
		if (packageConfig.exists) return packageConfig;
		const lastPackageJSONUrl = packageJSONUrl;
		packageJSONUrl = new URL("../package.json", packageJSONUrl);
		if (packageJSONUrl.pathname === lastPackageJSONUrl.pathname) break;
	}
	return {
		pjsonPath: fileURLToPath(packageJSONUrl),
		exists: false,
		type: "none"
	};
}
/**
* Returns the package type for a given URL.
* @param {URL} url - The URL to get the package type for.
* @returns {PackageType}
*/
function getPackageType(url) {
	return getPackageScopeConfig(url).type;
}
const { ERR_UNKNOWN_FILE_EXTENSION } = codes;
const hasOwnProperty = {}.hasOwnProperty;
/** @type {Record<string, string>} */
const extensionFormatMap = {
	__proto__: null,
	".cjs": "commonjs",
	".js": "module",
	".json": "json",
	".mjs": "module"
};
/**
* @param {string | null} mime
* @returns {string | null}
*/
function mimeToFormat(mime) {
	if (mime && /\s*(text|application)\/javascript\s*(;\s*charset=utf-?8\s*)?/i.test(mime)) return "module";
	if (mime === "application/json") return "json";
	return null;
}
/**
* @callback ProtocolHandler
* @param {URL} parsed
* @param {{parentURL: string, source?: Buffer}} context
* @param {boolean} ignoreErrors
* @returns {string | null | void}
*/
/**
* @type {Record<string, ProtocolHandler>}
*/
const protocolHandlers = {
	__proto__: null,
	"data:": getDataProtocolModuleFormat,
	"file:": getFileProtocolModuleFormat,
	"http:": getHttpProtocolModuleFormat,
	"https:": getHttpProtocolModuleFormat,
	"node:"() {
		return "builtin";
	}
};
/**
* @param {URL} parsed
*/
function getDataProtocolModuleFormat(parsed) {
	const { 1: mime } = /^([^/]+\/[^;,]+)[^,]*?(;base64)?,/.exec(parsed.pathname) || [
		null,
		null,
		null
	];
	return mimeToFormat(mime);
}
/**
* Returns the file extension from a URL.
*
* Should give similar result to
* `require('node:path').extname(require('node:url').fileURLToPath(url))`
* when used with a `file:` URL.
*
* @param {URL} url
* @returns {string}
*/
function extname$2(url) {
	const pathname = url.pathname;
	let index = pathname.length;
	while (index--) {
		const code = pathname.codePointAt(index);
		if (code === 47) return "";
		if (code === 46) return pathname.codePointAt(index - 1) === 47 ? "" : pathname.slice(index);
	}
	return "";
}
/**
* @type {ProtocolHandler}
*/
function getFileProtocolModuleFormat(url, _context, ignoreErrors) {
	const value = extname$2(url);
	if (value === ".js") {
		const packageType = getPackageType(url);
		if (packageType !== "none") return packageType;
		return "commonjs";
	}
	if (value === "") {
		const packageType = getPackageType(url);
		if (packageType === "none" || packageType === "commonjs") return "commonjs";
		return "module";
	}
	const format$1 = extensionFormatMap[value];
	if (format$1) return format$1;
	if (ignoreErrors) return;
	throw new ERR_UNKNOWN_FILE_EXTENSION(value, fileURLToPath(url));
}
function getHttpProtocolModuleFormat() {}
/**
* @param {URL} url
* @param {{parentURL: string}} context
* @returns {string | null}
*/
function defaultGetFormatWithoutErrors(url, context) {
	const protocol = url.protocol;
	if (!hasOwnProperty.call(protocolHandlers, protocol)) return null;
	return protocolHandlers[protocol](url, context, true) || null;
}
const RegExpPrototypeSymbolReplace = RegExp.prototype[Symbol.replace];
const { ERR_INVALID_MODULE_SPECIFIER, ERR_INVALID_PACKAGE_CONFIG, ERR_INVALID_PACKAGE_TARGET, ERR_MODULE_NOT_FOUND, ERR_PACKAGE_IMPORT_NOT_DEFINED, ERR_PACKAGE_PATH_NOT_EXPORTED, ERR_UNSUPPORTED_DIR_IMPORT, ERR_UNSUPPORTED_RESOLVE_REQUEST } = codes;
const own = {}.hasOwnProperty;
const invalidSegmentRegEx = /(^|\\|\/)((\.|%2e)(\.|%2e)?|(n|%6e|%4e)(o|%6f|%4f)(d|%64|%44)(e|%65|%45)(_|%5f)(m|%6d|%4d)(o|%6f|%4f)(d|%64|%44)(u|%75|%55)(l|%6c|%4c)(e|%65|%45)(s|%73|%53))?(\\|\/|$)/i;
const deprecatedInvalidSegmentRegEx = /(^|\\|\/)((\.|%2e)(\.|%2e)?|(n|%6e|%4e)(o|%6f|%4f)(d|%64|%44)(e|%65|%45)(_|%5f)(m|%6d|%4d)(o|%6f|%4f)(d|%64|%44)(u|%75|%55)(l|%6c|%4c)(e|%65|%45)(s|%73|%53))(\\|\/|$)/i;
const invalidPackageNameRegEx = /^\.|%|\\/;
const patternRegEx = /\*/g;
const encodedSeparatorRegEx = /%2f|%5c/i;
/** @type {Set<string>} */
const emittedPackageWarnings = /* @__PURE__ */ new Set();
const doubleSlashRegEx = /[/\\]{2}/;
/**
*
* @param {string} target
* @param {string} request
* @param {string} match
* @param {URL} packageJsonUrl
* @param {boolean} internal
* @param {URL} base
* @param {boolean} isTarget
*/
function emitInvalidSegmentDeprecation(target, request, match, packageJsonUrl, internal, base, isTarget) {
	if (process$1.noDeprecation) return;
	const pjsonPath = fileURLToPath(packageJsonUrl);
	const double = doubleSlashRegEx.exec(isTarget ? target : request) !== null;
	process$1.emitWarning(`Use of deprecated ${double ? "double slash" : "leading or trailing slash matching"} resolving "${target}" for module request "${request}" ${request === match ? "" : `matched to "${match}" `}in the "${internal ? "imports" : "exports"}" field module resolution of the package at ${pjsonPath}${base ? ` imported from ${fileURLToPath(base)}` : ""}.`, "DeprecationWarning", "DEP0166");
}
/**
* @param {URL} url
* @param {URL} packageJsonUrl
* @param {URL} base
* @param {string} [main]
* @returns {void}
*/
function emitLegacyIndexDeprecation(url, packageJsonUrl, base, main) {
	if (process$1.noDeprecation) return;
	if (defaultGetFormatWithoutErrors(url, { parentURL: base.href }) !== "module") return;
	const urlPath = fileURLToPath(url.href);
	const packagePath = fileURLToPath(new URL$1(".", packageJsonUrl));
	const basePath = fileURLToPath(base);
	if (!main) process$1.emitWarning(`No "main" or "exports" field defined in the package.json for ${packagePath} resolving the main entry point "${urlPath.slice(packagePath.length)}", imported from ${basePath}.\nDefault "index" lookups for the main are deprecated for ES modules.`, "DeprecationWarning", "DEP0151");
	else if (path.resolve(packagePath, main) !== urlPath) process$1.emitWarning(`Package ${packagePath} has a "main" field set to "${main}", excluding the full filename and extension to the resolved file at "${urlPath.slice(packagePath.length)}", imported from ${basePath}.\n Automatic extension resolution of the "main" field is deprecated for ES modules.`, "DeprecationWarning", "DEP0151");
}
/**
* @param {string} path
* @returns {Stats | undefined}
*/
function tryStatSync(path$1) {
	try {
		return statSync(path$1);
	} catch {}
}
/**
* Legacy CommonJS main resolution:
* 1. let M = pkg_url + (json main field)
* 2. TRY(M, M.js, M.json, M.node)
* 3. TRY(M/index.js, M/index.json, M/index.node)
* 4. TRY(pkg_url/index.js, pkg_url/index.json, pkg_url/index.node)
* 5. NOT_FOUND
*
* @param {URL} url
* @returns {boolean}
*/
function fileExists(url) {
	const stats = statSync(url, { throwIfNoEntry: false });
	const isFile = stats ? stats.isFile() : void 0;
	return isFile === null || isFile === void 0 ? false : isFile;
}
/**
* @param {URL} packageJsonUrl
* @param {PackageConfig} packageConfig
* @param {URL} base
* @returns {URL}
*/
function legacyMainResolve(packageJsonUrl, packageConfig, base) {
	/** @type {URL | undefined} */
	let guess;
	if (packageConfig.main !== void 0) {
		guess = new URL$1(packageConfig.main, packageJsonUrl);
		if (fileExists(guess)) return guess;
		const tries$1 = [
			`./${packageConfig.main}.js`,
			`./${packageConfig.main}.json`,
			`./${packageConfig.main}.node`,
			`./${packageConfig.main}/index.js`,
			`./${packageConfig.main}/index.json`,
			`./${packageConfig.main}/index.node`
		];
		let i$1 = -1;
		while (++i$1 < tries$1.length) {
			guess = new URL$1(tries$1[i$1], packageJsonUrl);
			if (fileExists(guess)) break;
			guess = void 0;
		}
		if (guess) {
			emitLegacyIndexDeprecation(guess, packageJsonUrl, base, packageConfig.main);
			return guess;
		}
	}
	const tries = [
		"./index.js",
		"./index.json",
		"./index.node"
	];
	let i = -1;
	while (++i < tries.length) {
		guess = new URL$1(tries[i], packageJsonUrl);
		if (fileExists(guess)) break;
		guess = void 0;
	}
	if (guess) {
		emitLegacyIndexDeprecation(guess, packageJsonUrl, base, packageConfig.main);
		return guess;
	}
	throw new ERR_MODULE_NOT_FOUND(fileURLToPath(new URL$1(".", packageJsonUrl)), fileURLToPath(base));
}
/**
* @param {URL} resolved
* @param {URL} base
* @param {boolean} [preserveSymlinks]
* @returns {URL}
*/
function finalizeResolution(resolved, base, preserveSymlinks) {
	if (encodedSeparatorRegEx.exec(resolved.pathname) !== null) throw new ERR_INVALID_MODULE_SPECIFIER(resolved.pathname, "must not include encoded \"/\" or \"\\\" characters", fileURLToPath(base));
	/** @type {string} */
	let filePath;
	try {
		filePath = fileURLToPath(resolved);
	} catch (error) {
		const cause = error;
		Object.defineProperty(cause, "input", { value: String(resolved) });
		Object.defineProperty(cause, "module", { value: String(base) });
		throw cause;
	}
	const stats = tryStatSync(filePath.endsWith("/") ? filePath.slice(-1) : filePath);
	if (stats && stats.isDirectory()) {
		const error = new ERR_UNSUPPORTED_DIR_IMPORT(filePath, fileURLToPath(base));
		error.url = String(resolved);
		throw error;
	}
	if (!stats || !stats.isFile()) {
		const error = new ERR_MODULE_NOT_FOUND(filePath || resolved.pathname, base && fileURLToPath(base), true);
		error.url = String(resolved);
		throw error;
	}
	{
		const real = realpathSync(filePath);
		const { search, hash } = resolved;
		resolved = pathToFileURL(real + (filePath.endsWith(path.sep) ? "/" : ""));
		resolved.search = search;
		resolved.hash = hash;
	}
	return resolved;
}
/**
* @param {string} specifier
* @param {URL | undefined} packageJsonUrl
* @param {URL} base
* @returns {Error}
*/
function importNotDefined(specifier, packageJsonUrl, base) {
	return new ERR_PACKAGE_IMPORT_NOT_DEFINED(specifier, packageJsonUrl && fileURLToPath(new URL$1(".", packageJsonUrl)), fileURLToPath(base));
}
/**
* @param {string} subpath
* @param {URL} packageJsonUrl
* @param {URL} base
* @returns {Error}
*/
function exportsNotFound(subpath, packageJsonUrl, base) {
	return new ERR_PACKAGE_PATH_NOT_EXPORTED(fileURLToPath(new URL$1(".", packageJsonUrl)), subpath, base && fileURLToPath(base));
}
/**
* @param {string} request
* @param {string} match
* @param {URL} packageJsonUrl
* @param {boolean} internal
* @param {URL} [base]
* @returns {never}
*/
function throwInvalidSubpath(request, match, packageJsonUrl, internal, base) {
	throw new ERR_INVALID_MODULE_SPECIFIER(request, `request is not a valid match in pattern "${match}" for the "${internal ? "imports" : "exports"}" resolution of ${fileURLToPath(packageJsonUrl)}`, base && fileURLToPath(base));
}
/**
* @param {string} subpath
* @param {unknown} target
* @param {URL} packageJsonUrl
* @param {boolean} internal
* @param {URL} [base]
* @returns {Error}
*/
function invalidPackageTarget(subpath, target, packageJsonUrl, internal, base) {
	target = typeof target === "object" && target !== null ? JSON.stringify(target, null, "") : `${target}`;
	return new ERR_INVALID_PACKAGE_TARGET(fileURLToPath(new URL$1(".", packageJsonUrl)), subpath, target, internal, base && fileURLToPath(base));
}
/**
* @param {string} target
* @param {string} subpath
* @param {string} match
* @param {URL} packageJsonUrl
* @param {URL} base
* @param {boolean} pattern
* @param {boolean} internal
* @param {boolean} isPathMap
* @param {Set<string> | undefined} conditions
* @returns {URL}
*/
function resolvePackageTargetString(target, subpath, match, packageJsonUrl, base, pattern, internal, isPathMap, conditions) {
	if (subpath !== "" && !pattern && target[target.length - 1] !== "/") throw invalidPackageTarget(match, target, packageJsonUrl, internal, base);
	if (!target.startsWith("./")) {
		if (internal && !target.startsWith("../") && !target.startsWith("/")) {
			let isURL = false;
			try {
				new URL$1(target);
				isURL = true;
			} catch {}
			if (!isURL) return packageResolve(pattern ? RegExpPrototypeSymbolReplace.call(patternRegEx, target, () => subpath) : target + subpath, packageJsonUrl, conditions);
		}
		throw invalidPackageTarget(match, target, packageJsonUrl, internal, base);
	}
	if (invalidSegmentRegEx.exec(target.slice(2)) !== null) if (deprecatedInvalidSegmentRegEx.exec(target.slice(2)) === null) {
		if (!isPathMap) {
			const request = pattern ? match.replace("*", () => subpath) : match + subpath;
			emitInvalidSegmentDeprecation(pattern ? RegExpPrototypeSymbolReplace.call(patternRegEx, target, () => subpath) : target, request, match, packageJsonUrl, internal, base, true);
		}
	} else throw invalidPackageTarget(match, target, packageJsonUrl, internal, base);
	const resolved = new URL$1(target, packageJsonUrl);
	const resolvedPath = resolved.pathname;
	const packagePath = new URL$1(".", packageJsonUrl).pathname;
	if (!resolvedPath.startsWith(packagePath)) throw invalidPackageTarget(match, target, packageJsonUrl, internal, base);
	if (subpath === "") return resolved;
	if (invalidSegmentRegEx.exec(subpath) !== null) {
		const request = pattern ? match.replace("*", () => subpath) : match + subpath;
		if (deprecatedInvalidSegmentRegEx.exec(subpath) === null) {
			if (!isPathMap) emitInvalidSegmentDeprecation(pattern ? RegExpPrototypeSymbolReplace.call(patternRegEx, target, () => subpath) : target, request, match, packageJsonUrl, internal, base, false);
		} else throwInvalidSubpath(request, match, packageJsonUrl, internal, base);
	}
	if (pattern) return new URL$1(RegExpPrototypeSymbolReplace.call(patternRegEx, resolved.href, () => subpath));
	return new URL$1(subpath, resolved);
}
/**
* @param {string} key
* @returns {boolean}
*/
function isArrayIndex(key) {
	const keyNumber = Number(key);
	if (`${keyNumber}` !== key) return false;
	return keyNumber >= 0 && keyNumber < 4294967295;
}
/**
* @param {URL} packageJsonUrl
* @param {unknown} target
* @param {string} subpath
* @param {string} packageSubpath
* @param {URL} base
* @param {boolean} pattern
* @param {boolean} internal
* @param {boolean} isPathMap
* @param {Set<string> | undefined} conditions
* @returns {URL | null}
*/
function resolvePackageTarget(packageJsonUrl, target, subpath, packageSubpath, base, pattern, internal, isPathMap, conditions) {
	if (typeof target === "string") return resolvePackageTargetString(target, subpath, packageSubpath, packageJsonUrl, base, pattern, internal, isPathMap, conditions);
	if (Array.isArray(target)) {
		/** @type {Array<unknown>} */
		const targetList = target;
		if (targetList.length === 0) return null;
		/** @type {ErrnoException | null | undefined} */
		let lastException;
		let i = -1;
		while (++i < targetList.length) {
			const targetItem = targetList[i];
			/** @type {URL | null} */
			let resolveResult;
			try {
				resolveResult = resolvePackageTarget(packageJsonUrl, targetItem, subpath, packageSubpath, base, pattern, internal, isPathMap, conditions);
			} catch (error) {
				const exception = error;
				lastException = exception;
				if (exception.code === "ERR_INVALID_PACKAGE_TARGET") continue;
				throw error;
			}
			if (resolveResult === void 0) continue;
			if (resolveResult === null) {
				lastException = null;
				continue;
			}
			return resolveResult;
		}
		if (lastException === void 0 || lastException === null) return null;
		throw lastException;
	}
	if (typeof target === "object" && target !== null) {
		const keys = Object.getOwnPropertyNames(target);
		let i = -1;
		while (++i < keys.length) {
			const key = keys[i];
			if (isArrayIndex(key)) throw new ERR_INVALID_PACKAGE_CONFIG(fileURLToPath(packageJsonUrl), base, "\"exports\" cannot contain numeric property keys.");
		}
		i = -1;
		while (++i < keys.length) {
			const key = keys[i];
			if (key === "default" || conditions && conditions.has(key)) {
				const conditionalTarget = target[key];
				const resolveResult = resolvePackageTarget(packageJsonUrl, conditionalTarget, subpath, packageSubpath, base, pattern, internal, isPathMap, conditions);
				if (resolveResult === void 0) continue;
				return resolveResult;
			}
		}
		return null;
	}
	if (target === null) return null;
	throw invalidPackageTarget(packageSubpath, target, packageJsonUrl, internal, base);
}
/**
* @param {unknown} exports
* @param {URL} packageJsonUrl
* @param {URL} base
* @returns {boolean}
*/
function isConditionalExportsMainSugar(exports, packageJsonUrl, base) {
	if (typeof exports === "string" || Array.isArray(exports)) return true;
	if (typeof exports !== "object" || exports === null) return false;
	const keys = Object.getOwnPropertyNames(exports);
	let isConditionalSugar = false;
	let i = 0;
	let keyIndex = -1;
	while (++keyIndex < keys.length) {
		const key = keys[keyIndex];
		const currentIsConditionalSugar = key === "" || key[0] !== ".";
		if (i++ === 0) isConditionalSugar = currentIsConditionalSugar;
		else if (isConditionalSugar !== currentIsConditionalSugar) throw new ERR_INVALID_PACKAGE_CONFIG(fileURLToPath(packageJsonUrl), base, "\"exports\" cannot contain some keys starting with '.' and some not. The exports object must either be an object of package subpath keys or an object of main entry condition name keys only.");
	}
	return isConditionalSugar;
}
/**
* @param {string} match
* @param {URL} pjsonUrl
* @param {URL} base
*/
function emitTrailingSlashPatternDeprecation(match, pjsonUrl, base) {
	if (process$1.noDeprecation) return;
	const pjsonPath = fileURLToPath(pjsonUrl);
	if (emittedPackageWarnings.has(pjsonPath + "|" + match)) return;
	emittedPackageWarnings.add(pjsonPath + "|" + match);
	process$1.emitWarning(`Use of deprecated trailing slash pattern mapping "${match}" in the "exports" field module resolution of the package at ${pjsonPath}${base ? ` imported from ${fileURLToPath(base)}` : ""}. Mapping specifiers ending in "/" is no longer supported.`, "DeprecationWarning", "DEP0155");
}
/**
* @param {URL} packageJsonUrl
* @param {string} packageSubpath
* @param {Record<string, unknown>} packageConfig
* @param {URL} base
* @param {Set<string> | undefined} conditions
* @returns {URL}
*/
function packageExportsResolve(packageJsonUrl, packageSubpath, packageConfig, base, conditions) {
	let exports = packageConfig.exports;
	if (isConditionalExportsMainSugar(exports, packageJsonUrl, base)) exports = { ".": exports };
	if (own.call(exports, packageSubpath) && !packageSubpath.includes("*") && !packageSubpath.endsWith("/")) {
		const target = exports[packageSubpath];
		const resolveResult = resolvePackageTarget(packageJsonUrl, target, "", packageSubpath, base, false, false, false, conditions);
		if (resolveResult === null || resolveResult === void 0) throw exportsNotFound(packageSubpath, packageJsonUrl, base);
		return resolveResult;
	}
	let bestMatch = "";
	let bestMatchSubpath = "";
	const keys = Object.getOwnPropertyNames(exports);
	let i = -1;
	while (++i < keys.length) {
		const key = keys[i];
		const patternIndex = key.indexOf("*");
		if (patternIndex !== -1 && packageSubpath.startsWith(key.slice(0, patternIndex))) {
			if (packageSubpath.endsWith("/")) emitTrailingSlashPatternDeprecation(packageSubpath, packageJsonUrl, base);
			const patternTrailer = key.slice(patternIndex + 1);
			if (packageSubpath.length >= key.length && packageSubpath.endsWith(patternTrailer) && patternKeyCompare(bestMatch, key) === 1 && key.lastIndexOf("*") === patternIndex) {
				bestMatch = key;
				bestMatchSubpath = packageSubpath.slice(patternIndex, packageSubpath.length - patternTrailer.length);
			}
		}
	}
	if (bestMatch) {
		const target = exports[bestMatch];
		const resolveResult = resolvePackageTarget(packageJsonUrl, target, bestMatchSubpath, bestMatch, base, true, false, packageSubpath.endsWith("/"), conditions);
		if (resolveResult === null || resolveResult === void 0) throw exportsNotFound(packageSubpath, packageJsonUrl, base);
		return resolveResult;
	}
	throw exportsNotFound(packageSubpath, packageJsonUrl, base);
}
/**
* @param {string} a
* @param {string} b
*/
function patternKeyCompare(a, b) {
	const aPatternIndex = a.indexOf("*");
	const bPatternIndex = b.indexOf("*");
	const baseLengthA = aPatternIndex === -1 ? a.length : aPatternIndex + 1;
	const baseLengthB = bPatternIndex === -1 ? b.length : bPatternIndex + 1;
	if (baseLengthA > baseLengthB) return -1;
	if (baseLengthB > baseLengthA) return 1;
	if (aPatternIndex === -1) return 1;
	if (bPatternIndex === -1) return -1;
	if (a.length > b.length) return -1;
	if (b.length > a.length) return 1;
	return 0;
}
/**
* @param {string} name
* @param {URL} base
* @param {Set<string>} [conditions]
* @returns {URL}
*/
function packageImportsResolve(name, base, conditions) {
	if (name === "#" || name.startsWith("#/") || name.endsWith("/")) throw new ERR_INVALID_MODULE_SPECIFIER(name, "is not a valid internal imports specifier name", fileURLToPath(base));
	/** @type {URL | undefined} */
	let packageJsonUrl;
	const packageConfig = getPackageScopeConfig(base);
	if (packageConfig.exists) {
		packageJsonUrl = pathToFileURL(packageConfig.pjsonPath);
		const imports = packageConfig.imports;
		if (imports) if (own.call(imports, name) && !name.includes("*")) {
			const resolveResult = resolvePackageTarget(packageJsonUrl, imports[name], "", name, base, false, true, false, conditions);
			if (resolveResult !== null && resolveResult !== void 0) return resolveResult;
		} else {
			let bestMatch = "";
			let bestMatchSubpath = "";
			const keys = Object.getOwnPropertyNames(imports);
			let i = -1;
			while (++i < keys.length) {
				const key = keys[i];
				const patternIndex = key.indexOf("*");
				if (patternIndex !== -1 && name.startsWith(key.slice(0, -1))) {
					const patternTrailer = key.slice(patternIndex + 1);
					if (name.length >= key.length && name.endsWith(patternTrailer) && patternKeyCompare(bestMatch, key) === 1 && key.lastIndexOf("*") === patternIndex) {
						bestMatch = key;
						bestMatchSubpath = name.slice(patternIndex, name.length - patternTrailer.length);
					}
				}
			}
			if (bestMatch) {
				const target = imports[bestMatch];
				const resolveResult = resolvePackageTarget(packageJsonUrl, target, bestMatchSubpath, bestMatch, base, true, true, false, conditions);
				if (resolveResult !== null && resolveResult !== void 0) return resolveResult;
			}
		}
	}
	throw importNotDefined(name, packageJsonUrl, base);
}
/**
* @param {string} specifier
* @param {URL} base
*/
function parsePackageName(specifier, base) {
	let separatorIndex = specifier.indexOf("/");
	let validPackageName = true;
	let isScoped = false;
	if (specifier[0] === "@") {
		isScoped = true;
		if (separatorIndex === -1 || specifier.length === 0) validPackageName = false;
		else separatorIndex = specifier.indexOf("/", separatorIndex + 1);
	}
	const packageName = separatorIndex === -1 ? specifier : specifier.slice(0, separatorIndex);
	if (invalidPackageNameRegEx.exec(packageName) !== null) validPackageName = false;
	if (!validPackageName) throw new ERR_INVALID_MODULE_SPECIFIER(specifier, "is not a valid package name", fileURLToPath(base));
	return {
		packageName,
		packageSubpath: "." + (separatorIndex === -1 ? "" : specifier.slice(separatorIndex)),
		isScoped
	};
}
/**
* @param {string} specifier
* @param {URL} base
* @param {Set<string> | undefined} conditions
* @returns {URL}
*/
function packageResolve(specifier, base, conditions) {
	if (builtinModules.includes(specifier)) return new URL$1("node:" + specifier);
	const { packageName, packageSubpath, isScoped } = parsePackageName(specifier, base);
	const packageConfig = getPackageScopeConfig(base);
	/* c8 ignore next 16 */
	if (packageConfig.exists) {
		const packageJsonUrl$1 = pathToFileURL(packageConfig.pjsonPath);
		if (packageConfig.name === packageName && packageConfig.exports !== void 0 && packageConfig.exports !== null) return packageExportsResolve(packageJsonUrl$1, packageSubpath, packageConfig, base, conditions);
	}
	let packageJsonUrl = new URL$1("./node_modules/" + packageName + "/package.json", base);
	let packageJsonPath = fileURLToPath(packageJsonUrl);
	/** @type {string} */
	let lastPath;
	do {
		const stat$1 = tryStatSync(packageJsonPath.slice(0, -13));
		if (!stat$1 || !stat$1.isDirectory()) {
			lastPath = packageJsonPath;
			packageJsonUrl = new URL$1((isScoped ? "../../../../node_modules/" : "../../../node_modules/") + packageName + "/package.json", packageJsonUrl);
			packageJsonPath = fileURLToPath(packageJsonUrl);
			continue;
		}
		const packageConfig$1 = read(packageJsonPath, {
			base,
			specifier
		});
		if (packageConfig$1.exports !== void 0 && packageConfig$1.exports !== null) return packageExportsResolve(packageJsonUrl, packageSubpath, packageConfig$1, base, conditions);
		if (packageSubpath === ".") return legacyMainResolve(packageJsonUrl, packageConfig$1, base);
		return new URL$1(packageSubpath, packageJsonUrl);
	} while (packageJsonPath.length !== lastPath.length);
	throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), false);
}
/**
* @param {string} specifier
* @returns {boolean}
*/
function isRelativeSpecifier(specifier) {
	if (specifier[0] === ".") {
		if (specifier.length === 1 || specifier[1] === "/") return true;
		if (specifier[1] === "." && (specifier.length === 2 || specifier[2] === "/")) return true;
	}
	return false;
}
/**
* @param {string} specifier
* @returns {boolean}
*/
function shouldBeTreatedAsRelativeOrAbsolutePath(specifier) {
	if (specifier === "") return false;
	if (specifier[0] === "/") return true;
	return isRelativeSpecifier(specifier);
}
/**
* The “Resolver Algorithm Specification” as detailed in the Node docs (which is
* sync and slightly lower-level than `resolve`).
*
* @param {string} specifier
*   `/example.js`, `./example.js`, `../example.js`, `some-package`, `fs`, etc.
* @param {URL} base
*   Full URL (to a file) that `specifier` is resolved relative from.
* @param {Set<string>} [conditions]
*   Conditions.
* @param {boolean} [preserveSymlinks]
*   Keep symlinks instead of resolving them.
* @returns {URL}
*   A URL object to the found thing.
*/
function moduleResolve(specifier, base, conditions, preserveSymlinks) {
	const protocol = base.protocol;
	const isRemote = protocol === "data:" || protocol === "http:" || protocol === "https:";
	/** @type {URL | undefined} */
	let resolved;
	if (shouldBeTreatedAsRelativeOrAbsolutePath(specifier)) try {
		resolved = new URL$1(specifier, base);
	} catch (error_) {
		const error = new ERR_UNSUPPORTED_RESOLVE_REQUEST(specifier, base);
		error.cause = error_;
		throw error;
	}
	else if (protocol === "file:" && specifier[0] === "#") resolved = packageImportsResolve(specifier, base, conditions);
	else try {
		resolved = new URL$1(specifier);
	} catch (error_) {
		if (isRemote && !builtinModules.includes(specifier)) {
			const error = new ERR_UNSUPPORTED_RESOLVE_REQUEST(specifier, base);
			error.cause = error_;
			throw error;
		}
		resolved = packageResolve(specifier, base, conditions);
	}
	assert(resolved !== void 0, "expected to be defined");
	if (resolved.protocol !== "file:") return resolved;
	return finalizeResolution(resolved, base);
}
function fileURLToPath$1(id) {
	if (typeof id === "string" && !id.startsWith("file://")) return normalizeSlash(id);
	return normalizeSlash(fileURLToPath(id));
}
function pathToFileURL$1(id) {
	return pathToFileURL(fileURLToPath$1(id)).toString();
}
const INVALID_CHAR_RE = /[\u0000-\u001F"#$&*+,/:;<=>?@[\]^`{|}\u007F]+/g;
function sanitizeURIComponent(name = "", replacement = "_") {
	return name.replace(INVALID_CHAR_RE, replacement).replace(/%../g, replacement);
}
function sanitizeFilePath(filePath = "") {
	return filePath.replace(/\?.*$/, "").split(/[/\\]/g).map((p) => sanitizeURIComponent(p)).join("/").replace(/^([A-Za-z])_\//, "$1:/");
}
function normalizeid(id) {
	if (typeof id !== "string") id = id.toString();
	if (/(?:node|data|http|https|file):/.test(id)) return id;
	if (BUILTIN_MODULES.has(id)) return "node:" + id;
	return "file://" + encodeURI(normalizeSlash(id));
}
async function loadURL(url) {
	return await promises.readFile(fileURLToPath$1(url), "utf8");
}
const DEFAULT_CONDITIONS_SET = /* @__PURE__ */ new Set(["node", "import"]);
const DEFAULT_EXTENSIONS = [
	".mjs",
	".cjs",
	".js",
	".json"
];
const NOT_FOUND_ERRORS = /* @__PURE__ */ new Set([
	"ERR_MODULE_NOT_FOUND",
	"ERR_UNSUPPORTED_DIR_IMPORT",
	"MODULE_NOT_FOUND",
	"ERR_PACKAGE_PATH_NOT_EXPORTED"
]);
function _tryModuleResolve(id, url, conditions) {
	try {
		return moduleResolve(id, url, conditions);
	} catch (error) {
		if (!NOT_FOUND_ERRORS.has(error?.code)) throw error;
	}
}
function _resolve$1(id, options = {}) {
	if (typeof id !== "string") if (id instanceof URL) id = fileURLToPath$1(id);
	else throw new TypeError("input must be a `string` or `URL`");
	if (/(?:node|data|http|https):/.test(id)) return id;
	if (BUILTIN_MODULES.has(id)) return "node:" + id;
	if (id.startsWith("file://")) id = fileURLToPath$1(id);
	if (isAbsolute$1(id)) try {
		if (statSync(id).isFile()) return pathToFileURL$1(id);
	} catch (error) {
		if (error?.code !== "ENOENT") throw error;
	}
	const conditionsSet = options.conditions ? new Set(options.conditions) : DEFAULT_CONDITIONS_SET;
	const _urls = (Array.isArray(options.url) ? options.url : [options.url]).filter(Boolean).map((url) => new URL(normalizeid(url.toString())));
	if (_urls.length === 0) _urls.push(new URL(pathToFileURL$1(process.cwd())));
	const urls = [..._urls];
	for (const url of _urls) if (url.protocol === "file:") urls.push(new URL("./", url), new URL(joinURL(url.pathname, "_index.js"), url), new URL("node_modules", url));
	let resolved;
	for (const url of urls) {
		resolved = _tryModuleResolve(id, url, conditionsSet);
		if (resolved) break;
		for (const prefix of ["", "/index"]) {
			for (const extension of options.extensions || DEFAULT_EXTENSIONS) {
				resolved = _tryModuleResolve(joinURL(id, prefix) + extension, url, conditionsSet);
				if (resolved) break;
			}
			if (resolved) break;
		}
		if (resolved) break;
	}
	if (!resolved) {
		const error = /* @__PURE__ */ new Error(`Cannot find module ${id} imported from ${urls.join(", ")}`);
		error.code = "ERR_MODULE_NOT_FOUND";
		throw error;
	}
	return pathToFileURL$1(resolved);
}
function resolveSync(id, options) {
	return _resolve$1(id, options);
}
function resolve$1(id, options) {
	try {
		return Promise.resolve(resolveSync(id, options));
	} catch (error) {
		return Promise.reject(error);
	}
}
function resolvePathSync(id, options) {
	return fileURLToPath$1(resolveSync(id, options));
}
function resolvePath(id, options) {
	try {
		return Promise.resolve(resolvePathSync(id, options));
	} catch (error) {
		return Promise.reject(error);
	}
}
const NODE_MODULES_RE = /^(.+\/node_modules\/)([^/@]+|@[^/]+\/[^/]+)(\/?.*?)?$/;
function parseNodeModulePath(path$1) {
	if (!path$1) return {};
	path$1 = normalize$1(fileURLToPath$1(path$1));
	const match = NODE_MODULES_RE.exec(path$1);
	if (!match) return {};
	const [, dir, name, subpath] = match;
	return {
		dir,
		name,
		subpath: subpath ? `.${subpath}` : void 0
	};
}
async function lookupNodeModuleSubpath(path$1) {
	path$1 = normalize$1(fileURLToPath$1(path$1));
	const { name, subpath } = parseNodeModulePath(path$1);
	if (!name || !subpath) return subpath;
	const { exports } = await readPackageJSON(path$1).catch(() => {}) || {};
	if (exports) {
		const resolvedSubpath = _findSubpath(subpath, exports);
		if (resolvedSubpath) return resolvedSubpath;
	}
	return subpath;
}
function _findSubpath(subpath, exports) {
	if (typeof exports === "string") exports = { ".": exports };
	if (!subpath.startsWith(".")) subpath = subpath.startsWith("/") ? `.${subpath}` : `./${subpath}`;
	if (subpath in (exports || {})) return subpath;
	return _flattenExports(exports).find((p) => p.fsPath === subpath)?.subpath;
}
function _flattenExports(exports = {}, parentSubpath = "./") {
	return Object.entries(exports).flatMap(([key, value]) => {
		const [subpath, condition] = key.startsWith(".") ? [key.slice(1), void 0] : ["", key];
		const _subPath = joinURL(parentSubpath, subpath);
		if (typeof value === "string") return [{
			subpath: _subPath,
			fsPath: value,
			condition
		}];
		else return _flattenExports(value, _subPath);
	});
}
const ESM_STATIC_IMPORT_RE = /(?<=\s|^|;|\})import\s*(?:[\s"']*(?<imports>[\p{L}\p{M}\w\t\n\r $*,/{}@.]+)from\s*)?["']\s*(?<specifier>(?<="\s*)[^"]*[^\s"](?=\s*")|(?<='\s*)[^']*[^\s'](?=\s*'))\s*["'][\s;]*/gmu;
const EXPORT_DECAL_RE = /\bexport\s+(?<declaration>(?:async function\s*\*?|function\s*\*?|let|const enum|const|enum|var|class))\s+\*?(?<name>[\w$]+)(?<extraNames>.*,\s*[\s\w:[\]{}]*[\w$\]}]+)*/g;
const EXPORT_DECAL_TYPE_RE = /\bexport\s+(?<declaration>(?:interface|type|declare (?:async function|function|let|const enum|const|enum|var|class)))\s+(?<name>[\w$]+)/g;
const EXPORT_NAMED_RE = /\bexport\s*{(?<exports>[^}]+?)[\s,]*}(?:\s*from\s*["']\s*(?<specifier>(?<="\s*)[^"]*[^\s"](?=\s*")|(?<='\s*)[^']*[^\s'](?=\s*'))\s*["'][^\n;]*)?/g;
const EXPORT_NAMED_TYPE_RE = /\bexport\s+type\s*{(?<exports>[^}]+?)[\s,]*}(?:\s*from\s*["']\s*(?<specifier>(?<="\s*)[^"]*[^\s"](?=\s*")|(?<='\s*)[^']*[^\s'](?=\s*'))\s*["'][^\n;]*)?/g;
const EXPORT_NAMED_DESTRUCT = /\bexport\s+(?:let|var|const)\s+(?:{(?<exports1>[^}]+?)[\s,]*}|\[(?<exports2>[^\]]+?)[\s,]*])\s+=/gm;
const EXPORT_STAR_RE = /\bexport\s*\*(?:\s*as\s+(?<name>[\w$]+)\s+)?\s*(?:\s*from\s*["']\s*(?<specifier>(?<="\s*)[^"]*[^\s"](?=\s*")|(?<='\s*)[^']*[^\s'](?=\s*'))\s*["'][^\n;]*)?/g;
const EXPORT_DEFAULT_RE = /\bexport\s+default\s+(async function|function|class|true|false|\W|\d)|\bexport\s+default\s+(?<defaultName>.*)/g;
const EXPORT_DEFAULT_CLASS_RE = /\bexport\s+default\s+(?<declaration>class)\s+(?<name>[\w$]+)/g;
const TYPE_RE = /^\s*?type\s/;
function findStaticImports(code) {
	return _filterStatement(_tryGetLocations(code, "import"), matchAll(ESM_STATIC_IMPORT_RE, code, { type: "static" }));
}
function parseStaticImport(matched) {
	const cleanedImports = clearImports(matched.imports);
	const namedImports = {};
	const _matches = cleanedImports.match(/{([^}]*)}/)?.[1]?.split(",") || [];
	for (const namedImport of _matches) {
		const _match = namedImport.match(/^\s*(\S*) as (\S*)\s*$/);
		const source = _match?.[1] || namedImport.trim();
		const importName = _match?.[2] || source;
		if (source && !TYPE_RE.test(source)) namedImports[source] = importName;
	}
	const { namespacedImport, defaultImport } = getImportNames(cleanedImports);
	return {
		...matched,
		defaultImport,
		namespacedImport,
		namedImports
	};
}
function findExports(code) {
	const declaredExports = matchAll(EXPORT_DECAL_RE, code, { type: "declaration" });
	for (const declaredExport of declaredExports) {
		if (/^export\s+(?:async\s+)?function/.test(declaredExport.code)) continue;
		const extraNamesStr = declaredExport.extraNames;
		if (extraNamesStr) {
			const extraNames = matchAll(/({.*?})|(\[.*?])|(,\s*(?<name>\w+))/g, extraNamesStr, {}).map((m) => m.name).filter(Boolean);
			declaredExport.names = [declaredExport.name, ...extraNames];
		}
		delete declaredExport.extraNames;
	}
	const namedExports = normalizeNamedExports(matchAll(EXPORT_NAMED_RE, code, { type: "named" }));
	const destructuredExports = matchAll(EXPORT_NAMED_DESTRUCT, code, { type: "named" });
	for (const namedExport of destructuredExports) {
		namedExport.exports = namedExport.exports1 || namedExport.exports2;
		namedExport.names = namedExport.exports.replace(/^\r?\n?/, "").split(/\s*,\s*/g).filter((name) => !TYPE_RE.test(name)).map((name) => name.replace(/^.*?\s*:\s*/, "").replace(/\s*=\s*.*$/, "").trim());
	}
	const defaultExport = matchAll(EXPORT_DEFAULT_RE, code, {
		type: "default",
		name: "default"
	});
	const defaultClassExports = matchAll(EXPORT_DEFAULT_CLASS_RE, code, { type: "declaration" });
	const starExports = matchAll(EXPORT_STAR_RE, code, { type: "star" });
	const exports = normalizeExports([
		...declaredExports,
		...namedExports,
		...destructuredExports,
		...defaultExport,
		...defaultClassExports,
		...starExports
	]);
	if (exports.length === 0) return [];
	const exportLocations = _tryGetLocations(code, "export");
	if (exportLocations && exportLocations.length === 0) return [];
	return _filterStatement(exportLocations, exports).filter((exp, index, exports2) => {
		const nextExport = exports2[index + 1];
		return !nextExport || exp.type !== nextExport.type || !exp.name || exp.name !== nextExport.name;
	});
}
function findTypeExports(code) {
	const declaredExports = matchAll(EXPORT_DECAL_TYPE_RE, code, { type: "declaration" });
	const namedExports = normalizeNamedExports(matchAll(EXPORT_NAMED_TYPE_RE, code, { type: "named" }));
	const exports = normalizeExports([...declaredExports, ...namedExports]);
	if (exports.length === 0) return [];
	const exportLocations = _tryGetLocations(code, "export");
	if (exportLocations && exportLocations.length === 0) return [];
	return _filterStatement(exportLocations, exports).filter((exp, index, exports2) => {
		const nextExport = exports2[index + 1];
		return !nextExport || exp.type !== nextExport.type || !exp.name || exp.name !== nextExport.name;
	});
}
function normalizeExports(exports) {
	for (const exp of exports) {
		if (!exp.name && exp.names && exp.names.length === 1) exp.name = exp.names[0];
		if (exp.name === "default" && exp.type !== "default") {
			exp._type = exp.type;
			exp.type = "default";
		}
		if (!exp.names && exp.name) exp.names = [exp.name];
		if (exp.type === "declaration" && exp.declaration) exp.declarationType = exp.declaration.replace(/^declare\s*/, "");
	}
	return exports;
}
function normalizeNamedExports(namedExports) {
	for (const namedExport of namedExports) namedExport.names = namedExport.exports.replace(/^\r?\n?/, "").split(/\s*,\s*/g).filter((name) => !TYPE_RE.test(name)).map((name) => name.replace(/^.*?\sas\s/, "").trim());
	return namedExports;
}
async function resolveModuleExportNames(id, options) {
	const url = await resolvePath(id, options);
	const exports = findExports(await loadURL(url));
	const exportNames = new Set(exports.flatMap((exp) => exp.names).filter(Boolean));
	for (const exp of exports) {
		if (exp.type !== "star" || !exp.specifier) continue;
		const subExports = await resolveModuleExportNames(exp.specifier, {
			...options,
			url
		});
		for (const subExport of subExports) exportNames.add(subExport);
	}
	return [...exportNames];
}
function _filterStatement(locations, statements) {
	return statements.filter((exp) => {
		return !locations || locations.some((location) => {
			return exp.start <= location.start && exp.end >= location.end;
		});
	});
}
function _tryGetLocations(code, label) {
	try {
		return _getLocations(code, label);
	} catch {}
}
function _getLocations(code, label) {
	const tokens = tokenizer(code, {
		ecmaVersion: "latest",
		sourceType: "module",
		allowHashBang: true,
		allowAwaitOutsideFunction: true,
		allowImportExportEverywhere: true
	});
	const locations = [];
	for (const token of tokens) if (token.type.label === label) locations.push({
		start: token.start,
		end: token.end
	});
	return locations;
}
const ESM_RE = /(?:[\s;]|^)(?:import[\s\w*,{}]*from|import\s*["'*{]|export\b\s*(?:[*{]|default|class|type|function|const|var|let|async function)|import\.meta\b)/m;
const CJS_RE = /(?:[\s;]|^)(?:module\.exports\b|exports\.\w|require\s*\(|global\.\w)/m;
const COMMENT_RE = /\/\*.+?\*\/|\/\/.*(?=[nr])/g;
function hasESMSyntax(code, opts = {}) {
	if (opts.stripComments) code = code.replace(COMMENT_RE, "");
	return ESM_RE.test(code);
}
function hasCJSSyntax(code, opts = {}) {
	if (opts.stripComments) code = code.replace(COMMENT_RE, "");
	return CJS_RE.test(code);
}
function detectSyntax(code, opts = {}) {
	if (opts.stripComments) code = code.replace(COMMENT_RE, "");
	const hasESM = hasESMSyntax(code, {});
	const hasCJS = hasCJSSyntax(code, {});
	return {
		hasESM,
		hasCJS,
		isMixed: hasESM && hasCJS
	};
}

//#endregion
//#region node_modules/.pnpm/quansync@0.2.11/node_modules/quansync/dist/index.mjs
const GET_IS_ASYNC = Symbol.for("quansync.getIsAsync");
var QuansyncError = class extends Error {
	constructor(message = "Unexpected promise in sync context") {
		super(message);
		this.name = "QuansyncError";
	}
};
function isThenable(value) {
	return value && typeof value === "object" && typeof value.then === "function";
}
function isQuansyncGenerator(value) {
	return value && typeof value === "object" && typeof value[Symbol.iterator] === "function" && "__quansync" in value;
}
function fromObject(options) {
	const generator = function* (...args) {
		if (yield GET_IS_ASYNC) return yield options.async.apply(this, args);
		return options.sync.apply(this, args);
	};
	function fn(...args) {
		const iter = generator.apply(this, args);
		iter.then = (...thenArgs) => options.async.apply(this, args).then(...thenArgs);
		iter.__quansync = true;
		return iter;
	}
	fn.sync = options.sync;
	fn.async = options.async;
	return fn;
}
function fromPromise(promise) {
	return fromObject({
		async: () => Promise.resolve(promise),
		sync: () => {
			if (isThenable(promise)) throw new QuansyncError();
			return promise;
		}
	});
}
function unwrapYield(value, isAsync) {
	if (value === GET_IS_ASYNC) return isAsync;
	if (isQuansyncGenerator(value)) return isAsync ? iterateAsync(value) : iterateSync(value);
	if (!isAsync && isThenable(value)) throw new QuansyncError();
	return value;
}
const DEFAULT_ON_YIELD = (value) => value;
function iterateSync(generator, onYield = DEFAULT_ON_YIELD) {
	let current = generator.next();
	while (!current.done) try {
		current = generator.next(unwrapYield(onYield(current.value, false)));
	} catch (err) {
		current = generator.throw(err);
	}
	return unwrapYield(current.value);
}
async function iterateAsync(generator, onYield = DEFAULT_ON_YIELD) {
	let current = generator.next();
	while (!current.done) try {
		current = generator.next(await unwrapYield(onYield(current.value, true), true));
	} catch (err) {
		current = generator.throw(err);
	}
	return current.value;
}
function fromGeneratorFn(generatorFn, options) {
	return fromObject({
		name: generatorFn.name,
		async(...args) {
			return iterateAsync(generatorFn.apply(this, args), options?.onYield);
		},
		sync(...args) {
			return iterateSync(generatorFn.apply(this, args), options?.onYield);
		}
	});
}
function quansync$1(input, options) {
	if (isThenable(input)) return fromPromise(input);
	if (typeof input === "function") return fromGeneratorFn(input, options);
	else return fromObject(input);
}
const getIsAsync = quansync$1({
	async: () => Promise.resolve(true),
	sync: () => false
});

//#endregion
//#region node_modules/.pnpm/quansync@0.2.11/node_modules/quansync/dist/macro.mjs
const quansync = quansync$1;

//#endregion
//#region node_modules/.pnpm/local-pkg@1.1.2/node_modules/local-pkg/dist/index.mjs
const toPath = (urlOrPath) => urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;
async function findUp$1(name, { cwd: cwd$1 = process$1.cwd(), type = "file", stopAt } = {}) {
	let directory = path.resolve(toPath(cwd$1) ?? "");
	const { root } = path.parse(directory);
	stopAt = path.resolve(directory, toPath(stopAt ?? root));
	const isAbsoluteName = path.isAbsolute(name);
	while (directory) {
		const filePath = isAbsoluteName ? name : path.join(directory, name);
		try {
			const stats = await fsp.stat(filePath);
			if (type === "file" && stats.isFile() || type === "directory" && stats.isDirectory()) return filePath;
		} catch {}
		if (directory === stopAt || directory === root) break;
		directory = path.dirname(directory);
	}
}
function findUpSync(name, { cwd: cwd$1 = process$1.cwd(), type = "file", stopAt } = {}) {
	let directory = path.resolve(toPath(cwd$1) ?? "");
	const { root } = path.parse(directory);
	stopAt = path.resolve(directory, toPath(stopAt) ?? root);
	const isAbsoluteName = path.isAbsolute(name);
	while (directory) {
		const filePath = isAbsoluteName ? name : path.join(directory, name);
		try {
			const stats = fs.statSync(filePath, { throwIfNoEntry: false });
			if (type === "file" && stats?.isFile() || type === "directory" && stats?.isDirectory()) return filePath;
		} catch {}
		if (directory === stopAt || directory === root) break;
		directory = path.dirname(directory);
	}
}
function _resolve(path$1, options = {}) {
	if (options.platform === "auto" || !options.platform) options.platform = process$1.platform === "win32" ? "win32" : "posix";
	if (process$1.versions.pnp) {
		const paths = options.paths || [];
		if (paths.length === 0) paths.push(process$1.cwd());
		const targetRequire = createRequire(import.meta.url);
		try {
			return targetRequire.resolve(path$1, { paths });
		} catch {}
	}
	const modulePath = resolvePathSync(path$1, { url: options.paths });
	if (options.platform === "win32") return win32.normalize(modulePath);
	return modulePath;
}
function resolveModule(name, options = {}) {
	try {
		return _resolve(name, options);
	} catch {
		return;
	}
}
function getPackageJsonPath(name, options = {}) {
	const entry = resolvePackage(name, options);
	if (!entry) return;
	return searchPackageJSON(entry);
}
const readFile$1 = quansync({
	async: (id) => fs.promises.readFile(id, "utf8"),
	sync: (id) => fs.readFileSync(id, "utf8")
});
const getPackageInfo = quansync(function* (name, options = {}) {
	const packageJsonPath = getPackageJsonPath(name, options);
	if (!packageJsonPath) return;
	const packageJson = JSON.parse(yield readFile$1(packageJsonPath));
	return {
		name,
		version: packageJson.version,
		rootPath: dirname(packageJsonPath),
		packageJsonPath,
		packageJson
	};
});
const getPackageInfoSync = getPackageInfo.sync;
function resolvePackage(name, options = {}) {
	try {
		return _resolve(`${name}/package.json`, options);
	} catch {}
	try {
		return _resolve(name, options);
	} catch (e) {
		if (e.code !== "MODULE_NOT_FOUND" && e.code !== "ERR_MODULE_NOT_FOUND") console.error(e);
		return false;
	}
}
function searchPackageJSON(dir) {
	let packageJsonPath;
	while (true) {
		if (!dir) return;
		const newDir = dirname(dir);
		if (newDir === dir) return;
		dir = newDir;
		packageJsonPath = join(dir, "package.json");
		if (fs.existsSync(packageJsonPath)) break;
	}
	return packageJsonPath;
}
const findUp = quansync({
	sync: findUpSync,
	async: findUp$1
});
const loadPackageJSON = quansync(function* (cwd$1 = process$1.cwd()) {
	const path$1 = yield findUp("package.json", { cwd: cwd$1 });
	if (!path$1 || !fs.existsSync(path$1)) return null;
	return JSON.parse(yield readFile$1(path$1));
});
const loadPackageJSONSync = loadPackageJSON.sync;
const isPackageListed = quansync(function* (name, cwd$1) {
	const pkg = (yield loadPackageJSON(cwd$1)) || {};
	return name in (pkg.dependencies || {}) || name in (pkg.devDependencies || {});
});
const isPackageListedSync = isPackageListed.sync;

//#endregion
export { findStaticImports as a, parseNodeModulePath as c, resolveModuleExportNames as d, sanitizeFilePath as f, findExports as i, parseStaticImport as l, detectSyntax as n, findTypeExports as o, fileURLToPath$1 as r, lookupNodeModuleSubpath as s, resolveModule as t, resolve$1 as u };