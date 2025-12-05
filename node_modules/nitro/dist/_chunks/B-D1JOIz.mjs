import { i as __toESM } from "./Bqks5huO.mjs";
import { O as relative, T as normalize, g as resolveModuleURL, h as resolveModulePath, i as loadConfig, k as resolve, l as findWorkspaceDir, t as watchConfig, w as join } from "../_libs/c12.mjs";
import { a as createUnimport } from "../_libs/unimport.mjs";
import { t as glob } from "../_libs/tinyglobby.mjs";
import { n as resolveCompatibilityDates, r as resolveCompatibilityDatesFromEnv } from "../_libs/compatx.mjs";
import { t as klona } from "../_libs/klona.mjs";
import { i as d, r as a } from "../_libs/std-env.mjs";
import { t as escapeStringRegexp } from "../_libs/escape-string-regexp.mjs";
import { n as parse, t as TSConfckCache } from "../_libs/tsconfck.mjs";
import { i as writeFile$1, n as prettyPath, r as resolveNitroPath, t as isDirectory } from "./C7CbzoI1.mjs";
import { i as scanHandlers, r as scanAndSyncOptions, t as runParallel } from "./ANM1K1bE.mjs";
import { a as findRoute, i as findAllRoutes, n as addRoute, r as createRouter, t as compileRouterToString } from "../_libs/rou3.mjs";
import { t as src_default } from "../_libs/mime.mjs";
import { n as z, t as P } from "../_libs/ultrahtml.mjs";
import { createRequire } from "node:module";
import consola$1, { consola } from "consola";
import { Hookable, createDebugger } from "hookable";
import { existsSync, promises } from "node:fs";
import { joinURL, parseURL, withBase, withLeadingSlash, withTrailingSlash, withoutBase, withoutTrailingSlash } from "ufo";
import { pathToFileURL } from "node:url";
import fsp, { readFile } from "node:fs/promises";
import { defu } from "defu";
import { pkgDir, runtimeDir } from "nitro/meta";
import { colors } from "consola/utils";
import { ofetch } from "ofetch";
import { hash } from "ohash";
import zlib from "node:zlib";
import { toRequest } from "h3";

//#region src/config/defaults.ts
const NitroDefaults = {
	compatibilityDate: "latest",
	debug: d,
	logLevel: a ? 1 : 3,
	runtimeConfig: {
		app: {},
		nitro: {}
	},
	serverDir: false,
	scanDirs: [],
	buildDir: `node_modules/.nitro`,
	output: {
		dir: "{{ rootDir }}/.output",
		serverDir: "{{ output.dir }}/server",
		publicDir: "{{ output.dir }}/public"
	},
	features: {},
	experimental: {},
	future: {},
	storage: {},
	devStorage: {},
	publicAssets: [],
	serverAssets: [],
	plugins: [],
	tasks: {},
	scheduledTasks: {},
	imports: false,
	virtual: {},
	compressPublicAssets: false,
	ignore: [],
	dev: false,
	devServer: { watch: [] },
	watchOptions: { ignoreInitial: true },
	devProxy: {},
	logging: {
		compressedSizes: true,
		buildSuccess: true
	},
	baseURL: process.env.NITRO_APP_BASE_URL || "/",
	handlers: [],
	devHandlers: [],
	errorHandler: void 0,
	routes: {},
	routeRules: {},
	prerender: {
		autoSubfolderIndex: true,
		concurrency: 1,
		interval: 0,
		retry: 3,
		retryDelay: 500,
		failOnError: false,
		crawlLinks: false,
		ignore: [],
		routes: []
	},
	builder: void 0,
	moduleSideEffects: ["unenv/polyfill/"],
	replace: {},
	node: true,
	sourcemap: false,
	typescript: {
		strict: true,
		generateRuntimeConfigTypes: false,
		generateTsConfig: false,
		tsconfigPath: "tsconfig.json",
		tsConfig: void 0
	},
	nodeModulesDirs: [],
	hooks: {},
	commands: {},
	framework: {
		name: "nitro",
		version: ""
	}
};

//#endregion
//#region src/config/resolvers/assets.ts
async function resolveAssetsOptions(options) {
	for (const publicAsset of options.publicAssets) {
		publicAsset.dir = resolve(options.rootDir, publicAsset.dir);
		publicAsset.baseURL = withLeadingSlash(withoutTrailingSlash(publicAsset.baseURL || "/"));
	}
	for (const dir of [options.rootDir, ...options.scanDirs]) {
		const publicDir = resolve(dir, "public");
		if (!existsSync(publicDir)) continue;
		if (options.publicAssets.some((asset) => asset.dir === publicDir)) continue;
		options.publicAssets.push({ dir: publicDir });
	}
	for (const serverAsset of options.serverAssets) serverAsset.dir = resolve(options.rootDir, serverAsset.dir);
	options.serverAssets.push({
		baseName: "server",
		dir: resolve(options.rootDir, "assets")
	});
	for (const asset of options.publicAssets) {
		asset.baseURL = asset.baseURL || "/";
		const isTopLevel = asset.baseURL === "/";
		asset.fallthrough = asset.fallthrough ?? isTopLevel;
		const routeRule = options.routeRules[asset.baseURL + "/**"];
		asset.maxAge = (routeRule?.cache)?.maxAge ?? asset.maxAge ?? 0;
		if (asset.maxAge && !asset.fallthrough) options.routeRules[asset.baseURL + "/**"] = defu(routeRule, { headers: { "cache-control": `public, max-age=${asset.maxAge}, immutable` } });
	}
}

//#endregion
//#region src/config/resolvers/compatibility.ts
async function resolveCompatibilityOptions(options) {
	options.compatibilityDate = resolveCompatibilityDatesFromEnv(options.compatibilityDate);
}

//#endregion
//#region src/config/resolvers/database.ts
async function resolveDatabaseOptions(options) {
	if (options.experimental.database && options.imports) {
		options.imports.presets.push({
			from: "nitro/database",
			imports: ["useDatabase"]
		});
		if (options.dev && !options.database && !options.devDatabase) options.devDatabase = { default: {
			connector: "sqlite",
			options: { cwd: options.rootDir }
		} };
		else if (options.node && !options.database) options.database = { default: {
			connector: "sqlite",
			options: {}
		} };
	}
}

//#endregion
//#region src/config/resolvers/export-conditions.ts
async function resolveExportConditionsOptions(options) {
	options.exportConditions = _resolveExportConditions(options.exportConditions || [], {
		dev: options.dev,
		node: options.node,
		wasm: options.experimental.wasm
	});
}
function _resolveExportConditions(conditions, opts) {
	const resolvedConditions = [];
	resolvedConditions.push(opts.dev ? "development" : "production");
	resolvedConditions.push(...conditions);
	if (opts.node) resolvedConditions.push("node");
	else resolvedConditions.push("wintercg", "worker", "web", "browser", "workerd", "edge-light", "netlify", "edge-routine", "deno");
	if (opts.wasm) resolvedConditions.push("wasm", "unwasm");
	resolvedConditions.push("import", "default");
	if ("Bun" in globalThis) resolvedConditions.push("bun");
	else if ("Deno" in globalThis) resolvedConditions.push("deno");
	return resolvedConditions.filter((c, i) => resolvedConditions.indexOf(c) === i);
}

//#endregion
//#region src/config/resolvers/imports.ts
async function resolveImportsOptions(options) {
	if (options.imports === false) return;
	options.imports.presets ??= [];
	options.imports.dirs ??= [];
	options.imports.dirs.push(...options.scanDirs.map((dir) => join(dir, "utils/**/*")));
	if (Array.isArray(options.imports.exclude) && options.imports.exclude.length === 0) {
		options.imports.exclude.push(/[/\\]\.git[/\\]/);
		options.imports.exclude.push(options.buildDir);
		const scanDirsInNodeModules = options.scanDirs.map((dir) => dir.match(/(?<=\/)node_modules\/(.+)$/)?.[1]).filter(Boolean);
		options.imports.exclude.push(scanDirsInNodeModules.length > 0 ? /* @__PURE__ */ new RegExp(`node_modules\\/(?!${scanDirsInNodeModules.map((dir) => escapeStringRegexp(dir)).join("|")})`) : /[/\\]node_modules[/\\]/);
	}
}

//#endregion
//#region src/config/resolvers/open-api.ts
async function resolveOpenAPIOptions(options) {
	if (!options.experimental.openAPI) return;
	if (!options.dev && !options.openAPI?.production) return;
	const shouldPrerender = !options.dev && options.openAPI?.production === "prerender";
	const handlersEnv = shouldPrerender ? "prerender" : "";
	const prerenderRoutes = [];
	const jsonRoute = options.openAPI?.route || "/_openapi.json";
	prerenderRoutes.push(jsonRoute);
	options.handlers.push({
		route: jsonRoute,
		env: handlersEnv,
		handler: join(runtimeDir, "internal/routes/openapi")
	});
	if (options.openAPI?.ui?.scalar !== false) {
		const scalarRoute = options.openAPI?.ui?.scalar?.route || "/_scalar";
		prerenderRoutes.push(scalarRoute);
		options.handlers.push({
			route: options.openAPI?.ui?.scalar?.route || "/_scalar",
			env: handlersEnv,
			handler: join(runtimeDir, "internal/routes/scalar")
		});
	}
	if (options.openAPI?.ui?.swagger !== false) {
		const swaggerRoute = options.openAPI?.ui?.swagger?.route || "/_swagger";
		prerenderRoutes.push(swaggerRoute);
		options.handlers.push({
			route: swaggerRoute,
			env: handlersEnv,
			handler: join(runtimeDir, "internal/routes/swagger")
		});
	}
	if (shouldPrerender) {
		options.prerender ??= {};
		options.prerender.routes ??= [];
		options.prerender.routes.push(...prerenderRoutes);
	}
}

//#endregion
//#region src/config/resolvers/tsconfig.ts
async function resolveTsconfig(options) {
	const root = resolve(options.rootDir || ".") + "/";
	if (!options.typescript.tsConfig) options.typescript.tsConfig = await loadTsconfig(root);
	if (options.experimental.tsconfigPaths !== false && options.typescript.tsConfig.compilerOptions?.paths) options.alias = {
		...tsConfigToAliasObj(options.typescript.tsConfig, root),
		...options.alias
	};
}
async function loadTsconfig(root) {
	const opts = {
		root,
		cache: loadTsconfig["__cache"] ??= new TSConfckCache(),
		ignoreNodeModules: true
	};
	const tsConfigPath = join(root, "tsconfig.json");
	const parsed = await parse(tsConfigPath, opts).catch(() => void 0);
	if (!parsed) return {};
	const { tsconfig, tsconfigFile } = parsed;
	tsconfig.compilerOptions ??= {};
	if (!tsconfig.compilerOptions.baseUrl) tsconfig.compilerOptions.baseUrl = resolve(tsconfigFile, "..");
	return tsconfig;
}
function tsConfigToAliasObj(tsconfig, root) {
	const compilerOptions = tsconfig?.compilerOptions;
	if (!compilerOptions?.paths) return {};
	const paths = compilerOptions.paths;
	const alias = {};
	for (const [key, targets] of Object.entries(paths)) {
		let source = key;
		let target = targets?.[0];
		if (!target) continue;
		if (source.includes("*") || target.includes("*")) {
			source = source.replace(/\/\*$/, "");
			target = target.replace(/\/\*$/, "");
			if (source.includes("*") || target.includes("*")) continue;
		}
		if (target.startsWith(".")) {
			if (!compilerOptions.baseUrl) continue;
			target = resolve(root, compilerOptions.baseUrl, target) + (key.endsWith("*") ? "/" : "");
		}
		alias[source] = target;
	}
	return alias;
}

//#endregion
//#region src/config/resolvers/paths.ts
const RESOLVE_EXTENSIONS = [
	".ts",
	".js",
	".mts",
	".mjs",
	".tsx",
	".jsx"
];
async function resolvePathOptions(options) {
	options.rootDir = resolve(options.rootDir || ".") + "/";
	options.buildDir = resolve(options.rootDir, options.buildDir || ".") + "/";
	options.workspaceDir ||= await findWorkspaceDir(options.rootDir).catch(() => options.rootDir) + "/";
	if (options.srcDir) {
		if (options.serverDir === void 0) options.serverDir = options.srcDir;
		consola$1.warn(`"srcDir" option is deprecated. Please use "serverDir" instead.`);
	}
	if (options.serverDir !== false) {
		if (options.serverDir === true) options.serverDir = "server";
		options.serverDir = resolve(options.rootDir, options.serverDir || ".") + "/";
	}
	options.alias ??= {};
	if (!options.static && !options.entry) throw new Error(`Nitro entry is missing! Is "${options.preset}" preset correct?`);
	if (options.entry) options.entry = resolveNitroPath(options.entry, options);
	options.output.dir = resolveNitroPath(options.output.dir || NitroDefaults.output.dir, options, options.rootDir) + "/";
	options.output.publicDir = resolveNitroPath(options.output.publicDir || NitroDefaults.output.publicDir, options, options.rootDir) + "/";
	options.output.serverDir = resolveNitroPath(options.output.serverDir || NitroDefaults.output.serverDir, options, options.rootDir) + "/";
	options.nodeModulesDirs.push(resolve(options.rootDir, "node_modules"));
	options.nodeModulesDirs.push(resolve(options.workspaceDir, "node_modules"));
	options.nodeModulesDirs.push(resolve(pkgDir, "dist/node_modules"));
	options.nodeModulesDirs.push(resolve(pkgDir, "node_modules"));
	options.nodeModulesDirs.push(resolve(pkgDir, ".."));
	options.nodeModulesDirs = [...new Set(options.nodeModulesDirs.map((dir) => resolve(options.rootDir, dir) + "/"))];
	options.plugins = options.plugins.map((p) => resolveNitroPath(p, options));
	if (options.serverDir) options.scanDirs.unshift(options.serverDir);
	options.scanDirs = options.scanDirs.map((dir) => resolve(options.rootDir, dir));
	options.scanDirs = [...new Set(options.scanDirs.map((dir) => dir + "/"))];
	options.handlers = options.handlers.map((h) => {
		return {
			...h,
			handler: resolveNitroPath(h.handler, options)
		};
	});
	options.routes = Object.fromEntries(Object.entries(options.routes).map(([route, h]) => {
		if (typeof h === "string") h = { handler: h };
		h.handler = resolveNitroPath(h.handler, options);
		return [route, h];
	}));
	if (!options.routes["/**"] && !options.handlers.some((h) => h.route === "/**")) {
		const serverEntry = resolveModulePath("./server", {
			from: [options.rootDir, ...options.scanDirs],
			extensions: RESOLVE_EXTENSIONS,
			try: true
		});
		if (serverEntry) {
			if (!(options.handlers.some((h) => h.handler === serverEntry) || Object.values(options.routes).some((r) => r.handler === serverEntry))) {
				options.routes["/**"] = { handler: serverEntry };
				consola$1.info(`Using \`${prettyPath(serverEntry)}\` as default route handler.`);
			}
		}
	}
	if (options.renderer?.handler) options.renderer.handler = resolveModulePath(resolveNitroPath(options.renderer?.handler, options), {
		from: [options.rootDir, ...options.scanDirs],
		extensions: RESOLVE_EXTENSIONS
	});
	if (options.renderer?.template) options.renderer.template = resolveModulePath(resolveNitroPath(options.renderer?.template, options), {
		from: [options.rootDir, ...options.scanDirs],
		extensions: [".html"]
	});
	else if (!options.renderer?.handler) {
		const defaultIndex = resolveModulePath("./index.html", {
			from: [options.rootDir, ...options.scanDirs],
			extensions: [".html"],
			try: true
		});
		if (defaultIndex) {
			options.renderer ??= {};
			options.renderer.template = defaultIndex;
			consola$1.info(`Using \`${prettyPath(defaultIndex)}\` as renderer template.`);
		}
	}
	if (options.renderer?.template && !options.renderer?.handler) {
		options.renderer ??= {};
		options.renderer.handler = join(runtimeDir, "internal/routes/renderer-template" + (options.dev ? ".dev" : ""));
	}
}

//#endregion
//#region src/config/resolvers/route-rules.ts
async function resolveRouteRulesOptions(options) {
	options.routeRules = normalizeRouteRules(options);
}
function normalizeRouteRules(config) {
	const normalizedRules = {};
	for (let path in config.routeRules) {
		const routeConfig = config.routeRules[path];
		path = withLeadingSlash(path);
		const routeRules = {
			...routeConfig,
			redirect: void 0,
			proxy: void 0
		};
		if (routeConfig.redirect) {
			routeRules.redirect = {
				to: "/",
				status: 307,
				...typeof routeConfig.redirect === "string" ? { to: routeConfig.redirect } : routeConfig.redirect
			};
			if (path.endsWith("/**")) routeRules.redirect._redirectStripBase = path.slice(0, -3);
		}
		if (routeConfig.proxy) {
			routeRules.proxy = typeof routeConfig.proxy === "string" ? { to: routeConfig.proxy } : routeConfig.proxy;
			if (path.endsWith("/**")) routeRules.proxy._proxyStripBase = path.slice(0, -3);
		}
		if (routeConfig.cors) routeRules.headers = {
			"access-control-allow-origin": "*",
			"access-control-allow-methods": "*",
			"access-control-allow-headers": "*",
			"access-control-max-age": "0",
			...routeRules.headers
		};
		if (routeConfig.swr) {
			routeRules.cache = routeRules.cache || {};
			routeRules.cache.swr = true;
			if (typeof routeConfig.swr === "number") routeRules.cache.maxAge = routeConfig.swr;
		}
		if (routeConfig.cache === false) routeRules.cache = false;
		normalizedRules[path] = routeRules;
	}
	return normalizedRules;
}

//#endregion
//#region src/config/resolvers/runtime-config.ts
async function resolveRuntimeConfigOptions(options) {
	options.runtimeConfig = normalizeRuntimeConfig(options);
}
function normalizeRuntimeConfig(config) {
	provideFallbackValues(config.runtimeConfig || {});
	const runtimeConfig = defu(config.runtimeConfig, {
		app: { baseURL: config.baseURL },
		nitro: {
			envExpansion: config.experimental?.envExpansion,
			openAPI: config.openAPI
		}
	});
	runtimeConfig.nitro.routeRules = config.routeRules;
	checkSerializableRuntimeConfig(runtimeConfig);
	return runtimeConfig;
}
function provideFallbackValues(obj) {
	for (const key in obj) if (obj[key] === void 0 || obj[key] === null) obj[key] = "";
	else if (typeof obj[key] === "object") provideFallbackValues(obj[key]);
}
function checkSerializableRuntimeConfig(obj, path = []) {
	if (isPrimitiveValue(obj)) return;
	for (const key in obj) {
		const value = obj[key];
		if (value === null || value === void 0 || isPrimitiveValue(value)) continue;
		if (Array.isArray(value)) for (const [index, item] of value.entries()) checkSerializableRuntimeConfig(item, [...path, `${key}[${index}]`]);
		else if (typeof value === "object" && value.constructor === Object && (!value.constructor?.name || value.constructor.name === "Object")) checkSerializableRuntimeConfig(value, [...path, key]);
		else console.warn(`Runtime config option \`${[...path, key].join(".")}\` may not be able to be serialized.`);
	}
}
function isPrimitiveValue(value) {
	return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

//#endregion
//#region src/config/resolvers/storage.ts
async function resolveStorageOptions(options) {}

//#endregion
//#region src/config/resolvers/url.ts
async function resolveURLOptions(options) {
	options.baseURL = withLeadingSlash(withTrailingSlash(options.baseURL));
}

//#endregion
//#region src/config/resolvers/error.ts
async function resolveErrorOptions(options) {
	if (!options.errorHandler) options.errorHandler = [];
	else if (!Array.isArray(options.errorHandler)) options.errorHandler = [options.errorHandler];
	options.errorHandler = options.errorHandler.map((h) => resolveNitroPath(h, options));
	options.errorHandler.push(join(runtimeDir, `internal/error/${options.dev ? "dev" : "prod"}`));
}

//#endregion
//#region src/config/resolvers/unenv.ts
const common = {
	meta: {
		name: "nitro-common",
		url: import.meta.url
	},
	alias: {
		"buffer/": "node:buffer",
		"buffer/index": "node:buffer",
		"buffer/index.js": "node:buffer",
		"string_decoder/": "node:string_decoder",
		"process/": "node:process"
	}
};
const nodeless = {
	meta: {
		name: "nitro-nodeless",
		url: import.meta.url
	},
	inject: {
		global: "unenv/polyfill/globalthis",
		process: "node:process",
		Buffer: ["node:buffer", "Buffer"],
		clearImmediate: ["node:timers", "clearImmediate"],
		setImmediate: ["node:timers", "setImmediate"],
		performance: "unenv/polyfill/performance",
		PerformanceObserver: ["node:perf_hooks", "PerformanceObserver"],
		BroadcastChannel: ["node:worker_threads", "BroadcastChannel"]
	},
	polyfill: [
		"unenv/polyfill/globalthis-global",
		"unenv/polyfill/process",
		"unenv/polyfill/buffer",
		"unenv/polyfill/timers"
	]
};
async function resolveUnenv(options) {
	options.unenv ??= [];
	if (!Array.isArray(options.unenv)) options.unenv = [options.unenv];
	options.unenv = options.unenv.filter(Boolean);
	if (!options.node) options.unenv.unshift(nodeless);
	options.unenv.unshift(common);
}

//#endregion
//#region src/config/resolvers/builder.ts
const VALID_BUILDERS = [
	"rollup",
	"rolldown",
	"vite",
	"rolldown-vite"
];
async function resolveBuilder(options) {
	options.builder ??= process.env.NITRO_BUILDER;
	if (options.builder) {
		if (!VALID_BUILDERS.includes(options.builder)) throw new Error(`Invalid nitro builder "${options.builder}". Valid builders are: ${VALID_BUILDERS.join(", ")}.`);
		const pkg = options.builder === "rolldown-vite" ? "vite" : options.builder;
		if (!isPkgInstalled(pkg, options.rootDir)) {
			if (!await consola$1.prompt(`Nitro builder package \`${pkg}\` is not installed. Would you like to install it?`, {
				type: "confirm",
				default: true,
				cancel: "null"
			})) throw new Error(`Nitro builder package "${options.builder}" is not installed. Please install it in your project dependencies.`);
			await installPkg(pkg, options.rootDir);
		}
		return;
	}
	for (const pkg of [
		"rolldown",
		"rollup",
		"vite"
	]) if (isPkgInstalled(pkg, options.rootDir)) {
		options.builder = pkg;
		return;
	}
	const pkgToInstall = await consola$1.prompt(`No nitro builder specified. Which builder would you like to install?`, {
		type: "select",
		cancel: "null",
		options: VALID_BUILDERS.map((b) => ({
			label: b,
			value: b
		}))
	});
	if (!pkgToInstall) throw new Error(`No nitro builder specified. Please install one of the following packages: ${VALID_BUILDERS.join(", ")} and set it as the builder in your nitro config or via the NITRO_BUILDER environment variable.`);
	await installPkg(pkgToInstall, options.rootDir);
	options.builder = pkgToInstall;
}
const require = createRequire(process.cwd() + "/_index.js");
function isPkgInstalled(pkg, root) {
	try {
		require.resolve(pkg, { paths: [root] });
		return true;
	} catch {
		return false;
	}
}
async function installPkg(pkg, root) {
	const { addDevDependency } = await import("../cli/_chunks/dist4.mjs");
	return addDevDependency(pkg === "rolldown-vite" ? "vite@npm:rolldown-vite" : pkg, { cwd: root });
}

//#endregion
//#region src/config/loader.ts
const configResolvers = [
	resolveCompatibilityOptions,
	resolveTsconfig,
	resolvePathOptions,
	resolveImportsOptions,
	resolveRouteRulesOptions,
	resolveDatabaseOptions,
	resolveExportConditionsOptions,
	resolveRuntimeConfigOptions,
	resolveOpenAPIOptions,
	resolveURLOptions,
	resolveAssetsOptions,
	resolveStorageOptions,
	resolveErrorOptions,
	resolveUnenv,
	resolveBuilder
];
async function loadOptions(configOverrides = {}, opts = {}) {
	const options = await _loadUserConfig(configOverrides, opts);
	for (const resolver of configResolvers) await resolver(options);
	return options;
}
async function _loadUserConfig(configOverrides = {}, opts = {}) {
	configOverrides = klona(configOverrides);
	globalThis.defineNitroConfig = globalThis.defineNitroConfig || ((c) => c);
	let compatibilityDate = configOverrides.compatibilityDate || opts.compatibilityDate || process.env.NITRO_COMPATIBILITY_DATE || process.env.SERVER_COMPATIBILITY_DATE || process.env.COMPATIBILITY_DATE;
	const { resolvePreset } = await import("../_presets.mjs");
	let preset = configOverrides.preset || process.env.NITRO_PRESET || process.env.SERVER_PRESET;
	const _dotenv = opts.dotenv ?? (configOverrides.dev && { fileName: [".env", ".env.local"] });
	const loadedConfig = await (opts.watch ? watchConfig : loadConfig)({
		name: "nitro",
		cwd: configOverrides.rootDir,
		dotenv: _dotenv,
		extend: { extendKey: ["extends", "preset"] },
		defaults: NitroDefaults,
		jitiOptions: { alias: {
			nitropack: "nitro/config",
			"nitro/config": "nitro/config"
		} },
		async overrides({ rawConfigs }) {
			const getConf = (key) => configOverrides[key] ?? rawConfigs.main?.[key] ?? rawConfigs.rc?.[key] ?? rawConfigs.packageJson?.[key];
			if (!compatibilityDate) compatibilityDate = getConf("compatibilityDate");
			const framework = getConf("framework");
			const isCustomFramework = framework?.name && framework.name !== "nitro";
			if (!preset) preset = getConf("preset");
			if (configOverrides.dev) preset = preset && preset !== "nitro-dev" ? await resolvePreset(preset, {
				static: getConf("static"),
				dev: true,
				compatibilityDate: compatibilityDate || "latest"
			}).then((p) => p?._meta?.name || "nitro-dev").catch(() => "nitro-dev") : "nitro-dev";
			else if (!preset) preset = await resolvePreset("", {
				static: getConf("static"),
				dev: false,
				compatibilityDate: compatibilityDate || "latest"
			}).then((p) => p?._meta?.name);
			return {
				...configOverrides,
				preset,
				typescript: {
					generateRuntimeConfigTypes: !isCustomFramework,
					...getConf("typescript"),
					...configOverrides.typescript
				}
			};
		},
		async resolve(id) {
			const preset$1 = await resolvePreset(id, {
				static: configOverrides.static,
				compatibilityDate: compatibilityDate || "latest",
				dev: configOverrides.dev
			});
			if (preset$1) return { config: klona(preset$1) };
		},
		...opts.c12
	});
	const options = klona(loadedConfig.config);
	options._config = configOverrides;
	options._c12 = loadedConfig;
	options.preset = (loadedConfig.layers || []).find((l) => l.config?._meta?.name)?.config?._meta?.name || preset;
	options.compatibilityDate = resolveCompatibilityDates(compatibilityDate, options.compatibilityDate);
	if (options.dev && options.preset !== "nitro-dev") consola$1.info(`Using \`${options.preset}\` emulation in development mode.`);
	return options;
}

//#endregion
//#region src/config/update.ts
async function updateNitroConfig(nitro, config) {
	nitro.options.routeRules = normalizeRouteRules(config.routeRules ? config : nitro.options);
	nitro.options.runtimeConfig = normalizeRuntimeConfig(config.runtimeConfig ? config : nitro.options);
	await nitro.hooks.callHook("rollup:reload");
	consola$1.success("Nitro config hot reloaded!");
}

//#endregion
//#region src/module.ts
async function installModules(nitro) {
	const _modules = [...nitro.options.modules || []];
	const modules = await Promise.all(_modules.map((mod) => _resolveNitroModule(mod, nitro.options)));
	const _installedURLs = /* @__PURE__ */ new Set();
	for (const mod of modules) {
		if (mod._url) {
			if (_installedURLs.has(mod._url)) continue;
			_installedURLs.add(mod._url);
		}
		await mod.setup(nitro);
	}
}
async function _resolveNitroModule(mod, nitroOptions) {
	let _url;
	if (typeof mod === "string") mod = await import(resolveModuleURL(mod, {
		from: [nitroOptions.rootDir],
		extensions: [
			".mjs",
			".cjs",
			".js",
			".mts",
			".cts",
			".ts"
		]
	})).then((m) => m.default || m);
	if (typeof mod === "function") mod = { setup: mod };
	if ("nitro" in mod) mod = mod.nitro;
	if (!mod.setup) throw new Error("Invalid Nitro module: missing setup() function.");
	return {
		_url,
		...mod
	};
}

//#endregion
//#region src/task.ts
/** @experimental */
async function runTask(taskEvent, opts) {
	return await (await _getTasksContext(opts)).devFetch(`/_nitro/tasks/${taskEvent.name}`, {
		method: "POST",
		body: taskEvent
	});
}
/** @experimental */
async function listTasks(opts) {
	return (await (await _getTasksContext(opts)).devFetch("/_nitro/tasks")).tasks;
}
function addNitroTasksVirtualFile(nitro) {
	nitro.options.virtual["#nitro-internal-virtual/tasks"] = () => {
		const _scheduledTasks = Object.entries(nitro.options.scheduledTasks || {}).map(([cron, _tasks]) => {
			return {
				cron,
				tasks: (Array.isArray(_tasks) ? _tasks : [_tasks]).filter((name) => {
					if (!nitro.options.tasks[name]) {
						nitro.logger.warn(`Scheduled task \`${name}\` is not defined!`);
						return false;
					}
					return true;
				})
			};
		}).filter((e) => e.tasks.length > 0);
		const scheduledTasks = _scheduledTasks.length > 0 ? _scheduledTasks : false;
		return `
export const scheduledTasks = ${JSON.stringify(scheduledTasks)};

export const tasks = {
  ${Object.entries(nitro.options.tasks).map(([name, task]) => `"${name}": {
          meta: {
            description: ${JSON.stringify(task.description)},
          },
          resolve: ${task.handler ? `() => import("${normalize(task.handler)}").then(r => r.default || r)` : "undefined"},
        }`).join(",\n")}
};`;
	};
}
const _devHint = `(is dev server running?)`;
async function _getTasksContext(opts) {
	const buildInfoPath = resolve(resolve(resolve(process.cwd(), opts?.cwd || "."), opts?.buildDir || "node_modules/.nitro"), "nitro.dev.json");
	if (!existsSync(buildInfoPath)) throw new Error(`Missing info file: \`${buildInfoPath}\` ${_devHint}`);
	const buildInfo = JSON.parse(await readFile(buildInfoPath, "utf8"));
	if (!buildInfo.dev?.pid || !buildInfo.dev?.workerAddress) throw new Error(`Missing dev server info in: \`${buildInfoPath}\` ${_devHint}`);
	if (!_pidIsRunning(buildInfo.dev.pid)) throw new Error(`Dev server is not running (pid: ${buildInfo.dev.pid})`);
	return {
		buildInfo,
		devFetch: ofetch.create({
			baseURL: `http://${buildInfo.dev.workerAddress.host || "localhost"}:${buildInfo.dev.workerAddress.port || "3000"}`,
			socketPath: buildInfo.dev.workerAddress.socketPath
		})
	};
}
function _pidIsRunning(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

//#endregion
//#region src/routing.ts
const isGlobalMiddleware = (h) => !h.method && (!h.route || h.route === "/**");
function initNitroRouting(nitro) {
	const envConditions = new Set([
		nitro.options.dev ? "dev" : "prod",
		nitro.options.preset,
		nitro.options.preset === "nitro-prerender" ? "prerender" : void 0
	].filter(Boolean));
	const matchesEnv = (h) => {
		const envs = (Array.isArray(h.env) ? h.env : [h.env]).filter(Boolean);
		return envs.length === 0 || envs.some((env) => envConditions.has(env));
	};
	const routes = new Router(nitro.options.baseURL);
	const routeRules = new Router(nitro.options.baseURL);
	const globalMiddleware = [];
	const routedMiddleware = new Router(nitro.options.baseURL);
	const sync = () => {
		routeRules._update(Object.entries(nitro.options.routeRules).map(([route, data]) => ({
			route,
			method: "",
			data: {
				...data,
				_route: route
			}
		})));
		const _routes = [
			...Object.entries(nitro.options.routes).flatMap(([route, handler]) => {
				if (typeof handler === "string") handler = { handler };
				return {
					...handler,
					route,
					middleware: false
				};
			}),
			...nitro.options.handlers,
			...nitro.scannedHandlers
		].filter((h) => h && !h.middleware && matchesEnv(h));
		if (nitro.options.renderer?.handler) _routes.push({
			route: "/**",
			lazy: true,
			handler: nitro.options.renderer?.handler
		});
		routes._update(_routes.map((h) => ({
			...h,
			method: h.method || "",
			data: handlerWithImportHash(h)
		})), { merge: true });
		const _middleware = [...nitro.scannedHandlers, ...nitro.options.handlers].filter((h) => h && h.middleware && matchesEnv(h));
		if (nitro.options.serveStatic) _middleware.unshift({
			route: "/**",
			middleware: true,
			handler: join(runtimeDir, "internal/static")
		});
		globalMiddleware.splice(0, globalMiddleware.length, ..._middleware.filter((h) => isGlobalMiddleware(h)).map((m) => handlerWithImportHash(m)));
		routedMiddleware._update(_middleware.filter((h) => !isGlobalMiddleware(h)).map((h) => ({
			...h,
			method: h.method || "",
			data: handlerWithImportHash(h)
		})));
	};
	nitro.routing = Object.freeze({
		sync,
		routes,
		routeRules,
		globalMiddleware,
		routedMiddleware
	});
}
function handlerWithImportHash(h) {
	const id = (h.lazy ? "_lazy_" : "_") + hash(h.handler).replace(/-/g, "").slice(0, 6);
	return {
		...h,
		_importHash: id
	};
}
var Router = class {
	_routes;
	_router;
	_compiled;
	_baseURL;
	constructor(baseURL) {
		this._update([]);
		this._baseURL = baseURL || "";
		if (this._baseURL.endsWith("/")) this._baseURL = this._baseURL.slice(0, -1);
	}
	get routes() {
		return this._routes;
	}
	_update(routes, opts) {
		this._routes = routes;
		this._router = createRouter();
		this._compiled = void 0;
		for (const route of routes) addRoute(this._router, route.method, this._baseURL + route.route, route.data);
		if (opts?.merge) mergeCatchAll(this._router);
	}
	hasRoutes() {
		return this._routes.length > 0;
	}
	compileToString(opts) {
		if (this._compiled) return this._compiled;
		this._compiled = compileRouterToString(this._router, void 0, opts);
		if (this.routes.length === 1 && this.routes[0].route === "/**" && this.routes[0].method === "") this._compiled = `/* @__PURE__ */ (() => {const data=${(opts?.serialize || JSON.stringify)(this.routes[0].data)};return ((_m, p)=>{return {data,params:{"_":p.slice(1)}};})})()`;
		return this._compiled;
	}
	match(method, path) {
		return findRoute(this._router, method, path)?.data;
	}
	matchAll(method, path) {
		return findAllRoutes(this._router, method, path).map((route) => route.data);
	}
};
function mergeCatchAll(router) {
	const handlers = router.root?.wildcard?.methods?.[""];
	if (!handlers || handlers.length < 2) return;
	handlers.splice(0, handlers.length, {
		...handlers[0],
		data: handlers.map((h) => h.data)
	});
}

//#endregion
//#region src/global.ts
const nitroInstances = globalThis.__nitro_instances__ ||= [];
const globalKey = "__nitro_builder__";
function registerNitroInstance(nitro) {
	if (nitroInstances.includes(nitro)) return;
	globalInit();
	nitroInstances.unshift(nitro);
	nitro.hooks.hookOnce("close", () => {
		nitroInstances.splice(nitroInstances.indexOf(nitro), 1);
		if (nitroInstances.length === 0) delete globalThis[globalKey];
	});
}
function globalInit() {
	if (globalThis[globalKey]) return;
	globalThis[globalKey] = { async fetch(req) {
		for (let r = 0; r < 10 && nitroInstances.length === 0; r++) await new Promise((resolve$1) => setTimeout(resolve$1, 300));
		const nitro = nitroInstances[0];
		if (!nitro) throw new Error("No Nitro instance is running.");
		return nitro.fetch(req);
	} };
}

//#endregion
//#region src/nitro.ts
async function createNitro(config = {}, opts = {}) {
	const nitro = {
		options: await loadOptions(config, opts),
		hooks: new Hookable(),
		vfs: {},
		routing: {},
		logger: consola.withTag("nitro"),
		scannedHandlers: [],
		fetch: () => {
			throw new Error("no dev server attached!");
		},
		close: () => Promise.resolve(nitro.hooks.callHook("close")),
		async updateConfig(config$1) {
			updateNitroConfig(nitro, config$1);
		}
	};
	registerNitroInstance(nitro);
	initNitroRouting(nitro);
	await scanAndSyncOptions(nitro);
	if (nitro.options.debug) createDebugger(nitro.hooks, { tag: "nitro" });
	if (nitro.options.logLevel !== void 0) nitro.logger.level = nitro.options.logLevel;
	nitro.hooks.addHooks(nitro.options.hooks);
	addNitroTasksVirtualFile(nitro);
	await installModules(nitro);
	if (nitro.options.imports) {
		nitro.unimport = createUnimport(nitro.options.imports);
		await nitro.unimport.init();
		nitro.options.virtual["#imports"] = () => nitro.unimport?.toExports() || "";
		nitro.options.virtual["#nitro"] = "export * from \"#imports\"";
	}
	await scanHandlers(nitro);
	nitro.routing.sync();
	return nitro;
}

//#endregion
//#region src/build/build.ts
async function build(nitro) {
	switch (nitro.options.builder) {
		case "rollup": {
			const { rollupBuild } = await import("../_build/rollup.mjs");
			return rollupBuild(nitro);
		}
		case "rolldown": {
			const { rolldownBuild } = await import("../_build/rolldown.mjs");
			return rolldownBuild(nitro);
		}
		case "vite":
		case "rolldown-vite": {
			const { viteBuild } = await import("../_build/vite.build.mjs");
			return viteBuild(nitro);
		}
		default: throw new Error(`Unknown builder: ${nitro.options.builder}`);
	}
}

//#endregion
//#region src/utils/compress.ts
async function compressPublicAssets(nitro) {
	const publicFiles = await glob("**", {
		cwd: nitro.options.output.publicDir,
		absolute: false,
		dot: true,
		ignore: ["**/*.gz", "**/*.br"]
	});
	await Promise.all(publicFiles.map(async (fileName) => {
		const filePath = resolve(nitro.options.output.publicDir, fileName);
		if (existsSync(filePath + ".gz") || existsSync(filePath + ".br")) return;
		const mimeType = src_default.getType(fileName) || "text/plain";
		const fileContents = await fsp.readFile(filePath);
		if (fileContents.length < 1024 || fileName.endsWith(".map") || !isCompressibleMime(mimeType)) return;
		const { gzip, brotli } = nitro.options.compressPublicAssets || {};
		const encodings = [gzip !== false && "gzip", brotli !== false && "br"].filter(Boolean);
		await Promise.all(encodings.map(async (encoding) => {
			const compressedPath = filePath + ("." + (encoding === "gzip" ? "gz" : "br"));
			if (existsSync(compressedPath)) return;
			const gzipOptions = { level: zlib.constants.Z_BEST_COMPRESSION };
			const brotliOptions = {
				[zlib.constants.BROTLI_PARAM_MODE]: isTextMime(mimeType) ? zlib.constants.BROTLI_MODE_TEXT : zlib.constants.BROTLI_MODE_GENERIC,
				[zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
				[zlib.constants.BROTLI_PARAM_SIZE_HINT]: fileContents.length
			};
			const compressedBuff = await new Promise((resolve$1, reject) => {
				const cb = (error, result) => error ? reject(error) : resolve$1(result);
				if (encoding === "gzip") zlib.gzip(fileContents, gzipOptions, cb);
				else zlib.brotliCompress(fileContents, brotliOptions, cb);
			});
			await fsp.writeFile(compressedPath, compressedBuff);
		}));
	}));
}
function isTextMime(mimeType) {
	return /text|javascript|json|xml/.test(mimeType);
}
const COMPRESSIBLE_MIMES_RE = new Set([
	"application/dash+xml",
	"application/eot",
	"application/font",
	"application/font-sfnt",
	"application/javascript",
	"application/json",
	"application/opentype",
	"application/otf",
	"application/pdf",
	"application/pkcs7-mime",
	"application/protobuf",
	"application/rss+xml",
	"application/truetype",
	"application/ttf",
	"application/vnd.apple.mpegurl",
	"application/vnd.mapbox-vector-tile",
	"application/vnd.ms-fontobject",
	"application/wasm",
	"application/xhtml+xml",
	"application/xml",
	"application/x-font-opentype",
	"application/x-font-truetype",
	"application/x-font-ttf",
	"application/x-httpd-cgi",
	"application/x-javascript",
	"application/x-mpegurl",
	"application/x-opentype",
	"application/x-otf",
	"application/x-perl",
	"application/x-ttf",
	"font/eot",
	"font/opentype",
	"font/otf",
	"font/ttf",
	"image/svg+xml",
	"text/css",
	"text/csv",
	"text/html",
	"text/javascript",
	"text/js",
	"text/plain",
	"text/richtext",
	"text/tab-separated-values",
	"text/xml",
	"text/x-component",
	"text/x-java-source",
	"text/x-script",
	"vnd.apple.mpegurl"
]);
function isCompressibleMime(mimeType) {
	return COMPRESSIBLE_MIMES_RE.has(mimeType);
}

//#endregion
//#region src/build/assets.ts
const NEGATION_RE = /^(!?)(.*)$/;
const PARENT_DIR_GLOB_RE = /!?\.\.\//;
async function scanUnprefixedPublicAssets(nitro) {
	const scannedPaths = [];
	for (const asset of nitro.options.publicAssets) {
		if (asset.baseURL && asset.baseURL !== "/" && !asset.fallthrough) continue;
		if (!await isDirectory(asset.dir)) continue;
		const publicAssets = await glob(getIncludePatterns(nitro, asset.dir), {
			cwd: asset.dir,
			absolute: false,
			dot: true
		});
		scannedPaths.push(...publicAssets.map((file) => join(asset.baseURL || "/", file)));
	}
	return scannedPaths;
}
async function copyPublicAssets(nitro) {
	if (nitro.options.noPublicDir) return;
	for (const asset of nitro.options.publicAssets) {
		const assetDir = asset.dir;
		const dstDir = join(nitro.options.output.publicDir, asset.baseURL);
		if (await isDirectory(assetDir)) {
			const publicAssets = await glob(getIncludePatterns(nitro, assetDir), {
				cwd: assetDir,
				absolute: false,
				dot: true
			});
			await Promise.all(publicAssets.map(async (file) => {
				const src = join(assetDir, file);
				const dst = join(dstDir, file);
				if (!existsSync(dst)) await promises.cp(src, dst);
			}));
		}
	}
	if (nitro.options.compressPublicAssets) await compressPublicAssets(nitro);
	nitro.logger.success("Generated public " + prettyPath(nitro.options.output.publicDir));
}
function getIncludePatterns(nitro, assetDir) {
	return ["**", ...nitro.options.ignore.map((p) => {
		const [_, negation, pattern] = p.match(NEGATION_RE) || [];
		return (negation ? "" : "!") + (pattern.startsWith("*") ? pattern : relative(assetDir, resolve(nitro.options.rootDir, pattern)));
	})].filter((p) => !PARENT_DIR_GLOB_RE.test(p));
}

//#endregion
//#region src/build/prepare.ts
async function prepare(nitro) {
	await prepareDir(nitro.options.output.dir);
	if (!nitro.options.noPublicDir) await prepareDir(nitro.options.output.publicDir);
	if (!nitro.options.static) await prepareDir(nitro.options.output.serverDir);
}
async function prepareDir(dir) {
	await fsp.rm(dir, {
		recursive: true,
		force: true
	});
	await fsp.mkdir(dir, { recursive: true });
}

//#endregion
//#region src/prerender/utils.ts
const allowedExtensions = new Set(["", ".json"]);
const linkParents = /* @__PURE__ */ new Map();
const HTML_ENTITIES = {
	"&lt;": "<",
	"&gt;": ">",
	"&amp;": "&",
	"&apos;": "'",
	"&quot;": "\""
};
function escapeHtml(text) {
	return text.replace(/&(lt|gt|amp|apos|quot);/g, (ch) => HTML_ENTITIES[ch] || ch);
}
async function extractLinks(html, from, res, crawlLinks) {
	const links = [];
	const _links = [];
	if (crawlLinks) await z(P(html), (node) => {
		if (!node.attributes?.href) return;
		const link = escapeHtml(node.attributes.href);
		if (!decodeURIComponent(link).startsWith("#") && allowedExtensions.has(getExtension(link))) _links.push(link);
	});
	const header = res.headers.get("x-nitro-prerender") || "";
	_links.push(...header.split(",").map((i) => decodeURIComponent(i.trim())));
	for (const link of _links.filter(Boolean)) {
		const _link = parseURL(link);
		if (_link.protocol || _link.host) continue;
		if (!_link.pathname.startsWith("/")) {
			const fromURL = new URL(from, "http://localhost");
			_link.pathname = new URL(_link.pathname, fromURL).pathname;
		}
		links.push(_link.pathname + _link.search);
	}
	for (const link of links) {
		const _parents = linkParents.get(link);
		if (_parents) _parents.add(from);
		else linkParents.set(link, new Set([from]));
	}
	return links;
}
const EXT_REGEX = /\.[\da-z]+$/;
function getExtension(link) {
	return (parseURL(link).pathname.match(EXT_REGEX) || [])[0] || "";
}
function formatPrerenderRoute(route) {
	let str = `  ├─ ${route.route} (${route.generateTimeMS}ms)`;
	if (route.error) {
		const parents = linkParents.get(route.route);
		const errorColor = colors[route.error.status === 404 ? "yellow" : "red"];
		const errorLead = parents?.size ? "├──" : "└──";
		str += `\n  │ ${errorLead} ${errorColor(route.error.message)}`;
		if (parents?.size) str += `\n${[...parents.values()].map((link) => `  │ └── Linked from ${link}`).join("\n")}`;
	}
	if (route.skip) str += colors.gray(" (skipped)");
	return colors.gray(str);
}
function matchesIgnorePattern(path, pattern) {
	if (typeof pattern === "string") return path.startsWith(pattern);
	if (typeof pattern === "function") return pattern(path) === true;
	if (pattern instanceof RegExp) return pattern.test(path);
	return false;
}

//#endregion
//#region src/prerender/prerender.ts
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
async function prerender(nitro) {
	if (nitro.options.noPublicDir) {
		nitro.logger.warn("Skipping prerender since `noPublicDir` option is enabled.");
		return;
	}
	if (nitro.options.builder === "vite") {
		nitro.logger.warn("Skipping prerender since not supported with vite builder yet...");
		return;
	}
	const routes = new Set(nitro.options.prerender.routes);
	const prerenderRulePaths = Object.entries(nitro.options.routeRules).filter(([path$1, options]) => options.prerender && !path$1.includes("*")).map((e) => e[0]);
	for (const route of prerenderRulePaths) routes.add(route);
	await nitro.hooks.callHook("prerender:routes", routes);
	if (routes.size === 0) if (nitro.options.prerender.crawlLinks) routes.add("/");
	else return;
	nitro.logger.info("Initializing prerenderer");
	nitro._prerenderedRoutes = [];
	nitro._prerenderMeta = nitro._prerenderMeta || {};
	const prerendererConfig = {
		...nitro.options._config,
		static: false,
		rootDir: nitro.options.rootDir,
		logLevel: 0,
		preset: "nitro-prerender"
	};
	await nitro.hooks.callHook("prerender:config", prerendererConfig);
	const nitroRenderer = await createNitro(prerendererConfig);
	const prerenderStartTime = Date.now();
	await nitro.hooks.callHook("prerender:init", nitroRenderer);
	let path = relative(nitro.options.output.dir, nitro.options.output.publicDir);
	if (!path.startsWith(".")) path = `./${path}`;
	nitroRenderer.options.commands.preview = `npx serve ${path}`;
	nitroRenderer.options.output.dir = nitro.options.output.dir;
	await build(nitroRenderer);
	const serverFilename = typeof nitroRenderer.options.rollupConfig?.output?.entryFileNames === "string" ? nitroRenderer.options.rollupConfig.output.entryFileNames : "index.mjs";
	const prerenderer = await import(pathToFileURL(resolve(nitroRenderer.options.output.serverDir, serverFilename)).href).then((m) => m.default);
	const routeRules = createRouter();
	for (const [route, rules] of Object.entries(nitro.options.routeRules)) addRoute(routeRules, void 0, route, rules);
	const _getRouteRules = (path$1) => defu({}, ...findAllRoutes(routeRules, void 0, path$1).map((r) => r.data).reverse());
	const generatedRoutes = /* @__PURE__ */ new Set();
	const failedRoutes = /* @__PURE__ */ new Set();
	const skippedRoutes = /* @__PURE__ */ new Set();
	const displayedLengthWarns = /* @__PURE__ */ new Set();
	const publicAssetBases = nitro.options.publicAssets.filter((a$1) => !!a$1.baseURL && a$1.baseURL !== "/" && !a$1.fallthrough).map((a$1) => withTrailingSlash(a$1.baseURL));
	const scannedPublicAssets = nitro.options.prerender.ignoreUnprefixedPublicAssets ? new Set(await scanUnprefixedPublicAssets(nitro)) : /* @__PURE__ */ new Set();
	const canPrerender = (route = "/") => {
		if (generatedRoutes.has(route) || skippedRoutes.has(route)) return false;
		for (const pattern of nitro.options.prerender.ignore) if (matchesIgnorePattern(route, pattern)) return false;
		if (publicAssetBases.some((base) => route.startsWith(base))) return false;
		if (scannedPublicAssets.has(route)) return false;
		if (_getRouteRules(route).prerender === false) return false;
		return true;
	};
	const canWriteToDisk = (route) => {
		if (route.route.includes("?")) return false;
		const FS_MAX_SEGMENT = 255;
		const FS_MAX_PATH_PUBLIC_HTML = 1024 - (nitro.options.output.publicDir.length + 10);
		if ((route.route.length >= FS_MAX_PATH_PUBLIC_HTML || route.route.split("/").some((s) => s.length > FS_MAX_SEGMENT)) && !displayedLengthWarns.has(route)) {
			displayedLengthWarns.add(route);
			const _route = route.route.slice(0, 60) + "...";
			if (route.route.length >= FS_MAX_PATH_PUBLIC_HTML) nitro.logger.warn(`Prerendering long route "${_route}" (${route.route.length}) can cause filesystem issues since it exceeds ${FS_MAX_PATH_PUBLIC_HTML}-character limit when writing to \`${nitro.options.output.publicDir}\`.`);
			else {
				nitro.logger.warn(`Skipping prerender of the route "${_route}" since it exceeds the ${FS_MAX_SEGMENT}-character limit in one of the path segments and can cause filesystem issues.`);
				return false;
			}
		}
		return true;
	};
	const generateRoute = async (route) => {
		const start = Date.now();
		route = decodeURI(route);
		if (!canPrerender(route)) {
			skippedRoutes.add(route);
			return;
		}
		generatedRoutes.add(route);
		const _route = { route };
		const encodedRoute = encodeURI(route);
		const req = toRequest(withBase(encodedRoute, nitro.options.baseURL), { headers: [["x-nitro-prerender", encodedRoute]] });
		const res = await prerenderer.fetch(req);
		let dataBuff = Buffer.from(await res.arrayBuffer());
		Object.defineProperty(_route, "contents", {
			get: () => {
				return dataBuff ? dataBuff.toString("utf8") : void 0;
			},
			set(value) {
				if (dataBuff) dataBuff = Buffer.from(value);
			}
		});
		Object.defineProperty(_route, "data", {
			get: () => {
				return dataBuff ? dataBuff.buffer : void 0;
			},
			set(value) {
				if (dataBuff) dataBuff = Buffer.from(value);
			}
		});
		if (![200, ...[
			301,
			302,
			303,
			304,
			307,
			308
		]].includes(res.status)) {
			_route.error = /* @__PURE__ */ new Error(`[${res.status}] ${res.statusText}`);
			_route.error.status = res.status;
			_route.error.statusText = res.statusText;
		}
		_route.generateTimeMS = Date.now() - start;
		const contentType = res.headers.get("content-type") || "";
		const isImplicitHTML = !route.endsWith(".html") && contentType.includes("html") && !JsonSigRx.test(dataBuff.subarray(0, 32).toString("utf8"));
		const routeWithIndex = route.endsWith("/") ? route + "index" : route;
		const htmlPath = route.endsWith("/") || nitro.options.prerender.autoSubfolderIndex ? joinURL(route, "index.html") : route + ".html";
		_route.fileName = withoutBase(isImplicitHTML ? htmlPath : routeWithIndex, nitro.options.baseURL);
		const inferredContentType = src_default.getType(_route.fileName) || "text/plain";
		_route.contentType = contentType || inferredContentType;
		await nitro.hooks.callHook("prerender:generate", _route, nitro);
		if (_route.contentType !== inferredContentType) {
			nitro._prerenderMeta[_route.fileName] ||= {};
			nitro._prerenderMeta[_route.fileName].contentType = _route.contentType;
		}
		if (_route.error) failedRoutes.add(_route);
		if (_route.skip || _route.error) {
			await nitro.hooks.callHook("prerender:route", _route);
			nitro.logger.log(formatPrerenderRoute(_route));
			dataBuff = void 0;
			return _route;
		}
		if (canWriteToDisk(_route)) {
			await writeFile$1(join(nitro.options.output.publicDir, _route.fileName), dataBuff);
			nitro._prerenderedRoutes.push(_route);
		} else _route.skip = true;
		if (!_route.error && (isImplicitHTML || route.endsWith(".html"))) {
			const extractedLinks = await extractLinks(dataBuff.toString("utf8"), route, res, nitro.options.prerender.crawlLinks);
			for (const _link of extractedLinks) if (canPrerender(_link)) routes.add(_link);
		}
		await nitro.hooks.callHook("prerender:route", _route);
		nitro.logger.log(formatPrerenderRoute(_route));
		dataBuff = void 0;
		return _route;
	};
	nitro.logger.info(nitro.options.prerender.crawlLinks ? `Prerendering ${routes.size} initial routes with crawler` : `Prerendering ${routes.size} routes`);
	await runParallel(routes, generateRoute, {
		concurrency: nitro.options.prerender.concurrency,
		interval: nitro.options.prerender.interval
	});
	await prerenderer.close();
	await nitro.hooks.callHook("prerender:done", {
		prerenderedRoutes: nitro._prerenderedRoutes,
		failedRoutes: [...failedRoutes]
	});
	if (nitro.options.prerender.failOnError && failedRoutes.size > 0) {
		nitro.logger.log("\nErrors prerendering:");
		for (const route of failedRoutes) nitro.logger.log(formatPrerenderRoute(route));
		nitro.logger.log("");
		throw new Error("Exiting due to prerender errors.");
	}
	const prerenderTimeInMs = Date.now() - prerenderStartTime;
	nitro.logger.info(`Prerendered ${nitro._prerenderedRoutes.length} routes in ${prerenderTimeInMs / 1e3} seconds`);
	if (nitro.options.compressPublicAssets) await compressPublicAssets(nitro);
}

//#endregion
export { createNitro as a, loadOptions as c, build as i, prepare as n, listTasks as o, copyPublicAssets as r, runTask as s, prerender as t };