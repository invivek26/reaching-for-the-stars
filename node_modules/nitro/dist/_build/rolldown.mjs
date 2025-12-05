import { O as relative, T as normalize, n as debounce, w as join } from "../_libs/c12.mjs";
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
import "../_libs/estree-walker.mjs";
import "../_libs/plugin-commonjs.mjs";
import { n as baseBuildConfig, t as baseBuildPlugins } from "./common2.mjs";
import "../_libs/remapping.mjs";
import "../_libs/unwasm.mjs";
import "../_libs/plugin-replace.mjs";
import "../_libs/etag.mjs";
import "../_libs/duplexer.mjs";
import "../_libs/gzip-size.mjs";
import "../_libs/pretty-bytes.mjs";
import { t as generateFSTree } from "../_chunks/BX9-zVkM.mjs";
import { builtinModules } from "node:module";
import { watch } from "node:fs";
import { defu } from "defu";
import { runtimeDir } from "nitro/meta";

//#region src/build/rolldown/config.ts
const getRolldownConfig = (nitro) => {
	const base = baseBuildConfig(nitro);
	const chunkNamePrefixes = [
		[runtimeDir, "nitro"],
		[base.presetsDir, "nitro"],
		["\0raw:", "raw"],
		["\0nitro-wasm:", "wasm"],
		["\0", "virtual"]
	];
	const tsc = nitro.options.typescript.tsConfig?.compilerOptions;
	let config = {
		cwd: nitro.options.rootDir,
		input: nitro.options.entry,
		external: [
			...base.env.external,
			...builtinModules,
			...builtinModules.map((m) => `node:${m}`)
		],
		plugins: [...baseBuildPlugins(nitro, base)],
		resolve: {
			alias: base.aliases,
			extensions: base.extensions,
			mainFields: ["main"],
			conditionNames: nitro.options.exportConditions
		},
		transform: {
			inject: base.env.inject,
			jsx: {
				runtime: tsc?.jsx === "react" ? "classic" : "automatic",
				pragma: tsc?.jsxFactory,
				pragmaFrag: tsc?.jsxFragmentFactory,
				importSource: tsc?.jsxImportSource,
				development: nitro.options.dev
			}
		},
		onwarn(warning, warn) {
			if (!["CIRCULAR_DEPENDENCY", "EVAL"].includes(warning.code || "") && !warning.message.includes("Unsupported source map comment")) warn(warning);
		},
		treeshake: { moduleSideEffects(id) {
			return nitro.options.moduleSideEffects.some((p) => id.startsWith(p));
		} },
		output: {
			dir: nitro.options.output.serverDir,
			entryFileNames: "index.mjs",
			minify: nitro.options.minify,
			chunkFileNames(chunk) {
				const id = normalize(chunk.moduleIds.at(-1) || "");
				for (const [dir, name] of chunkNamePrefixes) if (id.startsWith(dir)) return `chunks/${name}/[name].mjs`;
				const routeHandler = nitro.options.handlers.find((h) => id.startsWith(h.handler)) || nitro.scannedHandlers.find((h) => id.startsWith(h.handler));
				if (routeHandler?.route) return `chunks/routes${routeHandler.route.replace(/:([^/]+)/g, "_$1").replace(/\/[^/]+$/g, "").replace(/[^a-zA-Z0-9/_-]/g, "_") || "/"}/[name].mjs`;
				if (Object.entries(nitro.options.tasks).find(([_, task]) => task.handler === id)) return `chunks/tasks/[name].mjs`;
				return `chunks/_/[name].mjs`;
			},
			inlineDynamicImports: nitro.options.inlineDynamicImports,
			format: "esm",
			exports: "auto",
			intro: "",
			outro: "",
			sanitizeFileName: sanitizeFilePath,
			sourcemap: nitro.options.sourcemap,
			sourcemapIgnoreList(relativePath) {
				return relativePath.includes("node_modules");
			}
		}
	};
	config = defu(nitro.options.rollupConfig, config);
	return config;
};

//#endregion
//#region src/build/rolldown/dev.ts
async function watchDev(nitro, config) {
	const rolldown = await import("rolldown");
	let watcher;
	async function load() {
		if (watcher) await watcher.close();
		await scanHandlers(nitro);
		nitro.routing.sync();
		watcher = startWatcher(nitro, config);
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
	const scanDirsWatcher = watch$1(scanDirs, { ignoreInitial: true }).on("all", (event) => {
		if (watchReloadEvents.has(event)) reload();
	});
	const rootDirWatcher = watch(nitro.options.rootDir, { persistent: false }, (_event, filename) => {
		if (filename && /^server\.[mc]?[jt]sx?$/.test(filename)) reload();
	});
	nitro.hooks.hook("close", () => {
		watcher.close();
		scanDirsWatcher.close();
		rootDirWatcher.close();
	});
	nitro.hooks.hook("rollup:reload", () => reload());
	await load();
	function startWatcher(nitro$1, config$1) {
		const watcher$1 = rolldown.watch(config$1);
		let start;
		watcher$1.on("event", (event) => {
			switch (event.code) {
				case "START":
					start = Date.now();
					nitro$1.logger.info(`Starting dev watcher (builder: \`rolldown\`, preset: \`${nitro$1.options.preset}\`, compatibility date: \`${formatCompatibilityDate(nitro$1.options.compatibilityDate)}\`)`);
					nitro$1.hooks.callHook("dev:start");
					break;
				case "BUNDLE_END":
					nitro$1.hooks.callHook("compiled", nitro$1);
					if (nitro$1.options.logging.buildSuccess) nitro$1.logger.success(`Server built`, start ? `in ${Date.now() - start}ms` : "");
					nitro$1.hooks.callHook("dev:reload");
					break;
				case "ERROR": nitro$1.hooks.callHook("dev:error", event.error);
			}
		});
		return watcher$1;
	}
}

//#endregion
//#region src/build/rolldown/prod.ts
async function buildProduction(nitro, config) {
	const rolldown = await import("rolldown");
	const buildStartTime = Date.now();
	await scanHandlers(nitro);
	await writeTypes(nitro);
	if (!nitro.options.static) {
		nitro.logger.info(`Building server (builder: \`rolldown\`, preset: \`${nitro.options.preset}\`, compatibility date: \`${formatCompatibilityDate(nitro.options.compatibilityDate)}\`)`);
		await (await rolldown.rolldown(config)).write(config.output);
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
//#region src/build/rolldown/build.ts
async function rolldownBuild(nitro) {
	await nitro.hooks.callHook("build:before", nitro);
	const config = getRolldownConfig(nitro);
	await nitro.hooks.callHook("rollup:before", nitro, config);
	return nitro.options.dev ? watchDev(nitro, config) : buildProduction(nitro, config);
}

//#endregion
export { rolldownBuild };