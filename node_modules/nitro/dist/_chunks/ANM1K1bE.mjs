import { i as __toESM } from "./Bqks5huO.mjs";
import { C as isAbsolute, O as relative, h as resolveModulePath, k as resolve, w as join, x as dirname } from "../_libs/c12.mjs";
import { c as parseNodeModulePath, s as lookupNodeModuleSubpath } from "../_libs/local-pkg.mjs";
import { o as toExports } from "../_libs/unimport.mjs";
import { t as glob } from "../_libs/tinyglobby.mjs";
import { i as writeFile, r as resolveNitroPath, t as isDirectory } from "./C7CbzoI1.mjs";
import { t as resolveAlias } from "../_libs/pathe.mjs";
import { n as resolveSchema, t as generateTypes } from "../_libs/untyped.mjs";
import { existsSync, promises } from "node:fs";
import { withBase, withLeadingSlash, withoutTrailingSlash } from "ufo";
import { defu } from "defu";
import { runtimeDir } from "nitro/meta";

//#region src/scan.ts
const GLOB_SCAN_PATTERN = "**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}";
const suffixRegex = /(\.(?<method>connect|delete|get|head|options|patch|post|put|trace))?(\.(?<env>dev|prod|prerender))?$/;
async function scanAndSyncOptions(nitro) {
	const scannedPlugins = await scanPlugins(nitro);
	for (const plugin of scannedPlugins) if (!nitro.options.plugins.includes(plugin)) nitro.options.plugins.push(plugin);
	if (nitro.options.experimental.tasks) {
		const scannedTasks = await scanTasks(nitro);
		for (const scannedTask of scannedTasks) if (scannedTask.name in nitro.options.tasks) {
			if (!nitro.options.tasks[scannedTask.name].handler) nitro.options.tasks[scannedTask.name].handler = scannedTask.handler;
		} else nitro.options.tasks[scannedTask.name] = {
			handler: scannedTask.handler,
			description: ""
		};
	}
	const scannedModules = await scanModules(nitro);
	nitro.options.modules = nitro.options.modules || [];
	for (const modPath of scannedModules) if (!nitro.options.modules.includes(modPath)) nitro.options.modules.push(modPath);
}
async function scanHandlers(nitro) {
	const middleware = await scanMiddleware(nitro);
	const handlers = await Promise.all([scanServerRoutes(nitro, nitro.options.apiDir || "api", nitro.options.apiBaseURL || "/api"), scanServerRoutes(nitro, nitro.options.routesDir || "routes")]).then((r) => r.flat());
	nitro.scannedHandlers = [...middleware, ...handlers.filter((h, index, array) => {
		return array.findIndex((h2) => h.route === h2.route && h.method === h2.method && h.env === h2.env) === index;
	})];
	return handlers;
}
async function scanMiddleware(nitro) {
	return (await scanFiles(nitro, "middleware")).map((file) => {
		return {
			route: "/**",
			middleware: true,
			handler: file.fullPath
		};
	});
}
async function scanServerRoutes(nitro, dir, prefix = "/") {
	return (await scanFiles(nitro, dir)).map((file) => {
		let route = file.path.replace(/\.[A-Za-z]+$/, "").replace(/\(([^(/\\]+)\)[/\\]/g, "").replace(/\[\.{3}]/g, "**").replace(/\[\.{3}(\w+)]/g, "**:$1").replace(/\[([^/\]]+)]/g, ":$1");
		route = withLeadingSlash(withoutTrailingSlash(withBase(route, prefix)));
		const suffixMatch = route.match(suffixRegex);
		let method;
		let env;
		if (suffixMatch?.index && suffixMatch?.index >= 0) {
			route = route.slice(0, suffixMatch.index);
			method = suffixMatch.groups?.method;
			env = suffixMatch.groups?.env;
		}
		route = route.replace(/\/index$/, "") || "/";
		return {
			handler: file.fullPath,
			lazy: true,
			middleware: false,
			route,
			method,
			env
		};
	});
}
async function scanPlugins(nitro) {
	return (await scanFiles(nitro, "plugins")).map((f) => f.fullPath);
}
async function scanTasks(nitro) {
	return (await scanFiles(nitro, "tasks")).map((f) => {
		return {
			name: f.path.replace(/\/index$/, "").replace(/\.[A-Za-z]+$/, "").replace(/\//g, ":"),
			handler: f.fullPath
		};
	});
}
async function scanModules(nitro) {
	return (await scanFiles(nitro, "modules")).map((f) => f.fullPath);
}
async function scanFiles(nitro, name) {
	return await Promise.all(nitro.options.scanDirs.map((dir) => scanDir(nitro, dir, name))).then((r) => r.flat());
}
async function scanDir(nitro, dir, name) {
	return (await glob(join(name, GLOB_SCAN_PATTERN), {
		cwd: dir,
		dot: true,
		ignore: nitro.options.ignore,
		absolute: true
	}).catch((error) => {
		if (error?.code === "ENOTDIR") {
			nitro.logger.warn(`Ignoring \`${join(dir, name)}\`. It must be a directory.`);
			return [];
		}
		throw error;
	})).map((fullPath) => {
		return {
			fullPath,
			path: relative(join(dir, name), fullPath)
		};
	}).sort((a, b) => a.path.localeCompare(b.path));
}

//#endregion
//#region src/build/types.ts
async function writeTypes(nitro) {
	const types = { routes: {} };
	const generatedTypesDir = resolve(nitro.options.rootDir, nitro.options.typescript.generatedTypesDir || "node_modules/.nitro/types");
	const middleware = [...nitro.scannedHandlers, ...nitro.options.handlers];
	for (const mw of middleware) {
		if (typeof mw.handler !== "string" || !mw.route) continue;
		const relativePath = relative(generatedTypesDir, resolveNitroPath(mw.handler, nitro.options)).replace(/\.(js|mjs|cjs|ts|mts|cts|tsx|jsx)$/, "");
		const method = mw.method || "default";
		types.routes[mw.route] ??= {};
		types.routes[mw.route][method] ??= [];
		types.routes[mw.route][method].push(`Simplify<Serialize<Awaited<ReturnType<typeof import('${relativePath}').default>>>>`);
	}
	let autoImportedTypes = [];
	let autoImportExports = "";
	if (nitro.unimport) {
		await nitro.unimport.init();
		const allImports = await nitro.unimport.getImports();
		autoImportExports = toExports(allImports).replace(/#internal\/nitro/g, relative(generatedTypesDir, runtimeDir));
		const resolvedImportPathMap = /* @__PURE__ */ new Map();
		for (const i of allImports) {
			const from = i.typeFrom || i.from;
			if (resolvedImportPathMap.has(from)) continue;
			let path = resolveAlias(from, nitro.options.alias);
			if (!isAbsolute(path)) {
				const resolvedPath = resolveModulePath(from, {
					try: true,
					from: nitro.options.nodeModulesDirs,
					conditions: [
						"type",
						"node",
						"import"
					],
					suffixes: ["", "/index"],
					extensions: [
						".mjs",
						".cjs",
						".js",
						".mts",
						".cts",
						".ts"
					]
				});
				if (resolvedPath) {
					const { dir, name } = parseNodeModulePath(resolvedPath);
					if (!dir || !name) path = resolvedPath;
					else path = join(dir, name, await lookupNodeModuleSubpath(resolvedPath) || "");
				}
			}
			if (existsSync(path) && !await isDirectory(path)) path = path.replace(/\.[a-z]+$/, "");
			if (isAbsolute(path)) path = relative(generatedTypesDir, path);
			resolvedImportPathMap.set(from, path);
		}
		autoImportedTypes = [nitro.options.imports && nitro.options.imports.autoImport !== false ? (await nitro.unimport.generateTypeDeclarations({
			exportHelper: false,
			resolvePath: (i) => {
				const from = i.typeFrom || i.from;
				return resolvedImportPathMap.get(from) ?? from;
			}
		})).trim() : ""];
	}
	const generateRoutes = () => [
		"// Generated by nitro",
		"import type { Serialize, Simplify } from \"nitro/types\";",
		"declare module \"nitro/types\" {",
		"  type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T",
		"  interface InternalApi {",
		...Object.entries(types.routes).map(([path, methods]) => [
			`    '${path}': {`,
			...Object.entries(methods).map(([method, types$1]) => `      '${method}': ${types$1.join(" | ")}`),
			"    }"
		].join("\n")),
		"  }",
		"}",
		"export {}"
	];
	const config = [
		"// Generated by nitro",
		`declare module "nitro/types" {`,
		nitro.options.typescript.generateRuntimeConfigTypes ? generateTypes(await resolveSchema(Object.fromEntries(Object.entries(nitro.options.runtimeConfig).filter(([key]) => !["app", "nitro"].includes(key)))), {
			interfaceName: "NitroRuntimeConfig",
			addExport: false,
			addDefaults: false,
			allowExtraKeys: false,
			indentation: 2
		}) : "",
		`}`,
		"export {}"
	];
	const declarations = [
		"/// <reference path=\"./nitro-routes.d.ts\" />",
		"/// <reference path=\"./nitro-config.d.ts\" />",
		"/// <reference path=\"./nitro-imports.d.ts\" />"
	];
	const buildFiles = [];
	buildFiles.push({
		path: join(generatedTypesDir, "nitro-routes.d.ts"),
		contents: () => generateRoutes().join("\n")
	});
	buildFiles.push({
		path: join(generatedTypesDir, "nitro-config.d.ts"),
		contents: config.join("\n")
	});
	buildFiles.push({
		path: join(generatedTypesDir, "nitro-imports.d.ts"),
		contents: [...autoImportedTypes, autoImportExports || "export {}"].join("\n")
	});
	buildFiles.push({
		path: join(generatedTypesDir, "nitro.d.ts"),
		contents: declarations.join("\n")
	});
	if (nitro.options.typescript.generateTsConfig) {
		const tsConfigPath = resolve(generatedTypesDir, nitro.options.typescript.tsconfigPath);
		const tsconfigDir = dirname(tsConfigPath);
		const tsConfig = defu(nitro.options.typescript.tsConfig, {
			compilerOptions: {
				esModuleInterop: true,
				allowSyntheticDefaultImports: true,
				skipLibCheck: true,
				target: "ESNext",
				allowJs: true,
				resolveJsonModule: true,
				moduleDetection: "force",
				isolatedModules: true,
				verbatimModuleSyntax: true,
				allowImportingTsExtensions: true,
				strict: nitro.options.typescript.strict,
				noUncheckedIndexedAccess: true,
				noImplicitOverride: true,
				forceConsistentCasingInFileNames: true,
				module: "Preserve",
				jsx: "preserve",
				jsxFactory: "h",
				jsxFragmentFactory: "Fragment",
				paths: { "#imports": [relativeWithDot(tsconfigDir, join(generatedTypesDir, "nitro-imports"))] }
			},
			include: [
				relativeWithDot(tsconfigDir, join(generatedTypesDir, "nitro.d.ts")).replace(/^(?=[^.])/, "./"),
				join(relativeWithDot(tsconfigDir, nitro.options.rootDir), "**/*"),
				...!nitro.options.serverDir || nitro.options.serverDir === nitro.options.rootDir ? [] : [join(relativeWithDot(tsconfigDir, nitro.options.serverDir), "**/*")]
			]
		});
		for (const alias in tsConfig.compilerOptions.paths) {
			const paths = await Promise.all(tsConfig.compilerOptions.paths[alias].map(async (path) => {
				if (!isAbsolute(path)) return path;
				return relativeWithDot(tsconfigDir, (await promises.stat(path).catch(() => null))?.isFile() ? path.replace(/(?<=\w)\.\w+$/g, "") : path);
			}));
			tsConfig.compilerOptions.paths[alias] = [...new Set(paths)];
		}
		tsConfig.include = [...new Set(tsConfig.include.map((p) => isAbsolute(p) ? relativeWithDot(tsconfigDir, p) : p))];
		if (tsConfig.exclude) tsConfig.exclude = [...new Set(tsConfig.exclude.map((p) => isAbsolute(p) ? relativeWithDot(tsconfigDir, p) : p))];
		types.tsConfig = tsConfig;
		buildFiles.push({
			path: tsConfigPath,
			contents: () => JSON.stringify(tsConfig, null, 2)
		});
	}
	await nitro.hooks.callHook("types:extend", types);
	await Promise.all(buildFiles.map(async (file) => {
		await writeFile(resolve(generatedTypesDir, file.path), typeof file.contents === "string" ? file.contents : file.contents());
	}));
}
const RELATIVE_RE = /^\.{1,2}\//;
function relativeWithDot(from, to) {
	const rel = relative(from, to);
	return RELATIVE_RE.test(rel) ? rel : "./" + rel;
}

//#endregion
//#region src/utils/parallel.ts
async function runParallel(inputs, cb, opts) {
	const tasks = /* @__PURE__ */ new Set();
	function queueNext() {
		const route = inputs.values().next().value;
		if (!route) return;
		inputs.delete(route);
		const task = (opts.interval ? new Promise((resolve$1) => setTimeout(resolve$1, opts.interval)) : Promise.resolve()).then(() => cb(route)).catch((error) => {
			console.error(error);
		});
		tasks.add(task);
		return task.then(() => {
			tasks.delete(task);
			if (inputs.size > 0) return refillQueue();
		});
	}
	function refillQueue() {
		const workers = Math.min(opts.concurrency - tasks.size, inputs.size);
		return Promise.all(Array.from({ length: workers }, () => queueNext()));
	}
	await refillQueue();
}

//#endregion
export { scanHandlers as i, writeTypes as n, scanAndSyncOptions as r, runParallel as t };