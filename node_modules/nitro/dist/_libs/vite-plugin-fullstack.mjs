import { t as MagicString } from "./magic-string.mjs";
import { t as stripLiteral } from "./strip-literal.mjs";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import assert from "node:assert";
import "srvx/node";
import { createHash } from "node:crypto";
import { isCSSRequest, normalizePath } from "vite";
import assert$1 from "node:assert/strict";

//#region node_modules/.pnpm/@pi0+vite-plugin-fullstack@0.0.5-pr-1297_vite@7.2.2_@types+node@24.10.0_jiti@2.6.1_ligh_420de11c17db6dc1bb00fb6cc17e9a42/node_modules/@pi0/vite-plugin-fullstack/dist/index.js
function parseIdQuery(id) {
	if (!id.includes("?")) return {
		filename: id,
		query: {}
	};
	const [filename, rawQuery] = id.split(`?`, 2);
	return {
		filename,
		query: Object.fromEntries(new URLSearchParams(rawQuery))
	};
}
function toAssetsVirtual(options) {
	return `virtual:fullstack/assets?${new URLSearchParams(options)}&lang.js`;
}
function parseAssetsVirtual(id) {
	if (id.startsWith("\0virtual:fullstack/assets?")) return parseIdQuery(id).query;
}
function createVirtualPlugin(name, load) {
	name = "virtual:" + name;
	return {
		name: `rsc:virtual-${name}`,
		resolveId: { handler(source, _importer, _options) {
			return source === name ? "\0" + name : void 0;
		} },
		load: { handler(id, options) {
			if (id === "\0" + name) return load.apply(this, [id, options]);
		} }
	};
}
function normalizeRelativePath(s) {
	s = normalizePath(s);
	return s[0] === "." ? s : "./" + s;
}
function hashString(v) {
	return createHash("sha256").update(v).digest().toString("hex").slice(0, 12);
}
const VALID_ID_PREFIX = `/@id/`;
const NULL_BYTE_PLACEHOLDER = `__x00__`;
const FS_PREFIX = `/@fs/`;
function wrapId(id) {
	return id.startsWith(VALID_ID_PREFIX) ? id : VALID_ID_PREFIX + id.replace("\0", NULL_BYTE_PLACEHOLDER);
}
function withTrailingSlash(path$1) {
	if (path$1[path$1.length - 1] !== "/") return `${path$1}/`;
	return path$1;
}
const postfixRE = /[?#].*$/;
function cleanUrl(url) {
	return url.replace(postfixRE, "");
}
function splitFileAndPostfix(path$1) {
	const file = cleanUrl(path$1);
	return {
		file,
		postfix: path$1.slice(file.length)
	};
}
const windowsSlashRE = /\\/g;
function slash(p) {
	return p.replace(windowsSlashRE, "/");
}
const isWindows = typeof process !== "undefined" && process.platform === "win32";
function injectQuery(url, queryToInject) {
	const { file, postfix } = splitFileAndPostfix(url);
	return `${isWindows ? slash(file) : file}?${queryToInject}${postfix[0] === "?" ? `&${postfix.slice(1)}` : postfix}`;
}
function normalizeResolvedIdToUrl(environment, url, resolved) {
	const root = environment.config.root;
	const depsOptimizer = environment.depsOptimizer;
	if (resolved.id.startsWith(withTrailingSlash(root))) url = resolved.id.slice(root.length);
	else if (depsOptimizer?.isOptimizedDepFile(resolved.id) || resolved.id !== "/@react-refresh" && path.isAbsolute(resolved.id) && fs.existsSync(cleanUrl(resolved.id))) url = path.posix.join(FS_PREFIX, resolved.id);
	else url = resolved.id;
	if (url[0] !== "." && url[0] !== "/") url = wrapId(resolved.id);
	return url;
}
function normalizeViteImportAnalysisUrl(environment, id) {
	let url = normalizeResolvedIdToUrl(environment, id, { id });
	if (environment.config.consumer === "client") {
		const mod = environment.moduleGraph.getModuleById(id);
		if (mod && mod.lastHMRTimestamp > 0) url = injectQuery(url, `t=${mod.lastHMRTimestamp}`);
	}
	return url;
}
function evalValue(rawValue) {
	return new Function(`
    var console, exports, global, module, process, require
    return (\n${rawValue}\n)
  `)();
}
const directRequestRE = /(\?|&)direct=?(?:&|$)/;
function assetsPlugin(pluginOpts) {
	let server;
	let resolvedConfig;
	const importAssetsMetaMap = {};
	const bundleMap = {};
	async function processAssetsImport(ctx, id, options) {
		if (ctx.environment.mode === "dev") {
			const result = {
				entry: void 0,
				js: [],
				css: []
			};
			const environment = server.environments[options.environment];
			assert$1(environment, `Unknown environment: ${options.environment}`);
			if (options.environment === "client") result.entry = normalizeViteImportAnalysisUrl(environment, id);
			if (environment.name !== "client") {
				const collected = await collectCss(environment, id, { eager: pluginOpts?.experimental?.devEagerTransform ?? true });
				result.css = collected.hrefs.map((href, i) => ({
					href,
					"data-vite-dev-id": collected.ids[i]
				}));
			}
			return JSON.stringify(result);
		} else {
			const map = importAssetsMetaMap[options.environment] ??= {};
			const meta = {
				id,
				key: path.relative(resolvedConfig.root, id),
				importerEnvironment: ctx.environment.name,
				isEntry: !!(map[id]?.isEntry || options.isEntry)
			};
			map[id] = meta;
			return `__assets_manifest[${JSON.stringify(options.environment)}][${JSON.stringify(meta.key)}]`;
		}
	}
	let writeAssetsManifestCalled = false;
	async function writeAssetsManifest(builder) {
		if (writeAssetsManifestCalled) return;
		writeAssetsManifestCalled = true;
		const manifest = {};
		for (const [environmentName, metas] of Object.entries(importAssetsMetaMap)) {
			const bundle = bundleMap[environmentName];
			const assetDepsMap = collectAssetDeps(bundle);
			for (const [id, meta] of Object.entries(metas)) {
				const found = assetDepsMap[id];
				if (!found) {
					builder.config.logger.error(`[vite-plugin-fullstack] failed to find built chunk for ${meta.id} imported by ${meta.importerEnvironment} environment`);
					return;
				}
				const result = {
					js: [],
					css: []
				};
				const { chunk, deps } = found;
				if (environmentName === "client") {
					result.entry = `/${chunk.fileName}`;
					result.js = deps.js.map((fileName) => ({ href: `/${fileName}` }));
				}
				result.css = deps.css.map((fileName) => ({ href: `/${fileName}` }));
				if (!builder.environments[environmentName].config.build.cssCodeSplit) {
					const singleCss = Object.values(bundle).find((v) => v.type === "asset" && v.originalFileNames.includes("style.css"));
					if (singleCss) result.css.push({ href: `/${singleCss.fileName}` });
				}
				(manifest[environmentName] ??= {})[meta.key] = result;
			}
		}
		const importerEnvironments = new Set(Object.values(importAssetsMetaMap).flatMap((metas) => Object.values(metas)).flatMap((meta) => meta.importerEnvironment));
		for (const environmentName of importerEnvironments) {
			const outDir = builder.environments[environmentName].config.build.outDir;
			fs.writeFileSync(path.join(outDir, BUILD_ASSETS_MANIFEST_NAME), `export default ${JSON.stringify(manifest, null, 2)};`);
			const clientOutDir = builder.environments["client"].config.build.outDir;
			for (const asset of Object.values(bundleMap[environmentName])) if (asset.type === "asset") {
				const srcFile = path.join(outDir, asset.fileName);
				const destFile = path.join(clientOutDir, asset.fileName);
				fs.mkdirSync(path.dirname(destFile), { recursive: true });
				fs.copyFileSync(srcFile, destFile);
			}
		}
	}
	return [
		{
			name: "fullstack:assets",
			sharedDuringBuild: true,
			configureServer(server_) {
				server = server_;
			},
			configResolved(config) {
				resolvedConfig = config;
			},
			configEnvironment(name) {
				if ((pluginOpts?.serverEnvironments ?? ["ssr"]).includes(name)) return { build: { emitAssets: true } };
			},
			transform: { async handler(code, id, _options) {
				if (!code.includes("import.meta.vite.assets")) return;
				const output = new MagicString(code);
				const strippedCode = stripLiteral(code);
				const newImports = /* @__PURE__ */ new Set();
				for (const match of code.matchAll(/import\.meta\.vite\.assets\(([\s\S]*?)\)/dg)) {
					const [start, end] = match.indices[0];
					if (!strippedCode.slice(start, end).includes("import.meta.vite.assets")) continue;
					if (this.environment.name === "client") {
						const replacement$1 = `(${JSON.stringify(EMPTY_ASSETS)})`;
						output.update(start, end, replacement$1);
						continue;
					}
					const argCode = match[1].trim();
					const options = {
						import: id,
						environment: void 0,
						asEntry: false
					};
					if (argCode) {
						const argValue = evalValue(argCode);
						Object.assign(options, argValue);
					}
					const environments = options.environment ? [options.environment] : ["client", this.environment.name];
					const importedNames = [];
					for (const environment of environments) {
						const importSource = toAssetsVirtual({
							import: options.import,
							importer: id,
							environment,
							entry: options.asEntry ? "1" : ""
						});
						const importedName = `__assets_${hashString(importSource)}`;
						newImports.add(`;import ${importedName} from ${JSON.stringify(importSource)};\n`);
						importedNames.push(importedName);
					}
					let replacement = importedNames[0];
					if (importedNames.length > 1) {
						newImports.add(`;import * as __assets_runtime from "virtual:fullstack/runtime";\n`);
						replacement = `__assets_runtime.mergeAssets(${importedNames.join(", ")})`;
					}
					output.update(start, end, `(${replacement})`);
				}
				if (output.hasChanged()) {
					for (const newImport of newImports) output.append(newImport);
					return {
						code: output.toString(),
						map: output.generateMap({ hires: "boundary" })
					};
				}
			} },
			resolveId: { handler(source) {
				if (source.startsWith("virtual:fullstack/assets?")) return "\0" + source;
				if (source === "virtual:fullstack/assets-manifest") {
					assert$1.notEqual(this.environment.name, "client");
					assert$1.equal(this.environment.mode, "build");
					return {
						id: source,
						external: true
					};
				}
				if (source === "virtual:fullstack/runtime") return { id: source };
			} },
			load: { async handler(id) {
				if (id === "virtual:fullstack/runtime") return runtimeUtils();
				const parsed = parseAssetsVirtual(id);
				if (!parsed) return;
				assert$1.notEqual(this.environment.name, "client");
				const resolved = await this.resolve(parsed.import, parsed.importer);
				assert$1(resolved, `Failed to resolve: ${parsed.import}`);
				const s = new MagicString("");
				const code = await processAssetsImport(this, resolved.id, {
					environment: parsed.environment,
					isEntry: !!parsed.entry
				});
				s.append(`export default ${code};\n`);
				if (this.environment.mode === "build") s.prepend(`import __assets_manifest from "virtual:fullstack/assets-manifest";\n`);
				return s.toString();
			} },
			renderChunk(code, chunk) {
				if (code.includes("virtual:fullstack/assets-manifest")) {
					const replacement = normalizeRelativePath(path.relative(path.join(chunk.fileName, ".."), BUILD_ASSETS_MANIFEST_NAME));
					code = code.replaceAll("virtual:fullstack/assets-manifest", () => replacement);
					return { code };
				}
			},
			writeBundle(_options, bundle) {
				bundleMap[this.environment.name] = bundle;
			},
			buildStart() {
				if (this.environment.mode == "build" && this.environment.name === "client") {
					if (importAssetsMetaMap["client"]) {
						for (const meta of Object.values(importAssetsMetaMap["client"])) if (meta.isEntry) this.emitFile({
							type: "chunk",
							id: meta.id,
							preserveSignature: "exports-only"
						});
					}
				}
			},
			buildApp: {
				order: "pre",
				async handler(builder) {
					builder.writeAssetsManifest = async () => {
						await writeAssetsManifest(builder);
					};
				}
			}
		},
		{
			name: "fullstack:write-assets-manifest-post",
			buildApp: {
				order: "post",
				async handler(builder) {
					await builder.writeAssetsManifest();
				}
			}
		},
		{
			name: "fullstack:assets-query",
			sharedDuringBuild: true,
			resolveId: {
				order: "pre",
				handler(source) {
					const { query } = parseIdQuery(source);
					if (typeof query["assets"] !== "undefined") {
						if (this.environment.name === "client") return `\0virtual:fullstack/empty-assets`;
					}
					if (source === "virtual:fullstack/runtime") return source;
				}
			},
			load: { async handler(id) {
				if (id === "\0virtual:fullstack/empty-assets") return `export default ${JSON.stringify(EMPTY_ASSETS)}`;
				if (id === "virtual:fullstack/runtime") return runtimeUtils();
				const { filename, query } = parseIdQuery(id);
				const value = query["assets"];
				if (typeof value !== "undefined") {
					const s = new MagicString("");
					const codes = [];
					if (value) {
						const code = await processAssetsImport(this, filename, {
							environment: value,
							isEntry: value === "client"
						});
						codes.push(code);
					} else {
						const code1 = await processAssetsImport(this, filename, {
							environment: "client",
							isEntry: false
						});
						const code2 = await processAssetsImport(this, filename, {
							environment: this.environment.name,
							isEntry: false
						});
						codes.push(code1, code2);
					}
					s.append(`
import * as __assets_runtime from "virtual:fullstack/runtime";\n
export default __assets_runtime.mergeAssets(${codes.join(", ")});
`);
					if (this.environment.mode === "build") s.prepend(`import __assets_manifest from "virtual:fullstack/assets-manifest";\n`);
					return {
						code: s.toString(),
						moduleSideEffects: false
					};
				}
			} },
			hotUpdate(ctx) {
				if (this.environment.name === "rsc") {
					const mods = collectModuleDependents(ctx.modules);
					for (const mod of mods) if (mod.id) {
						const ids = [
							`${mod.id}?assets`,
							`${mod.id}?assets=client`,
							`${mod.id}?assets=${this.environment.name}`
						];
						for (const id of ids) invalidteModuleById(this.environment, id);
					}
				}
			}
		},
		{
			...createVirtualPlugin("fullstack/client-fallback", () => "export {}"),
			configEnvironment: {
				order: "post",
				handler(name, config, _env) {
					if (name === "client") {
						if ((pluginOpts?.experimental?.clientBuildFallback ?? true) && !config.build?.rollupOptions?.input) return { build: { rollupOptions: { input: { __fallback: "virtual:fullstack/client-fallback" } } } };
					}
				}
			},
			generateBundle(_optoins, bundle) {
				if (this.environment.name !== "client") return;
				for (const [k, v] of Object.entries(bundle)) if (v.type === "chunk" && v.name === "__fallback") delete bundle[k];
			}
		},
		patchViteClientPlugin(),
		patchVueScopeCssHmr(),
		patchCssLinkSelfAccept()
	];
}
const EMPTY_ASSETS = {
	js: [],
	css: []
};
const BUILD_ASSETS_MANIFEST_NAME = "__fullstack_assets_manifest.js";
async function collectCss(environment, entryId, options) {
	const visited = /* @__PURE__ */ new Set();
	const cssIds = /* @__PURE__ */ new Set();
	async function recurse(id) {
		if (visited.has(id) || parseAssetsVirtual(id) || "assets" in parseIdQuery(id).query) return;
		visited.add(id);
		const mod = environment.moduleGraph.getModuleById(id);
		if (!mod) return;
		if (options.eager && !mod?.transformResult) try {
			await environment.transformRequest(id);
		} catch (e) {
			console.error(`[collectCss] Failed to transform '${id}'`, e);
		}
		for (const next of mod?.importedModules ?? []) if (next.id) if (isCSSRequest(next.id)) {
			if (hasSpecialCssQuery(next.id)) continue;
			cssIds.add(next.id);
		} else await recurse(next.id);
	}
	await recurse(entryId);
	const hrefs = [...cssIds].map((id) => normalizeViteImportAnalysisUrl(environment, id));
	return {
		ids: [...cssIds],
		hrefs
	};
}
function invalidteModuleById(environment, id) {
	const mod = environment.moduleGraph.getModuleById(id);
	if (mod) environment.moduleGraph.invalidateModule(mod);
	return mod;
}
function collectModuleDependents(mods) {
	const visited = /* @__PURE__ */ new Set();
	function recurse(mod) {
		if (visited.has(mod)) return;
		visited.add(mod);
		for (const importer of mod.importers) recurse(importer);
	}
	for (const mod of mods) recurse(mod);
	return [...visited];
}
function hasSpecialCssQuery(id) {
	return /[?&](url|inline|raw)(\b|=|&|$)/.test(id);
}
function collectAssetDeps(bundle) {
	const chunkToDeps = /* @__PURE__ */ new Map();
	for (const chunk of Object.values(bundle)) if (chunk.type === "chunk") chunkToDeps.set(chunk, collectAssetDepsInner(chunk.fileName, bundle));
	const idToDeps = {};
	for (const [chunk, deps] of chunkToDeps.entries()) for (const id of chunk.moduleIds) idToDeps[id] = {
		chunk,
		deps
	};
	return idToDeps;
}
function collectAssetDepsInner(fileName, bundle) {
	const visited = /* @__PURE__ */ new Set();
	const css = [];
	function recurse(k) {
		if (visited.has(k)) return;
		visited.add(k);
		const v = bundle[k];
		assert$1(v, `Not found '${k}' in the bundle`);
		if (v.type === "chunk") {
			css.push(...v.viteMetadata?.importedCss ?? []);
			for (const k2 of v.imports) if (k2 in bundle) recurse(k2);
		}
	}
	recurse(fileName);
	return {
		js: [...visited],
		css: [...new Set(css)]
	};
}
function patchViteClientPlugin() {
	const viteClientPath = normalizePath(fileURLToPath(import.meta.resolve("vite/dist/client/client.mjs")));
	function endIndexOf(code, searchValue) {
		const i = code.lastIndexOf(searchValue);
		return i === -1 ? i : i + searchValue.length;
	}
	return {
		name: "fullstack:patch-vite-client",
		transform: { handler(code, id) {
			if (id === viteClientPath) {
				if (code.includes("linkSheetsMap")) return;
				const s = new MagicString(code);
				s.prependLeft(code.indexOf("const sheetsMap"), `\
const linkSheetsMap = new Map();
document
  .querySelectorAll('link[rel="stylesheet"][data-vite-dev-id]')
  .forEach((el) => {
    linkSheetsMap.set(el.getAttribute('data-vite-dev-id'), el)
  });
`);
				s.appendLeft(endIndexOf(code, `function updateStyle(id, content) {`), `if (linkSheetsMap.has(id)) { return }`);
				s.appendLeft(endIndexOf(code, `function removeStyle(id) {`), `
const link = linkSheetsMap.get(id);
if (link) {
  document
    .querySelectorAll(
      'link[rel="stylesheet"][data-vite-dev-id]',
    )
    .forEach((el) => {
      if (el.getAttribute('data-vite-dev-id') === id) {
        el.remove()
      }
    })
  linkSheetsMap.delete(id)
}
`);
				return s.toString();
			}
		} }
	};
}
function patchVueScopeCssHmr() {
	return {
		name: "fullstack:patch-vue-scoped-css-hmr",
		configureServer(server) {
			server.middlewares.use((req, _res, next) => {
				if (req.headers.accept?.includes("text/css") && req.url?.includes("&lang.css=")) req.url = req.url.replace("&lang.css=", "?lang.css");
				next();
			});
		}
	};
}
function patchCssLinkSelfAccept() {
	return {
		name: "fullstack:patch-css-link-self-accept",
		apply: "serve",
		transform: {
			order: "post",
			handler(_code, id, _options) {
				if (this.environment.name === "client" && this.environment.mode === "dev" && isCSSRequest(id) && directRequestRE.test(id)) {
					const mod = this.environment.moduleGraph.getModuleById(id);
					if (mod && !mod.isSelfAccepting) mod.isSelfAccepting = true;
				}
			}
		}
	};
}
function runtimeUtils() {
	return `
export function mergeAssets(...args) {
  const js = uniqBy(args.flatMap((h) => h.js), (a) => a.href);
  const css = uniqBy(args.flatMap((h) => h.css), (a) => a.href);
  const entry = args.filter((arg) => arg.entry)?.[0]?.entry;
  const raw = { entry, js, css };
  return { ...raw, merge: (...args$1) => mergeAssets(raw, ...args$1) };
}
function uniqBy(array, key) {
  const seen = new Set();
  return array.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}`;
}

//#endregion
export { assetsPlugin as t };