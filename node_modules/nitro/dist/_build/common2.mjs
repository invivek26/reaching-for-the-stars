import { i as __toESM } from "../_chunks/Bqks5huO.mjs";
import { O as relative, k as resolve, w as join, x as dirname } from "../_libs/c12.mjs";
import { i as unplugin } from "../_libs/unimport.mjs";
import { t as glob } from "../_libs/tinyglobby.mjs";
import { t as src_default } from "../_libs/mime.mjs";
import { i as genSafeVariableName, t as genImport } from "../_libs/knitwork.mjs";
import { t as unwasm } from "../_libs/unwasm.mjs";
import { t as replace } from "../_libs/plugin-replace.mjs";
import { t as require_etag } from "../_libs/etag.mjs";
import { camelCase } from "scule";
import { promises } from "node:fs";
import { joinURL, withTrailingSlash } from "ufo";
import { readFile } from "node:fs/promises";
import { defu } from "defu";
import { pkgDir, runtimeDependencies, runtimeDir } from "nitro/meta";
import { hash } from "ohash";
import { defineEnv } from "unenv";
import { connectors } from "db0";
import { transform } from "oxc-transform";
import { builtinDrivers, normalizeKey } from "unstorage";
import { rollupNodeFileTrace } from "nf3";
import { RENDER_CONTEXT_KEYS, compileTemplateToString, hasTemplateSyntax } from "rendu";

//#region src/build/config.ts
function baseBuildConfig(nitro) {
	const presetsDir$1 = resolve(runtimeDir, "../presets");
	const extensions = [
		".ts",
		".mjs",
		".js",
		".json",
		".node",
		".tsx",
		".jsx"
	];
	const isNodeless = nitro.options.node === false;
	const importMetaInjections = {
		dev: nitro.options.dev,
		preset: nitro.options.preset,
		prerender: nitro.options.preset === "nitro-prerender",
		nitro: true,
		server: true,
		client: false,
		baseURL: nitro.options.baseURL,
		_asyncContext: nitro.options.experimental.asyncContext,
		_tasks: nitro.options.experimental.tasks
	};
	const replacements = {
		...Object.fromEntries(Object.entries(importMetaInjections).map(([key, val]) => [`import.meta.${key}`, JSON.stringify(val)])),
		...nitro.options.replace
	};
	const noExternal = [
		"#",
		"~",
		"@/",
		"~~",
		"@@/",
		"virtual:",
		"nitro",
		pkgDir,
		nitro.options.serverDir,
		nitro.options.buildDir,
		dirname(nitro.options.entry),
		...nitro.options.experimental.wasm ? [(id) => id?.endsWith(".wasm")] : [],
		...nitro.options.handlers.map((m) => m.handler).filter((i) => typeof i === "string"),
		...nitro.options.dev || nitro.options.preset === "nitro-prerender" ? [] : runtimeDependencies
	].filter(Boolean);
	const { env } = defineEnv({
		nodeCompat: isNodeless,
		resolve: true,
		presets: nitro.options.unenv,
		overrides: { alias: nitro.options.alias }
	});
	return {
		presetsDir: presetsDir$1,
		extensions,
		isNodeless,
		replacements,
		env,
		aliases: resolveAliases({ ...env.alias }),
		noExternal
	};
}
function resolveAliases(_aliases) {
	const aliases = Object.fromEntries(Object.entries(_aliases).sort(([a], [b]) => b.split("/").length - a.split("/").length || b.length - a.length));
	for (const key in aliases) for (const alias in aliases) {
		if (![
			"~",
			"@",
			"#"
		].includes(alias[0])) continue;
		if (alias === "@" && !aliases[key].startsWith("@/")) continue;
		if (aliases[key].startsWith(alias)) aliases[key] = aliases[alias] + aliases[key].slice(alias.length);
	}
	return aliases;
}

//#endregion
//#region src/build/plugins/virtual.ts
const PREFIX = "\0virtual:";
function virtual(modules, cache = {}, opts) {
	const _modules = /* @__PURE__ */ new Map();
	for (const [id, mod] of Object.entries(modules)) {
		cache[id] = mod;
		_modules.set(id, mod);
		_modules.set(resolve(id), mod);
	}
	return {
		name: "virtual",
		resolveId(id, importer) {
			if (id in modules) return {
				id: PREFIX + id,
				...opts
			};
			if (importer) {
				const resolved = resolve(dirname(importer.startsWith(PREFIX) ? importer.slice(9) : importer), id);
				if (_modules.has(resolved)) return PREFIX + resolved;
			}
			return null;
		},
		async load(id) {
			if (!id.startsWith(PREFIX)) return null;
			const idNoPrefix = id.slice(9);
			if (!_modules.has(idNoPrefix)) return null;
			let m = _modules.get(idNoPrefix);
			if (typeof m === "function") m = await m();
			if (!m) return null;
			cache[id.replace(PREFIX, "")] = m;
			return {
				code: m,
				map: null
			};
		}
	};
}

//#endregion
//#region src/build/plugins/database.ts
function database(nitro) {
	if (!nitro.options.experimental.database) return virtual({ "#nitro-internal-virtual/database": () => {
		return `export const connectionConfigs = {};`;
	} }, nitro.vfs);
	const dbConfigs = nitro.options.dev && nitro.options.devDatabase || nitro.options.database;
	const connectorsNames = [...new Set(Object.values(dbConfigs || {}).map((config) => config?.connector))].filter(Boolean);
	for (const name of connectorsNames) if (!connectors[name]) throw new Error(`Database connector "${name}" is invalid.`);
	return virtual({ "#nitro-internal-virtual/database": () => {
		return `
${connectorsNames.map((name) => `import ${camelCase(name)}Connector from "${connectors[name]}";`).join("\n")}

export const connectionConfigs = {
  ${Object.entries(dbConfigs || {}).map(([name, { connector, options }]) => `${name}: {
          connector: ${camelCase(connector)}Connector,
          options: ${JSON.stringify(options)}
        }`).join(",\n")}
};
        `;
	} }, nitro.vfs);
}

//#endregion
//#region src/build/plugins/routing.ts
const RuntimeRouteRules = [
	"headers",
	"redirect",
	"proxy",
	"cache"
];
function routing(nitro) {
	return virtual({
		"#nitro-internal-virtual/routing": () => {
			const allHandlers = uniqueBy([
				...Object.values(nitro.routing.routes.routes).flatMap((h) => h.data),
				...Object.values(nitro.routing.routedMiddleware.routes).map((h) => h.data),
				...nitro.routing.globalMiddleware
			], "_importHash");
			return `
import * as __routeRules__ from "nitro/~internal/runtime/route-rules";
import * as srvxNode from "srvx/node"
import * as h3 from "h3";

export const findRouteRules = ${nitro.routing.routeRules.compileToString({
				serialize: serializeRouteRule,
				matchAll: true
			})}

const multiHandler = (...handlers) => {
  const final = handlers.pop()
  const middleware = handlers.filter(Boolean).map(h => h3.toMiddleware(h));
  return (ev) => h3.callMiddleware(ev, middleware, final);
}

${allHandlers.filter((h) => !h.lazy).map((h) => `import ${h._importHash} from "${h.handler}";`).join("\n")}

${allHandlers.filter((h) => h.lazy).map((h) => `const ${h._importHash} = h3.defineLazyEventHandler(() => import("${h.handler}")${h.format === "node" ? ".then(m => srvxNode.toFetchHandler(m.default))" : ""});`).join("\n")}

export const findRoute = ${nitro.routing.routes.compileToString({ serialize: serializeHandler })}

export const findRoutedMiddleware = ${nitro.routing.routedMiddleware.compileToString({
				serialize: serializeHandler,
				matchAll: true
			})};

export const globalMiddleware = [
  ${nitro.routing.globalMiddleware.map((h) => h.lazy ? h._importHash : `h3.toEventHandler(${h._importHash})`).join(",")}
].filter(Boolean);
  `;
		},
		"#nitro-internal-virtual/routing-meta": () => {
			const routeHandlers = uniqueBy(Object.values(nitro.routing.routes.routes).flatMap((h) => h.data), "_importHash");
			return `
  ${routeHandlers.map((h) => `import ${h._importHash}Meta from "${h.handler}?meta";`).join("\n")}
export const handlersMeta = [
  ${routeHandlers.map((h) => `{ route: ${JSON.stringify(h.route)}, method: ${JSON.stringify(h.method?.toLowerCase())}, meta: ${h._importHash}Meta }`).join(",\n")}
  ];
        `.trim();
		}
	}, nitro.vfs);
}
function uniqueBy(arr, key) {
	return [...new Map(arr.map((item) => [item[key], item])).values()];
}
function serializeHandler(h) {
	const meta = Array.isArray(h) ? h[0] : h;
	return `{${[
		`route:${JSON.stringify(meta.route)}`,
		meta.method && `method:${JSON.stringify(meta.method)}`,
		meta.meta && `meta:${JSON.stringify(meta.meta)}`,
		`handler:${Array.isArray(h) ? `multiHandler(${h.map((handler) => serializeHandlerFn(handler)).join(",")})` : serializeHandlerFn(h)}`
	].filter(Boolean).join(",")}}`;
}
function serializeHandlerFn(h) {
	let code = h._importHash;
	if (!h.lazy) {
		if (h.format === "node") code = `srvxNode.toFetchHandler(${code})`;
		code = `h3.toEventHandler(${code})`;
	}
	return code;
}
function serializeRouteRule(h) {
	return `[${Object.entries(h).filter(([name, options]) => options !== void 0 && name[0] !== "_").map(([name, options]) => {
		return `{${[
			`name:${JSON.stringify(name)}`,
			`route:${JSON.stringify(h._route)}`,
			h._method && `method:${JSON.stringify(h._method)}`,
			RuntimeRouteRules.includes(name) && `handler:__routeRules__.${name}`,
			`options:${JSON.stringify(options)}`
		].filter(Boolean).join(",")}}`;
	}).join(",")}]`;
}

//#endregion
//#region src/build/plugins/route-meta.ts
const virtualPrefix = "\0nitro-handler-meta:";
function routeMeta(nitro) {
	return {
		name: "nitro:route-meta",
		async resolveId(id, importer, resolveOpts) {
			if (id.startsWith("\0")) return;
			if (id.endsWith(`?meta`)) {
				const resolved = await this.resolve(id.replace(`?meta`, ``), importer, resolveOpts);
				if (!resolved) return;
				return virtualPrefix + resolved.id;
			}
		},
		load(id) {
			if (id.startsWith(virtualPrefix)) return readFile(id.slice(20), { encoding: "utf8" });
		},
		async transform(code, id) {
			if (!id.startsWith(virtualPrefix)) return;
			let meta = null;
			try {
				const jsCode = transform(id, code).code;
				const ast = this.parse(jsCode);
				for (const node of ast.body) if (node.type === "ExpressionStatement" && node.expression.type === "CallExpression" && node.expression.callee.type === "Identifier" && node.expression.callee.name === "defineRouteMeta" && node.expression.arguments.length === 1) {
					meta = astToObject(node.expression.arguments[0]);
					break;
				}
			} catch (error) {
				nitro.logger.warn(`[handlers-meta] Cannot extra route meta for: ${id}: ${error}`);
			}
			return {
				code: `export default ${JSON.stringify(meta)};`,
				map: null
			};
		}
	};
}
function astToObject(node) {
	switch (node.type) {
		case "ObjectExpression": {
			const obj = {};
			for (const prop of node.properties) if (prop.type === "Property") {
				const key = prop.key.name ?? prop.key.value;
				obj[key] = astToObject(prop.value);
			}
			return obj;
		}
		case "ArrayExpression": return node.elements.map((el) => astToObject(el)).filter(Boolean);
		case "Literal": return node.value;
	}
}

//#endregion
//#region src/build/plugins/server-main.ts
function serverMain(nitro) {
	return {
		name: "nitro:server-main",
		renderChunk(code, chunk) {
			if (chunk.isEntry) return {
				code: `globalThis.__nitro_main__ = import.meta.url; ${code}`,
				map: null
			};
		}
	};
}

//#endregion
//#region src/build/plugins/public-assets.ts
var import_etag$1 = /* @__PURE__ */ __toESM(require_etag(), 1);
const readAssetHandler = {
	true: "node",
	node: "node",
	false: "null",
	deno: "deno",
	inline: "inline"
};
function publicAssets(nitro) {
	return virtual({
		"#nitro-internal-virtual/public-assets-data": async () => {
			const assets = {};
			const files = await glob("**", {
				cwd: nitro.options.output.publicDir,
				absolute: false,
				dot: true
			});
			for (const id of files) {
				let mimeType = src_default.getType(id.replace(/\.(gz|br)$/, "")) || "text/plain";
				if (mimeType.startsWith("text")) mimeType += "; charset=utf-8";
				const fullPath = resolve(nitro.options.output.publicDir, id);
				const assetData = await promises.readFile(fullPath);
				const etag = (0, import_etag$1.default)(assetData);
				const stat$1 = await promises.stat(fullPath);
				const assetId = joinURL(nitro.options.baseURL, decodeURIComponent(id));
				let encoding;
				if (id.endsWith(".gz")) encoding = "gzip";
				else if (id.endsWith(".br")) encoding = "br";
				assets[assetId] = {
					type: nitro._prerenderMeta?.[assetId]?.contentType || mimeType,
					encoding,
					etag,
					mtime: stat$1.mtime.toJSON(),
					size: stat$1.size,
					path: relative(nitro.options.output.serverDir, fullPath),
					data: nitro.options.serveStatic === "inline" ? assetData.toString("base64") : void 0
				};
			}
			return `export default ${JSON.stringify(assets, null, 2)};`;
		},
		"#nitro-internal-virtual/public-assets-node": () => {
			return `
import { promises as fsp } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import assets from '#nitro-internal-virtual/public-assets-data'
export function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__))
  return fsp.readFile(resolve(serverDir, assets[id].path))
}`;
		},
		"#nitro-internal-virtual/public-assets-deno": () => {
			return `
import assets from '#nitro-internal-virtual/public-assets-data'
export function readAsset (id) {
  // https://deno.com/deploy/docs/serve-static-assets
  const path = '.' + decodeURIComponent(new URL(\`../public\${id}\`, 'file://').pathname)
  return Deno.readFile(path);
}`;
		},
		"#nitro-internal-virtual/public-assets-null": () => {
			return `
    export function readAsset (id) {
        return Promise.resolve(null);
    }`;
		},
		"#nitro-internal-virtual/public-assets-inline": () => {
			return `
  import assets from '#nitro-internal-virtual/public-assets-data'
  export function readAsset (id) {
    if (!assets[id]) { return undefined }
    if (assets[id]._data) { return assets[id]._data }
    if (!assets[id].data) { return assets[id].data }
    assets[id]._data = Uint8Array.from(atob(assets[id].data), (c) => c.charCodeAt(0))
    return assets[id]._data
}`;
		},
		"#nitro-internal-virtual/public-assets": () => {
			const publicAssetBases = Object.fromEntries(nitro.options.publicAssets.filter((dir) => !dir.fallthrough && dir.baseURL !== "/").map((dir) => [withTrailingSlash(joinURL(nitro.options.baseURL, dir.baseURL || "/")), { maxAge: dir.maxAge }]));
			return `
import assets from '#nitro-internal-virtual/public-assets-data'
export { readAsset } from "${`#nitro-internal-virtual/public-assets-${readAssetHandler[nitro.options.serveStatic] || "null"}`}"
export const publicAssetBases = ${JSON.stringify(publicAssetBases)}

export function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

export function getPublicAssetMeta(id = '') {
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return publicAssetBases[base] }
  }
  return {}
}

export function getAsset (id) {
  return assets[id]
}
`;
		}
	}, nitro.vfs);
}

//#endregion
//#region src/build/plugins/server-assets.ts
var import_etag = /* @__PURE__ */ __toESM(require_etag(), 1);
function serverAssets(nitro) {
	if (nitro.options.dev || nitro.options.preset === "nitro-prerender") return virtual({ "#nitro-internal-virtual/server-assets": getAssetsDev(nitro) }, nitro.vfs);
	return virtual({ "#nitro-internal-virtual/server-assets": async () => {
		const assets = {};
		for (const asset of nitro.options.serverAssets) {
			const files = await glob(asset.pattern || "**/*", {
				cwd: asset.dir,
				absolute: false,
				ignore: asset.ignore
			});
			for (const _id of files) {
				const fsPath = resolve(asset.dir, _id);
				const id = asset.baseName + "/" + _id;
				assets[id] = {
					fsPath,
					meta: {}
				};
				let type = src_default.getType(id) || "text/plain";
				if (type.startsWith("text")) type += "; charset=utf-8";
				const etag = (0, import_etag.default)(await promises.readFile(fsPath));
				const mtime = await promises.stat(fsPath).then((s) => s.mtime.toJSON());
				assets[id].meta = {
					type,
					etag,
					mtime
				};
			}
		}
		return getAssetProd(assets);
	} }, nitro.vfs);
}
function getAssetsDev(nitro) {
	return `
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'

const serverAssets = ${JSON.stringify(nitro.options.serverAssets)}

export const assets = createStorage()

for (const asset of serverAssets) {
  assets.mount(asset.baseName, fsDriver({ base: asset.dir, ignore: (asset?.ignore || []) }))
}`;
}
function getAssetProd(assets) {
	return `
const _assets = {\n${Object.entries(assets).map(([id, asset]) => `  [${JSON.stringify(normalizeKey(id))}]: {\n    import: () => import(${JSON.stringify("raw:" + asset.fsPath)}).then(r => r.default || r),\n    meta: ${JSON.stringify(asset.meta)}\n  }`).join(",\n")}\n}

const normalizeKey = ${normalizeKey.toString()}

export const assets = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id)
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id)
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id)
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
}
`;
}

//#endregion
//#region src/build/plugins/storage.ts
function storage(nitro) {
	const mounts = [];
	const storageMounts = nitro.options.dev || nitro.options.preset === "nitro-prerender" ? {
		...nitro.options.storage,
		...nitro.options.devStorage
	} : nitro.options.storage;
	for (const path in storageMounts) {
		const mount = storageMounts[path];
		mounts.push({
			path,
			driver: builtinDrivers[mount.driver] || mount.driver,
			opts: mount
		});
	}
	const driverImports = [...new Set(mounts.map((m) => m.driver))];
	return virtual({ "#nitro-internal-virtual/storage": `
import { createStorage } from 'unstorage'
import { assets } from '#nitro-internal-virtual/server-assets'

${driverImports.map((i) => genImport(i, genSafeVariableName(i))).join("\n")}

export function initStorage() {
  const storage = createStorage({})
  storage.mount('/assets', assets)
  ${mounts.map((m) => `storage.mount('${m.path}', ${genSafeVariableName(m.driver)}(${JSON.stringify(m.opts)}))`).join("\n")}
  return storage
}
` }, nitro.vfs);
}

//#endregion
//#region src/build/plugins/error-handler.ts
function errorHandler(nitro) {
	return virtual({ "#nitro-internal-virtual/error-handler": () => {
		const errorHandlers = Array.isArray(nitro.options.errorHandler) ? nitro.options.errorHandler : [nitro.options.errorHandler];
		const builtinHandler = join(runtimeDir, `internal/error/${nitro.options.dev ? "dev" : "prod"}`);
		return `
${errorHandlers.map((h, i) => `import errorHandler$${i} from "${h}";`).join("\n")}

const errorHandlers = [${errorHandlers.map((_, i) => `errorHandler$${i}`).join(", ")}];

import { defaultHandler } from "${builtinHandler}";

export default async function(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}
`;
	} }, nitro.vfs);
}

//#endregion
//#region src/build/plugins/renderer-template.ts
function rendererTemplate(nitro) {
	return virtual({ "#nitro-internal-virtual/renderer-template": async () => {
		const template = nitro.options.renderer?.template;
		if (typeof template !== "string") return `
            export const rendererTemplate = () => '<!-- renderer.template is not set -->';
            export const rendererTemplateFile = undefined;
            export const isStaticTemplate = true;`;
		if (nitro.options.dev) return `
            import { readFile } from 'node:fs/promises';
            export const rendererTemplate = () => readFile(${JSON.stringify(template)}, "utf8");
            export const rendererTemplateFile = ${JSON.stringify(template)};
            export const isStaticTemplate = ${JSON.stringify(nitro.options.renderer?.static)};
            `;
		else {
			const html = await readFile(template, "utf8");
			if (nitro.options.renderer?.static ?? !hasTemplateSyntax(html)) return `
              import { HTTPResponse } from "h3";
              export const rendererTemplate = () => new HTTPResponse(${JSON.stringify(html)}, { headers: { "content-type": "text/html; charset=utf-8" } });
            `;
			else return `
            import { renderToResponse } from 'rendu'
            import { serverFetch } from 'nitro/app'
            const template = ${compileTemplateToString(html, { contextKeys: [...RENDER_CONTEXT_KEYS] })};
            export const rendererTemplate = (request) => renderToResponse(template, { request, context: { serverFetch } })
            `;
		}
	} }, nitro.vfs);
}

//#endregion
//#region src/build/plugins/feature-flags.ts
function featureFlags(nitro) {
	return virtual({ "#nitro-internal-virtual/feature-flags": () => {
		const featureFlags$1 = {
			hasRoutes: nitro.routing.routes.hasRoutes(),
			hasRouteRules: nitro.routing.routeRules.hasRoutes(),
			hasRoutedMiddleware: nitro.routing.routedMiddleware.hasRoutes(),
			hasGlobalMiddleware: nitro.routing.globalMiddleware.length > 0,
			hasPlugins: nitro.options.plugins.length > 0,
			hasHooks: nitro.options.features?.runtimeHooks ?? nitro.options.plugins.length > 0,
			hasWebSocket: nitro.options.features?.websocket ?? nitro.options.experimental.websocket ?? false
		};
		return Object.entries(featureFlags$1).map(([key, value]) => `export const ${key} = ${Boolean(value)};`).join("\n");
	} }, nitro.vfs);
}

//#endregion
//#region src/build/plugins/resolve.ts
const subpathMap = {
	"nitro/h3": "h3",
	"nitro/deps/h3": "h3",
	"nitro/deps/ofetch": "ofetch"
};
function nitroResolveIds() {
	return {
		name: "nitro:resolve-ids",
		resolveId: {
			order: "pre",
			handler(id, importer, rOpts) {
				if (importer && importer.startsWith("\0virtual:#nitro-internal-virtual")) return this.resolve(id, runtimeDir, { skipSelf: true });
				const mappedId = subpathMap[id];
				if (mappedId) return this.resolve(mappedId, runtimeDir, { skipSelf: true });
			}
		}
	};
}

//#endregion
//#region src/build/plugins/sourcemap-min.ts
function sourcemapMinify() {
	return {
		name: "nitro:sourcemap-minify",
		generateBundle(_options, bundle) {
			for (const [key, asset] of Object.entries(bundle)) {
				if (!key.endsWith(".map") || !("source" in asset) || typeof asset.source !== "string") continue;
				const sourcemap = JSON.parse(asset.source);
				delete sourcemap.sourcesContent;
				delete sourcemap.x_google_ignoreList;
				if ((sourcemap.sources || []).some((s) => s.includes("node_modules"))) sourcemap.mappings = "";
				asset.source = JSON.stringify(sourcemap);
			}
		}
	};
}

//#endregion
//#region src/build/plugins/raw.ts
const HELPER_ID = "virtual:raw-helpers";
const RESOLVED_RAW_PREFIX = "virtual:raw:";
function raw() {
	return {
		name: "raw",
		resolveId: {
			order: "pre",
			async handler(id, importer, resolveOpts) {
				if (id === HELPER_ID) return id;
				if (id.startsWith("raw:")) return { id: RESOLVED_RAW_PREFIX + (await this.resolve(id.slice(4), importer, resolveOpts))?.id };
			}
		},
		load: {
			order: "pre",
			handler(id) {
				if (id === HELPER_ID) return getHelpers();
				if (id.startsWith(RESOLVED_RAW_PREFIX)) return promises.readFile(id.slice(12), isBinary(id) ? "binary" : "utf8");
			}
		},
		transform: {
			order: "pre",
			handler(code, id) {
				if (!id.startsWith(RESOLVED_RAW_PREFIX)) return;
				if (isBinary(id)) return {
					code: `import {base64ToUint8Array } from "${HELPER_ID}" \n export default base64ToUint8Array("${Buffer.from(code, "binary").toString("base64")}")`,
					map: null
				};
				return {
					code: `export default ${JSON.stringify(code)}`,
					map: null,
					moduleType: "js"
				};
			}
		}
	};
}
function isBinary(id) {
	const idMime = src_default.getType(id) || "";
	if (idMime.startsWith("text/")) return false;
	if (/application\/(json|sql|xml|yaml)/.test(idMime)) return false;
	return true;
}
function getHelpers() {
	return String.raw`
export function base64ToUint8Array(str) {
  const data = atob(str);
  const size = data.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = data.charCodeAt(i);
  }
  return bytes;
}
  `;
}

//#endregion
//#region src/build/plugins/runtime-config.ts
function runtimeConfig(nitro) {
	return virtual({ "#nitro-internal-virtual/runtime-config": () => {
		return `export const runtimeConfig = ${JSON.stringify(nitro.options.runtimeConfig || {})};`;
	} }, nitro.vfs);
}

//#endregion
//#region src/build/plugins.ts
function baseBuildPlugins(nitro, base) {
	const plugins = [];
	if (nitro.options.imports) plugins.push(unplugin.rollup(nitro.options.imports));
	if (nitro.options.experimental.wasm) plugins.push(unwasm(nitro.options.wasm || {}));
	plugins.push(serverMain(nitro));
	const nitroPlugins = [...new Set(nitro.options.plugins)];
	plugins.push(virtual({ "#nitro-internal-virtual/plugins": `
  ${nitroPlugins.map((plugin) => `import _${hash(plugin).replace(/-/g, "")} from '${plugin}';`).join("\n")}

  export const plugins = [
    ${nitroPlugins.map((plugin) => `_${hash(plugin).replace(/-/g, "")}`).join(",\n")}
  ]
      ` }, nitro.vfs));
	plugins.push(featureFlags(nitro));
	plugins.push(nitroResolveIds());
	plugins.push(serverAssets(nitro));
	plugins.push(publicAssets(nitro));
	plugins.push(storage(nitro));
	plugins.push(database(nitro));
	plugins.push(routing(nitro));
	plugins.push(raw());
	if (nitro.options.experimental.openAPI) plugins.push(routeMeta(nitro));
	plugins.push(runtimeConfig(nitro));
	plugins.push(errorHandler(nitro));
	plugins.push(virtual({ "#nitro-internal-pollyfills": base.env.polyfill.map((p) => `import '${p}';`).join("\n") || `/* No polyfills */` }, nitro.vfs, { moduleSideEffects: true }));
	plugins.push(virtual(nitro.options.virtual, nitro.vfs));
	if (nitro.options.renderer?.template) plugins.push(rendererTemplate(nitro));
	plugins.push(replace({
		preventAssignment: true,
		values: base.replacements
	}));
	if (!nitro.options.noExternals) plugins.push(rollupNodeFileTrace(defu(nitro.options.externals, {
		outDir: nitro.options.output.serverDir,
		moduleDirectories: nitro.options.nodeModulesDirs,
		external: nitro.options.nodeModulesDirs,
		inline: [...base.noExternal],
		traceOptions: {
			base: "/",
			processCwd: nitro.options.rootDir,
			exportsOnly: true
		},
		traceAlias: {
			"h3-nightly": "h3",
			...nitro.options.externals?.traceAlias
		},
		exportConditions: nitro.options.exportConditions,
		writePackageJson: true
	})));
	if (nitro.options.sourcemap && !nitro.options.dev && nitro.options.experimental.sourcemapMinify !== false) plugins.push(sourcemapMinify());
	return plugins;
}

//#endregion
export { baseBuildConfig as n, baseBuildPlugins as t };