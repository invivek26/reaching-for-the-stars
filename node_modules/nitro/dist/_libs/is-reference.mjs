import { t as __commonJS } from "../_chunks/Bqks5huO.mjs";

//#region node_modules/.pnpm/is-reference@1.2.1/node_modules/is-reference/dist/is-reference.js
var require_is_reference = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/is-reference@1.2.1/node_modules/is-reference/dist/is-reference.js": ((exports, module) => {
	(function(global, factory) {
		typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = global || self, global.isReference = factory());
	})(exports, (function() {
		function isReference(node, parent) {
			if (node.type === "MemberExpression") return !node.computed && isReference(node.object, node);
			if (node.type === "Identifier") {
				if (!parent) return true;
				switch (parent.type) {
					case "MemberExpression": return parent.computed || node === parent.object;
					case "MethodDefinition": return parent.computed;
					case "FieldDefinition": return parent.computed || node === parent.value;
					case "Property": return parent.computed || node === parent.value;
					case "ExportSpecifier":
					case "ImportSpecifier": return node === parent.local;
					case "LabeledStatement":
					case "BreakStatement":
					case "ContinueStatement": return false;
					default: return true;
				}
			}
			return false;
		}
		return isReference;
	}));
}) });

//#endregion
export { require_is_reference as t };