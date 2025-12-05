import { k as resolve } from "../../_libs/c12.mjs";
import "../../_libs/std-env.mjs";
import "../../_libs/dot-prop.mjs";
import "../../_chunks/C7CbzoI1.mjs";
import "../../_libs/mime.mjs";
import "../../_build/common.mjs";
import "../../_libs/httpxy.mjs";
import { t as NitroDevServer } from "../../_dev.mjs";
import "../../_libs/chokidar.mjs";
import { t as defineCommand } from "../../_libs/citty.mjs";
import { t as commonArgs } from "./common.mjs";
import { consola } from "consola";
import { build, createNitro, prepare } from "nitro/builder";

//#region src/cli/commands/dev.ts
const hmrKeyRe = /^runtimeConfig\.|routeRules\./;
var dev_default = defineCommand({
	meta: {
		name: "dev",
		description: "Start the development server"
	},
	args: {
		...commonArgs,
		port: {
			type: "string",
			description: "specify port"
		},
		host: {
			type: "string",
			description: "specify hostname "
		}
	},
	async run({ args }) {
		const rootDir = resolve(args.dir || args._dir || ".");
		let nitro;
		const reload = async () => {
			if (nitro) {
				consola.info("Restarting dev server...");
				if ("unwatch" in nitro.options._c12) await nitro.options._c12.unwatch();
				await nitro.close();
			}
			nitro = await createNitro({
				rootDir,
				dev: true,
				_cli: { command: "dev" }
			}, {
				watch: true,
				c12: { async onUpdate({ getDiff, newConfig }) {
					const diff = getDiff();
					if (diff.length === 0) return;
					consola.info("Nitro config updated:\n" + diff.map((entry) => `  ${entry.toString()}`).join("\n"));
					await (diff.every((e) => hmrKeyRe.test(e.key)) ? nitro.updateConfig(newConfig.config || {}) : reload());
				} }
			});
			nitro.hooks.hookOnce("restart", reload);
			await new NitroDevServer(nitro).listen({
				port: args.port,
				hostname: args.host
			});
			await prepare(nitro);
			await build(nitro);
		};
		await reload();
	}
});

//#endregion
export { dev_default as default };