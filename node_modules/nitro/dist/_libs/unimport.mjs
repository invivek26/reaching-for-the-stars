import { i as __toESM, n as __require, t as __commonJS } from "../_chunks/Bqks5huO.mjs";
import { C as isAbsolute$1, D as parse$2, O as relative$1, T as normalize$2, b as basename$1, f as readPackageJSON, k as resolve$1, m as resolvePackageJSON, w as join$1, x as dirname$1 } from "./c12.mjs";
import { t as MagicString } from "./magic-string.mjs";
import { n as parse, t as Parser } from "./acorn.mjs";
import { a as findStaticImports, d as resolveModuleExportNames, i as findExports, l as parseStaticImport, n as detectSyntax, o as findTypeExports, t as resolveModule, u as resolve$2 } from "./local-pkg.mjs";
import { t as stripLiteral } from "./strip-literal.mjs";
import { t as require_picomatch } from "./picomatch.mjs";
import { t as glob } from "./tinyglobby.mjs";
import { t as walk } from "./estree-walker.mjs";
import { t as remapping } from "./remapping.mjs";
import { createRequire } from "node:module";
import path, { basename, dirname, extname, isAbsolute, normalize, resolve } from "node:path";
import process$1 from "node:process";
import { camelCase, kebabCase } from "scule";
import fs, { accessSync, constants, existsSync, promises, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import os from "node:os";
import { Buffer } from "node:buffer";
import * as querystring from "node:querystring";

//#region node_modules/.pnpm/unimport@5.5.0/node_modules/unimport/dist/shared/unimport.rkT0nXLK.mjs
const excludeRE = [
	/\b(import|export)\b([\w$*{},\s]+?)\bfrom\s*["']/g,
	/\bfunction\s*([\w$]+)\s*\(/g,
	/\bclass\s*([\w$]+)\s*\{/g,
	/\b(?:const|let|var)\s+?(\[.*?\]|\{.*?\}|.+?)\s*?[=;\n]/gs
];
const importAsRE = /^.*\sas\s+/;
const separatorRE = /[,[\]{}\n]|\b(?:import|export)\b/g;
const matchRE = /(^|\.\.\.|(?:\bcase|\?)\s+|[^\w$/)]|\bextends\s+)([\w$]+)\s*(?=[.()[\]}:;?+\-*&|`<>,\n]|\b(?:instanceof|in)\b|$|(?<=extends\s+\w+)\s+\{)/g;
const regexRE = /\/\S*?(?<!\\)(?<!\[[^\]]*)\/[gimsuy]*/g;
function stripCommentsAndStrings(code, options) {
	return stripLiteral(code, options).replace(regexRE, "new RegExp(\"\")");
}
function defineUnimportPreset(preset) {
	return preset;
}
const identifierRE = /^[A-Z_$][\w$]*$/i;
const safePropertyName = /^[a-z$_][\w$]*$/i;
function stringifyWith(withValues) {
	let withDefs = "";
	for (let entries = Object.entries(withValues), l = entries.length, i = 0; i < l; i++) {
		const [prop, value] = entries[i];
		withDefs += safePropertyName.test(prop) ? prop : JSON.stringify(prop);
		withDefs += `: ${JSON.stringify(String(value))}`;
		if (i + 1 !== l) withDefs += ", ";
	}
	return `{ ${withDefs} }`;
}
function stringifyImports(imports, isCJS = false) {
	const map = toImportModuleMap(imports);
	return Object.entries(map).flatMap(([name, importSet]) => {
		const entries = [];
		const imports2 = Array.from(importSet).filter((i) => {
			if (!i.name || i.as === "") {
				let importStr;
				if (isCJS) importStr = `require('${name}');`;
				else {
					importStr = `import '${name}'`;
					if (i.with) importStr += ` with ${stringifyWith(i.with)}`;
					importStr += ";";
				}
				entries.push(importStr);
				return false;
			} else if (i.name === "default" || i.name === "=") {
				let importStr;
				if (isCJS) importStr = i.name === "=" ? `const ${i.as} = require('${name}');` : `const { default: ${i.as} } = require('${name}');`;
				else {
					importStr = `import ${i.as} from '${name}'`;
					if (i.with) importStr += ` with ${stringifyWith(i.with)}`;
					importStr += ";";
				}
				entries.push(importStr);
				return false;
			} else if (i.name === "*") {
				let importStr;
				if (isCJS) importStr = `const ${i.as} = require('${name}');`;
				else {
					importStr = `import * as ${i.as} from '${name}'`;
					if (i.with) importStr += ` with ${stringifyWith(i.with)}`;
					importStr += ";";
				}
				entries.push(importStr);
				return false;
			} else if (!isCJS && i.with) {
				entries.push(`import { ${stringifyImportAlias(i)} } from '${name}' with ${stringifyWith(i.with)};`);
				return false;
			}
			return true;
		});
		if (imports2.length) {
			const importsAs = imports2.map((i) => stringifyImportAlias(i, isCJS));
			entries.push(isCJS ? `const { ${importsAs.join(", ")} } = require('${name}');` : `import { ${importsAs.join(", ")} } from '${name}';`);
		}
		return entries;
	}).join("\n");
}
function dedupeImports(imports, warn) {
	const map = /* @__PURE__ */ new Map();
	const indexToRemove = /* @__PURE__ */ new Set();
	imports.filter((i) => !i.disabled).forEach((i, idx) => {
		if (i.declarationType === "enum" || i.declarationType === "class") return;
		const name = i.as ?? i.name;
		if (!map.has(name)) {
			map.set(name, idx);
			return;
		}
		const other = imports[map.get(name)];
		if (other.from === i.from) {
			indexToRemove.add(idx);
			return;
		}
		const diff = (other.priority || 1) - (i.priority || 1);
		if (diff === 0) warn(`Duplicated imports "${name}", the one from "${other.from}" has been ignored and "${i.from}" is used`);
		if (diff <= 0) {
			indexToRemove.add(map.get(name));
			map.set(name, idx);
		} else indexToRemove.add(idx);
	});
	return imports.filter((_, idx) => !indexToRemove.has(idx));
}
function toExports(imports, fileDir, includeType = false) {
	const map = toImportModuleMap(imports, includeType);
	return Object.entries(map).flatMap(([name, imports2]) => {
		if (isFilePath(name)) name = name.replace(/\.[a-z]+$/i, "");
		if (fileDir && isAbsolute$1(name)) {
			name = relative$1(fileDir, name);
			if (!name.match(/^[./]/)) name = `./${name}`;
		}
		const entries = [];
		const filtered = Array.from(imports2).filter((i) => {
			if (i.name === "*") {
				entries.push(`export * as ${i.as} from '${name}';`);
				return false;
			}
			return true;
		});
		if (filtered.length) entries.push(`export { ${filtered.map((i) => stringifyImportAlias(i, false)).join(", ")} } from '${name}';`);
		return entries;
	}).join("\n");
}
function stripFileExtension(path$1) {
	return path$1.replace(/\.[a-z]+$/i, "");
}
function toTypeDeclarationItems(imports, options) {
	return imports.map((i) => {
		const from = options?.resolvePath?.(i) || stripFileExtension(i.typeFrom || i.from);
		let typeDef = "";
		if (i.with) typeDef += `import('${from}', { with: ${stringifyWith(i.with)} })`;
		else typeDef += `import('${from}')`;
		if (i.name !== "*" && i.name !== "=") typeDef += identifierRE.test(i.name) ? `.${i.name}` : `['${i.name}']`;
		return `const ${i.as}: typeof ${typeDef}`;
	}).sort();
}
function toTypeDeclarationFile(imports, options) {
	const items = toTypeDeclarationItems(imports, options);
	const { exportHelper = true } = options || {};
	let declaration = "";
	if (exportHelper) declaration += "export {}\n";
	declaration += `declare global {
${items.map((i) => `  ${i}`).join("\n")}
}`;
	return declaration;
}
function makeTypeModulesMap(imports, resolvePath$1) {
	const modulesMap = /* @__PURE__ */ new Map();
	const resolveImportFrom = typeof resolvePath$1 === "function" ? (i) => {
		return resolvePath$1(i) || stripFileExtension(i.typeFrom || i.from);
	} : (i) => stripFileExtension(i.typeFrom || i.from);
	for (const import_ of imports) {
		const from = resolveImportFrom(import_);
		let module$1 = modulesMap.get(from);
		if (!module$1) {
			module$1 = {
				typeImports: /* @__PURE__ */ new Set(),
				starTypeImport: void 0
			};
			modulesMap.set(from, module$1);
		}
		if (import_.name === "*") {
			if (import_.as) module$1.starTypeImport = import_;
		} else module$1.typeImports.add(import_);
	}
	return modulesMap;
}
function toTypeReExports(imports, options) {
	const importsMap = makeTypeModulesMap(imports, options?.resolvePath);
	return `// for type re-export
declare global {
${Array.from(importsMap).flatMap(([from, module$1]) => {
		from = from.replace(/\.d\.([cm]?)ts$/i, ".$1js");
		const { starTypeImport, typeImports } = module$1;
		const strings = [];
		if (typeImports.size) {
			const typeImportNames = Array.from(typeImports).map(({ name, as }) => {
				if (as && as !== name) return `${name} as ${as}`;
				return name;
			});
			strings.push("// @ts-ignore", `export type { ${typeImportNames.join(", ")} } from '${from}'`);
		}
		if (starTypeImport) strings.push("// @ts-ignore", `export type * as ${starTypeImport.as} from '${from}'`);
		if (strings.length) strings.push(`import('${from}')`);
		return strings;
	}).map((i) => `  ${i}`).join("\n")}
}`;
}
function stringifyImportAlias(item, isCJS = false) {
	return item.as === void 0 || item.name === item.as ? item.name : isCJS ? `${item.name}: ${item.as}` : `${item.name} as ${item.as}`;
}
function toImportModuleMap(imports, includeType = false) {
	const map = {};
	for (const _import of imports) {
		if (_import.type && !includeType) continue;
		if (!map[_import.from]) map[_import.from] = /* @__PURE__ */ new Set();
		map[_import.from].add(_import);
	}
	return map;
}
function getMagicString(code) {
	if (typeof code === "string") return new MagicString(code);
	return code;
}
function addImportToCode(code, imports, isCJS = false, mergeExisting = false, injectAtLast = false, firstOccurrence = Number.POSITIVE_INFINITY, onResolved, onStringified) {
	let newImports = [];
	const s = getMagicString(code);
	let _staticImports;
	const strippedCode = stripCommentsAndStrings(s.original);
	function findStaticImportsLazy() {
		if (!_staticImports) _staticImports = findStaticImports(s.original).filter((i) => Boolean(strippedCode.slice(i.start, i.end).trim())).map((i) => parseStaticImport(i));
		return _staticImports;
	}
	function hasShebang() {
		return /^#!.+/.test(s.original);
	}
	if (mergeExisting && !isCJS) {
		const existingImports = findStaticImportsLazy();
		const map = /* @__PURE__ */ new Map();
		imports.forEach((i) => {
			const target = existingImports.find((e) => e.specifier === i.from && e.imports.startsWith("{"));
			if (!target) return newImports.push(i);
			if (!map.has(target)) map.set(target, []);
			map.get(target).push(i);
		});
		for (const [target, items] of map.entries()) {
			const strings = items.map((i) => `${stringifyImportAlias(i)}, `);
			const importLength = target.code.match(/^\s*import\s*\{/)?.[0]?.length;
			if (importLength) s.appendLeft(target.start + importLength, ` ${strings.join("").trim()}`);
		}
	} else newImports = imports;
	newImports = onResolved?.(newImports) ?? newImports;
	let newEntries = stringifyImports(newImports, isCJS);
	newEntries = onStringified?.(newEntries, newImports) ?? newEntries;
	if (newEntries) {
		const insertionIndex = injectAtLast ? findStaticImportsLazy().reverse().find((i) => i.end <= firstOccurrence)?.end ?? 0 : 0;
		if (insertionIndex > 0) s.appendRight(insertionIndex, `
${newEntries}
`);
		else if (hasShebang()) s.appendLeft(s.original.indexOf("\n") + 1, `
${newEntries}
`);
		else s.prepend(`${newEntries}
`);
	}
	return {
		s,
		get code() {
			return s.toString();
		}
	};
}
function normalizeImports(imports) {
	for (const _import of imports) _import.as = _import.as ?? _import.name;
	return imports;
}
function isFilePath(path$1) {
	return path$1.startsWith(".") || isAbsolute$1(path$1) || path$1.includes("://");
}
const contextRE$1 = /\b_ctx\.([$\w]+)\b/g;
const UNREF_KEY = "__unimport_unref_";
const VUE_TEMPLATE_NAME = "unimport:vue-template";
function vueTemplateAddon() {
	const self = {
		name: VUE_TEMPLATE_NAME,
		async transform(s, id) {
			if (!s.original.includes("_ctx.") || s.original.includes(UNREF_KEY)) return s;
			const matches = Array.from(s.original.matchAll(contextRE$1));
			const imports = await this.getImports();
			let targets = [];
			for (const match of matches) {
				const name = match[1];
				const item = imports.find((i) => i.as === name);
				if (!item) continue;
				const start = match.index;
				const end = start + match[0].length;
				const tempName = `__unimport_${name}`;
				s.overwrite(start, end, `(${JSON.stringify(name)} in _ctx ? _ctx.${name} : ${UNREF_KEY}(${tempName}))`);
				if (!targets.find((i) => i.as === tempName)) targets.push({
					...item,
					as: tempName
				});
			}
			if (targets.length) {
				targets.push({
					name: "unref",
					from: "vue",
					as: UNREF_KEY
				});
				for (const addon of this.addons) {
					if (addon === self) continue;
					targets = await addon.injectImportsResolved?.call(this, targets, s, id) ?? targets;
				}
				let injection = stringifyImports(targets);
				for (const addon of this.addons) {
					if (addon === self) continue;
					injection = await addon.injectImportsStringified?.call(this, injection, targets, s, id) ?? injection;
				}
				s.prepend(injection);
			}
			return s;
		},
		async declaration(dts, options) {
			return `${dts}
// for vue template auto import
import { UnwrapRef } from 'vue'
declare module 'vue' {
  interface ComponentCustomProperties {
${(await this.getImports()).map((i) => {
				if (i.type || i.dtsDisabled) return "";
				const from = options?.resolvePath?.(i) || i.from;
				return `readonly ${i.as}: UnwrapRef<typeof import('${from}')${i.name !== "*" ? `['${i.name}']` : ""}>`;
			}).filter(Boolean).sort().map((i) => `    ${i}`).join("\n")}
  }
}`;
		}
	};
	return self;
}
const contextRE = /resolveDirective as _resolveDirective/;
const contextText = `${contextRE.source}, `;
const directiveRE = /(?:var|const) (\w+) = _resolveDirective\("([\w.-]+)"\);?\s*/g;
const VUE_DIRECTIVES_NAME = "unimport:vue-directives";
function vueDirectivesAddon(options = {}) {
	function isDirective(importEntry) {
		let isDirective2 = importEntry.meta?.vueDirective === true;
		if (isDirective2) return true;
		isDirective2 = options.isDirective?.(normalizePath$1(process$1.cwd(), importEntry.from), importEntry) ?? false;
		if (isDirective2) {
			importEntry.meta ??= {};
			importEntry.meta.vueDirective = true;
		}
		return isDirective2;
	}
	const self = {
		name: VUE_DIRECTIVES_NAME,
		async transform(s, id) {
			if (!s.original.match(contextRE)) return s;
			const matches = Array.from(s.original.matchAll(directiveRE)).sort((a, b) => b.index - a.index);
			if (!matches.length) return s;
			let targets = [];
			for await (const [begin, end, importEntry] of findDirectives(isDirective, matches, this.getImports())) {
				s.overwrite(begin, end, "");
				targets.push(importEntry);
			}
			if (!targets.length) return s;
			if (!s.toString().match(directiveRE)) s.replace(contextText, "");
			for (const addon of this.addons) {
				if (addon === self) continue;
				targets = await addon.injectImportsResolved?.call(this, targets, s, id) ?? targets;
			}
			let injection = stringifyImports(targets);
			for (const addon of this.addons) {
				if (addon === self) continue;
				injection = await addon.injectImportsStringified?.call(this, injection, targets, s, id) ?? injection;
			}
			s.prepend(injection);
			return s;
		},
		async declaration(dts, options2) {
			const directivesMap = await this.getImports().then((imports) => {
				return imports.filter(isDirective).reduce((acc, i) => {
					if (i.type || i.dtsDisabled) return acc;
					let name;
					if (i.name === "default" && (i.as === "default" || !i.as)) {
						const file = basename(i.from);
						const idx = file.indexOf(".");
						name = idx > -1 ? file.slice(0, idx) : file;
					} else name = i.as ?? i.name;
					name = name[0] === "v" ? camelCase(name) : camelCase(`v-${name}`);
					if (!acc.has(name)) acc.set(name, i);
					return acc;
				}, /* @__PURE__ */ new Map());
			});
			if (!directivesMap.size) return dts;
			return `${dts}
// for vue directives auto import
declare module 'vue' {
  interface GlobalDirectives {
${Array.from(directivesMap.entries()).map(([name, i]) => `    ${name}: typeof import('${options2?.resolvePath?.(i) || i.from}')['${i.name}']`).sort().join("\n")}
  }
}`;
		}
	};
	return self;
}
function resolvePath(cwd$1, path$1) {
	return path$1[0] === "." ? resolve$1(cwd$1, path$1) : path$1;
}
function normalizePath$1(cwd$1, path$1) {
	return resolvePath(cwd$1, path$1).replace(/\\/g, "/");
}
async function* findDirectives(isDirective, regexArray, importsPromise) {
	const imports = (await importsPromise).filter(isDirective);
	if (!imports.length) return;
	const symbols = regexArray.reduce((acc, regex) => {
		const [all, symbol, resolveDirectiveName] = regex;
		if (acc.has(symbol)) return acc;
		acc.set(symbol, [
			regex.index,
			regex.index + all.length,
			kebabCase(resolveDirectiveName)
		]);
		return acc;
	}, /* @__PURE__ */ new Map());
	for (const [symbol, data] of symbols.entries()) yield* findDirective(imports, symbol, data);
}
function* findDirective(imports, symbol, [begin, end, importName]) {
	let resolvedName;
	for (const i of imports) {
		if (i.name === "default" && (i.as === "default" || !i.as)) {
			const file = basename(i.from);
			const idx = file.indexOf(".");
			resolvedName = kebabCase(idx > -1 ? file.slice(0, idx) : file);
		} else resolvedName = kebabCase(i.as ?? i.name);
		if (resolvedName === importName) {
			yield [
				begin,
				end,
				{
					...i,
					name: i.name,
					as: symbol
				}
			];
			return;
		}
		if (resolvedName[0] === "v") resolvedName = resolvedName.slice(resolvedName[1] === "-" ? 2 : 1);
		if (resolvedName === importName) {
			yield [
				begin,
				end,
				{
					...i,
					name: i.name,
					as: symbol
				}
			];
			return;
		}
	}
}

//#endregion
//#region node_modules/.pnpm/unimport@5.5.0/node_modules/unimport/dist/shared/unimport.C1hu2RXM.mjs
var import_picomatch$2 = /* @__PURE__ */ __toESM(require_picomatch(), 1);
const version = "5.5.0";
function configureAddons(opts) {
	const addons = [];
	if (Array.isArray(opts.addons)) addons.push(...opts.addons);
	else {
		const addonsMap = /* @__PURE__ */ new Map();
		if (opts.addons?.addons?.length) {
			let i = 0;
			for (const addon of opts.addons.addons) addonsMap.set(addon.name || `external:custom-${i++}`, addon);
		}
		if (opts.addons?.vueTemplate) {
			if (!addonsMap.has(VUE_TEMPLATE_NAME)) addonsMap.set(VUE_TEMPLATE_NAME, vueTemplateAddon());
		}
		if (opts.addons?.vueDirectives) {
			if (!addonsMap.has(VUE_DIRECTIVES_NAME)) addonsMap.set(VUE_DIRECTIVES_NAME, vueDirectivesAddon(typeof opts.addons.vueDirectives === "object" ? opts.addons.vueDirectives : void 0));
		}
		addons.push(...addonsMap.values());
	}
	return addons;
}
async function detectImportsRegex(code, ctx, options) {
	const s = getMagicString(code);
	const original = s.original;
	const strippedCode = stripCommentsAndStrings(original, options?.transformVirtualImports !== false && ctx.options.virtualImports?.length ? {
		filter: (i) => !ctx.options.virtualImports.includes(i),
		fillChar: "-"
	} : void 0);
	const syntax = detectSyntax(strippedCode);
	const isCJSContext = syntax.hasCJS && !syntax.hasESM;
	let matchedImports = [];
	const occurrenceMap = /* @__PURE__ */ new Map();
	const map = await ctx.getImportMap();
	if (options?.autoImport !== false) {
		Array.from(strippedCode.matchAll(matchRE)).forEach((i) => {
			if (i[1] === ".") return null;
			const end = strippedCode[i.index + i[0].length];
			const before = strippedCode[i.index - 1];
			if (end === ":" && !["?", "case"].includes(i[1].trim()) && before !== ":") return null;
			const name = i[2];
			const occurrence = i.index + i[1].length;
			if (occurrenceMap.get(name) || Number.POSITIVE_INFINITY > occurrence) occurrenceMap.set(name, occurrence);
		});
		for (const regex of excludeRE) for (const match of strippedCode.matchAll(regex)) {
			const segments = [...match[1]?.split(separatorRE) || [], ...match[2]?.split(separatorRE) || []];
			for (const segment of segments) {
				const identifier = segment.replace(importAsRE, "").trim();
				occurrenceMap.delete(identifier);
			}
		}
		const identifiers = new Set(occurrenceMap.keys());
		matchedImports = Array.from(identifiers).map((name) => {
			const item = map.get(name);
			if (item && !item.disabled) return item;
			occurrenceMap.delete(name);
			return null;
		}).filter(Boolean);
		for (const addon of ctx.addons) matchedImports = await addon.matchImports?.call(ctx, identifiers, matchedImports) || matchedImports;
	}
	if (options?.transformVirtualImports !== false && ctx.options.virtualImports?.length) {
		const virtualImports = parseVirtualImportsRegex(strippedCode, map, ctx.options.virtualImports);
		virtualImports.ranges.forEach(([start, end]) => {
			s.remove(start, end);
		});
		matchedImports.push(...virtualImports.imports);
	}
	const firstOccurrence = Math.min(...Array.from(occurrenceMap.entries()).map((i) => i[1]));
	return {
		s,
		strippedCode,
		isCJSContext,
		matchedImports,
		firstOccurrence
	};
}
function parseVirtualImportsRegex(strippedCode, importMap, virtualImports) {
	const imports = [];
	const ranges = [];
	if (virtualImports?.length) findStaticImports(strippedCode).filter((i) => virtualImports.includes(i.specifier)).map((i) => parseStaticImport(i)).forEach((i) => {
		ranges.push([i.start, i.end]);
		Object.entries(i.namedImports || {}).forEach(([name, as]) => {
			const original = importMap.get(name);
			if (!original) throw new Error(`[unimport] failed to find "${name}" imported from "${i.specifier}"`);
			imports.push({
				from: original.from,
				name: original.name,
				as
			});
		});
	});
	return {
		imports,
		ranges
	};
}
async function detectImports(code, ctx, options) {
	if (options?.parser === "acorn") return import("../cli/_chunks/detect-acorn.mjs").then((r) => r.detectImportsAcorn(code, ctx, options));
	return detectImportsRegex(code, ctx, options);
}
const FileExtensionLookup = [
	"mts",
	"cts",
	"ts",
	"tsx",
	"mjs",
	"cjs",
	"js",
	"jsx"
];
const FileLookupPatterns = `*.{${FileExtensionLookup.join(",")}}`;
function resolveGlobsExclude(glob2, cwd$1) {
	return `${glob2.startsWith("!") ? "!" : ""}${resolve$1(cwd$1, glob2.replace(/^!/, ""))}`;
}
function joinGlobFilePattern(glob2, filePattern) {
	return join$1(basename$1(glob2) === "*" ? dirname$1(glob2) : glob2, filePattern);
}
function normalizeScanDirs(dirs, options) {
	const topLevelTypes = options?.types ?? true;
	const cwd$1 = options?.cwd ?? process$1.cwd();
	const filePatterns = options?.filePatterns || [FileLookupPatterns];
	return dirs.map((dir) => {
		const isString$1 = typeof dir === "string";
		const glob2 = resolveGlobsExclude(isString$1 ? dir : dir.glob, cwd$1);
		const types = isString$1 ? topLevelTypes : dir.types ?? topLevelTypes;
		if (glob2.match(/\.\w+$/)) return {
			glob: glob2,
			types
		};
		const withFilePatterns = filePatterns.map((filePattern) => ({
			glob: joinGlobFilePattern(glob2, filePattern),
			types
		}));
		return [{
			glob: glob2,
			types
		}, ...withFilePatterns];
	}).flat();
}
async function scanFilesFromDir(dir, options) {
	const dirGlobs = (Array.isArray(dir) ? dir : [dir]).map((i) => i.glob);
	const files = (await glob(dirGlobs, {
		absolute: true,
		cwd: options?.cwd || process$1.cwd(),
		onlyFiles: true,
		followSymbolicLinks: true,
		expandDirectories: false
	})).map((i) => normalize$2(i));
	const fileFilter = options?.fileFilter || (() => true);
	const indexOfDirs = (file) => dirGlobs.findIndex((glob2) => import_picomatch$2.default.isMatch(file, glob2));
	return files.reduce((acc, file) => {
		const index = indexOfDirs(file);
		if (acc[index]) acc[index].push(normalize$2(file));
		else acc[index] = [normalize$2(file)];
		return acc;
	}, []).map((files2) => files2.sort()).flat().filter(fileFilter);
}
async function scanDirExports(dirs, options) {
	const normalizedDirs = normalizeScanDirs(dirs, options);
	const files = await scanFilesFromDir(normalizedDirs, options);
	const includeTypesDirs = normalizedDirs.filter((dir) => !dir.glob.startsWith("!") && dir.types);
	const isIncludeTypes = (file) => includeTypesDirs.some((dir) => import_picomatch$2.default.isMatch(file, dir.glob));
	return dedupeDtsExports((await Promise.all(files.map((file) => scanExports(file, isIncludeTypes(file))))).flat());
}
function dedupeDtsExports(exports$1) {
	return exports$1.filter((i) => {
		if (!i.type) return true;
		if (i.declarationType === "enum" || i.declarationType === "class") return true;
		return !exports$1.find((e) => e.as === i.as && e.name === i.name && !e.type);
	});
}
async function scanExports(filepath, includeTypes, seen = /* @__PURE__ */ new Set()) {
	if (seen.has(filepath)) {
		console.warn(`[unimport] "${filepath}" is already scanned, skipping`);
		return [];
	}
	seen.add(filepath);
	const imports = [];
	const code = await readFile(filepath, "utf-8");
	const exports$1 = findExports(code);
	if (exports$1.find((i) => i.type === "default")) {
		let name = parse$2(filepath).name;
		if (name === "index") name = parse$2(filepath.split("/").slice(0, -1).join("/")).name;
		const as = /[-_.]/.test(name) ? camelCase(name) : name;
		imports.push({
			name: "default",
			as,
			from: filepath
		});
	}
	async function toImport(exports2, additional) {
		for (const exp of exports2) if (exp.type === "named") for (const name of exp.names) imports.push({
			name,
			as: name,
			from: filepath,
			...additional
		});
		else if (exp.type === "declaration") {
			if (exp.name) {
				imports.push({
					name: exp.name,
					as: exp.name,
					from: filepath,
					...additional
				});
				if (exp.declarationType === "enum" || exp.declarationType === "class") imports.push({
					name: exp.name,
					as: exp.name,
					from: filepath,
					type: true,
					declarationType: exp.declarationType,
					...additional
				});
			}
		} else if (exp.type === "star" && exp.specifier) if (exp.name) imports.push({
			name: exp.name,
			as: exp.name,
			from: filepath,
			...additional
		});
		else {
			const subfile = exp.specifier;
			let subfilepath = resolve$1(dirname$1(filepath), subfile);
			let subfilepathResolved = false;
			for (const ext of FileExtensionLookup) if (existsSync(`${subfilepath}.${ext}`)) {
				subfilepath = `${subfilepath}.${ext}`;
				break;
			} else if (existsSync(`${subfilepath}/index.${ext}`)) {
				subfilepath = `${subfilepath}/index.${ext}`;
				break;
			}
			if (existsSync(subfilepath)) subfilepathResolved = true;
			else try {
				subfilepath = await resolve$2(exp.specifier);
				subfilepath = normalize$2(fileURLToPath(subfilepath));
				if (existsSync(subfilepath)) subfilepathResolved = true;
			} catch {}
			if (!subfilepathResolved) {
				console.warn(`[unimport] failed to resolve "${subfilepath}", skip scanning`);
				continue;
			}
			const nested = await scanExports(subfilepath, includeTypes, seen);
			imports.push(...additional ? nested.map((i) => ({
				...i,
				...additional
			})) : nested);
		}
	}
	if (filepath.match(/\.d\.[mc]?ts$/)) {
		if (includeTypes) {
			await toImport(exports$1, { type: true });
			await toImport(findTypeExports(code), { type: true });
		}
	} else {
		await toImport(exports$1);
		if (includeTypes) await toImport(findTypeExports(code), { type: true });
	}
	return imports;
}
const CACHE_PATH = /* @__PURE__ */ join$1(os.tmpdir(), "unimport");
let CACHE_WRITEABLE;
async function resolvePackagePreset(preset) {
	return (await extractExports(preset.package, preset.url, preset.cache)).filter((name) => {
		for (const item of preset.ignore || []) {
			if (typeof item === "string" && item === name) return false;
			if (item instanceof RegExp && item.test(name)) return false;
			if (typeof item === "function" && item(name) === false) return false;
		}
		return true;
	}).map((name) => ({
		from: preset.package,
		name
	}));
}
async function extractExports(name, url, cache = true) {
	const version$1 = (await readPackageJSON(await resolvePackageJSON(name, { url }))).version;
	const cachePath = join$1(CACHE_PATH, `${name}@${version$1}`, "exports.json");
	if (cache && CACHE_WRITEABLE === void 0) try {
		CACHE_WRITEABLE = isWritable(CACHE_PATH);
	} catch {
		CACHE_WRITEABLE = false;
	}
	const useCache = cache && version$1 && CACHE_WRITEABLE;
	if (useCache && existsSync(cachePath)) return JSON.parse(await promises.readFile(cachePath, "utf-8"));
	const scanned = await resolveModuleExportNames(name, { url });
	if (useCache) {
		await promises.mkdir(dirname$1(cachePath), { recursive: true });
		await promises.writeFile(cachePath, JSON.stringify(scanned), "utf-8");
	}
	return scanned;
}
function isWritable(filename) {
	try {
		accessSync(filename, constants.W_OK);
		return true;
	} catch {
		return false;
	}
}
const dateFns = defineUnimportPreset({
	from: "date-fns",
	imports: [
		"add",
		"addBusinessDays",
		"addDays",
		"addHours",
		"addISOWeekYears",
		"addMilliseconds",
		"addMinutes",
		"addMonths",
		"addQuarters",
		"addSeconds",
		"addWeeks",
		"addYears",
		"areIntervalsOverlapping",
		"clamp",
		"closestIndexTo",
		"closestTo",
		"compareAsc",
		"compareDesc",
		"constants",
		"daysToWeeks",
		"differenceInBusinessDays",
		"differenceInCalendarDays",
		"differenceInCalendarISOWeekYears",
		"differenceInCalendarISOWeeks",
		"differenceInCalendarMonths",
		"differenceInCalendarQuarters",
		"differenceInCalendarWeeks",
		"differenceInCalendarYears",
		"differenceInDays",
		"differenceInHours",
		"differenceInISOWeekYears",
		"differenceInMilliseconds",
		"differenceInMinutes",
		"differenceInMonths",
		"differenceInQuarters",
		"differenceInSeconds",
		"differenceInWeeks",
		"differenceInYears",
		"eachDayOfInterval",
		"eachHourOfInterval",
		"eachMinuteOfInterval",
		"eachMonthOfInterval",
		"eachQuarterOfInterval",
		"eachWeekOfInterval",
		"eachWeekendOfInterval",
		"eachWeekendOfMonth",
		"eachWeekendOfYear",
		"eachYearOfInterval",
		"endOfDay",
		"endOfDecade",
		"endOfHour",
		"endOfISOWeek",
		"endOfISOWeekYear",
		"endOfMinute",
		"endOfMonth",
		"endOfQuarter",
		"endOfSecond",
		"endOfToday",
		"endOfTomorrow",
		"endOfWeek",
		"endOfYear",
		"endOfYesterday",
		"format",
		"formatDistance",
		"formatDistanceStrict",
		"formatDistanceToNow",
		"formatDistanceToNowStrict",
		"formatDuration",
		"formatISO",
		"formatISO9075",
		"formatISODuration",
		"formatRFC3339",
		"formatRFC7231",
		"formatRelative",
		"fromUnixTime",
		"getDate",
		"getDay",
		"getDayOfYear",
		"getDaysInMonth",
		"getDaysInYear",
		"getDecade",
		"getDefaultOptions",
		"getHours",
		"getISODay",
		"getISOWeek",
		"getISOWeekYear",
		"getISOWeeksInYear",
		"getMilliseconds",
		"getMinutes",
		"getMonth",
		"getOverlappingDaysInIntervals",
		"getQuarter",
		"getSeconds",
		"getTime",
		"getUnixTime",
		"getWeek",
		"getWeekOfMonth",
		"getWeekYear",
		"getWeeksInMonth",
		"getYear",
		"hoursToMilliseconds",
		"hoursToMinutes",
		"hoursToSeconds",
		"intervalToDuration",
		"intlFormat",
		"intlFormatDistance",
		"isAfter",
		"isBefore",
		"isDate",
		"isEqual",
		"isExists",
		"isFirstDayOfMonth",
		"isFriday",
		"isFuture",
		"isLastDayOfMonth",
		"isLeapYear",
		"isMatch",
		"isMonday",
		"isPast",
		"isSameDay",
		"isSameHour",
		"isSameISOWeek",
		"isSameISOWeekYear",
		"isSameMinute",
		"isSameMonth",
		"isSameQuarter",
		"isSameSecond",
		"isSameWeek",
		"isSameYear",
		"isSaturday",
		"isSunday",
		"isThisHour",
		"isThisISOWeek",
		"isThisMinute",
		"isThisMonth",
		"isThisQuarter",
		"isThisSecond",
		"isThisWeek",
		"isThisYear",
		"isThursday",
		"isToday",
		"isTomorrow",
		"isTuesday",
		"isValid",
		"isWednesday",
		"isWeekend",
		"isWithinInterval",
		"isYesterday",
		"lastDayOfDecade",
		"lastDayOfISOWeek",
		"lastDayOfISOWeekYear",
		"lastDayOfMonth",
		"lastDayOfQuarter",
		"lastDayOfWeek",
		"lastDayOfYear",
		"lightFormat",
		"max",
		"milliseconds",
		"millisecondsToHours",
		"millisecondsToMinutes",
		"millisecondsToSeconds",
		"min",
		"minutesToHours",
		"minutesToMilliseconds",
		"minutesToSeconds",
		"monthsToQuarters",
		"monthsToYears",
		"nextDay",
		"nextFriday",
		"nextMonday",
		"nextSaturday",
		"nextSunday",
		"nextThursday",
		"nextTuesday",
		"nextWednesday",
		"parse",
		"parseISO",
		"parseJSON",
		"previousDay",
		"previousFriday",
		"previousMonday",
		"previousSaturday",
		"previousSunday",
		"previousThursday",
		"previousTuesday",
		"previousWednesday",
		"quartersToMonths",
		"quartersToYears",
		"roundToNearestMinutes",
		"secondsToHours",
		"secondsToMilliseconds",
		"secondsToMinutes",
		"set",
		"setDate",
		"setDay",
		"setDayOfYear",
		"setDefaultOptions",
		"setHours",
		"setISODay",
		"setISOWeek",
		"setISOWeekYear",
		"setMilliseconds",
		"setMinutes",
		"setMonth",
		"setQuarter",
		"setSeconds",
		"setWeek",
		"setWeekYear",
		"setYear",
		"startOfDay",
		"startOfDecade",
		"startOfHour",
		"startOfISOWeek",
		"startOfISOWeekYear",
		"startOfMinute",
		"startOfMonth",
		"startOfQuarter",
		"startOfSecond",
		"startOfToday",
		"startOfTomorrow",
		"startOfWeek",
		"startOfWeekYear",
		"startOfYear",
		"startOfYesterday",
		"sub",
		"subBusinessDays",
		"subDays",
		"subHours",
		"subISOWeekYears",
		"subMilliseconds",
		"subMinutes",
		"subMonths",
		"subQuarters",
		"subSeconds",
		"subWeeks",
		"subYears",
		"toDate",
		"weeksToDays",
		"yearsToMonths",
		"yearsToQuarters"
	]
});
const pinia = defineUnimportPreset({
	from: "pinia",
	imports: [
		"acceptHMRUpdate",
		"createPinia",
		"defineStore",
		"getActivePinia",
		"mapActions",
		"mapGetters",
		"mapState",
		"mapStores",
		"mapWritableState",
		"setActivePinia",
		"setMapStoreSuffix",
		"storeToRefs"
	]
});
const preact = defineUnimportPreset({
	from: "preact",
	imports: [
		"useState",
		"useCallback",
		"useMemo",
		"useEffect",
		"useRef",
		"useContext",
		"useReducer"
	]
});
const quasar = defineUnimportPreset({
	from: "quasar",
	imports: [
		"useQuasar",
		"useDialogPluginComponent",
		"useFormChild",
		"useMeta"
	]
});
const react = defineUnimportPreset({
	from: "react",
	imports: [
		"useState",
		"useCallback",
		"useMemo",
		"useEffect",
		"useRef",
		"useContext",
		"useReducer"
	]
});
const ReactRouterHooks = [
	"useOutletContext",
	"useHref",
	"useInRouterContext",
	"useLocation",
	"useNavigationType",
	"useNavigate",
	"useOutlet",
	"useParams",
	"useResolvedPath",
	"useRoutes"
];
const reactRouter = defineUnimportPreset({
	from: "react-router",
	imports: [...ReactRouterHooks]
});
const reactRouterDom = defineUnimportPreset({
	from: "react-router-dom",
	imports: [
		...ReactRouterHooks,
		"useLinkClickHandler",
		"useSearchParams",
		"Link",
		"NavLink",
		"Navigate",
		"Outlet",
		"Route",
		"Routes"
	]
});
const rxjs = defineUnimportPreset({
	from: "rxjs",
	imports: [
		"of",
		"from",
		"map",
		"tap",
		"filter",
		"forkJoin",
		"throwError",
		"catchError",
		"Observable",
		"mergeMap",
		"switchMap",
		"merge",
		"zip",
		"take",
		"takeUntil",
		"first",
		"lastValueFrom",
		"skip",
		"skipUntil",
		"distinct",
		"distinctUntilChanged",
		"throttle",
		"throttleTime",
		"retry",
		"retryWhen",
		"timeout",
		"delay",
		"debounce",
		"debounceTime",
		"find",
		"every"
	]
});
const solid = defineUnimportPreset({
	from: "solid-js",
	imports: [
		defineUnimportPreset({
			from: "solid-js",
			imports: [
				"createSignal",
				"createEffect",
				"createMemo",
				"createResource",
				"onMount",
				"onCleanup",
				"onError",
				"untrack",
				"batch",
				"on",
				"createRoot",
				"mergeProps",
				"splitProps",
				"useTransition",
				"observable",
				"mapArray",
				"indexArray",
				"createContext",
				"useContext",
				"children",
				"lazy",
				"createDeferred",
				"createRenderEffect",
				"createSelector",
				"For",
				"Show",
				"Switch",
				"Match",
				"Index",
				"ErrorBoundary",
				"Suspense",
				"SuspenseList"
			]
		}),
		defineUnimportPreset({
			from: "solid-js/store",
			imports: [
				"createStore",
				"produce",
				"reconcile",
				"createMutable"
			]
		}),
		defineUnimportPreset({
			from: "solid-js/web",
			imports: [
				"Dynamic",
				"hydrate",
				"render",
				"renderToString",
				"renderToStringAsync",
				"renderToStream",
				"isServer",
				"Portal"
			]
		})
	]
});
const solidAppRouter = defineUnimportPreset({
	from: "solid-app-router",
	imports: [
		"Link",
		"NavLink",
		"Navigate",
		"Outlet",
		"Route",
		"Router",
		"Routes",
		"_mergeSearchString",
		"createIntegration",
		"hashIntegration",
		"normalizeIntegration",
		"pathIntegration",
		"staticIntegration",
		"useHref",
		"useIsRouting",
		"useLocation",
		"useMatch",
		"useNavigate",
		"useParams",
		"useResolvedPath",
		"useRouteData",
		"useRoutes",
		"useSearchParams"
	]
});
const svelteAnimate = defineUnimportPreset({
	from: "svelte/animate",
	imports: ["flip"]
});
const svelteEasing = defineUnimportPreset({
	from: "svelte/easing",
	imports: [
		"back",
		"bounce",
		"circ",
		"cubic",
		"elastic",
		"expo",
		"quad",
		"quart",
		"quint",
		"sine"
	].reduce((acc, e) => {
		acc.push(`${e}In`, `${e}Out`, `${e}InOut`);
		return acc;
	}, ["linear"])
});
const svelteStore = defineUnimportPreset({
	from: "svelte/store",
	imports: [
		"writable",
		"readable",
		"derived",
		"get"
	]
});
const svelteMotion = defineUnimportPreset({
	from: "svelte/motion",
	imports: ["tweened", "spring"]
});
const svelteTransition = defineUnimportPreset({
	from: "svelte/transition",
	imports: [
		"fade",
		"blur",
		"fly",
		"slide",
		"scale",
		"draw",
		"crossfade"
	]
});
const svelte = defineUnimportPreset({
	from: "svelte",
	imports: [
		"onMount",
		"beforeUpdate",
		"afterUpdate",
		"onDestroy",
		"tick",
		"setContext",
		"getContext",
		"hasContext",
		"getAllContexts",
		"createEventDispatcher"
	]
});
const uniApp = defineUnimportPreset({
	from: "@dcloudio/uni-app",
	imports: [
		"onAddToFavorites",
		"onBackPress",
		"onError",
		"onHide",
		"onLaunch",
		"onLoad",
		"onNavigationBarButtonTap",
		"onNavigationBarSearchInputChanged",
		"onNavigationBarSearchInputClicked",
		"onNavigationBarSearchInputConfirmed",
		"onNavigationBarSearchInputFocusChanged",
		"onPageNotFound",
		"onPageScroll",
		"onPullDownRefresh",
		"onReachBottom",
		"onReady",
		"onResize",
		"onShareAppMessage",
		"onShareTimeline",
		"onShow",
		"onTabItemTap",
		"onThemeChange",
		"onUnhandledRejection",
		"onUnload"
	]
});
const veeValidate = defineUnimportPreset({
	from: "vee-validate",
	imports: [
		"validate",
		"defineRule",
		"configure",
		"useField",
		"useForm",
		"useFieldArray",
		"useResetForm",
		"useIsFieldDirty",
		"useIsFieldTouched",
		"useIsFieldValid",
		"useIsSubmitting",
		"useValidateField",
		"useIsFormDirty",
		"useIsFormTouched",
		"useIsFormValid",
		"useValidateForm",
		"useSubmitCount",
		"useFieldValue",
		"useFormValues",
		"useFormErrors",
		"useFieldError",
		"useSubmitForm",
		"FormContextKey",
		"FieldContextKey"
	]
});
const vitepress = defineUnimportPreset({
	from: "vitepress",
	imports: [
		"useData",
		"useRoute",
		"useRouter",
		"withBase"
	]
});
const vitest = defineUnimportPreset({
	from: "vitest",
	imports: [
		"suite",
		"test",
		"describe",
		"it",
		"chai",
		"expect",
		"assert",
		"vitest",
		"vi",
		"beforeAll",
		"afterAll",
		"beforeEach",
		"afterEach"
	]
});
const CommonCompositionAPI = [
	"onActivated",
	"onBeforeMount",
	"onBeforeUnmount",
	"onBeforeUpdate",
	"onErrorCaptured",
	"onDeactivated",
	"onMounted",
	"onServerPrefetch",
	"onUnmounted",
	"onUpdated",
	"useAttrs",
	"useSlots",
	"computed",
	"customRef",
	"isReadonly",
	"isRef",
	"isShallow",
	"isProxy",
	"isReactive",
	"markRaw",
	"reactive",
	"readonly",
	"ref",
	"shallowReactive",
	"shallowReadonly",
	"shallowRef",
	"triggerRef",
	"toRaw",
	"toRef",
	"toRefs",
	"toValue",
	"unref",
	"watch",
	"watchEffect",
	"watchPostEffect",
	"watchSyncEffect",
	"defineComponent",
	"defineAsyncComponent",
	"getCurrentInstance",
	"h",
	"inject",
	"nextTick",
	"provide",
	"useCssModule",
	"createApp",
	"effectScope",
	"EffectScope",
	"getCurrentScope",
	"onScopeDispose",
	...[
		"Component",
		"Slot",
		"Slots",
		"ComponentPublicInstance",
		"ComputedRef",
		"DirectiveBinding",
		"ExtractDefaultPropTypes",
		"ExtractPropTypes",
		"ExtractPublicPropTypes",
		"InjectionKey",
		"PropType",
		"Ref",
		"ShallowRef",
		"MaybeRef",
		"MaybeRefOrGetter",
		"VNode",
		"WritableComputedRef"
	].map((name) => ({
		name,
		type: true
	}))
];
const vue = defineUnimportPreset({
	from: "vue",
	imports: [
		...CommonCompositionAPI,
		"onRenderTracked",
		"onRenderTriggered",
		"resolveComponent",
		"useCssVars",
		"useModel",
		"getCurrentWatcher",
		"onWatcherCleanup",
		"useId",
		"useTemplateRef"
	]
});
const vueCompositionApi = defineUnimportPreset({
	from: "@vue/composition-api",
	imports: CommonCompositionAPI
});
const vueDemi = defineUnimportPreset({
	from: "vue-demi",
	imports: CommonCompositionAPI
});
const vueI18n = defineUnimportPreset({
	from: "vue-i18n",
	imports: ["useI18n"]
});
const vueMacros = defineUnimportPreset({
	from: "vue/macros",
	imports: [
		"$",
		"$$",
		"$ref",
		"$shallowRef",
		"$toRef",
		"$customRef",
		"$computed"
	]
});
const vueRouter = defineUnimportPreset({
	from: "vue-router",
	imports: [
		"useRouter",
		"useRoute",
		"useLink",
		"onBeforeRouteLeave",
		"onBeforeRouteUpdate"
	]
});
const vueRouterComposables = defineUnimportPreset({
	from: "vue-router/composables",
	imports: [
		"useRouter",
		"useRoute",
		"useLink",
		"onBeforeRouteLeave",
		"onBeforeRouteUpdate"
	]
});
let _cache;
const vueuseCore = () => {
	const excluded = ["toRefs", "utils"];
	if (!_cache) try {
		const corePath = resolveModule("@vueuse/core") || process$1.cwd();
		const path$1 = resolveModule("@vueuse/core/indexes.json") || resolveModule("@vueuse/metadata/index.json") || resolveModule("@vueuse/metadata/index.json", { paths: [corePath] });
		_cache = defineUnimportPreset({
			from: "@vueuse/core",
			imports: JSON.parse(readFileSync(path$1, "utf-8")).functions.filter((i) => ["core", "shared"].includes(i.package)).map((i) => i.name).filter((i) => i && i.length >= 4 && !excluded.includes(i))
		});
	} catch (error) {
		console.error(error);
		throw new Error("[auto-import] failed to load @vueuse/core, have you installed it?");
	}
	return _cache;
};
const vueuseHead = defineUnimportPreset({
	from: "@vueuse/head",
	imports: ["useHead"]
});
const vuex = defineUnimportPreset({
	from: "vuex",
	imports: [
		"createStore",
		"createLogger",
		"mapState",
		"mapGetters",
		"mapActions",
		"mapMutations",
		"createNamespacedHelpers",
		"useStore"
	]
});
const builtinPresets = {
	"@vue/composition-api": vueCompositionApi,
	"@vueuse/core": vueuseCore,
	"@vueuse/head": vueuseHead,
	"pinia": pinia,
	"preact": preact,
	"quasar": quasar,
	"react": react,
	"react-router": reactRouter,
	"react-router-dom": reactRouterDom,
	"svelte": svelte,
	"svelte/animate": svelteAnimate,
	"svelte/easing": svelteEasing,
	"svelte/motion": svelteMotion,
	"svelte/store": svelteStore,
	"svelte/transition": svelteTransition,
	"vee-validate": veeValidate,
	"vitepress": vitepress,
	"vue-demi": vueDemi,
	"vue-i18n": vueI18n,
	"vue-router": vueRouter,
	"vue-router-composables": vueRouterComposables,
	"vue": vue,
	"vue/macros": vueMacros,
	"vuex": vuex,
	"vitest": vitest,
	"uni-app": uniApp,
	"solid-js": solid,
	"solid-app-router": solidAppRouter,
	"rxjs": rxjs,
	"date-fns": dateFns
};
const commonProps = [
	"from",
	"priority",
	"disabled",
	"dtsDisabled",
	"declarationType",
	"meta",
	"type",
	"typeFrom"
];
async function resolvePreset(preset) {
	const imports = [];
	if ("package" in preset) return await resolvePackagePreset(preset);
	const common = {};
	commonProps.forEach((i) => {
		if (i in preset) common[i] = preset[i];
	});
	for (const _import of preset.imports) if (typeof _import === "string") imports.push({
		...common,
		name: _import,
		as: _import
	});
	else if (Array.isArray(_import)) imports.push({
		...common,
		name: _import[0],
		as: _import[1] || _import[0],
		from: _import[2] || preset.from
	});
	else if (_import.imports) imports.push(...await resolvePreset(_import));
	else imports.push({
		...common,
		..._import
	});
	return imports;
}
async function resolveBuiltinPresets(presets) {
	return (await Promise.all(presets.map(async (p) => {
		let preset = typeof p === "string" ? builtinPresets[p] : p;
		if (typeof preset === "function") preset = preset();
		return await resolvePreset(preset);
	}))).flat();
}
function createUnimport(opts) {
	const ctx = createInternalContext(opts);
	async function generateTypeDeclarations(options) {
		const opts2 = {
			resolvePath: (i) => stripFileExtension(i.typeFrom || i.from),
			...options
		};
		const { typeReExports = true } = opts2;
		const imports = await ctx.getImports();
		let dts = toTypeDeclarationFile(imports.filter((i) => !i.type && !i.dtsDisabled), opts2);
		const typeOnly = imports.filter((i) => i.type);
		if (typeReExports && typeOnly.length) dts += `
${toTypeReExports(typeOnly, opts2)}`;
		for (const addon of ctx.addons) dts = await addon.declaration?.call(ctx, dts, opts2) ?? dts;
		return dts;
	}
	async function scanImportsFromFile(filepath, includeTypes = true) {
		const additions = await scanExports(filepath, includeTypes);
		await ctx.modifyDynamicImports((imports) => imports.filter((i) => i.from !== filepath).concat(additions));
		return additions;
	}
	async function scanImportsFromDir(dirs = ctx.options.dirs || [], options = ctx.options.dirsScanOptions) {
		const imports = await scanDirExports(dirs, options);
		const files = new Set(imports.map((f) => f.from));
		await ctx.modifyDynamicImports((i) => i.filter((i2) => !files.has(i2.from)).concat(imports));
		return imports;
	}
	async function injectImportsWithContext(code, id, options) {
		const result = await injectImports(code, id, ctx, {
			...opts,
			...options
		});
		const metadata = ctx.getMetadata();
		if (metadata) result.imports.forEach((i) => {
			metadata.injectionUsage[i.name] = metadata.injectionUsage[i.name] || {
				import: i,
				count: 0,
				moduleIds: []
			};
			metadata.injectionUsage[i.name].count++;
			if (id && !metadata.injectionUsage[i.name].moduleIds.includes(id)) metadata.injectionUsage[i.name].moduleIds.push(id);
		});
		return result;
	}
	async function init() {
		if (ctx.options.dirs?.length) await scanImportsFromDir();
	}
	return {
		version,
		init,
		clearDynamicImports: () => ctx.clearDynamicImports(),
		modifyDynamicImports: (fn) => ctx.modifyDynamicImports(fn),
		scanImportsFromDir,
		scanImportsFromFile,
		getImports: () => ctx.getImports(),
		getImportMap: () => ctx.getImportMap(),
		detectImports: (code) => detectImports(code, ctx),
		injectImports: injectImportsWithContext,
		generateTypeDeclarations: (options) => generateTypeDeclarations(options),
		getMetadata: () => ctx.getMetadata(),
		getInternalContext: () => ctx,
		toExports: async (filepath, includeTypes = false) => toExports(await ctx.getImports(), filepath, includeTypes)
	};
}
function createInternalContext(opts) {
	let _combinedImports;
	const _map = /* @__PURE__ */ new Map();
	const addons = configureAddons(opts);
	opts.addons = addons;
	opts.commentsDisable = opts.commentsDisable ?? ["@unimport-disable", "@imports-disable"];
	opts.commentsDebug = opts.commentsDebug ?? ["@unimport-debug", "@imports-debug"];
	let metadata;
	if (opts.collectMeta) metadata = { injectionUsage: {} };
	let resolvePromise;
	const ctx = {
		version,
		options: opts,
		addons,
		staticImports: [...opts.imports || []].filter(Boolean),
		dynamicImports: [],
		modifyDynamicImports,
		clearDynamicImports,
		async getImports() {
			await resolvePromise;
			return updateImports();
		},
		async replaceImports(imports) {
			ctx.staticImports = [...imports || []].filter(Boolean);
			ctx.invalidate();
			await resolvePromise;
			return updateImports();
		},
		async getImportMap() {
			await ctx.getImports();
			return _map;
		},
		getMetadata() {
			return metadata;
		},
		invalidate() {
			_combinedImports = void 0;
		},
		resolveId: (id, parentId) => opts.resolveId?.(id, parentId)
	};
	resolvePromise = resolveBuiltinPresets(opts.presets || []).then((r) => {
		ctx.staticImports.unshift(...r);
		_combinedImports = void 0;
		updateImports();
	});
	function updateImports() {
		if (!_combinedImports) {
			let imports = normalizeImports(dedupeImports([...ctx.staticImports, ...ctx.dynamicImports], opts.warn || console.warn));
			for (const addon of ctx.addons) if (addon.extendImports) imports = addon.extendImports.call(ctx, imports) ?? imports;
			imports = imports.filter((i) => !i.disabled);
			_map.clear();
			for (const _import of imports) if (!_import.type) _map.set(_import.as ?? _import.name, _import);
			_combinedImports = imports;
		}
		return _combinedImports;
	}
	async function modifyDynamicImports(fn) {
		const result = await fn(ctx.dynamicImports);
		if (Array.isArray(result)) ctx.dynamicImports = result;
		ctx.invalidate();
	}
	function clearDynamicImports() {
		ctx.dynamicImports.length = 0;
		ctx.invalidate();
	}
	return ctx;
}
async function injectImports(code, id, ctx, options) {
	const s = getMagicString(code);
	if (ctx.options.commentsDisable?.some((c) => s.original.includes(c))) return {
		s,
		get code() {
			return s.toString();
		},
		imports: []
	};
	for (const addon of ctx.addons) await addon.transform?.call(ctx, s, id);
	const { isCJSContext, matchedImports, firstOccurrence } = await detectImports(s, ctx, options);
	const imports = await resolveImports(ctx, matchedImports, id);
	if (ctx.options.commentsDebug?.some((c) => s.original.includes(c))) (ctx.options.debugLog || console.log)(`[unimport] ${imports.length} imports detected in "${id}"${imports.length ? `: ${imports.map((i) => i.name).join(", ")}` : ""}`);
	return {
		...addImportToCode(s, imports, isCJSContext, options?.mergeExisting, options?.injectAtEnd, firstOccurrence, (imports2) => {
			for (const addon of ctx.addons) imports2 = addon.injectImportsResolved?.call(ctx, imports2, s, id) ?? imports2;
			return imports2;
		}, (str, imports2) => {
			for (const addon of ctx.addons) str = addon.injectImportsStringified?.call(ctx, str, imports2, s, id) ?? str;
			return str;
		}),
		imports
	};
}
async function resolveImports(ctx, imports, id) {
	const resolveCache = /* @__PURE__ */ new Map();
	return (await Promise.all(imports.map(async (i) => {
		if (!resolveCache.has(i.from)) resolveCache.set(i.from, await ctx.resolveId(i.from, id) || i.from);
		const from = resolveCache.get(i.from);
		if (i.from === id || !from || from === "." || from === id) return;
		return {
			...i,
			from
		};
	}))).filter(Boolean);
}

//#endregion
//#region node_modules/.pnpm/unplugin@2.3.10/node_modules/unplugin/dist/context-D49cMElb.js
var import_picomatch$1 = /* @__PURE__ */ __toESM(require_picomatch(), 1);
function toArray$2(array) {
	array = array || [];
	if (Array.isArray(array)) return array;
	return [array];
}
const BACKSLASH_REGEX = /\\/g;
function normalize$1(path$1) {
	return path$1.replace(BACKSLASH_REGEX, "/");
}
const ABSOLUTE_PATH_REGEX = /^(?:\/|(?:[A-Z]:)?[/\\|])/i;
function isAbsolute$1$1(path$1) {
	return ABSOLUTE_PATH_REGEX.test(path$1);
}
function getMatcherString$1(glob$1, cwd$1) {
	if (glob$1.startsWith("**") || isAbsolute$1$1(glob$1)) return normalize$1(glob$1);
	return normalize$1(resolve(cwd$1, glob$1));
}
function patternToIdFilter(pattern) {
	if (pattern instanceof RegExp) return (id) => {
		const normalizedId = normalize$1(id);
		const result = pattern.test(normalizedId);
		pattern.lastIndex = 0;
		return result;
	};
	const matcher = (0, import_picomatch$1.default)(getMatcherString$1(pattern, process.cwd()), { dot: true });
	return (id) => {
		return matcher(normalize$1(id));
	};
}
function patternToCodeFilter(pattern) {
	if (pattern instanceof RegExp) return (code) => {
		const result = pattern.test(code);
		pattern.lastIndex = 0;
		return result;
	};
	return (code) => code.includes(pattern);
}
function createFilter$1(exclude, include) {
	if (!exclude && !include) return;
	return (input) => {
		if (exclude?.some((filter) => filter(input))) return false;
		if (include?.some((filter) => filter(input))) return true;
		return !(include && include.length > 0);
	};
}
function normalizeFilter(filter) {
	if (typeof filter === "string" || filter instanceof RegExp) return { include: [filter] };
	if (Array.isArray(filter)) return { include: filter };
	return {
		exclude: filter.exclude ? toArray$2(filter.exclude) : void 0,
		include: filter.include ? toArray$2(filter.include) : void 0
	};
}
function createIdFilter(filter) {
	if (!filter) return;
	const { exclude, include } = normalizeFilter(filter);
	const excludeFilter = exclude?.map(patternToIdFilter);
	const includeFilter = include?.map(patternToIdFilter);
	return createFilter$1(excludeFilter, includeFilter);
}
function createCodeFilter(filter) {
	if (!filter) return;
	const { exclude, include } = normalizeFilter(filter);
	const excludeFilter = exclude?.map(patternToCodeFilter);
	const includeFilter = include?.map(patternToCodeFilter);
	return createFilter$1(excludeFilter, includeFilter);
}
function createFilterForId(filter) {
	const filterFunction = createIdFilter(filter);
	return filterFunction ? (id) => !!filterFunction(id) : void 0;
}
function createFilterForTransform(idFilter, codeFilter) {
	if (!idFilter && !codeFilter) return;
	const idFilterFunction = createIdFilter(idFilter);
	const codeFilterFunction = createCodeFilter(codeFilter);
	return (id, code) => {
		let fallback = true;
		if (idFilterFunction) fallback &&= idFilterFunction(id);
		if (!fallback) return false;
		if (codeFilterFunction) fallback &&= codeFilterFunction(code);
		return fallback;
	};
}
function normalizeObjectHook(name, hook) {
	let handler;
	let filter;
	if (typeof hook === "function") handler = hook;
	else {
		handler = hook.handler;
		const hookFilter = hook.filter;
		if (name === "resolveId" || name === "load") filter = createFilterForId(hookFilter?.id);
		else filter = createFilterForTransform(hookFilter?.id, hookFilter?.code);
	}
	return {
		handler,
		filter: filter || (() => true)
	};
}
function parse$1(code, opts = {}) {
	return Parser.parse(code, {
		sourceType: "module",
		ecmaVersion: "latest",
		locations: true,
		...opts
	});
}

//#endregion
//#region node_modules/.pnpm/unplugin@2.3.10/node_modules/unplugin/dist/webpack-like-CSbnjTNU.js
function transformUse(data, plugin, transformLoader) {
	if (data.resource == null) return [];
	const id = normalizeAbsolutePath(data.resource + (data.resourceQuery || ""));
	if (plugin.transformInclude && !plugin.transformInclude(id)) return [];
	const { filter } = normalizeObjectHook("load", plugin.transform);
	if (!filter(id)) return [];
	return [{
		loader: transformLoader,
		options: { plugin },
		ident: plugin.name
	}];
}
/**
* Normalizes a given path when it's absolute. Normalizing means returning a new path by converting
* the input path to the native os format. This is useful in cases where we want to normalize
* the `id` argument of a hook. Any absolute ids should be in the default format
* of the operating system. Any relative imports or node_module imports should remain
* untouched.
*
* @param path - Path to normalize.
* @returns a new normalized path.
*/
function normalizeAbsolutePath(path$1) {
	if (isAbsolute(path$1)) return normalize(path$1);
	else return path$1;
}

//#endregion
//#region node_modules/.pnpm/unplugin@2.3.10/node_modules/unplugin/dist/context-D_KPTgTH.js
function createBuildContext(compiler, compilation, loaderContext) {
	return {
		getNativeBuildContext() {
			return {
				framework: "rspack",
				compiler,
				compilation,
				loaderContext
			};
		},
		addWatchFile(file) {
			const cwd$1 = process.cwd();
			compilation.fileDependencies.add(resolve(cwd$1, file));
		},
		getWatchFiles() {
			return Array.from(compilation.fileDependencies);
		},
		parse: parse$1,
		emitFile(emittedFile) {
			const outFileName = emittedFile.fileName || emittedFile.name;
			if (emittedFile.source && outFileName) {
				const { sources } = compilation.compiler.webpack;
				compilation.emitAsset(outFileName, new sources.RawSource(typeof emittedFile.source === "string" ? emittedFile.source : Buffer.from(emittedFile.source)));
			}
		}
	};
}
function normalizeMessage(error) {
	const err = new Error(typeof error === "string" ? error : error.message);
	if (typeof error === "object") {
		err.stack = error.stack;
		err.cause = error.meta;
	}
	return err;
}

//#endregion
//#region node_modules/.pnpm/unplugin@2.3.10/node_modules/unplugin/dist/utils-C8vphsat.js
function encodeVirtualModuleId(id, plugin) {
	return resolve(plugin.__virtualModulePrefix, encodeURIComponent(id));
}
function decodeVirtualModuleId(encoded, _plugin) {
	return decodeURIComponent(basename(encoded));
}
function isVirtualModuleId(encoded, plugin) {
	return dirname(encoded) === plugin.__virtualModulePrefix;
}
var FakeVirtualModulesPlugin = class FakeVirtualModulesPlugin$1 {
	name = "FakeVirtualModulesPlugin";
	static counters = /* @__PURE__ */ new Map();
	static initCleanup = false;
	constructor(plugin) {
		this.plugin = plugin;
		if (!FakeVirtualModulesPlugin$1.initCleanup) {
			FakeVirtualModulesPlugin$1.initCleanup = true;
			process.once("exit", () => {
				FakeVirtualModulesPlugin$1.counters.forEach((_, dir) => {
					fs.rmSync(dir, {
						recursive: true,
						force: true
					});
				});
			});
		}
	}
	apply(compiler) {
		const dir = this.plugin.__virtualModulePrefix;
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		const counter = FakeVirtualModulesPlugin$1.counters.get(dir) ?? 0;
		FakeVirtualModulesPlugin$1.counters.set(dir, counter + 1);
		compiler.hooks.shutdown.tap(this.name, () => {
			const counter$1 = (FakeVirtualModulesPlugin$1.counters.get(dir) ?? 1) - 1;
			if (counter$1 === 0) {
				FakeVirtualModulesPlugin$1.counters.delete(dir);
				fs.rmSync(dir, {
					recursive: true,
					force: true
				});
			} else FakeVirtualModulesPlugin$1.counters.set(dir, counter$1);
		});
	}
	async writeModule(file) {
		return fs.promises.writeFile(file, "");
	}
};

//#endregion
//#region node_modules/.pnpm/unplugin@2.3.10/node_modules/unplugin/dist/context-BZKy5Nsn.js
function contextOptionsFromCompilation(compilation) {
	return {
		addWatchFile(file) {
			(compilation.fileDependencies ?? compilation.compilationDependencies).add(file);
		},
		getWatchFiles() {
			return Array.from(compilation.fileDependencies ?? compilation.compilationDependencies);
		}
	};
}
const require$1 = createRequire(import.meta.url);
function getSource(fileSource) {
	return new (require$1("webpack")).sources.RawSource(typeof fileSource === "string" ? fileSource : Buffer.from(fileSource.buffer));
}
function createBuildContext$1(options, compiler, compilation, loaderContext) {
	return {
		parse: parse$1,
		addWatchFile(id) {
			options.addWatchFile(resolve(process$1.cwd(), id));
		},
		emitFile(emittedFile) {
			const outFileName = emittedFile.fileName || emittedFile.name;
			if (emittedFile.source && outFileName) {
				if (!compilation) throw new Error("unplugin/webpack: emitFile outside supported hooks  (buildStart, buildEnd, load, transform, watchChange)");
				compilation.emitAsset(outFileName, getSource(emittedFile.source));
			}
		},
		getWatchFiles() {
			return options.getWatchFiles();
		},
		getNativeBuildContext() {
			return {
				framework: "webpack",
				compiler,
				compilation,
				loaderContext
			};
		}
	};
}
function normalizeMessage$1(error) {
	const err = new Error(typeof error === "string" ? error : error.message);
	if (typeof error === "object") {
		err.stack = error.stack;
		err.cause = error.meta;
	}
	return err;
}

//#endregion
//#region node_modules/.pnpm/webpack-virtual-modules@0.6.2/node_modules/webpack-virtual-modules/lib/virtual-stats.js
var require_virtual_stats = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/webpack-virtual-modules@0.6.2/node_modules/webpack-virtual-modules/lib/virtual-stats.js": ((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VirtualStats = void 0;
	const constants_1 = __importDefault(__require("constants"));
	var VirtualStats = class {
		constructor(config) {
			for (const key in config) {
				if (!Object.prototype.hasOwnProperty.call(config, key)) continue;
				this[key] = config[key];
			}
		}
		_checkModeProperty(property) {
			return (this.mode & constants_1.default.S_IFMT) === property;
		}
		isDirectory() {
			return this._checkModeProperty(constants_1.default.S_IFDIR);
		}
		isFile() {
			return this._checkModeProperty(constants_1.default.S_IFREG);
		}
		isBlockDevice() {
			return this._checkModeProperty(constants_1.default.S_IFBLK);
		}
		isCharacterDevice() {
			return this._checkModeProperty(constants_1.default.S_IFCHR);
		}
		isSymbolicLink() {
			return this._checkModeProperty(constants_1.default.S_IFLNK);
		}
		isFIFO() {
			return this._checkModeProperty(constants_1.default.S_IFIFO);
		}
		isSocket() {
			return this._checkModeProperty(constants_1.default.S_IFSOCK);
		}
	};
	exports.VirtualStats = VirtualStats;
}) });

//#endregion
//#region node_modules/.pnpm/webpack-virtual-modules@0.6.2/node_modules/webpack-virtual-modules/lib/index.js
var require_lib = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/webpack-virtual-modules@0.6.2/node_modules/webpack-virtual-modules/lib/index.js": ((exports, module) => {
	const path_1 = (exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	})(__require("path"));
	const virtual_stats_1 = require_virtual_stats();
	let inode = 45e6;
	const ALL = "all";
	const STATIC = "static";
	const DYNAMIC = "dynamic";
	function checkActivation(instance) {
		if (!instance._compiler) throw new Error("You must use this plugin only after creating webpack instance!");
	}
	function getModulePath(filePath, compiler) {
		return path_1.default.isAbsolute(filePath) ? filePath : path_1.default.join(compiler.context, filePath);
	}
	function createWebpackData(result) {
		return (backendOrStorage) => {
			if (backendOrStorage._data) {
				const curLevelIdx = backendOrStorage._currentLevel;
				return {
					result,
					level: backendOrStorage._levels[curLevelIdx]
				};
			}
			return [null, result];
		};
	}
	function getData(storage, key) {
		if (storage._data instanceof Map) return storage._data.get(key);
		else if (storage._data) return storage.data[key];
		else if (storage.data instanceof Map) return storage.data.get(key);
		else return storage.data[key];
	}
	function setData(backendOrStorage, key, valueFactory) {
		const value = valueFactory(backendOrStorage);
		if (backendOrStorage._data instanceof Map) backendOrStorage._data.set(key, value);
		else if (backendOrStorage._data) backendOrStorage.data[key] = value;
		else if (backendOrStorage.data instanceof Map) backendOrStorage.data.set(key, value);
		else backendOrStorage.data[key] = value;
	}
	function getStatStorage(fileSystem) {
		if (fileSystem._statStorage) return fileSystem._statStorage;
		else if (fileSystem._statBackend) return fileSystem._statBackend;
		else throw new Error("Couldn't find a stat storage");
	}
	function getFileStorage(fileSystem) {
		if (fileSystem._readFileStorage) return fileSystem._readFileStorage;
		else if (fileSystem._readFileBackend) return fileSystem._readFileBackend;
		else throw new Error("Couldn't find a readFileStorage");
	}
	function getReadDirBackend(fileSystem) {
		if (fileSystem._readdirBackend) return fileSystem._readdirBackend;
		else if (fileSystem._readdirStorage) return fileSystem._readdirStorage;
		else throw new Error("Couldn't find a readDirStorage from Webpack Internals");
	}
	function getRealpathBackend(fileSystem) {
		if (fileSystem._realpathBackend) return fileSystem._realpathBackend;
	}
	var VirtualModulesPlugin$1 = class {
		constructor(modules) {
			this._compiler = null;
			this._watcher = null;
			this._staticModules = modules || null;
		}
		getModuleList(filter = ALL) {
			var _a, _b;
			let modules = {};
			const shouldGetStaticModules = filter === ALL || filter === STATIC;
			const shouldGetDynamicModules = filter === ALL || filter === DYNAMIC;
			if (shouldGetStaticModules) modules = Object.assign(Object.assign({}, modules), this._staticModules);
			if (shouldGetDynamicModules) {
				const finalInputFileSystem = (_a = this._compiler) === null || _a === void 0 ? void 0 : _a.inputFileSystem;
				const virtualFiles = (_b = finalInputFileSystem === null || finalInputFileSystem === void 0 ? void 0 : finalInputFileSystem._virtualFiles) !== null && _b !== void 0 ? _b : {};
				const dynamicModules = {};
				Object.keys(virtualFiles).forEach((key) => {
					dynamicModules[key] = virtualFiles[key].contents;
				});
				modules = Object.assign(Object.assign({}, modules), dynamicModules);
			}
			return modules;
		}
		writeModule(filePath, contents) {
			if (!this._compiler) throw new Error(`Plugin has not been initialized`);
			checkActivation(this);
			const len = contents ? contents.length : 0;
			const time = Date.now();
			const date = new Date(time);
			const stats = new virtual_stats_1.VirtualStats({
				dev: 8675309,
				nlink: 0,
				uid: 1e3,
				gid: 1e3,
				rdev: 0,
				blksize: 4096,
				ino: inode++,
				mode: 33188,
				size: len,
				blocks: Math.floor(len / 4096),
				atime: date,
				mtime: date,
				ctime: date,
				birthtime: date
			});
			const modulePath = getModulePath(filePath, this._compiler);
			if (process.env.WVM_DEBUG) console.log(this._compiler.name, "Write virtual module:", modulePath, contents);
			let finalWatchFileSystem = this._watcher && this._watcher.watchFileSystem;
			while (finalWatchFileSystem && finalWatchFileSystem.wfs) finalWatchFileSystem = finalWatchFileSystem.wfs;
			let finalInputFileSystem = this._compiler.inputFileSystem;
			while (finalInputFileSystem && finalInputFileSystem._inputFileSystem) finalInputFileSystem = finalInputFileSystem._inputFileSystem;
			finalInputFileSystem._writeVirtualFile(modulePath, stats, contents);
			if (finalWatchFileSystem && finalWatchFileSystem.watcher && (finalWatchFileSystem.watcher.fileWatchers.size || finalWatchFileSystem.watcher.fileWatchers.length)) {
				const fileWatchers = finalWatchFileSystem.watcher.fileWatchers instanceof Map ? Array.from(finalWatchFileSystem.watcher.fileWatchers.values()) : finalWatchFileSystem.watcher.fileWatchers;
				for (let fileWatcher of fileWatchers) {
					if ("watcher" in fileWatcher) fileWatcher = fileWatcher.watcher;
					if (fileWatcher.path === modulePath) {
						if (process.env.DEBUG) console.log(this._compiler.name, "Emit file change:", modulePath, time);
						delete fileWatcher.directoryWatcher._cachedTimeInfoEntries;
						fileWatcher.emit("change", time, null);
					}
				}
			}
		}
		apply(compiler) {
			this._compiler = compiler;
			const afterEnvironmentHook = () => {
				let finalInputFileSystem = compiler.inputFileSystem;
				while (finalInputFileSystem && finalInputFileSystem._inputFileSystem) finalInputFileSystem = finalInputFileSystem._inputFileSystem;
				if (!finalInputFileSystem._writeVirtualFile) {
					const originalPurge = finalInputFileSystem.purge;
					finalInputFileSystem.purge = () => {
						originalPurge.apply(finalInputFileSystem, []);
						if (finalInputFileSystem._virtualFiles) Object.keys(finalInputFileSystem._virtualFiles).forEach((file) => {
							const data = finalInputFileSystem._virtualFiles[file];
							finalInputFileSystem._writeVirtualFile(file, data.stats, data.contents);
						});
					};
					finalInputFileSystem._writeVirtualFile = (file, stats, contents) => {
						const statStorage = getStatStorage(finalInputFileSystem);
						const fileStorage = getFileStorage(finalInputFileSystem);
						const readDirStorage = getReadDirBackend(finalInputFileSystem);
						const realPathStorage = getRealpathBackend(finalInputFileSystem);
						finalInputFileSystem._virtualFiles = finalInputFileSystem._virtualFiles || {};
						finalInputFileSystem._virtualFiles[file] = {
							stats,
							contents
						};
						setData(statStorage, file, createWebpackData(stats));
						setData(fileStorage, file, createWebpackData(contents));
						const segments = file.split(/[\\/]/);
						let count = segments.length - 1;
						const minCount = segments[0] ? 1 : 0;
						while (count > minCount) {
							const dir = segments.slice(0, count).join(path_1.default.sep) || path_1.default.sep;
							try {
								finalInputFileSystem.readdirSync(dir);
							} catch (e) {
								const time = Date.now();
								const dirStats = new virtual_stats_1.VirtualStats({
									dev: 8675309,
									nlink: 0,
									uid: 1e3,
									gid: 1e3,
									rdev: 0,
									blksize: 4096,
									ino: inode++,
									mode: 16877,
									size: stats.size,
									blocks: Math.floor(stats.size / 4096),
									atime: time,
									mtime: time,
									ctime: time,
									birthtime: time
								});
								setData(readDirStorage, dir, createWebpackData([]));
								if (realPathStorage) setData(realPathStorage, dir, createWebpackData(dir));
								setData(statStorage, dir, createWebpackData(dirStats));
							}
							let dirData = getData(getReadDirBackend(finalInputFileSystem), dir);
							dirData = dirData[1] || dirData.result;
							const filename = segments[count];
							if (dirData.indexOf(filename) < 0) {
								const files = dirData.concat([filename]).sort();
								setData(getReadDirBackend(finalInputFileSystem), dir, createWebpackData(files));
							} else break;
							count--;
						}
					};
				}
			};
			const afterResolversHook = () => {
				if (this._staticModules) {
					for (const [filePath, contents] of Object.entries(this._staticModules)) this.writeModule(filePath, contents);
					this._staticModules = null;
				}
			};
			const version$1 = typeof compiler.webpack === "undefined" ? 4 : 5;
			const watchRunHook = (watcher, callback) => {
				this._watcher = watcher.compiler || watcher;
				const virtualFiles = compiler.inputFileSystem._virtualFiles;
				const fts = compiler.fileTimestamps;
				if (virtualFiles && fts && typeof fts.set === "function") Object.keys(virtualFiles).forEach((file) => {
					const mtime = +virtualFiles[file].stats.mtime;
					fts.set(file, version$1 === 4 ? mtime : {
						safeTime: mtime,
						timestamp: mtime
					});
				});
				callback();
			};
			if (compiler.hooks) {
				compiler.hooks.afterEnvironment.tap("VirtualModulesPlugin", afterEnvironmentHook);
				compiler.hooks.afterResolvers.tap("VirtualModulesPlugin", afterResolversHook);
				compiler.hooks.watchRun.tapAsync("VirtualModulesPlugin", watchRunHook);
			} else {
				compiler.plugin("after-environment", afterEnvironmentHook);
				compiler.plugin("after-resolvers", afterResolversHook);
				compiler.plugin("watch-run", watchRunHook);
			}
		}
	};
	module.exports = VirtualModulesPlugin$1;
}) });

//#endregion
//#region node_modules/.pnpm/unplugin@2.3.10/node_modules/unplugin/dist/index.js
var import_lib = /* @__PURE__ */ __toESM(require_lib(), 1);
const ExtToLoader = {
	".js": "js",
	".mjs": "js",
	".cjs": "js",
	".jsx": "jsx",
	".ts": "ts",
	".cts": "ts",
	".mts": "ts",
	".tsx": "tsx",
	".css": "css",
	".less": "css",
	".stylus": "css",
	".scss": "css",
	".sass": "css",
	".json": "json",
	".txt": "text"
};
function guessLoader(code, id) {
	return ExtToLoader[path.extname(id).toLowerCase()] || "js";
}
function unwrapLoader(loader, code, id) {
	if (typeof loader === "function") return loader(code, id);
	return loader;
}
function fixSourceMap(map) {
	if (!Object.prototype.hasOwnProperty.call(map, "toString")) Object.defineProperty(map, "toString", {
		enumerable: false,
		value: function toString() {
			return JSON.stringify(this);
		}
	});
	if (!Object.prototype.hasOwnProperty.call(map, "toUrl")) Object.defineProperty(map, "toUrl", {
		enumerable: false,
		value: function toUrl() {
			return `data:application/json;charset=utf-8;base64,${Buffer.from(this.toString()).toString("base64")}`;
		}
	});
	return map;
}
const nullSourceMap = {
	names: [],
	sources: [],
	mappings: "",
	version: 3
};
function combineSourcemaps(filename, sourcemapList) {
	sourcemapList = sourcemapList.filter((m) => m.sources);
	if (sourcemapList.length === 0 || sourcemapList.every((m) => m.sources.length === 0)) return { ...nullSourceMap };
	let map;
	let mapIndex = 1;
	if (sourcemapList.slice(0, -1).find((m) => m.sources.length !== 1) === void 0) map = remapping(sourcemapList, () => null, true);
	else map = remapping(sourcemapList[0], (sourcefile) => {
		if (sourcefile === filename && sourcemapList[mapIndex]) return sourcemapList[mapIndex++];
		else return { ...nullSourceMap };
	}, true);
	if (!map.file) delete map.file;
	return map;
}
function createBuildContext$2(build) {
	const watchFiles = [];
	const { initialOptions } = build;
	return {
		parse: parse$1,
		addWatchFile() {
			throw new Error("unplugin/esbuild: addWatchFile outside supported hooks (resolveId, load, transform)");
		},
		emitFile(emittedFile) {
			const outFileName = emittedFile.fileName || emittedFile.name;
			if (initialOptions.outdir && emittedFile.source && outFileName) {
				const outPath = path.resolve(initialOptions.outdir, outFileName);
				const outDir = path.dirname(outPath);
				if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
				fs.writeFileSync(outPath, emittedFile.source);
			}
		},
		getWatchFiles() {
			return watchFiles;
		},
		getNativeBuildContext() {
			return {
				framework: "esbuild",
				build
			};
		}
	};
}
function createPluginContext(context) {
	const errors = [];
	const warnings = [];
	const pluginContext = {
		error(message) {
			errors.push(normalizeMessage$2(message));
		},
		warn(message) {
			warnings.push(normalizeMessage$2(message));
		}
	};
	return {
		errors,
		warnings,
		mixedContext: {
			...context,
			...pluginContext,
			addWatchFile(id) {
				context.getWatchFiles().push(id);
			}
		}
	};
}
function normalizeMessage$2(message) {
	if (typeof message === "string") message = { message };
	return {
		id: message.id,
		pluginName: message.plugin,
		text: message.message,
		location: message.loc ? {
			file: message.loc.file,
			line: message.loc.line,
			column: message.loc.column
		} : null,
		detail: message.meta,
		notes: []
	};
}
function processCodeWithSourceMap(map, code) {
	if (map) {
		if (!map.sourcesContent || map.sourcesContent.length === 0) map.sourcesContent = [code];
		map = fixSourceMap(map);
		code += `\n//# sourceMappingURL=${map.toUrl()}`;
	}
	return code;
}
function getEsbuildPlugin(factory) {
	return (userOptions) => {
		const meta = { framework: "esbuild" };
		const plugins = toArray$2(factory(userOptions, meta));
		const setupPlugins = async (build) => {
			const setup = buildSetup();
			const loaders = [];
			for (const plugin of plugins) {
				const loader = {};
				await setup(plugin)({
					...build,
					onLoad(_options, callback) {
						loader.options = _options;
						loader.onLoadCb = callback;
					},
					onTransform(_options, callback) {
						loader.options ||= _options;
						loader.onTransformCb = callback;
					}
				}, build);
				if (loader.onLoadCb || loader.onTransformCb) loaders.push(loader);
			}
			if (loaders.length) build.onLoad(loaders.length === 1 ? loaders[0].options : { filter: /.*/ }, async (args) => {
				function checkFilter(options) {
					return loaders.length === 1 || !options?.filter || options.filter.test(args.path);
				}
				let result;
				for (const { options, onLoadCb } of loaders) {
					if (!checkFilter(options)) continue;
					if (onLoadCb) result = await onLoadCb(args);
					if (result?.contents) break;
				}
				let fsContentsCache;
				for (const { options, onTransformCb } of loaders) {
					if (!checkFilter(options)) continue;
					if (onTransformCb) {
						const _result = await onTransformCb({
							...result,
							...args,
							async getContents() {
								if (result?.contents) return result.contents;
								if (fsContentsCache) return fsContentsCache;
								return fsContentsCache = await fs.promises.readFile(args.path, "utf8");
							}
						});
						if (_result?.contents) result = _result;
					}
				}
				if (result?.contents) return result;
			});
		};
		return {
			name: (plugins.length === 1 ? plugins[0].name : meta.esbuildHostName) ?? `unplugin-host:${plugins.map((p) => p.name).join(":")}`,
			setup: setupPlugins
		};
	};
}
function buildSetup() {
	return (plugin) => {
		return (build, rawBuild) => {
			const context = createBuildContext$2(rawBuild);
			const { onStart, onEnd, onResolve, onLoad, onTransform, initialOptions } = build;
			const onResolveFilter = plugin.esbuild?.onResolveFilter ?? /.*/;
			const onLoadFilter = plugin.esbuild?.onLoadFilter ?? /.*/;
			const loader = plugin.esbuild?.loader ?? guessLoader;
			plugin.esbuild?.config?.call(context, initialOptions);
			if (plugin.buildStart) onStart(() => plugin.buildStart.call(context));
			if (plugin.buildEnd || plugin.writeBundle) onEnd(async () => {
				if (plugin.buildEnd) await plugin.buildEnd.call(context);
				if (plugin.writeBundle) await plugin.writeBundle();
			});
			if (plugin.resolveId) onResolve({ filter: onResolveFilter }, async (args) => {
				const id = args.path;
				if (initialOptions.external?.includes(id)) return;
				const { handler, filter } = normalizeObjectHook("resolveId", plugin.resolveId);
				if (!filter(id)) return;
				const { errors, warnings, mixedContext } = createPluginContext(context);
				const isEntry = args.kind === "entry-point";
				const result = await handler.call(mixedContext, id, isEntry ? void 0 : args.importer, { isEntry });
				if (typeof result === "string") return {
					path: result,
					namespace: plugin.name,
					errors,
					warnings,
					watchFiles: mixedContext.getWatchFiles()
				};
				else if (typeof result === "object" && result !== null) return {
					path: result.id,
					external: result.external,
					namespace: plugin.name,
					errors,
					warnings,
					watchFiles: mixedContext.getWatchFiles()
				};
			});
			if (plugin.load) onLoad({ filter: onLoadFilter }, async (args) => {
				const { handler, filter } = normalizeObjectHook("load", plugin.load);
				const id = args.path + (args.suffix || "");
				if (plugin.loadInclude && !plugin.loadInclude(id)) return;
				if (!filter(id)) return;
				const { errors, warnings, mixedContext } = createPluginContext(context);
				let code;
				let map;
				const result = await handler.call(mixedContext, id);
				if (typeof result === "string") code = result;
				else if (typeof result === "object" && result !== null) {
					code = result.code;
					map = result.map;
				}
				if (code === void 0) return null;
				if (map) code = processCodeWithSourceMap(map, code);
				const resolveDir = path.dirname(args.path);
				return {
					contents: code,
					errors,
					warnings,
					watchFiles: mixedContext.getWatchFiles(),
					loader: unwrapLoader(loader, code, args.path),
					resolveDir
				};
			});
			if (plugin.transform) onTransform({ filter: onLoadFilter }, async (args) => {
				const { handler, filter } = normalizeObjectHook("transform", plugin.transform);
				const id = args.path + (args.suffix || "");
				if (plugin.transformInclude && !plugin.transformInclude(id)) return;
				let code = await args.getContents();
				if (!filter(id, code)) return;
				const { mixedContext, errors, warnings } = createPluginContext(context);
				const resolveDir = path.dirname(args.path);
				let map;
				const result = await handler.call(mixedContext, code, id);
				if (typeof result === "string") code = result;
				else if (typeof result === "object" && result !== null) {
					code = result.code;
					if (map && result.map) map = combineSourcemaps(args.path, [result.map === "string" ? JSON.parse(result.map) : result.map, map]);
					else if (typeof result.map === "string") map = JSON.parse(result.map);
					else map = result.map;
				}
				if (code) {
					if (map) code = processCodeWithSourceMap(map, code);
					return {
						contents: code,
						errors,
						warnings,
						watchFiles: mixedContext.getWatchFiles(),
						loader: unwrapLoader(loader, code, args.path),
						resolveDir
					};
				}
			});
			if (plugin.esbuild?.setup) return plugin.esbuild.setup(rawBuild);
		};
	};
}
function createFarmContext(context, currentResolveId) {
	return {
		parse: parse$1,
		addWatchFile(id) {
			context.addWatchFile(id, currentResolveId || id);
		},
		emitFile(emittedFile) {
			const outFileName = emittedFile.fileName || emittedFile.name;
			if (emittedFile.source && outFileName) context.emitFile({
				resolvedPath: outFileName,
				name: outFileName,
				content: [...Buffer.from(emittedFile.source)],
				resourceType: extname(outFileName)
			});
		},
		getWatchFiles() {
			return context.getWatchFiles();
		},
		getNativeBuildContext() {
			return {
				framework: "farm",
				context
			};
		}
	};
}
function unpluginContext(context) {
	return {
		error: (error) => context.error(typeof error === "string" ? new Error(error) : error),
		warn: (error) => context.warn(typeof error === "string" ? new Error(error) : error)
	};
}
function convertEnforceToPriority(value) {
	const defaultPriority = 100;
	const enforceToPriority = {
		pre: 102,
		post: 98
	};
	return enforceToPriority[value] !== void 0 ? enforceToPriority[value] : defaultPriority;
}
function convertWatchEventChange(value) {
	return {
		Added: "create",
		Updated: "update",
		Removed: "delete"
	}[value];
}
function isString(variable) {
	return typeof variable === "string";
}
function isObject(variable) {
	return typeof variable === "object" && variable !== null;
}
function customParseQueryString(url) {
	if (!url) return [];
	const queryString = url.split("?")[1];
	const parsedParams = querystring.parse(queryString);
	const paramsArray = [];
	for (const key in parsedParams) paramsArray.push([key, parsedParams[key]]);
	return paramsArray;
}
function encodeStr(str) {
	const len = str.length;
	if (len === 0) return str;
	const firstNullIndex = str.indexOf("\0");
	if (firstNullIndex === -1) return str;
	const result = Array.from({ length: len + countNulls(str, firstNullIndex) });
	let pos = 0;
	for (let i = 0; i < firstNullIndex; i++) result[pos++] = str[i];
	for (let i = firstNullIndex; i < len; i++) {
		const char = str[i];
		if (char === "\0") {
			result[pos++] = "\\";
			result[pos++] = "0";
		} else result[pos++] = char;
	}
	return path.posix.normalize(result.join(""));
}
function decodeStr(str) {
	const len = str.length;
	if (len === 0) return str;
	const firstIndex = str.indexOf("\\0");
	if (firstIndex === -1) return str;
	const result = Array.from({ length: len - countBackslashZeros(str, firstIndex) });
	let pos = 0;
	for (let i$1 = 0; i$1 < firstIndex; i$1++) result[pos++] = str[i$1];
	let i = firstIndex;
	while (i < len) if (str[i] === "\\" && str[i + 1] === "0") {
		result[pos++] = "\0";
		i += 2;
	} else result[pos++] = str[i++];
	return path.posix.normalize(result.join(""));
}
function getContentValue(content) {
	if (content === null || content === void 0) throw new Error("Content cannot be null or undefined");
	return encodeStr(typeof content === "string" ? content : content.code || "");
}
function countNulls(str, startIndex) {
	let count = 0;
	const len = str.length;
	for (let i = startIndex; i < len; i++) if (str[i] === "\0") count++;
	return count;
}
function countBackslashZeros(str, startIndex) {
	let count = 0;
	const len = str.length;
	for (let i = startIndex; i < len - 1; i++) if (str[i] === "\\" && str[i + 1] === "0") {
		count++;
		i++;
	}
	return count;
}
function removeQuery(pathe) {
	const queryIndex = pathe.indexOf("?");
	if (queryIndex !== -1) return path.posix.normalize(pathe.slice(0, queryIndex));
	return path.posix.normalize(pathe);
}
function isStartsWithSlash(str) {
	return str?.startsWith("/");
}
function appendQuery(id, query) {
	if (!query.length) return id;
	return `${id}?${stringifyQuery(query)}`;
}
function stringifyQuery(query) {
	if (!query.length) return "";
	let queryStr = "";
	for (const [key, value] of query) queryStr += `${key}${value ? `=${value}` : ""}&`;
	return `${queryStr.slice(0, -1)}`;
}
const CSS_LANGS_RES = [
	[/\.(less)(?:$|\?)/, "less"],
	[/\.(scss|sass)(?:$|\?)/, "sass"],
	[/\.(styl|stylus)(?:$|\?)/, "stylus"],
	[/\.(css)(?:$|\?)/, "css"]
];
const JS_LANGS_RES = [
	[/\.(js|mjs|cjs)(?:$|\?)/, "js"],
	[/\.(jsx)(?:$|\?)/, "jsx"],
	[/\.(ts|cts|mts)(?:$|\?)/, "ts"],
	[/\.(tsx)(?:$|\?)/, "tsx"]
];
function getCssModuleType(id) {
	for (const [reg, lang] of CSS_LANGS_RES) if (reg.test(id)) return lang;
	return null;
}
function getJsModuleType(id) {
	for (const [reg, lang] of JS_LANGS_RES) if (reg.test(id)) return lang;
	return null;
}
function formatLoadModuleType(id) {
	const cssModuleType = getCssModuleType(id);
	if (cssModuleType) return cssModuleType;
	const jsModuleType = getJsModuleType(id);
	if (jsModuleType) return jsModuleType;
	return "js";
}
function formatTransformModuleType(id) {
	return formatLoadModuleType(id);
}
function getFarmPlugin(factory) {
	return ((userOptions) => {
		const plugins = toArray$2(factory(userOptions, { framework: "farm" })).map((rawPlugin) => {
			const plugin = toFarmPlugin(rawPlugin, userOptions);
			if (rawPlugin.farm) Object.assign(plugin, rawPlugin.farm);
			return plugin;
		});
		return plugins.length === 1 ? plugins[0] : plugins;
	});
}
function toFarmPlugin(plugin, options) {
	const farmPlugin = {
		name: plugin.name,
		priority: convertEnforceToPriority(plugin.enforce)
	};
	if (plugin.farm) Object.keys(plugin.farm).forEach((key) => {
		const value = plugin.farm[key];
		if (value) Reflect.set(farmPlugin, key, value);
	});
	if (plugin.buildStart) {
		const _buildStart = plugin.buildStart;
		farmPlugin.buildStart = { async executor(_, context) {
			await _buildStart.call(createFarmContext(context));
		} };
	}
	if (plugin.resolveId) {
		const _resolveId = plugin.resolveId;
		let filters = [];
		if (options) filters = options?.filters ?? [];
		farmPlugin.resolve = {
			filters: {
				sources: filters.length ? filters : [".*"],
				importers: [".*"]
			},
			async executor(params, context) {
				const resolvedIdPath = path.resolve(params.importer ?? "");
				const id = decodeStr(params.source);
				const { handler, filter } = normalizeObjectHook("resolveId", _resolveId);
				if (!filter(id)) return null;
				let isEntry = false;
				if (isObject(params.kind) && "entry" in params.kind) isEntry = params.kind.entry === "index";
				const farmContext = createFarmContext(context, resolvedIdPath);
				const resolveIdResult = await handler.call(Object.assign(unpluginContext(context), farmContext), id, resolvedIdPath ?? null, { isEntry });
				if (isString(resolveIdResult)) return {
					resolvedPath: removeQuery(encodeStr(resolveIdResult)),
					query: customParseQueryString(resolveIdResult),
					sideEffects: true,
					external: false,
					meta: {}
				};
				if (isObject(resolveIdResult)) return {
					resolvedPath: removeQuery(encodeStr(resolveIdResult?.id)),
					query: customParseQueryString(resolveIdResult?.id),
					sideEffects: false,
					external: Boolean(resolveIdResult?.external),
					meta: {}
				};
				if (!isStartsWithSlash(params.source)) return null;
			}
		};
	}
	if (plugin.load) {
		const _load = plugin.load;
		farmPlugin.load = {
			filters: { resolvedPaths: [".*"] },
			async executor(params, context) {
				const id = appendQuery(decodeStr(params.resolvedPath), params.query);
				const loader = formatTransformModuleType(id);
				if (plugin.loadInclude && !plugin.loadInclude?.(id)) return null;
				const { handler, filter } = normalizeObjectHook("load", _load);
				if (!filter(id)) return null;
				const farmContext = createFarmContext(context, id);
				return {
					content: getContentValue(await handler.call(Object.assign(unpluginContext(context), farmContext), id)),
					moduleType: loader
				};
			}
		};
	}
	if (plugin.transform) {
		const _transform = plugin.transform;
		farmPlugin.transform = {
			filters: {
				resolvedPaths: [".*"],
				moduleTypes: [".*"]
			},
			async executor(params, context) {
				const id = appendQuery(decodeStr(params.resolvedPath), params.query);
				const loader = formatTransformModuleType(id);
				if (plugin.transformInclude && !plugin.transformInclude(id)) return null;
				const { handler, filter } = normalizeObjectHook("transform", _transform);
				if (!filter(id, params.content)) return null;
				const farmContext = createFarmContext(context, id);
				const resource = await handler.call(Object.assign(unpluginContext(context), farmContext), params.content, id);
				if (resource && typeof resource !== "string") return {
					content: getContentValue(resource),
					moduleType: loader,
					sourceMap: typeof resource.map === "object" && resource.map !== null ? JSON.stringify(resource.map) : void 0
				};
			}
		};
	}
	if (plugin.watchChange) {
		const _watchChange = plugin.watchChange;
		farmPlugin.updateModules = { async executor(param, context) {
			const updatePathContent = param.paths[0];
			const ModifiedPath = updatePathContent[0];
			const eventChange = convertWatchEventChange(updatePathContent[1]);
			await _watchChange.call(createFarmContext(context), ModifiedPath, { event: eventChange });
		} };
	}
	if (plugin.buildEnd) {
		const _buildEnd = plugin.buildEnd;
		farmPlugin.buildEnd = { async executor(_, context) {
			await _buildEnd.call(createFarmContext(context));
		} };
	}
	if (plugin.writeBundle) {
		const _writeBundle = plugin.writeBundle;
		farmPlugin.finish = { async executor() {
			await _writeBundle();
		} };
	}
	return farmPlugin;
}
function getRollupPlugin(factory) {
	return ((userOptions) => {
		const plugins = toArray$2(factory(userOptions, { framework: "rollup" })).map((plugin) => toRollupPlugin(plugin, "rollup"));
		return plugins.length === 1 ? plugins[0] : plugins;
	});
}
function toRollupPlugin(plugin, key) {
	const nativeFilter = key === "rolldown";
	if (plugin.resolveId && !nativeFilter && typeof plugin.resolveId === "object" && plugin.resolveId.filter) {
		const resolveIdHook = plugin.resolveId;
		const { handler, filter } = normalizeObjectHook("load", resolveIdHook);
		replaceHookHandler("resolveId", resolveIdHook, function(...args) {
			const [id] = args;
			if (!supportNativeFilter(this, key) && !filter(id)) return;
			return handler.apply(this, args);
		});
	}
	if (plugin.load && (plugin.loadInclude || !nativeFilter && typeof plugin.load === "object" && plugin.load.filter)) {
		const loadHook = plugin.load;
		const { handler, filter } = normalizeObjectHook("load", loadHook);
		replaceHookHandler("load", loadHook, function(...args) {
			const [id] = args;
			if (plugin.loadInclude && !plugin.loadInclude(id)) return;
			if (!supportNativeFilter(this, key) && !filter(id)) return;
			return handler.apply(this, args);
		});
	}
	if (plugin.transform && (plugin.transformInclude || !nativeFilter && typeof plugin.transform === "object" && plugin.transform.filter)) {
		const transformHook = plugin.transform;
		const { handler, filter } = normalizeObjectHook("transform", transformHook);
		replaceHookHandler("transform", transformHook, function(...args) {
			const [code, id] = args;
			if (plugin.transformInclude && !plugin.transformInclude(id)) return;
			if (!supportNativeFilter(this, key) && !filter(id, code)) return;
			return handler.apply(this, args);
		});
	}
	if (plugin[key]) Object.assign(plugin, plugin[key]);
	return plugin;
	function replaceHookHandler(name, hook, handler) {
		if (typeof hook === "function") plugin[name] = handler;
		else hook.handler = handler;
	}
}
function supportNativeFilter(context, framework) {
	if (framework === "unloader") return false;
	if (framework === "vite") return !!context?.meta?.viteVersion;
	if (framework === "rolldown") return true;
	const rollupVersion = context?.meta?.rollupVersion;
	if (!rollupVersion) return false;
	const [major, minor] = rollupVersion.split(".");
	return Number(major) > 4 || Number(major) === 4 && Number(minor) >= 40;
}
function getRolldownPlugin(factory) {
	return ((userOptions) => {
		const plugins = toArray$2(factory(userOptions, { framework: "rolldown" })).map((rawPlugin) => {
			return toRollupPlugin(rawPlugin, "rolldown");
		});
		return plugins.length === 1 ? plugins[0] : plugins;
	});
}
const getFilename = () => fileURLToPath(import.meta.url);
const getDirname = () => path.dirname(getFilename());
const __dirname = /* @__PURE__ */ getDirname();
const TRANSFORM_LOADER$1 = resolve(__dirname, "rspack/loaders/transform");
const LOAD_LOADER$1 = resolve(__dirname, "rspack/loaders/load");
function getRspackPlugin(factory) {
	return (userOptions) => {
		return { apply(compiler) {
			const VIRTUAL_MODULE_PREFIX = resolve(compiler.options.context ?? process.cwd(), "node_modules/.virtual", process.pid.toString());
			const meta = {
				framework: "rspack",
				rspack: { compiler }
			};
			const rawPlugins = toArray$2(factory(userOptions, meta));
			for (const rawPlugin of rawPlugins) {
				const plugin = Object.assign(rawPlugin, {
					__unpluginMeta: meta,
					__virtualModulePrefix: VIRTUAL_MODULE_PREFIX
				});
				const externalModules = /* @__PURE__ */ new Set();
				if (plugin.resolveId) {
					const createPlugin = (plugin$1) => {
						if (compiler.rspack.experiments.VirtualModulesPlugin) return new compiler.rspack.experiments.VirtualModulesPlugin();
						return new FakeVirtualModulesPlugin(plugin$1);
					};
					const vfs = createPlugin(plugin);
					vfs.apply(compiler);
					const vfsModules = /* @__PURE__ */ new Map();
					plugin.__vfsModules = vfsModules;
					plugin.__vfs = vfs;
					compiler.hooks.compilation.tap(plugin.name, (compilation, { normalModuleFactory }) => {
						normalModuleFactory.hooks.resolve.tapPromise(plugin.name, async (resolveData) => {
							const id = normalizeAbsolutePath(resolveData.request);
							const requestContext = resolveData.contextInfo;
							let importer = requestContext.issuer !== "" ? requestContext.issuer : void 0;
							const isEntry = requestContext.issuer === "";
							if (importer?.startsWith(plugin.__virtualModulePrefix)) importer = decodeURIComponent(importer.slice(plugin.__virtualModulePrefix.length));
							const context = createBuildContext(compiler, compilation);
							let error;
							const pluginContext = {
								error(msg) {
									if (error == null) error = normalizeMessage(msg);
									else console.error(`unplugin/rspack: multiple errors returned from resolveId hook: ${msg}`);
								},
								warn(msg) {
									console.warn(`unplugin/rspack: warning from resolveId hook: ${msg}`);
								}
							};
							const { handler, filter } = normalizeObjectHook("resolveId", plugin.resolveId);
							if (!filter(id)) return;
							const resolveIdResult = await handler.call({
								...context,
								...pluginContext
							}, id, importer, { isEntry });
							if (error != null) throw error;
							if (resolveIdResult == null) return;
							let resolved = typeof resolveIdResult === "string" ? resolveIdResult : resolveIdResult.id;
							if (typeof resolveIdResult === "string" ? false : resolveIdResult.external === true) externalModules.add(resolved);
							let isVirtual = true;
							try {
								(compiler.inputFileSystem?.statSync ?? fs.statSync)(resolved);
								isVirtual = false;
							} catch {
								isVirtual = !isVirtualModuleId(resolved, plugin);
							}
							if (isVirtual) {
								const encodedVirtualPath = encodeVirtualModuleId(resolved, plugin);
								if (!vfsModules.has(resolved)) {
									const fsPromise = Promise.resolve(vfs.writeModule(encodedVirtualPath, ""));
									vfsModules.set(resolved, fsPromise);
									await fsPromise;
								} else await vfsModules.get(resolved);
								resolved = encodedVirtualPath;
							}
							resolveData.request = resolved;
						});
					});
				}
				if (plugin.load) compiler.options.module.rules.unshift({
					enforce: plugin.enforce,
					include(id) {
						if (isVirtualModuleId(id, plugin)) id = decodeVirtualModuleId(id, plugin);
						if (plugin.loadInclude && !plugin.loadInclude(id)) return false;
						const { filter } = normalizeObjectHook("load", plugin.load);
						if (!filter(id)) return false;
						return !externalModules.has(id);
					},
					use: [{
						loader: LOAD_LOADER$1,
						options: { plugin }
					}],
					type: "javascript/auto"
				});
				if (plugin.transform) compiler.options.module.rules.unshift({
					enforce: plugin.enforce,
					use(data) {
						return transformUse(data, plugin, TRANSFORM_LOADER$1);
					}
				});
				if (plugin.rspack) plugin.rspack(compiler);
				if (plugin.watchChange || plugin.buildStart) compiler.hooks.make.tapPromise(plugin.name, async (compilation) => {
					const context = createBuildContext(compiler, compilation);
					if (plugin.watchChange && (compiler.modifiedFiles || compiler.removedFiles)) {
						const promises$1 = [];
						if (compiler.modifiedFiles) compiler.modifiedFiles.forEach((file) => promises$1.push(Promise.resolve(plugin.watchChange.call(context, file, { event: "update" }))));
						if (compiler.removedFiles) compiler.removedFiles.forEach((file) => promises$1.push(Promise.resolve(plugin.watchChange.call(context, file, { event: "delete" }))));
						await Promise.all(promises$1);
					}
					if (plugin.buildStart) return await plugin.buildStart.call(context);
				});
				if (plugin.buildEnd) compiler.hooks.emit.tapPromise(plugin.name, async (compilation) => {
					await plugin.buildEnd.call(createBuildContext(compiler, compilation));
				});
				if (plugin.writeBundle) compiler.hooks.afterEmit.tapPromise(plugin.name, async () => {
					await plugin.writeBundle();
				});
			}
		} };
	};
}
function getUnloaderPlugin(factory) {
	return ((userOptions) => {
		const plugins = toArray$2(factory(userOptions, { framework: "unloader" })).map((rawPlugin) => {
			return toRollupPlugin(rawPlugin, "unloader");
		});
		return plugins.length === 1 ? plugins[0] : plugins;
	});
}
function getVitePlugin(factory) {
	return ((userOptions) => {
		const plugins = toArray$2(factory(userOptions, { framework: "vite" })).map((rawPlugin) => {
			return toRollupPlugin(rawPlugin, "vite");
		});
		return plugins.length === 1 ? plugins[0] : plugins;
	});
}
const TRANSFORM_LOADER = resolve(__dirname, "webpack/loaders/transform");
const LOAD_LOADER = resolve(__dirname, "webpack/loaders/load");
function getWebpackPlugin(factory) {
	return (userOptions) => {
		return { apply(compiler) {
			const VIRTUAL_MODULE_PREFIX = resolve(compiler.options.context ?? process$1.cwd(), "_virtual_");
			const meta = {
				framework: "webpack",
				webpack: { compiler }
			};
			const rawPlugins = toArray$2(factory(userOptions, meta));
			for (const rawPlugin of rawPlugins) {
				const plugin = Object.assign(rawPlugin, {
					__unpluginMeta: meta,
					__virtualModulePrefix: VIRTUAL_MODULE_PREFIX
				});
				const externalModules = /* @__PURE__ */ new Set();
				if (plugin.resolveId) {
					let vfs = compiler.options.plugins.find((i) => i instanceof import_lib.default);
					if (!vfs) {
						vfs = new import_lib.default();
						compiler.options.plugins.push(vfs);
					}
					const vfsModules = /* @__PURE__ */ new Set();
					plugin.__vfsModules = vfsModules;
					plugin.__vfs = vfs;
					const resolverPlugin = { apply(resolver) {
						const target = resolver.ensureHook("resolve");
						resolver.getHook("resolve").tapAsync(plugin.name, async (request, resolveContext, callback) => {
							if (!request.request) return callback();
							if (normalizeAbsolutePath(request.request).startsWith(plugin.__virtualModulePrefix)) return callback();
							const id = normalizeAbsolutePath(request.request);
							const requestContext = request.context;
							let importer = requestContext.issuer !== "" ? requestContext.issuer : void 0;
							const isEntry = requestContext.issuer === "";
							if (importer?.startsWith(plugin.__virtualModulePrefix)) importer = decodeURIComponent(importer.slice(plugin.__virtualModulePrefix.length));
							const fileDependencies = /* @__PURE__ */ new Set();
							const context = createBuildContext$1({
								addWatchFile(file) {
									fileDependencies.add(file);
									resolveContext.fileDependencies?.add(file);
								},
								getWatchFiles() {
									return Array.from(fileDependencies);
								}
							}, compiler);
							let error;
							const pluginContext = {
								error(msg) {
									if (error == null) error = normalizeMessage$1(msg);
									else console.error(`unplugin/webpack: multiple errors returned from resolveId hook: ${msg}`);
								},
								warn(msg) {
									console.warn(`unplugin/webpack: warning from resolveId hook: ${msg}`);
								}
							};
							const { handler, filter } = normalizeObjectHook("resolveId", plugin.resolveId);
							if (!filter(id)) return callback();
							const resolveIdResult = await handler.call({
								...context,
								...pluginContext
							}, id, importer, { isEntry });
							if (error != null) return callback(error);
							if (resolveIdResult == null) return callback();
							let resolved = typeof resolveIdResult === "string" ? resolveIdResult : resolveIdResult.id;
							if (typeof resolveIdResult === "string" ? false : resolveIdResult.external === true) externalModules.add(resolved);
							if (!fs.existsSync(resolved)) {
								resolved = normalizeAbsolutePath(plugin.__virtualModulePrefix + encodeURIComponent(resolved));
								if (!vfsModules.has(resolved)) {
									plugin.__vfs.writeModule(resolved, "");
									vfsModules.add(resolved);
								}
							}
							const newRequest = {
								...request,
								request: resolved
							};
							resolver.doResolve(target, newRequest, null, resolveContext, callback);
						});
					} };
					compiler.options.resolve.plugins = compiler.options.resolve.plugins || [];
					compiler.options.resolve.plugins.push(resolverPlugin);
				}
				if (plugin.load) compiler.options.module.rules.unshift({
					include(id) {
						return shouldLoad(id, plugin, externalModules);
					},
					enforce: plugin.enforce,
					use: [{
						loader: LOAD_LOADER,
						options: { plugin }
					}],
					type: "javascript/auto"
				});
				if (plugin.transform) compiler.options.module.rules.unshift({
					enforce: plugin.enforce,
					use(data) {
						return transformUse(data, plugin, TRANSFORM_LOADER);
					}
				});
				if (plugin.webpack) plugin.webpack(compiler);
				if (plugin.watchChange || plugin.buildStart) compiler.hooks.make.tapPromise(plugin.name, async (compilation) => {
					const context = createBuildContext$1(contextOptionsFromCompilation(compilation), compiler, compilation);
					if (plugin.watchChange && (compiler.modifiedFiles || compiler.removedFiles)) {
						const promises$1 = [];
						if (compiler.modifiedFiles) compiler.modifiedFiles.forEach((file) => promises$1.push(Promise.resolve(plugin.watchChange.call(context, file, { event: "update" }))));
						if (compiler.removedFiles) compiler.removedFiles.forEach((file) => promises$1.push(Promise.resolve(plugin.watchChange.call(context, file, { event: "delete" }))));
						await Promise.all(promises$1);
					}
					if (plugin.buildStart) return await plugin.buildStart.call(context);
				});
				if (plugin.buildEnd) compiler.hooks.emit.tapPromise(plugin.name, async (compilation) => {
					await plugin.buildEnd.call(createBuildContext$1(contextOptionsFromCompilation(compilation), compiler, compilation));
				});
				if (plugin.writeBundle) compiler.hooks.afterEmit.tapPromise(plugin.name, async () => {
					await plugin.writeBundle();
				});
			}
		} };
	};
}
function shouldLoad(id, plugin, externalModules) {
	if (id.startsWith(plugin.__virtualModulePrefix)) id = decodeURIComponent(id.slice(plugin.__virtualModulePrefix.length));
	if (plugin.loadInclude && !plugin.loadInclude(id)) return false;
	const { filter } = normalizeObjectHook("load", plugin.load);
	if (!filter(id)) return false;
	return !externalModules.has(id);
}
function createUnplugin(factory) {
	return {
		get esbuild() {
			return getEsbuildPlugin(factory);
		},
		get rollup() {
			return getRollupPlugin(factory);
		},
		get vite() {
			return getVitePlugin(factory);
		},
		get rolldown() {
			return getRolldownPlugin(factory);
		},
		get webpack() {
			return getWebpackPlugin(factory);
		},
		get rspack() {
			return getRspackPlugin(factory);
		},
		get farm() {
			return getFarmPlugin(factory);
		},
		get unloader() {
			return getUnloaderPlugin(factory);
		},
		get raw() {
			return factory;
		}
	};
}

//#endregion
//#region node_modules/.pnpm/unplugin-utils@0.3.1/node_modules/unplugin-utils/dist/index.js
var import_picomatch = /* @__PURE__ */ __toESM(require_picomatch(), 1);
/**
* Converts path separators to forward slash.
*/
function normalizePath(filename) {
	return filename.replaceAll("\\", "/");
}
const isArray = Array.isArray;
function toArray$1(thing) {
	if (isArray(thing)) return thing;
	if (thing == null) return [];
	return [thing];
}
const escapeMark = "[_#EsCaPe#_]";
function getMatcherString(id, resolutionBase) {
	if (resolutionBase === false || isAbsolute$1(id) || id.startsWith("**")) return normalizePath(id);
	return join$1(normalizePath(resolve$1(resolutionBase || "")).replaceAll(/[-^$*+?.()|[\]{}]/g, `${escapeMark}$&`), normalizePath(id)).replaceAll(escapeMark, "\\");
}
/**
* Constructs a filter function which can be used to determine whether or not
* certain modules should be operated upon.
* @param include If `include` is omitted or has zero length, filter will return `true` by default.
* @param exclude ID must not match any of the `exclude` patterns.
* @param options Additional options.
* @param options.resolve Optionally resolves the patterns against a directory other than `process.cwd()`.
* If a `string` is specified, then the value will be used as the base directory.
* Relative paths will be resolved against `process.cwd()` first.
* If `false`, then the patterns will not be resolved against any directory.
* This can be useful if you want to create a filter for virtual module names.
*/
function createFilter(include, exclude, options) {
	const resolutionBase = options && options.resolve;
	const getMatcher = (id) => id instanceof RegExp ? id : { test: (what) => {
		return (0, import_picomatch.default)(getMatcherString(id, resolutionBase), { dot: true })(what);
	} };
	const includeMatchers = toArray$1(include).map(getMatcher);
	const excludeMatchers = toArray$1(exclude).map(getMatcher);
	if (!includeMatchers.length && !excludeMatchers.length) return (id) => typeof id === "string" && !id.includes("\0");
	return function result(id) {
		if (typeof id !== "string") return false;
		if (id.includes("\0")) return false;
		const pathId = normalizePath(id);
		for (const matcher of excludeMatchers) {
			if (matcher instanceof RegExp) matcher.lastIndex = 0;
			if (matcher.test(pathId)) return false;
		}
		for (const matcher of includeMatchers) {
			if (matcher instanceof RegExp) matcher.lastIndex = 0;
			if (matcher.test(pathId)) return true;
		}
		return !includeMatchers.length;
	};
}

//#endregion
//#region node_modules/.pnpm/unimport@5.5.0/node_modules/unimport/dist/unplugin.mjs
const defaultIncludes = [
	/\.[jt]sx?$/,
	/\.vue$/,
	/\.vue\?vue/,
	/\.svelte$/
];
const defaultExcludes = [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/];
function toArray(x) {
	return x == null ? [] : Array.isArray(x) ? x : [x];
}
const unplugin = createUnplugin((options = {}) => {
	const ctx = createUnimport(options);
	const filter = createFilter(toArray(options.include || []).length ? options.include : defaultIncludes, options.exclude || defaultExcludes);
	const dts = options.dts === true ? "unimport.d.ts" : options.dts;
	const { autoImport = true } = options;
	return {
		name: "unimport",
		enforce: "post",
		transformInclude(id) {
			return filter(id);
		},
		async transform(code, id) {
			const s = new MagicString(code);
			await ctx.injectImports(s, id, { autoImport });
			if (!s.hasChanged()) return;
			return {
				code: s.toString(),
				map: s.generateMap()
			};
		},
		async buildStart() {
			await ctx.init();
			if (dts) return promises.writeFile(dts, await ctx.generateTypeDeclarations(), "utf-8");
		}
	};
});

//#endregion
//#region node_modules/.pnpm/unimport@5.5.0/node_modules/unimport/dist/chunks/detect-acorn.mjs
async function detectImportsAcorn(code, ctx, options) {
	const s = getMagicString(code);
	const map = await ctx.getImportMap();
	let matchedImports = [];
	const enableAutoImport = options?.autoImport !== false;
	const enableTransformVirtualImports = options?.transformVirtualImports !== false && ctx.options.virtualImports?.length;
	if (enableAutoImport || enableTransformVirtualImports) {
		const ast = parse(s.original, {
			sourceType: "module",
			ecmaVersion: "latest",
			locations: true
		});
		const virtualImports = createVirtualImportsAcronWalker(map, ctx.options.virtualImports);
		const scopes = traveseScopes(ast, enableTransformVirtualImports ? virtualImports.walk : {});
		if (enableAutoImport) {
			const identifiers = scopes.unmatched;
			matchedImports.push(...Array.from(identifiers).map((name) => {
				const item = map.get(name);
				if (item && !item.disabled) return item;
				return null;
			}).filter(Boolean));
			for (const addon of ctx.addons) matchedImports = await addon.matchImports?.call(ctx, identifiers, matchedImports) || matchedImports;
		}
		virtualImports.ranges.forEach(([start, end]) => {
			s.remove(start, end);
		});
		matchedImports.push(...virtualImports.imports);
	}
	return {
		s,
		strippedCode: code.toString(),
		matchedImports,
		isCJSContext: false,
		firstOccurrence: 0
	};
}
function traveseScopes(ast, additionalWalk) {
	const scopes = [];
	let scopeCurrent = void 0;
	const scopesStack = [];
	function pushScope(node) {
		scopeCurrent = {
			node,
			parent: scopeCurrent,
			declarations: /* @__PURE__ */ new Set(),
			references: /* @__PURE__ */ new Set()
		};
		scopes.push(scopeCurrent);
		scopesStack.push(scopeCurrent);
	}
	function popScope(node) {
		if (scopesStack.pop()?.node !== node) throw new Error("Scope mismatch");
		scopeCurrent = scopesStack[scopesStack.length - 1];
	}
	pushScope(void 0);
	walk(ast, {
		enter(node, parent, prop, index) {
			additionalWalk?.enter?.call(this, node, parent, prop, index);
			switch (node.type) {
				case "ImportSpecifier":
				case "ImportDefaultSpecifier":
				case "ImportNamespaceSpecifier":
					scopeCurrent.declarations.add(node.local.name);
					return;
				case "FunctionDeclaration":
				case "ClassDeclaration":
					if (node.id) scopeCurrent.declarations.add(node.id.name);
					return;
				case "VariableDeclarator":
					if (node.id.type === "Identifier") scopeCurrent.declarations.add(node.id.name);
					else walk(node.id, { enter(node2) {
						if (node2.type === "ObjectPattern") node2.properties.forEach((i) => {
							if (i.type === "Property" && i.value.type === "Identifier") scopeCurrent.declarations.add(i.value.name);
							else if (i.type === "RestElement" && i.argument.type === "Identifier") scopeCurrent.declarations.add(i.argument.name);
						});
						else if (node2.type === "ArrayPattern") node2.elements.forEach((i) => {
							if (i?.type === "Identifier") scopeCurrent.declarations.add(i.name);
							if (i?.type === "RestElement" && i.argument.type === "Identifier") scopeCurrent.declarations.add(i.argument.name);
						});
					} });
					return;
				case "BlockStatement":
					pushScope(node);
					return;
				case "Identifier":
					switch (parent?.type) {
						case "CallExpression":
							if (parent.callee === node || parent.arguments.includes(node)) scopeCurrent.references.add(node.name);
							return;
						case "MemberExpression":
							if (parent.object === node) scopeCurrent.references.add(node.name);
							return;
						case "VariableDeclarator":
							if (parent.init === node) scopeCurrent.references.add(node.name);
							return;
						case "SpreadElement":
							if (parent.argument === node) scopeCurrent.references.add(node.name);
							return;
						case "ClassDeclaration":
							if (parent.superClass === node) scopeCurrent.references.add(node.name);
							return;
						case "Property":
							if (parent.value === node) scopeCurrent.references.add(node.name);
							return;
						case "TemplateLiteral":
							if (parent.expressions.includes(node)) scopeCurrent.references.add(node.name);
							return;
						case "AssignmentExpression":
							if (parent.right === node) scopeCurrent.references.add(node.name);
							return;
						case "IfStatement":
						case "WhileStatement":
						case "DoWhileStatement":
							if (parent.test === node) scopeCurrent.references.add(node.name);
							return;
						case "SwitchStatement":
							if (parent.discriminant === node) scopeCurrent.references.add(node.name);
							return;
					}
					if (parent?.type.includes("Expression")) scopeCurrent.references.add(node.name);
			}
		},
		leave(node, parent, prop, index) {
			additionalWalk?.leave?.call(this, node, parent, prop, index);
			switch (node.type) {
				case "BlockStatement": popScope(node);
			}
		}
	});
	const unmatched = /* @__PURE__ */ new Set();
	for (const scope of scopes) for (const name of scope.references) {
		let defined = false;
		let parent = scope;
		while (parent) {
			if (parent.declarations.has(name)) {
				defined = true;
				break;
			}
			parent = parent?.parent;
		}
		if (!defined) unmatched.add(name);
	}
	return {
		unmatched,
		scopes
	};
}
function createVirtualImportsAcronWalker(importMap, virtualImports = []) {
	const imports = [];
	const ranges = [];
	return {
		imports,
		ranges,
		walk: { enter(node) {
			if (node.type === "ImportDeclaration") {
				if (virtualImports.includes(node.source.value)) {
					ranges.push([node.start, node.end]);
					node.specifiers.forEach((i) => {
						if (i.type === "ImportSpecifier" && i.imported.type === "Identifier") {
							const original = importMap.get(i.imported.name);
							if (!original) throw new Error(`[unimport] failed to find "${i.imported.name}" imported from "${node.source.value}"`);
							imports.push({
								from: original.from,
								name: original.name,
								as: i.local.name
							});
						}
					});
				}
			}
		} }
	};
}

//#endregion
export { createUnimport as a, unplugin as i, detectImportsAcorn as n, toExports as o, traveseScopes as r, createVirtualImportsAcronWalker as t };