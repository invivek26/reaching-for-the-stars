//#region node_modules/.pnpm/estree-walker@2.0.2/node_modules/estree-walker/dist/esm/estree-walker.js
/** @typedef { import('estree').BaseNode} BaseNode */
/** @typedef {{
skip: () => void;
remove: () => void;
replace: (node: BaseNode) => void;
}} WalkerContext */
var WalkerBase$1 = class {
	constructor() {
		/** @type {boolean} */
		this.should_skip = false;
		/** @type {boolean} */
		this.should_remove = false;
		/** @type {BaseNode | null} */
		this.replacement = null;
		/** @type {WalkerContext} */
		this.context = {
			skip: () => this.should_skip = true,
			remove: () => this.should_remove = true,
			replace: (node) => this.replacement = node
		};
	}
	/**
	*
	* @param {any} parent
	* @param {string} prop
	* @param {number} index
	* @param {BaseNode} node
	*/
	replace(parent, prop, index, node) {
		if (parent) if (index !== null) parent[prop][index] = node;
		else parent[prop] = node;
	}
	/**
	*
	* @param {any} parent
	* @param {string} prop
	* @param {number} index
	*/
	remove(parent, prop, index) {
		if (parent) if (index !== null) parent[prop].splice(index, 1);
		else delete parent[prop];
	}
};
/** @typedef { import('estree').BaseNode} BaseNode */
/** @typedef { import('./walker.js').WalkerContext} WalkerContext */
/** @typedef {(
*    this: WalkerContext,
*    node: BaseNode,
*    parent: BaseNode,
*    key: string,
*    index: number
* ) => void} SyncHandler */
var SyncWalker$1 = class extends WalkerBase$1 {
	/**
	*
	* @param {SyncHandler} enter
	* @param {SyncHandler} leave
	*/
	constructor(enter, leave) {
		super();
		/** @type {SyncHandler} */
		this.enter = enter;
		/** @type {SyncHandler} */
		this.leave = leave;
	}
	/**
	*
	* @param {BaseNode} node
	* @param {BaseNode} parent
	* @param {string} [prop]
	* @param {number} [index]
	* @returns {BaseNode}
	*/
	visit(node, parent, prop, index) {
		if (node) {
			if (this.enter) {
				const _should_skip = this.should_skip;
				const _should_remove = this.should_remove;
				const _replacement = this.replacement;
				this.should_skip = false;
				this.should_remove = false;
				this.replacement = null;
				this.enter.call(this.context, node, parent, prop, index);
				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}
				if (this.should_remove) this.remove(parent, prop, index);
				const skipped = this.should_skip;
				const removed = this.should_remove;
				this.should_skip = _should_skip;
				this.should_remove = _should_remove;
				this.replacement = _replacement;
				if (skipped) return node;
				if (removed) return null;
			}
			for (const key in node) {
				const value = node[key];
				if (typeof value !== "object") continue;
				else if (Array.isArray(value)) {
					for (let i = 0; i < value.length; i += 1) if (value[i] !== null && typeof value[i].type === "string") {
						if (!this.visit(value[i], node, key, i)) i--;
					}
				} else if (value !== null && typeof value.type === "string") this.visit(value, node, key, null);
			}
			if (this.leave) {
				const _replacement = this.replacement;
				const _should_remove = this.should_remove;
				this.replacement = null;
				this.should_remove = false;
				this.leave.call(this.context, node, parent, prop, index);
				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}
				if (this.should_remove) this.remove(parent, prop, index);
				const removed = this.should_remove;
				this.replacement = _replacement;
				this.should_remove = _should_remove;
				if (removed) return null;
			}
		}
		return node;
	}
};
/** @typedef { import('estree').BaseNode} BaseNode */
/** @typedef { import('./sync.js').SyncHandler} SyncHandler */
/** @typedef { import('./async.js').AsyncHandler} AsyncHandler */
/**
*
* @param {BaseNode} ast
* @param {{
*   enter?: SyncHandler
*   leave?: SyncHandler
* }} walker
* @returns {BaseNode}
*/
function walk$1(ast, { enter, leave }) {
	return new SyncWalker$1(enter, leave).visit(ast, null);
}

//#endregion
//#region node_modules/.pnpm/estree-walker@3.0.3/node_modules/estree-walker/src/walker.js
/**
* @typedef { import('estree').Node} Node
* @typedef {{
*   skip: () => void;
*   remove: () => void;
*   replace: (node: Node) => void;
* }} WalkerContext
*/
var WalkerBase = class {
	constructor() {
		/** @type {boolean} */
		this.should_skip = false;
		/** @type {boolean} */
		this.should_remove = false;
		/** @type {Node | null} */
		this.replacement = null;
		/** @type {WalkerContext} */
		this.context = {
			skip: () => this.should_skip = true,
			remove: () => this.should_remove = true,
			replace: (node) => this.replacement = node
		};
	}
	/**
	* @template {Node} Parent
	* @param {Parent | null | undefined} parent
	* @param {keyof Parent | null | undefined} prop
	* @param {number | null | undefined} index
	* @param {Node} node
	*/
	replace(parent, prop, index, node) {
		if (parent && prop) if (index != null)
 /** @type {Array<Node>} */ parent[prop][index] = node;
		else
 /** @type {Node} */ parent[prop] = node;
	}
	/**
	* @template {Node} Parent
	* @param {Parent | null | undefined} parent
	* @param {keyof Parent | null | undefined} prop
	* @param {number | null | undefined} index
	*/
	remove(parent, prop, index) {
		if (parent && prop) if (index !== null && index !== void 0)
 /** @type {Array<Node>} */ parent[prop].splice(index, 1);
		else delete parent[prop];
	}
};

//#endregion
//#region node_modules/.pnpm/estree-walker@3.0.3/node_modules/estree-walker/src/sync.js
/**
* @typedef { import('estree').Node} Node
* @typedef { import('./walker.js').WalkerContext} WalkerContext
* @typedef {(
*    this: WalkerContext,
*    node: Node,
*    parent: Node | null,
*    key: string | number | symbol | null | undefined,
*    index: number | null | undefined
* ) => void} SyncHandler
*/
var SyncWalker = class extends WalkerBase {
	/**
	*
	* @param {SyncHandler} [enter]
	* @param {SyncHandler} [leave]
	*/
	constructor(enter, leave) {
		super();
		/** @type {boolean} */
		this.should_skip = false;
		/** @type {boolean} */
		this.should_remove = false;
		/** @type {Node | null} */
		this.replacement = null;
		/** @type {WalkerContext} */
		this.context = {
			skip: () => this.should_skip = true,
			remove: () => this.should_remove = true,
			replace: (node) => this.replacement = node
		};
		/** @type {SyncHandler | undefined} */
		this.enter = enter;
		/** @type {SyncHandler | undefined} */
		this.leave = leave;
	}
	/**
	* @template {Node} Parent
	* @param {Node} node
	* @param {Parent | null} parent
	* @param {keyof Parent} [prop]
	* @param {number | null} [index]
	* @returns {Node | null}
	*/
	visit(node, parent, prop, index) {
		if (node) {
			if (this.enter) {
				const _should_skip = this.should_skip;
				const _should_remove = this.should_remove;
				const _replacement = this.replacement;
				this.should_skip = false;
				this.should_remove = false;
				this.replacement = null;
				this.enter.call(this.context, node, parent, prop, index);
				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}
				if (this.should_remove) this.remove(parent, prop, index);
				const skipped = this.should_skip;
				const removed = this.should_remove;
				this.should_skip = _should_skip;
				this.should_remove = _should_remove;
				this.replacement = _replacement;
				if (skipped) return node;
				if (removed) return null;
			}
			/** @type {keyof Node} */
			let key;
			for (key in node) {
				/** @type {unknown} */
				const value = node[key];
				if (value && typeof value === "object") {
					if (Array.isArray(value)) {
						const nodes = value;
						for (let i = 0; i < nodes.length; i += 1) {
							const item = nodes[i];
							if (isNode(item)) {
								if (!this.visit(item, node, key, i)) i--;
							}
						}
					} else if (isNode(value)) this.visit(value, node, key, null);
				}
			}
			if (this.leave) {
				const _replacement = this.replacement;
				const _should_remove = this.should_remove;
				this.replacement = null;
				this.should_remove = false;
				this.leave.call(this.context, node, parent, prop, index);
				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}
				if (this.should_remove) this.remove(parent, prop, index);
				const removed = this.should_remove;
				this.replacement = _replacement;
				this.should_remove = _should_remove;
				if (removed) return null;
			}
		}
		return node;
	}
};
/**
* Ducktype a node.
*
* @param {unknown} value
* @returns {value is Node}
*/
function isNode(value) {
	return value !== null && typeof value === "object" && "type" in value && typeof value.type === "string";
}

//#endregion
//#region node_modules/.pnpm/estree-walker@3.0.3/node_modules/estree-walker/src/index.js
/**
* @typedef {import('estree').Node} Node
* @typedef {import('./sync.js').SyncHandler} SyncHandler
* @typedef {import('./async.js').AsyncHandler} AsyncHandler
*/
/**
* @param {Node} ast
* @param {{
*   enter?: SyncHandler
*   leave?: SyncHandler
* }} walker
* @returns {Node | null}
*/
function walk(ast, { enter, leave }) {
	return new SyncWalker(enter, leave).visit(ast, null);
}

//#endregion
export { walk$1 as n, walk as t };