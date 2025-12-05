import "../_libs/c12.mjs";
import "../_libs/gen-mapping.mjs";
import "../_libs/magic-string.mjs";
import "../_libs/acorn.mjs";
import "../_libs/confbox.mjs";
import "../_libs/local-pkg.mjs";
import "../_libs/js-tokens.mjs";
import "../_libs/strip-literal.mjs";
import "../_libs/unimport.mjs";
import "../_libs/picomatch.mjs";
import "../_libs/fdir.mjs";
import "../_libs/tinyglobby.mjs";
import "../_libs/compatx.mjs";
import "../_libs/klona.mjs";
import { r as a } from "../_libs/std-env.mjs";
import "../_chunks/B-D1JOIz.mjs";
import "../_libs/escape-string-regexp.mjs";
import "../_libs/tsconfck.mjs";
import "../_libs/dot-prop.mjs";
import "../_chunks/C7CbzoI1.mjs";
import "../_chunks/ANM1K1bE.mjs";
import "../_libs/rou3.mjs";
import "../_libs/mime.mjs";
import "../_libs/pathe.mjs";
import "../_libs/untyped.mjs";
import "../_libs/knitwork.mjs";
import "./common.mjs";
import "../_libs/httpxy.mjs";
import "../_dev.mjs";
import "../_libs/chokidar.mjs";
import "../_libs/ultrahtml.mjs";
import "../_libs/plugin-alias.mjs";
import "../_libs/estree-walker.mjs";
import "../_libs/plugin-commonjs.mjs";
import "../_libs/plugin-inject.mjs";
import "./common2.mjs";
import "../_libs/remapping.mjs";
import "../_libs/unwasm.mjs";
import "../_libs/plugin-replace.mjs";
import "../_libs/etag.mjs";
import { t as nitro } from "./vite.plugin.mjs";
import "../_libs/vite-plugin-fullstack.mjs";

//#region src/build/vite/build.ts
async function viteBuild(nitro$1) {
	if (nitro$1.options.dev) throw new Error("Nitro dev CLI does not supports vite. Please use `vite dev` instead.");
	const { createBuilder } = nitro$1.options.builder === "rolldown-vite" ? await import("rolldown-vite").catch(() => import("vite")) : await import("vite");
	await (await createBuilder({
		base: nitro$1.options.rootDir,
		plugins: [await nitro({ _nitro: nitro$1 })],
		logLevel: a ? "warn" : void 0
	})).buildApp();
}

//#endregion
export { viteBuild };