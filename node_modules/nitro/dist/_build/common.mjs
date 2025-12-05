import { O as relative$1, k as resolve$1, w as join$1 } from "../_libs/c12.mjs";
import { i as writeFile$1 } from "../_chunks/C7CbzoI1.mjs";
import { dirname } from "node:path";
import { mkdir, readFile, stat } from "node:fs/promises";
import { version } from "nitro/meta";

//#region src/presets/_types.gen.ts
const presetsWithConfig = [
	"awsAmplify",
	"awsLambda",
	"azure",
	"cloudflare",
	"firebase",
	"netlify",
	"vercel"
];

//#endregion
//#region src/build/info.ts
const NITRO_WELLKNOWN_DIR = "node_modules/.nitro";
async function getBuildInfo(root) {
	const outputDir = await findLastBuildDir(root);
	if (!await stat(outputDir).then((s) => s.isDirectory()).catch(() => false)) return {};
	return {
		outputDir,
		buildInfo: await readFile(resolve$1(outputDir, "nitro.json"), "utf8").then(JSON.parse).catch(() => void 0)
	};
}
async function findLastBuildDir(root) {
	const lastBuildLink = join$1(root, NITRO_WELLKNOWN_DIR, "last-build.json");
	return await readFile(lastBuildLink, "utf8").then(JSON.parse).then((data) => resolve$1(lastBuildLink, data.outputDir || "../../../.output")).catch(() => resolve$1(root, ".output"));
}
async function writeBuildInfo(nitro) {
	const buildInfoPath = resolve$1(nitro.options.output.dir, "nitro.json");
	const buildInfo = {
		date: (/* @__PURE__ */ new Date()).toJSON(),
		preset: nitro.options.preset,
		framework: nitro.options.framework,
		versions: { nitro: version },
		commands: {
			preview: nitro.options.commands.preview,
			deploy: nitro.options.commands.deploy
		},
		config: { ...Object.fromEntries(presetsWithConfig.map((key) => [key, nitro.options[key]])) }
	};
	await writeFile$1(buildInfoPath, JSON.stringify(buildInfo, null, 2), true);
	const lastBuild = join$1(nitro.options.rootDir, NITRO_WELLKNOWN_DIR, "last-build.json");
	await mkdir(dirname(lastBuild), { recursive: true });
	await writeFile$1(lastBuild, JSON.stringify({ outputDir: relative$1(lastBuild, nitro.options.output.dir) }));
	return buildInfo;
}
async function writeDevBuildInfo(nitro, addr) {
	const buildInfoPath = join$1(nitro.options.rootDir, NITRO_WELLKNOWN_DIR, "nitro.dev.json");
	const buildInfo = {
		date: (/* @__PURE__ */ new Date()).toJSON(),
		preset: nitro.options.preset,
		framework: nitro.options.framework,
		versions: { nitro: version },
		dev: {
			pid: process.pid,
			workerAddress: addr
		}
	};
	await writeFile$1(buildInfoPath, JSON.stringify(buildInfo, null, 2));
}

//#endregion
export { writeBuildInfo as n, writeDevBuildInfo as r, getBuildInfo as t };