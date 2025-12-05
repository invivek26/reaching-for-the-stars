import { O as relative, k as resolve, x as dirname } from "../_libs/c12.mjs";
import { t as getProperty } from "../_libs/dot-prop.mjs";
import consola$1 from "consola";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { colors } from "consola/utils";

//#region src/utils/fs.ts
function prettyPath(p, highlight = true) {
	p = relative(process.cwd(), p);
	return highlight ? colors.cyan(p) : p;
}
function resolveNitroPath(path, nitroOptions, base) {
	if (typeof path !== "string") throw new TypeError("Invalid path: " + path);
	path = _compilePathTemplate(path)(nitroOptions);
	for (const base$1 in nitroOptions.alias) if (path.startsWith(base$1)) path = nitroOptions.alias[base$1] + path.slice(base$1.length);
	return resolve(base || nitroOptions.rootDir, path);
}
function _compilePathTemplate(contents) {
	return (params) => contents.replace(/{{ ?([\w.]+) ?}}/g, (_, match) => {
		const val = getProperty(params, match);
		if (!val) consola$1.warn(`cannot resolve template param '${match}' in ${contents.slice(0, 20)}`);
		return val || `${match}`;
	});
}
async function writeFile$1(file, contents, log = false) {
	await mkdir(dirname(file), { recursive: true });
	await writeFile(file, contents, typeof contents === "string" ? "utf8" : void 0);
	if (log) consola$1.info("Generated", prettyPath(file));
}
async function isDirectory(path) {
	try {
		return (await stat(path)).isDirectory();
	} catch {
		return false;
	}
}

//#endregion
export { writeFile$1 as i, prettyPath as n, resolveNitroPath as r, isDirectory as t };