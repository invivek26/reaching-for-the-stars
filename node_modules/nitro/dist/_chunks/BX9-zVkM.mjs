import { O as relative, k as resolve, x as dirname } from "../_libs/c12.mjs";
import { t as glob } from "../_libs/tinyglobby.mjs";
import { r as a } from "../_libs/std-env.mjs";
import { t as runParallel } from "./ANM1K1bE.mjs";
import { t as gzipSize } from "../_libs/gzip-size.mjs";
import { t as prettyBytes } from "../_libs/pretty-bytes.mjs";
import { promises } from "node:fs";
import { colors } from "consola/utils";

//#region src/utils/fs-tree.ts
async function generateFSTree(dir, options = {}) {
	if (a) return;
	const files = await glob("**/*.*", {
		cwd: dir,
		ignore: ["*.map"]
	});
	const items = [];
	await runParallel(new Set(files), async (file) => {
		const path = resolve(dir, file);
		const src = await promises.readFile(path);
		const size = src.byteLength;
		const gzip = options.compressedSizes ? await gzipSize(src) : 0;
		items.push({
			file,
			path,
			size,
			gzip
		});
	}, { concurrency: 10 });
	items.sort((a$1, b) => a$1.path.localeCompare(b.path));
	let totalSize = 0;
	let totalGzip = 0;
	let totalNodeModulesSize = 0;
	let totalNodeModulesGzip = 0;
	let treeText = "";
	for (const [index, item] of items.entries()) {
		let dir$1 = dirname(item.file);
		if (dir$1 === ".") dir$1 = "";
		const rpath = relative(process.cwd(), item.path);
		const treeChar = index === items.length - 1 ? "└─" : "├─";
		if (item.file.includes("node_modules")) {
			totalNodeModulesSize += item.size;
			totalNodeModulesGzip += item.gzip;
			continue;
		}
		treeText += colors.gray(`  ${treeChar} ${rpath} (${prettyBytes(item.size)})`);
		if (options.compressedSizes) treeText += colors.gray(` (${prettyBytes(item.gzip)} gzip)`);
		treeText += "\n";
		totalSize += item.size;
		totalGzip += item.gzip;
	}
	treeText += `${colors.cyan("Σ Total size:")} ${prettyBytes(totalSize + totalNodeModulesSize)}`;
	if (options.compressedSizes) treeText += ` (${prettyBytes(totalGzip + totalNodeModulesGzip)} gzip)`;
	treeText += "\n";
	return treeText;
}

//#endregion
export { generateFSTree as t };