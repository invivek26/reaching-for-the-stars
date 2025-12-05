import { C as isAbsolute, O as relative, T as normalize, n as debounce, w as join } from "../_libs/c12.mjs";
import "../_libs/gen-mapping.mjs";
import "../_libs/magic-string.mjs";
import "../_libs/acorn.mjs";
import "../_libs/confbox.mjs";
import { f as sanitizeFilePath } from "../_libs/local-pkg.mjs";
import "../_libs/js-tokens.mjs";
import "../_libs/strip-literal.mjs";
import "../_libs/unimport.mjs";
import "../_libs/picomatch.mjs";
import "../_libs/fdir.mjs";
import "../_libs/tinyglobby.mjs";
import { t as formatCompatibilityDate } from "../_libs/compatx.mjs";
import "../_libs/std-env.mjs";
import "../_libs/dot-prop.mjs";
import "../_chunks/C7CbzoI1.mjs";
import { i as scanHandlers, n as writeTypes } from "../_chunks/ANM1K1bE.mjs";
import "../_libs/mime.mjs";
import "../_libs/pathe.mjs";
import "../_libs/untyped.mjs";
import "../_libs/knitwork.mjs";
import { n as writeBuildInfo } from "./common.mjs";
import { i as watch$1 } from "../_libs/chokidar.mjs";
import { t as alias } from "../_libs/plugin-alias.mjs";
import "../_libs/estree-walker.mjs";
import { t as commonjs } from "../_libs/plugin-commonjs.mjs";
import { t as inject } from "../_libs/plugin-inject.mjs";
import { n as baseBuildConfig, t as baseBuildPlugins } from "./common2.mjs";
import "../_libs/remapping.mjs";
import "../_libs/unwasm.mjs";
import "../_libs/plugin-replace.mjs";
import "../_libs/etag.mjs";
import "../_libs/duplexer.mjs";
import "../_libs/gzip-size.mjs";
import "../_libs/pretty-bytes.mjs";
import { t as generateFSTree } from "../_chunks/BX9-zVkM.mjs";
import "../_libs/commondir.mjs";
import "../_libs/is-reference.mjs";
import { t as json } from "../_libs/plugin-json.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/is-module.mjs";
import { t as nodeResolve } from "../_libs/plugin-node-resolve.mjs";
import "../_libs/path-parse.mjs";
import "../_libs/function-bind.mjs";
import "../_libs/hasown.mjs";
import "../_libs/is-core-module.mjs";
import { watch } from "node:fs";
import { defu } from "defu";
import { runtimeDir } from "nitro/meta";
import { transform } from "oxc-transform";
import { minify } from "oxc-minify";

//#region src/build/plugins/oxc.ts
function oxc(options) {
	const filter = (id) => !/node_modules/.test(id) && /\.[mj]?[jt]sx?$/.test(id);
	return {
		name: "nitro:oxc",
		async transform(code, id) {
			if (!filter(id)) return null;
			return transform(id, code, {
				sourcemap: options.sourcemap,
				...options.transform
			});
		},
		async renderChunk(code, chunk) {
			if (options.minify) return minify(chunk.fileName, code, {
				sourcemap: options.sourcemap,
				...typeof options.minify === "object" ? options.minify : {}
			});
			return null;
		}
	};
}

//#endregion
//#region src/build/rollup/config.ts
const getRollupConfig = (nitro) => {
	const base = baseBuildConfig(nitro);
	const chunkNamePrefixes = [
		[runtimeDir, "nitro"],
		[base.presetsDir, "nitro"],
		["\0raw:", "raw"],
		["\0nitro-wasm:", "wasm"],
		["\0", "virtual"]
	];
	function getChunkGroup(id) {
		if (id.startsWith(runtimeDir) || id.startsWith(base.presetsDir)) return "nitro";
	}
	const tsc = nitro.options.typescript.tsConfig?.compilerOptions;
	let config = {
		input: nitro.options.entry,
		external: [...base.env.external],
		plugins: [
			...baseBuildPlugins(nitro, base),
			oxc({
				sourcemap: !!nitro.options.sourcemap,
				minify: nitro.options.minify ? { ...nitro.options.oxc?.minify } : false,
				transform: {
					target: "esnext",
					cwd: nitro.options.rootDir,
					...nitro.options.oxc?.transform,
					jsx: {
						runtime: tsc?.jsx === "react" ? "classic" : "automatic",
						pragma: tsc?.jsxFactory,
						pragmaFrag: tsc?.jsxFragmentFactory,
						importSource: tsc?.jsxImportSource,
						development: nitro.options.dev,
						...nitro.options.oxc?.transform?.jsx
					}
				}
			}),
			alias({ entries: base.aliases }),
			nodeResolve({
				extensions: base.extensions,
				preferBuiltins: !!nitro.options.node,
				rootDir: nitro.options.rootDir,
				modulePaths: nitro.options.nodeModulesDirs,
				mainFields: ["main"],
				exportConditions: nitro.options.exportConditions
			}),
			commonjs({ ...nitro.options.commonJS }),
			json(),
			inject(base.env.inject)
		],
		onwarn(warning, rollupWarn) {
			if (![
				"EVAL",
				"CIRCULAR_DEPENDENCY",
				"THIS_IS_UNDEFINED"
			].includes(warning.code || "") && !warning.message.includes("Unsupported source map comment")) rollupWarn(warning);
		},
		treeshake: { moduleSideEffects(id) {
			return nitro.options.moduleSideEffects.some((p) => id.startsWith(p));
		} },
		output: {
			dir: nitro.options.output.serverDir,
			entryFileNames: "index.mjs",
			chunkFileNames(chunk) {
				const id = normalize(chunk.moduleIds.at(-1) || "");
				for (const [dir, name] of chunkNamePrefixes) if (id.startsWith(dir)) return `chunks/${name}/[name].mjs`;
				const routeHandler = nitro.options.handlers.find((h) => id.startsWith(h.handler)) || nitro.scannedHandlers.find((h) => id.startsWith(h.handler));
				if (routeHandler?.route) return `chunks/routes${routeHandler.route.replace(/:([^/]+)/g, "_$1").replace(/\/[^/]+$/g, "") || "/"}/[name].mjs`;
				if (Object.entries(nitro.options.tasks).find(([_, task]) => task.handler === id)) return `chunks/tasks/[name].mjs`;
				return `chunks/_/[name].mjs`;
			},
			manualChunks(id) {
				return getChunkGroup(id);
			},
			inlineDynamicImports: nitro.options.inlineDynamicImports,
			format: "esm",
			exports: "auto",
			intro: "",
			outro: "",
			generatedCode: { constBindings: true },
			sanitizeFileName: sanitizeFilePath,
			sourcemap: nitro.options.sourcemap,
			sourcemapExcludeSources: true,
			sourcemapIgnoreList(relativePath) {
				return relativePath.includes("node_modules");
			}
		}
	};
	config = defu(nitro.options.rollupConfig, config);
	if (config.output.inlineDynamicImports) delete config.output.manualChunks;
	return config;
};

//#endregion
//#region src/build/rollup/error.ts
function formatRollupError(_error) {
	try {
		const logs = [_error.toString()];
		const errors = _error?.errors || [_error];
		for (const error of errors) {
			const id = error.path || error.id || _error.id;
			let path = isAbsolute(id) ? relative(process.cwd(), id) : id;
			const location = error.loc;
			if (location) path += `:${location.line}:${location.column}`;
			const text = error.frame;
			logs.push(`Rollup error while processing \`${path}\`` + text ? "\n\n" + text : "");
		}
		return logs.join("\n");
	} catch {
		return _error?.toString();
	}
}

//#endregion
//#region src/build/rollup/dev.ts
async function watchDev(nitro, rollupConfig) {
	const rollup = await import("rollup");
	let rollupWatcher;
	async function load() {
		if (rollupWatcher) await rollupWatcher.close();
		await scanHandlers(nitro);
		nitro.routing.sync();
		rollupWatcher = startRollupWatcher(nitro, rollupConfig);
		await writeTypes(nitro);
	}
	const reload = debounce(load);
	const scanDirs = nitro.options.scanDirs.flatMap((dir) => [
		join(dir, nitro.options.apiDir || "api"),
		join(dir, nitro.options.routesDir || "routes"),
		join(dir, "middleware"),
		join(dir, "plugins"),
		join(dir, "modules")
	]);
	const watchReloadEvents = new Set([
		"add",
		"addDir",
		"unlink",
		"unlinkDir"
	]);
	const scanDirsWatcher = watch$1(scanDirs, { ignoreInitial: true }).on("all", (event, path, stat) => {
		if (watchReloadEvents.has(event)) reload();
	});
	const rootDirWatcher = watch(nitro.options.rootDir, { persistent: false }, (_event, filename) => {
		if (filename && /^server\.[mc]?[jt]sx?$/.test(filename)) reload();
	});
	nitro.hooks.hook("close", () => {
		rollupWatcher.close();
		scanDirsWatcher.close();
		rootDirWatcher.close();
	});
	nitro.hooks.hook("rollup:reload", () => reload());
	await load();
	function startRollupWatcher(nitro$1, rollupConfig$1) {
		const watcher = rollup.watch(defu(rollupConfig$1, { watch: { chokidar: nitro$1.options.watchOptions } }));
		let start;
		watcher.on("event", (event) => {
			switch (event.code) {
				case "START":
					start = Date.now();
					nitro$1.logger.info(`Starting dev watcher (builder: \`rollup\`, preset: \`${nitro$1.options.preset}\`, compatibility date: \`${formatCompatibilityDate(nitro$1.options.compatibilityDate)}\`)`);
					nitro$1.hooks.callHook("dev:start");
					break;
				case "BUNDLE_END":
					nitro$1.hooks.callHook("compiled", nitro$1);
					if (nitro$1.options.logging.buildSuccess) nitro$1.logger.success(`Server built`, start ? `in ${Date.now() - start}ms` : "");
					nitro$1.hooks.callHook("dev:reload");
					break;
				case "ERROR":
					nitro$1.logger.error(formatRollupError(event.error));
					nitro$1.hooks.callHook("dev:error", event.error);
			}
		});
		return watcher;
	}
}

//#endregion
//#region src/build/rollup/prod.ts
async function buildProduction(nitro, rollupConfig) {
	const rollup = await import("rollup");
	const buildStartTime = Date.now();
	await scanHandlers(nitro);
	await writeTypes(nitro);
	if (!nitro.options.static) {
		nitro.logger.info(`Building server (builder: \`rollup\`, preset: \`${nitro.options.preset}\`, compatibility date: \`${formatCompatibilityDate(nitro.options.compatibilityDate)}\`)`);
		await (await rollup.rollup(rollupConfig).catch((error) => {
			nitro.logger.error(formatRollupError(error));
			throw error;
		})).write(rollupConfig.output);
	}
	const buildInfo = await writeBuildInfo(nitro);
	if (!nitro.options.static) {
		if (nitro.options.logging.buildSuccess) nitro.logger.success(`Server built in ${Date.now() - buildStartTime}ms`);
		if (nitro.options.logLevel > 1) process.stdout.write(await generateFSTree(nitro.options.output.serverDir, { compressedSizes: nitro.options.logging.compressedSizes }) || "");
	}
	await nitro.hooks.callHook("compiled", nitro);
	const rOutput = relative(process.cwd(), nitro.options.output.dir);
	const rewriteRelativePaths = (input) => {
		return input.replace(/([\s:])\.\/(\S*)/g, `$1${rOutput}/$2`);
	};
	if (buildInfo.commands.preview) nitro.logger.success(`You can preview this build using \`${rewriteRelativePaths(buildInfo.commands.preview)}\``);
	if (buildInfo.commands.deploy) nitro.logger.success(`You can deploy this build using \`${rewriteRelativePaths(buildInfo.commands.deploy)}\``);
}

//#endregion
//#region src/build/rollup/build.ts
async function rollupBuild(nitro) {
	await nitro.hooks.callHook("build:before", nitro);
	const config = getRollupConfig(nitro);
	await nitro.hooks.callHook("rollup:before", nitro, config);
	return nitro.options.dev ? watchDev(nitro, config) : buildProduction(nitro, config);
}

//#endregion
export { rollupBuild };