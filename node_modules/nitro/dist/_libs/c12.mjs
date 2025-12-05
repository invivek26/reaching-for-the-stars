import { i as __toESM, n as __require, t as __commonJS } from "../_chunks/Bqks5huO.mjs";
import path, { isAbsolute, resolve } from "node:path";
import process$1 from "node:process";
import fs, { existsSync, lstatSync, promises, readFileSync, realpathSync, statSync } from "node:fs";
import { URL as URL$1, fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert";
import v8 from "node:v8";
import { format, inspect } from "node:util";
import { readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { createJiti } from "jiti";
import destr from "destr";
import { defu } from "defu";

//#region node_modules/.pnpm/pathe@2.0.3/node_modules/pathe/dist/shared/pathe.M-eThtNZ.mjs
const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
	if (!input) return input;
	return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r$1) => r$1.toUpperCase());
}
const _UNC_REGEX = /^[/\\]{2}/;
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
const _ROOT_FOLDER_RE = /^\/([A-Za-z]:)?$/;
const _EXTNAME_RE = /.(\.[^./]+|\.)$/;
const _PATH_ROOT_RE = /^[/\\]|^[a-zA-Z]:[/\\]/;
const normalize$1 = function(path$2) {
	if (path$2.length === 0) return ".";
	path$2 = normalizeWindowsPath(path$2);
	const isUNCPath = path$2.match(_UNC_REGEX);
	const isPathAbsolute = isAbsolute$1(path$2);
	const trailingSeparator = path$2[path$2.length - 1] === "/";
	path$2 = normalizeString(path$2, !isPathAbsolute);
	if (path$2.length === 0) {
		if (isPathAbsolute) return "/";
		return trailingSeparator ? "./" : ".";
	}
	if (trailingSeparator) path$2 += "/";
	if (_DRIVE_LETTER_RE.test(path$2)) path$2 += "/";
	if (isUNCPath) {
		if (!isPathAbsolute) return `//./${path$2}`;
		return `//${path$2}`;
	}
	return isPathAbsolute && !isAbsolute$1(path$2) ? `/${path$2}` : path$2;
};
const join$1 = function(...segments) {
	let path$2 = "";
	for (const seg of segments) {
		if (!seg) continue;
		if (path$2.length > 0) {
			const pathTrailing = path$2[path$2.length - 1] === "/";
			const segLeading = seg[0] === "/";
			if (pathTrailing && segLeading) path$2 += seg.slice(1);
			else path$2 += pathTrailing || segLeading ? seg : `/${seg}`;
		} else path$2 += seg;
	}
	return normalize$1(path$2);
};
function cwd$1() {
	if (typeof process !== "undefined" && typeof process.cwd === "function") return process.cwd().replace(/\\/g, "/");
	return "/";
}
const resolve$1 = function(...arguments_) {
	arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
	let resolvedPath = "";
	let resolvedAbsolute = false;
	for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
		const path$2 = index >= 0 ? arguments_[index] : cwd$1();
		if (!path$2 || path$2.length === 0) continue;
		resolvedPath = `${path$2}/${resolvedPath}`;
		resolvedAbsolute = isAbsolute$1(path$2);
	}
	resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
	if (resolvedAbsolute && !isAbsolute$1(resolvedPath)) return `/${resolvedPath}`;
	return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path$2, allowAboveRoot) {
	let res = "";
	let lastSegmentLength = 0;
	let lastSlash = -1;
	let dots = 0;
	let char = null;
	for (let index = 0; index <= path$2.length; ++index) {
		if (index < path$2.length) char = path$2[index];
		else if (char === "/") break;
		else char = "/";
		if (char === "/") {
			if (lastSlash === index - 1 || dots === 1);
			else if (dots === 2) {
				if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
					if (res.length > 2) {
						const lastSlashIndex = res.lastIndexOf("/");
						if (lastSlashIndex === -1) {
							res = "";
							lastSegmentLength = 0;
						} else {
							res = res.slice(0, lastSlashIndex);
							lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
						}
						lastSlash = index;
						dots = 0;
						continue;
					} else if (res.length > 0) {
						res = "";
						lastSegmentLength = 0;
						lastSlash = index;
						dots = 0;
						continue;
					}
				}
				if (allowAboveRoot) {
					res += res.length > 0 ? "/.." : "..";
					lastSegmentLength = 2;
				}
			} else {
				if (res.length > 0) res += `/${path$2.slice(lastSlash + 1, index)}`;
				else res = path$2.slice(lastSlash + 1, index);
				lastSegmentLength = index - lastSlash - 1;
			}
			lastSlash = index;
			dots = 0;
		} else if (char === "." && dots !== -1) ++dots;
		else dots = -1;
	}
	return res;
}
const isAbsolute$1 = function(p) {
	return _IS_ABSOLUTE_RE.test(p);
};
const extname$1 = function(p) {
	if (p === "..") return "";
	const match = _EXTNAME_RE.exec(normalizeWindowsPath(p));
	return match && match[1] || "";
};
const relative$1 = function(from, to) {
	const _from = resolve$1(from).replace(_ROOT_FOLDER_RE, "$1").split("/");
	const _to = resolve$1(to).replace(_ROOT_FOLDER_RE, "$1").split("/");
	if (_to[0][1] === ":" && _from[0][1] === ":" && _from[0] !== _to[0]) return _to.join("/");
	const _fromCopy = [..._from];
	for (const segment of _fromCopy) {
		if (_to[0] !== segment) break;
		_from.shift();
		_to.shift();
	}
	return [..._from.map(() => ".."), ..._to].join("/");
};
const dirname$1 = function(p) {
	const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
	if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) segments[0] += "/";
	return segments.join("/") || (isAbsolute$1(p) ? "/" : ".");
};
const basename$1 = function(p, extension) {
	const segments = normalizeWindowsPath(p).split("/");
	let lastSegment = "";
	for (let i = segments.length - 1; i >= 0; i--) {
		const val = segments[i];
		if (val) {
			lastSegment = val;
			break;
		}
	}
	return extension && lastSegment.endsWith(extension) ? lastSegment.slice(0, -extension.length) : lastSegment;
};
const parse$2 = function(p) {
	const root = _PATH_ROOT_RE.exec(p)?.[0]?.replace(/\\/g, "/") || "";
	const base = basename$1(p);
	const extension = extname$1(base);
	return {
		root,
		dir: dirname$1(p),
		base,
		ext: extension,
		name: base.slice(0, base.length - extension.length)
	};
};

//#endregion
//#region node_modules/.pnpm/confbox@0.2.2/node_modules/confbox/dist/shared/confbox.DA7CpUDY.mjs
const b = /^(?:( )+|\t+)/, d$1 = "space", h$1 = "tab";
function g(e, t) {
	const n = /* @__PURE__ */ new Map();
	let s = 0, o, i;
	for (const c of e.split(/\n/g)) {
		if (!c) continue;
		let f, a, l, p, r$1;
		const y = c.match(b);
		if (y === null) s = 0, o = "";
		else {
			if (f = y[0].length, a = y[1] ? d$1 : h$1, t && a === d$1 && f === 1) continue;
			a !== o && (s = 0), o = a, l = 1, p = 0;
			const u = f - s;
			if (s = f, u === 0) l = 0, p = 1;
			else {
				const I$1 = u > 0 ? u : -u;
				i = T(a, I$1);
			}
			r$1 = n.get(i), r$1 = r$1 === void 0 ? [1, 0] : [r$1[0] + l, r$1[1] + p], n.set(i, r$1);
		}
	}
	return n;
}
function T(e, t) {
	return (e === d$1 ? "s" : "t") + String(t);
}
function w(e) {
	return {
		type: e[0] === "s" ? d$1 : h$1,
		amount: Number(e.slice(1))
	};
}
function E(e) {
	let t, n = 0, s = 0;
	for (const [o, [i, c]] of e) (i > n || i === n && c > s) && (n = i, s = c, t = o);
	return t;
}
function S$2(e, t) {
	return (e === d$1 ? " " : "	").repeat(t);
}
function _(e) {
	if (typeof e != "string") throw new TypeError("Expected a string");
	let t = g(e, !0);
	t.size === 0 && (t = g(e, !1));
	const n = E(t);
	let s, o = 0, i = "";
	return n !== void 0 && ({type: s, amount: o} = w(n), i = S$2(s, o)), {
		amount: o,
		type: s,
		indent: i
	};
}
const m = Symbol.for("__confbox_fmt__"), k = /^(\s+)/, v = /(\s+)$/;
function x$2(e, t = {}) {
	return {
		sample: t.indent === void 0 && t.preserveIndentation !== !1 && e.slice(0, t?.sampleSize || 1024),
		whiteSpace: t.preserveWhitespace === !1 ? void 0 : {
			start: k.exec(e)?.[0] || "",
			end: v.exec(e)?.[0] || ""
		}
	};
}
function N(e, t, n) {
	!t || typeof t != "object" || Object.defineProperty(t, m, {
		enumerable: !1,
		configurable: !0,
		writable: !0,
		value: x$2(e, n)
	});
}
function C(e, t) {
	if (!e || typeof e != "object" || !(m in e)) return {
		indent: t?.indent ?? 2,
		whitespace: {
			start: "",
			end: ""
		}
	};
	const n = e[m];
	return {
		indent: t?.indent || _(n.sample || "").indent,
		whitespace: n.whiteSpace || {
			start: "",
			end: ""
		}
	};
}

//#endregion
//#region node_modules/.pnpm/confbox@0.2.2/node_modules/confbox/dist/shared/confbox.DnMsyigM.mjs
function $$1(n, l = !1) {
	const g$1 = n.length;
	let e = 0, u = "", p = 0, k$1 = 16, A = 0, o = 0, O$1 = 0, B = 0, b$1 = 0;
	function I$1(i, T$1) {
		let s = 0, c = 0;
		for (; s < i;) {
			let t = n.charCodeAt(e);
			if (t >= 48 && t <= 57) c = c * 16 + t - 48;
			else if (t >= 65 && t <= 70) c = c * 16 + t - 65 + 10;
			else if (t >= 97 && t <= 102) c = c * 16 + t - 97 + 10;
			else break;
			e++, s++;
		}
		return s < i && (c = -1), c;
	}
	function V(i) {
		e = i, u = "", p = 0, k$1 = 16, b$1 = 0;
	}
	function F() {
		let i = e;
		if (n.charCodeAt(e) === 48) e++;
		else for (e++; e < n.length && L(n.charCodeAt(e));) e++;
		if (e < n.length && n.charCodeAt(e) === 46) if (e++, e < n.length && L(n.charCodeAt(e))) for (e++; e < n.length && L(n.charCodeAt(e));) e++;
		else return b$1 = 3, n.substring(i, e);
		let T$1 = e;
		if (e < n.length && (n.charCodeAt(e) === 69 || n.charCodeAt(e) === 101)) if (e++, (e < n.length && n.charCodeAt(e) === 43 || n.charCodeAt(e) === 45) && e++, e < n.length && L(n.charCodeAt(e))) {
			for (e++; e < n.length && L(n.charCodeAt(e));) e++;
			T$1 = e;
		} else b$1 = 3;
		return n.substring(i, T$1);
	}
	function a() {
		let i = "", T$1 = e;
		for (;;) {
			if (e >= g$1) {
				i += n.substring(T$1, e), b$1 = 2;
				break;
			}
			const s = n.charCodeAt(e);
			if (s === 34) {
				i += n.substring(T$1, e), e++;
				break;
			}
			if (s === 92) {
				if (i += n.substring(T$1, e), e++, e >= g$1) {
					b$1 = 2;
					break;
				}
				switch (n.charCodeAt(e++)) {
					case 34:
						i += "\"";
						break;
					case 92:
						i += "\\";
						break;
					case 47:
						i += "/";
						break;
					case 98:
						i += "\b";
						break;
					case 102:
						i += "\f";
						break;
					case 110:
						i += `
`;
						break;
					case 114:
						i += "\r";
						break;
					case 116:
						i += "	";
						break;
					case 117:
						const t = I$1(4);
						t >= 0 ? i += String.fromCharCode(t) : b$1 = 4;
						break;
					default: b$1 = 5;
				}
				T$1 = e;
				continue;
			}
			if (s >= 0 && s <= 31) if (r(s)) {
				i += n.substring(T$1, e), b$1 = 2;
				break;
			} else b$1 = 6;
			e++;
		}
		return i;
	}
	function w$1() {
		if (u = "", b$1 = 0, p = e, o = A, B = O$1, e >= g$1) return p = g$1, k$1 = 17;
		let i = n.charCodeAt(e);
		if (J(i)) {
			do
				e++, u += String.fromCharCode(i), i = n.charCodeAt(e);
			while (J(i));
			return k$1 = 15;
		}
		if (r(i)) return e++, u += String.fromCharCode(i), i === 13 && n.charCodeAt(e) === 10 && (e++, u += `
`), A++, O$1 = e, k$1 = 14;
		switch (i) {
			case 123: return e++, k$1 = 1;
			case 125: return e++, k$1 = 2;
			case 91: return e++, k$1 = 3;
			case 93: return e++, k$1 = 4;
			case 58: return e++, k$1 = 6;
			case 44: return e++, k$1 = 5;
			case 34: return e++, u = a(), k$1 = 10;
			case 47:
				const T$1 = e - 1;
				if (n.charCodeAt(e + 1) === 47) {
					for (e += 2; e < g$1 && !r(n.charCodeAt(e));) e++;
					return u = n.substring(T$1, e), k$1 = 12;
				}
				if (n.charCodeAt(e + 1) === 42) {
					e += 2;
					const s = g$1 - 1;
					let c = !1;
					for (; e < s;) {
						const t = n.charCodeAt(e);
						if (t === 42 && n.charCodeAt(e + 1) === 47) {
							e += 2, c = !0;
							break;
						}
						e++, r(t) && (t === 13 && n.charCodeAt(e) === 10 && e++, A++, O$1 = e);
					}
					return c || (e++, b$1 = 1), u = n.substring(T$1, e), k$1 = 13;
				}
				return u += String.fromCharCode(i), e++, k$1 = 16;
			case 45: if (u += String.fromCharCode(i), e++, e === g$1 || !L(n.charCodeAt(e))) return k$1 = 16;
			case 48:
			case 49:
			case 50:
			case 51:
			case 52:
			case 53:
			case 54:
			case 55:
			case 56:
			case 57: return u += F(), k$1 = 11;
			default:
				for (; e < g$1 && v$1(i);) e++, i = n.charCodeAt(e);
				if (p !== e) {
					switch (u = n.substring(p, e), u) {
						case "true": return k$1 = 8;
						case "false": return k$1 = 9;
						case "null": return k$1 = 7;
					}
					return k$1 = 16;
				}
				return u += String.fromCharCode(i), e++, k$1 = 16;
		}
	}
	function v$1(i) {
		if (J(i) || r(i)) return !1;
		switch (i) {
			case 125:
			case 93:
			case 123:
			case 91:
			case 34:
			case 58:
			case 44:
			case 47: return !1;
		}
		return !0;
	}
	function j$1() {
		let i;
		do
			i = w$1();
		while (i >= 12 && i <= 15);
		return i;
	}
	return {
		setPosition: V,
		getPosition: () => e,
		scan: l ? j$1 : w$1,
		getToken: () => k$1,
		getTokenValue: () => u,
		getTokenOffset: () => p,
		getTokenLength: () => e - p,
		getTokenStartLine: () => o,
		getTokenStartCharacter: () => p - B,
		getTokenError: () => b$1
	};
}
function J(n) {
	return n === 32 || n === 9;
}
function r(n) {
	return n === 10 || n === 13;
}
function L(n) {
	return n >= 48 && n <= 57;
}
var Q;
(function(n) {
	n[n.lineFeed = 10] = "lineFeed", n[n.carriageReturn = 13] = "carriageReturn", n[n.space = 32] = "space", n[n._0 = 48] = "_0", n[n._1 = 49] = "_1", n[n._2 = 50] = "_2", n[n._3 = 51] = "_3", n[n._4 = 52] = "_4", n[n._5 = 53] = "_5", n[n._6 = 54] = "_6", n[n._7 = 55] = "_7", n[n._8 = 56] = "_8", n[n._9 = 57] = "_9", n[n.a = 97] = "a", n[n.b = 98] = "b", n[n.c = 99] = "c", n[n.d = 100] = "d", n[n.e = 101] = "e", n[n.f = 102] = "f", n[n.g = 103] = "g", n[n.h = 104] = "h", n[n.i = 105] = "i", n[n.j = 106] = "j", n[n.k = 107] = "k", n[n.l = 108] = "l", n[n.m = 109] = "m", n[n.n = 110] = "n", n[n.o = 111] = "o", n[n.p = 112] = "p", n[n.q = 113] = "q", n[n.r = 114] = "r", n[n.s = 115] = "s", n[n.t = 116] = "t", n[n.u = 117] = "u", n[n.v = 118] = "v", n[n.w = 119] = "w", n[n.x = 120] = "x", n[n.y = 121] = "y", n[n.z = 122] = "z", n[n.A = 65] = "A", n[n.B = 66] = "B", n[n.C = 67] = "C", n[n.D = 68] = "D", n[n.E = 69] = "E", n[n.F = 70] = "F", n[n.G = 71] = "G", n[n.H = 72] = "H", n[n.I = 73] = "I", n[n.J = 74] = "J", n[n.K = 75] = "K", n[n.L = 76] = "L", n[n.M = 77] = "M", n[n.N = 78] = "N", n[n.O = 79] = "O", n[n.P = 80] = "P", n[n.Q = 81] = "Q", n[n.R = 82] = "R", n[n.S = 83] = "S", n[n.T = 84] = "T", n[n.U = 85] = "U", n[n.V = 86] = "V", n[n.W = 87] = "W", n[n.X = 88] = "X", n[n.Y = 89] = "Y", n[n.Z = 90] = "Z", n[n.asterisk = 42] = "asterisk", n[n.backslash = 92] = "backslash", n[n.closeBrace = 125] = "closeBrace", n[n.closeBracket = 93] = "closeBracket", n[n.colon = 58] = "colon", n[n.comma = 44] = "comma", n[n.dot = 46] = "dot", n[n.doubleQuote = 34] = "doubleQuote", n[n.minus = 45] = "minus", n[n.openBrace = 123] = "openBrace", n[n.openBracket = 91] = "openBracket", n[n.plus = 43] = "plus", n[n.slash = 47] = "slash", n[n.formFeed = 12] = "formFeed", n[n.tab = 9] = "tab";
})(Q || (Q = {})), new Array(20).fill(0).map((n, l) => " ".repeat(l));
const N$1 = 200;
new Array(N$1).fill(0).map((n, l) => `
` + " ".repeat(l)), new Array(N$1).fill(0).map((n, l) => "\r" + " ".repeat(l)), new Array(N$1).fill(0).map((n, l) => `\r
` + " ".repeat(l)), new Array(N$1).fill(0).map((n, l) => `
` + "	".repeat(l)), new Array(N$1).fill(0).map((n, l) => "\r" + "	".repeat(l)), new Array(N$1).fill(0).map((n, l) => `\r
` + "	".repeat(l));
var U;
(function(n) {
	n.DEFAULT = { allowTrailingComma: !1 };
})(U || (U = {}));
function S$1(n, l = [], g$1 = U.DEFAULT) {
	let e = null, u = [];
	const p = [];
	function k$1(o) {
		Array.isArray(u) ? u.push(o) : e !== null && (u[e] = o);
	}
	return P(n, {
		onObjectBegin: () => {
			const o = {};
			k$1(o), p.push(u), u = o, e = null;
		},
		onObjectProperty: (o) => {
			e = o;
		},
		onObjectEnd: () => {
			u = p.pop();
		},
		onArrayBegin: () => {
			const o = [];
			k$1(o), p.push(u), u = o, e = null;
		},
		onArrayEnd: () => {
			u = p.pop();
		},
		onLiteralValue: k$1,
		onError: (o, O$1, B) => {
			l.push({
				error: o,
				offset: O$1,
				length: B
			});
		}
	}, g$1), u[0];
}
function P(n, l, g$1 = U.DEFAULT) {
	const e = $$1(n, !1), u = [];
	let p = 0;
	function k$1(f) {
		return f ? () => p === 0 && f(e.getTokenOffset(), e.getTokenLength(), e.getTokenStartLine(), e.getTokenStartCharacter()) : () => !0;
	}
	function A(f) {
		return f ? (m$1) => p === 0 && f(m$1, e.getTokenOffset(), e.getTokenLength(), e.getTokenStartLine(), e.getTokenStartCharacter()) : () => !0;
	}
	function o(f) {
		return f ? (m$1) => p === 0 && f(m$1, e.getTokenOffset(), e.getTokenLength(), e.getTokenStartLine(), e.getTokenStartCharacter(), () => u.slice()) : () => !0;
	}
	function O$1(f) {
		return f ? () => {
			p > 0 ? p++ : f(e.getTokenOffset(), e.getTokenLength(), e.getTokenStartLine(), e.getTokenStartCharacter(), () => u.slice()) === !1 && (p = 1);
		} : () => !0;
	}
	function B(f) {
		return f ? () => {
			p > 0 && p--, p === 0 && f(e.getTokenOffset(), e.getTokenLength(), e.getTokenStartLine(), e.getTokenStartCharacter());
		} : () => !0;
	}
	const b$1 = O$1(l.onObjectBegin), I$1 = o(l.onObjectProperty), V = B(l.onObjectEnd), F = O$1(l.onArrayBegin), a = B(l.onArrayEnd), w$1 = o(l.onLiteralValue), v$1 = A(l.onSeparator), j$1 = k$1(l.onComment), i = A(l.onError), T$1 = g$1 && g$1.disallowComments, s = g$1 && g$1.allowTrailingComma;
	function c() {
		for (;;) {
			const f = e.scan();
			switch (e.getTokenError()) {
				case 4:
					t(14);
					break;
				case 5:
					t(15);
					break;
				case 3:
					t(13);
					break;
				case 1:
					T$1 || t(11);
					break;
				case 2:
					t(12);
					break;
				case 6:
					t(16);
					break;
			}
			switch (f) {
				case 12:
				case 13:
					T$1 ? t(10) : j$1();
					break;
				case 16:
					t(1);
					break;
				case 15:
				case 14: break;
				default: return f;
			}
		}
	}
	function t(f, m$1 = [], y = []) {
		if (i(f), m$1.length + y.length > 0) {
			let _$1 = e.getToken();
			for (; _$1 !== 17;) {
				if (m$1.indexOf(_$1) !== -1) {
					c();
					break;
				} else if (y.indexOf(_$1) !== -1) break;
				_$1 = c();
			}
		}
	}
	function D(f) {
		const m$1 = e.getTokenValue();
		return f ? w$1(m$1) : (I$1(m$1), u.push(m$1)), c(), !0;
	}
	function G() {
		switch (e.getToken()) {
			case 11:
				const f = e.getTokenValue();
				let m$1 = Number(f);
				isNaN(m$1) && (t(2), m$1 = 0), w$1(m$1);
				break;
			case 7:
				w$1(null);
				break;
			case 8:
				w$1(!0);
				break;
			case 9:
				w$1(!1);
				break;
			default: return !1;
		}
		return c(), !0;
	}
	function M() {
		return e.getToken() !== 10 ? (t(3, [], [2, 5]), !1) : (D(!1), e.getToken() === 6 ? (v$1(":"), c(), E$1() || t(4, [], [2, 5])) : t(5, [], [2, 5]), u.pop(), !0);
	}
	function X() {
		b$1(), c();
		let f = !1;
		for (; e.getToken() !== 2 && e.getToken() !== 17;) {
			if (e.getToken() === 5) {
				if (f || t(4, [], []), v$1(","), c(), e.getToken() === 2 && s) break;
			} else f && t(6, [], []);
			M() || t(4, [], [2, 5]), f = !0;
		}
		return V(), e.getToken() !== 2 ? t(7, [2], []) : c(), !0;
	}
	function Y() {
		F(), c();
		let f = !0, m$1 = !1;
		for (; e.getToken() !== 4 && e.getToken() !== 17;) {
			if (e.getToken() === 5) {
				if (m$1 || t(4, [], []), v$1(","), c(), e.getToken() === 4 && s) break;
			} else m$1 && t(6, [], []);
			f ? (u.push(0), f = !1) : u[u.length - 1]++, E$1() || t(4, [], [4, 5]), m$1 = !0;
		}
		return a(), f || u.pop(), e.getToken() !== 4 ? t(8, [4], []) : c(), !0;
	}
	function E$1() {
		switch (e.getToken()) {
			case 3: return Y();
			case 1: return X();
			case 10: return D(!0);
			default: return G();
		}
	}
	return c(), e.getToken() === 17 ? g$1.allowEmptyContent ? !0 : (t(4, [], []), !1) : E$1() ? (e.getToken() !== 17 && t(9, [], []), !0) : (t(4, [], []), !1);
}
var W;
(function(n) {
	n[n.None = 0] = "None", n[n.UnexpectedEndOfComment = 1] = "UnexpectedEndOfComment", n[n.UnexpectedEndOfString = 2] = "UnexpectedEndOfString", n[n.UnexpectedEndOfNumber = 3] = "UnexpectedEndOfNumber", n[n.InvalidUnicode = 4] = "InvalidUnicode", n[n.InvalidEscapeCharacter = 5] = "InvalidEscapeCharacter", n[n.InvalidCharacter = 6] = "InvalidCharacter";
})(W || (W = {}));
var H;
(function(n) {
	n[n.OpenBraceToken = 1] = "OpenBraceToken", n[n.CloseBraceToken = 2] = "CloseBraceToken", n[n.OpenBracketToken = 3] = "OpenBracketToken", n[n.CloseBracketToken = 4] = "CloseBracketToken", n[n.CommaToken = 5] = "CommaToken", n[n.ColonToken = 6] = "ColonToken", n[n.NullKeyword = 7] = "NullKeyword", n[n.TrueKeyword = 8] = "TrueKeyword", n[n.FalseKeyword = 9] = "FalseKeyword", n[n.StringLiteral = 10] = "StringLiteral", n[n.NumericLiteral = 11] = "NumericLiteral", n[n.LineCommentTrivia = 12] = "LineCommentTrivia", n[n.BlockCommentTrivia = 13] = "BlockCommentTrivia", n[n.LineBreakTrivia = 14] = "LineBreakTrivia", n[n.Trivia = 15] = "Trivia", n[n.Unknown = 16] = "Unknown", n[n.EOF = 17] = "EOF";
})(H || (H = {}));
const K = S$1;
var q;
(function(n) {
	n[n.InvalidSymbol = 1] = "InvalidSymbol", n[n.InvalidNumberFormat = 2] = "InvalidNumberFormat", n[n.PropertyNameExpected = 3] = "PropertyNameExpected", n[n.ValueExpected = 4] = "ValueExpected", n[n.ColonExpected = 5] = "ColonExpected", n[n.CommaExpected = 6] = "CommaExpected", n[n.CloseBraceExpected = 7] = "CloseBraceExpected", n[n.CloseBracketExpected = 8] = "CloseBracketExpected", n[n.EndOfFileExpected = 9] = "EndOfFileExpected", n[n.InvalidCommentToken = 10] = "InvalidCommentToken", n[n.UnexpectedEndOfComment = 11] = "UnexpectedEndOfComment", n[n.UnexpectedEndOfString = 12] = "UnexpectedEndOfString", n[n.UnexpectedEndOfNumber = 13] = "UnexpectedEndOfNumber", n[n.InvalidUnicode = 14] = "InvalidUnicode", n[n.InvalidEscapeCharacter = 15] = "InvalidEscapeCharacter", n[n.InvalidCharacter = 16] = "InvalidCharacter";
})(q || (q = {}));
function x(n, l) {
	const g$1 = JSON.parse(n, l?.reviver);
	return N(n, g$1, l), g$1;
}
function h(n, l) {
	const g$1 = K(n, l?.errors, l);
	return N(n, g$1, l), g$1;
}

//#endregion
//#region node_modules/.pnpm/confbox@0.2.2/node_modules/confbox/dist/ini.mjs
var O, x$1;
function j() {
	if (x$1) return O;
	x$1 = 1;
	const { hasOwnProperty: y } = Object.prototype, d$2 = (e, t = {}) => {
		typeof t == "string" && (t = { section: t }), t.align = t.align === !0, t.newline = t.newline === !0, t.sort = t.sort === !0, t.whitespace = t.whitespace === !0 || t.align === !0, t.platform = t.platform || typeof process < "u" && process.platform, t.bracketedArray = t.bracketedArray !== !1;
		const s = t.platform === "win32" ? `\r
` : `
`, r$1 = t.whitespace ? " = " : "=", c = [], o = t.sort ? Object.keys(e).sort() : Object.keys(e);
		let g$1 = 0;
		t.align && (g$1 = h$2(o.filter((n) => e[n] === null || Array.isArray(e[n]) || typeof e[n] != "object").map((n) => Array.isArray(e[n]) ? `${n}[]` : n).concat([""]).reduce((n, i) => h$2(n).length >= h$2(i).length ? n : i)).length);
		let l = "";
		const m$1 = t.bracketedArray ? "[]" : "";
		for (const n of o) {
			const i = e[n];
			if (i && Array.isArray(i)) for (const f of i) l += h$2(`${n}${m$1}`).padEnd(g$1, " ") + r$1 + h$2(f) + s;
			else i && typeof i == "object" ? c.push(n) : l += h$2(n).padEnd(g$1, " ") + r$1 + h$2(i) + s;
		}
		t.section && l.length && (l = "[" + h$2(t.section) + "]" + (t.newline ? s + s : s) + l);
		for (const n of c) {
			const i = k$1(n, ".").join("\\."), f = (t.section ? t.section + "." : "") + i, u = d$2(e[n], {
				...t,
				section: f
			});
			l.length && u.length && (l += s), l += u;
		}
		return l;
	};
	function k$1(e, t) {
		var s = 0, r$1 = 0, c = 0, o = [];
		do
			if (c = e.indexOf(t, s), c !== -1) {
				if (s = c + t.length, c > 0 && e[c - 1] === "\\") continue;
				o.push(e.slice(r$1, c)), r$1 = c + t.length;
			}
		while (c !== -1);
		return o.push(e.slice(r$1)), o;
	}
	const w$1 = (e, t = {}) => {
		t.bracketedArray = t.bracketedArray !== !1;
		const s = Object.create(null);
		let r$1 = s, c = null;
		const o = /^\[([^\]]*)\]\s*$|^([^=]+)(=(.*))?$/i, g$1 = e.split(/[\r\n]+/g), l = {};
		for (const n of g$1) {
			if (!n || n.match(/^\s*[;#]/) || n.match(/^\s*$/)) continue;
			const i = n.match(o);
			if (!i) continue;
			if (i[1] !== void 0) {
				if (c = A(i[1]), c === "__proto__") {
					r$1 = Object.create(null);
					continue;
				}
				r$1 = s[c] = s[c] || Object.create(null);
				continue;
			}
			const f = A(i[2]);
			let u;
			t.bracketedArray ? u = f.length > 2 && f.slice(-2) === "[]" : (l[f] = (l?.[f] || 0) + 1, u = l[f] > 1);
			const a = u && f.endsWith("[]") ? f.slice(0, -2) : f;
			if (a === "__proto__") continue;
			const p = i[3] ? A(i[4]) : !0, b$1 = p === "true" || p === "false" || p === "null" ? JSON.parse(p) : p;
			u && (y.call(r$1, a) ? Array.isArray(r$1[a]) || (r$1[a] = [r$1[a]]) : r$1[a] = []), Array.isArray(r$1[a]) ? r$1[a].push(b$1) : r$1[a] = b$1;
		}
		const m$1 = [];
		for (const n of Object.keys(s)) {
			if (!y.call(s, n) || typeof s[n] != "object" || Array.isArray(s[n])) continue;
			const i = k$1(n, ".");
			r$1 = s;
			const f = i.pop(), u = f.replace(/\\\./g, ".");
			for (const a of i) a !== "__proto__" && ((!y.call(r$1, a) || typeof r$1[a] != "object") && (r$1[a] = Object.create(null)), r$1 = r$1[a]);
			r$1 === s && u === f || (r$1[u] = s[n], m$1.push(n));
		}
		for (const n of m$1) delete s[n];
		return s;
	}, _$1 = (e) => e.startsWith("\"") && e.endsWith("\"") || e.startsWith("'") && e.endsWith("'"), h$2 = (e) => typeof e != "string" || e.match(/[=\r\n]/) || e.match(/^\[/) || e.length > 1 && _$1(e) || e !== e.trim() ? JSON.stringify(e) : e.split(";").join("\\;").split("#").join("\\#"), A = (e) => {
		if (e = (e || "").trim(), _$1(e)) {
			e.charAt(0) === "'" && (e = e.slice(1, -1));
			try {
				e = JSON.parse(e);
			} catch {}
		} else {
			let t = !1, s = "";
			for (let r$1 = 0, c = e.length; r$1 < c; r$1++) {
				const o = e.charAt(r$1);
				if (t) "\\;#".indexOf(o) !== -1 ? s += o : s += "\\" + o, t = !1;
				else {
					if (";#".indexOf(o) !== -1) break;
					o === "\\" ? t = !0 : s += o;
				}
			}
			return t && (s += "\\"), s.trim();
		}
		return e;
	};
	return O = {
		parse: w$1,
		decode: w$1,
		stringify: d$2,
		encode: d$2,
		safe: h$2,
		unsafe: A
	}, O;
}
var I = j();
function S(y, d$2) {
	return I.parse(y, d$2);
}

//#endregion
//#region node_modules/.pnpm/exsolve@1.0.8/node_modules/exsolve/dist/index.mjs
const nodeBuiltins = [
	"_http_agent",
	"_http_client",
	"_http_common",
	"_http_incoming",
	"_http_outgoing",
	"_http_server",
	"_stream_duplex",
	"_stream_passthrough",
	"_stream_readable",
	"_stream_transform",
	"_stream_wrap",
	"_stream_writable",
	"_tls_common",
	"_tls_wrap",
	"assert",
	"assert/strict",
	"async_hooks",
	"buffer",
	"child_process",
	"cluster",
	"console",
	"constants",
	"crypto",
	"dgram",
	"diagnostics_channel",
	"dns",
	"dns/promises",
	"domain",
	"events",
	"fs",
	"fs/promises",
	"http",
	"http2",
	"https",
	"inspector",
	"inspector/promises",
	"module",
	"net",
	"os",
	"path",
	"path/posix",
	"path/win32",
	"perf_hooks",
	"process",
	"punycode",
	"querystring",
	"readline",
	"readline/promises",
	"repl",
	"stream",
	"stream/consumers",
	"stream/promises",
	"stream/web",
	"string_decoder",
	"sys",
	"timers",
	"timers/promises",
	"tls",
	"trace_events",
	"tty",
	"url",
	"util",
	"util/types",
	"v8",
	"vm",
	"wasi",
	"worker_threads",
	"zlib"
];
const own$1 = {}.hasOwnProperty;
const classRegExp = /^([A-Z][a-z\d]*)+$/;
const kTypes = new Set([
	"string",
	"function",
	"number",
	"object",
	"Function",
	"Object",
	"boolean",
	"bigint",
	"symbol"
]);
const messages = /* @__PURE__ */ new Map();
const nodeInternalPrefix = "__node_internal_";
let userStackTraceLimit;
/**
* Create a list string in the form like 'A and B' or 'A, B, ..., and Z'.
* We cannot use Intl.ListFormat because it's not available in
* --without-intl builds.
*
* @param {Array<string>} array
*   An array of strings.
* @param {string} [type]
*   The list type to be inserted before the last element.
* @returns {string}
*/
function formatList(array, type = "and") {
	return array.length < 3 ? array.join(` ${type} `) : `${array.slice(0, -1).join(", ")}, ${type} ${array.at(-1)}`;
}
/**
* Utility function for registering the error codes.
*/
function createError(sym, value, constructor) {
	messages.set(sym, value);
	return makeNodeErrorWithCode(constructor, sym);
}
function makeNodeErrorWithCode(Base, key) {
	return function NodeError(...parameters) {
		const limit = Error.stackTraceLimit;
		if (isErrorStackTraceLimitWritable()) Error.stackTraceLimit = 0;
		const error = new Base();
		if (isErrorStackTraceLimitWritable()) Error.stackTraceLimit = limit;
		const message = getMessage(key, parameters, error);
		Object.defineProperties(error, {
			message: {
				value: message,
				enumerable: false,
				writable: true,
				configurable: true
			},
			toString: {
				value() {
					return `${this.name} [${key}]: ${this.message}`;
				},
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		captureLargerStackTrace(error);
		error.code = key;
		return error;
	};
}
function isErrorStackTraceLimitWritable() {
	try {
		if (v8.startupSnapshot.isBuildingSnapshot()) return false;
	} catch {}
	const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
	if (desc === void 0) return Object.isExtensible(Error);
	return own$1.call(desc, "writable") && desc.writable !== void 0 ? desc.writable : desc.set !== void 0;
}
/**
* This function removes unnecessary frames from Node.js core errors.
*/
function hideStackFrames(wrappedFunction) {
	const hidden = nodeInternalPrefix + wrappedFunction.name;
	Object.defineProperty(wrappedFunction, "name", { value: hidden });
	return wrappedFunction;
}
const captureLargerStackTrace = hideStackFrames(function(error) {
	const stackTraceLimitIsWritable = isErrorStackTraceLimitWritable();
	if (stackTraceLimitIsWritable) {
		userStackTraceLimit = Error.stackTraceLimit;
		Error.stackTraceLimit = Number.POSITIVE_INFINITY;
	}
	Error.captureStackTrace(error);
	if (stackTraceLimitIsWritable) Error.stackTraceLimit = userStackTraceLimit;
	return error;
});
function getMessage(key, parameters, self) {
	const message = messages.get(key);
	assert.ok(message !== void 0, "expected `message` to be found");
	if (typeof message === "function") {
		assert.ok(message.length <= parameters.length, `Code: ${key}; The provided arguments length (${parameters.length}) does not match the required ones (${message.length}).`);
		return Reflect.apply(message, self, parameters);
	}
	const regex = /%[dfijoOs]/g;
	let expectedLength = 0;
	while (regex.exec(message) !== null) expectedLength++;
	assert.ok(expectedLength === parameters.length, `Code: ${key}; The provided arguments length (${parameters.length}) does not match the required ones (${expectedLength}).`);
	if (parameters.length === 0) return message;
	parameters.unshift(message);
	return Reflect.apply(format, null, parameters);
}
/**
* Determine the specific type of a value for type-mismatch errors.
*/
function determineSpecificType(value) {
	if (value === null || value === void 0) return String(value);
	if (typeof value === "function" && value.name) return `function ${value.name}`;
	if (typeof value === "object") {
		if (value.constructor && value.constructor.name) return `an instance of ${value.constructor.name}`;
		return `${inspect(value, { depth: -1 })}`;
	}
	let inspected = inspect(value, { colors: false });
	if (inspected.length > 28) inspected = `${inspected.slice(0, 25)}...`;
	return `type ${typeof value} (${inspected})`;
}
createError("ERR_INVALID_ARG_TYPE", (name, expected, actual) => {
	assert.ok(typeof name === "string", "'name' must be a string");
	if (!Array.isArray(expected)) expected = [expected];
	let message = "The ";
	if (name.endsWith(" argument")) message += `${name} `;
	else {
		const type = name.includes(".") ? "property" : "argument";
		message += `"${name}" ${type} `;
	}
	message += "must be ";
	const types = [];
	const instances = [];
	const other = [];
	for (const value of expected) {
		assert.ok(typeof value === "string", "All expected entries have to be of type string");
		if (kTypes.has(value)) types.push(value.toLowerCase());
		else if (classRegExp.exec(value) === null) {
			assert.ok(value !== "object", "The value \"object\" should be written as \"Object\"");
			other.push(value);
		} else instances.push(value);
	}
	if (instances.length > 0) {
		const pos = types.indexOf("object");
		if (pos !== -1) {
			types.slice(pos, 1);
			instances.push("Object");
		}
	}
	if (types.length > 0) {
		message += `${types.length > 1 ? "one of type" : "of type"} ${formatList(types, "or")}`;
		if (instances.length > 0 || other.length > 0) message += " or ";
	}
	if (instances.length > 0) {
		message += `an instance of ${formatList(instances, "or")}`;
		if (other.length > 0) message += " or ";
	}
	if (other.length > 0) if (other.length > 1) message += `one of ${formatList(other, "or")}`;
	else {
		if (other[0]?.toLowerCase() !== other[0]) message += "an ";
		message += `${other[0]}`;
	}
	message += `. Received ${determineSpecificType(actual)}`;
	return message;
}, TypeError);
const ERR_INVALID_MODULE_SPECIFIER = createError(
	"ERR_INVALID_MODULE_SPECIFIER",
	/**
	* @param {string} request
	* @param {string} reason
	* @param {string} [base]
	*/
	(request, reason, base) => {
		return `Invalid module "${request}" ${reason}${base ? ` imported from ${base}` : ""}`;
	},
	TypeError
);
const ERR_INVALID_PACKAGE_CONFIG = createError("ERR_INVALID_PACKAGE_CONFIG", (path$1$1, base, message) => {
	return `Invalid package config ${path$1$1}${base ? ` while importing ${base}` : ""}${message ? `. ${message}` : ""}`;
}, Error);
const ERR_INVALID_PACKAGE_TARGET = createError("ERR_INVALID_PACKAGE_TARGET", (packagePath, key, target, isImport = false, base) => {
	const relatedError = typeof target === "string" && !isImport && target.length > 0 && !target.startsWith("./");
	if (key === ".") {
		assert.ok(isImport === false);
		return `Invalid "exports" main target ${JSON.stringify(target)} defined in the package config ${packagePath}package.json${base ? ` imported from ${base}` : ""}${relatedError ? "; targets must start with \"./\"" : ""}`;
	}
	return `Invalid "${isImport ? "imports" : "exports"}" target ${JSON.stringify(target)} defined for '${key}' in the package config ${packagePath}package.json${base ? ` imported from ${base}` : ""}${relatedError ? "; targets must start with \"./\"" : ""}`;
}, Error);
const ERR_MODULE_NOT_FOUND = createError("ERR_MODULE_NOT_FOUND", (path$1$1, base, exactUrl = false) => {
	return `Cannot find ${exactUrl ? "module" : "package"} '${path$1$1}' imported from ${base}`;
}, Error);
createError("ERR_NETWORK_IMPORT_DISALLOWED", "import of '%s' by %s is not supported: %s", Error);
const ERR_PACKAGE_IMPORT_NOT_DEFINED = createError("ERR_PACKAGE_IMPORT_NOT_DEFINED", (specifier, packagePath, base) => {
	return `Package import specifier "${specifier}" is not defined${packagePath ? ` in package ${packagePath || ""}package.json` : ""} imported from ${base}`;
}, TypeError);
const ERR_PACKAGE_PATH_NOT_EXPORTED = createError(
	"ERR_PACKAGE_PATH_NOT_EXPORTED",
	/**
	* @param {string} packagePath
	* @param {string} subpath
	* @param {string} [base]
	*/
	(packagePath, subpath, base) => {
		if (subpath === ".") return `No "exports" main defined in ${packagePath}package.json${base ? ` imported from ${base}` : ""}`;
		return `Package subpath '${subpath}' is not defined by "exports" in ${packagePath}package.json${base ? ` imported from ${base}` : ""}`;
	},
	Error
);
const ERR_UNSUPPORTED_DIR_IMPORT = createError("ERR_UNSUPPORTED_DIR_IMPORT", "Directory import '%s' is not supported resolving ES modules imported from %s", Error);
const ERR_UNSUPPORTED_RESOLVE_REQUEST = createError("ERR_UNSUPPORTED_RESOLVE_REQUEST", "Failed to resolve module specifier \"%s\" from \"%s\": Invalid relative URL or base scheme is not hierarchical.", TypeError);
const ERR_UNKNOWN_FILE_EXTENSION = createError("ERR_UNKNOWN_FILE_EXTENSION", (extension, path$1$1) => {
	return `Unknown file extension "${extension}" for ${path$1$1}`;
}, TypeError);
createError("ERR_INVALID_ARG_VALUE", (name, value, reason = "is invalid") => {
	let inspected = inspect(value);
	if (inspected.length > 128) inspected = `${inspected.slice(0, 128)}...`;
	return `The ${name.includes(".") ? "property" : "argument"} '${name}' ${reason}. Received ${inspected}`;
}, TypeError);
const hasOwnProperty$1 = {}.hasOwnProperty;
const cache = /* @__PURE__ */ new Map();
function read$1(jsonPath, { base, specifier }) {
	const existing = cache.get(jsonPath);
	if (existing) return existing;
	let string;
	try {
		string = fs.readFileSync(path.toNamespacedPath(jsonPath), "utf8");
	} catch (error) {
		const exception = error;
		if (exception.code !== "ENOENT") throw exception;
	}
	const result = {
		exists: false,
		pjsonPath: jsonPath,
		main: void 0,
		name: void 0,
		type: "none",
		exports: void 0,
		imports: void 0
	};
	if (string !== void 0) {
		let parsed;
		try {
			parsed = JSON.parse(string);
		} catch (error_) {
			const error = new ERR_INVALID_PACKAGE_CONFIG(jsonPath, (base ? `"${specifier}" from ` : "") + fileURLToPath(base || specifier), error_.message);
			error.cause = error_;
			throw error;
		}
		result.exists = true;
		if (hasOwnProperty$1.call(parsed, "name") && typeof parsed.name === "string") result.name = parsed.name;
		if (hasOwnProperty$1.call(parsed, "main") && typeof parsed.main === "string") result.main = parsed.main;
		if (hasOwnProperty$1.call(parsed, "exports")) result.exports = parsed.exports;
		if (hasOwnProperty$1.call(parsed, "imports")) result.imports = parsed.imports;
		if (hasOwnProperty$1.call(parsed, "type") && (parsed.type === "commonjs" || parsed.type === "module")) result.type = parsed.type;
	}
	cache.set(jsonPath, result);
	return result;
}
function getPackageScopeConfig(resolved) {
	let packageJSONUrl = new URL("package.json", resolved);
	while (true) {
		if (packageJSONUrl.pathname.endsWith("node_modules/package.json")) break;
		const packageConfig = read$1(fileURLToPath(packageJSONUrl), { specifier: resolved });
		if (packageConfig.exists) return packageConfig;
		const lastPackageJSONUrl = packageJSONUrl;
		packageJSONUrl = new URL("../package.json", packageJSONUrl);
		if (packageJSONUrl.pathname === lastPackageJSONUrl.pathname) break;
	}
	return {
		pjsonPath: fileURLToPath(packageJSONUrl),
		exists: false,
		type: "none"
	};
}
const hasOwnProperty = {}.hasOwnProperty;
const extensionFormatMap = {
	__proto__: null,
	".json": "json",
	".cjs": "commonjs",
	".cts": "commonjs",
	".js": "module",
	".ts": "module",
	".mts": "module",
	".mjs": "module"
};
const protocolHandlers = {
	__proto__: null,
	"data:": getDataProtocolModuleFormat,
	"file:": getFileProtocolModuleFormat,
	"node:": () => "builtin"
};
function mimeToFormat(mime) {
	if (mime && /\s*(text|application)\/javascript\s*(;\s*charset=utf-?8\s*)?/i.test(mime)) return "module";
	if (mime === "application/json") return "json";
	return null;
}
function getDataProtocolModuleFormat(parsed) {
	const { 1: mime } = /^([^/]+\/[^;,]+)[^,]*?(;base64)?,/.exec(parsed.pathname) || [
		null,
		null,
		null
	];
	return mimeToFormat(mime);
}
/**
* Returns the file extension from a URL.
*
* Should give similar result to
* `require('node:path').extname(require('node:url').fileURLToPath(url))`
* when used with a `file:` URL.
*
*/
function extname$2(url) {
	const pathname = url.pathname;
	let index = pathname.length;
	while (index--) {
		const code = pathname.codePointAt(index);
		if (code === 47) return "";
		if (code === 46) return pathname.codePointAt(index - 1) === 47 ? "" : pathname.slice(index);
	}
	return "";
}
function getFileProtocolModuleFormat(url, _context, ignoreErrors) {
	const ext = extname$2(url);
	if (ext === ".js") {
		const { type: packageType } = getPackageScopeConfig(url);
		if (packageType !== "none") return packageType;
		return "commonjs";
	}
	if (ext === "") {
		const { type: packageType } = getPackageScopeConfig(url);
		if (packageType === "none" || packageType === "commonjs") return "commonjs";
		return "module";
	}
	const format$1 = extensionFormatMap[ext];
	if (format$1) return format$1;
	if (ignoreErrors) return;
	throw new ERR_UNKNOWN_FILE_EXTENSION(ext, fileURLToPath(url));
}
function defaultGetFormatWithoutErrors(url, context) {
	const protocol = url.protocol;
	if (!hasOwnProperty.call(protocolHandlers, protocol)) return null;
	return protocolHandlers[protocol](url, context, true) || null;
}
const RegExpPrototypeSymbolReplace = RegExp.prototype[Symbol.replace];
const own = {}.hasOwnProperty;
const invalidSegmentRegEx = /(^|\\|\/)((\.|%2e)(\.|%2e)?|(n|%6e|%4e)(o|%6f|%4f)(d|%64|%44)(e|%65|%45)(_|%5f)(m|%6d|%4d)(o|%6f|%4f)(d|%64|%44)(u|%75|%55)(l|%6c|%4c)(e|%65|%45)(s|%73|%53))?(\\|\/|$)/i;
const deprecatedInvalidSegmentRegEx = /(^|\\|\/)((\.|%2e)(\.|%2e)?|(n|%6e|%4e)(o|%6f|%4f)(d|%64|%44)(e|%65|%45)(_|%5f)(m|%6d|%4d)(o|%6f|%4f)(d|%64|%44)(u|%75|%55)(l|%6c|%4c)(e|%65|%45)(s|%73|%53))(\\|\/|$)/i;
const invalidPackageNameRegEx = /^\.|%|\\/;
const patternRegEx = /\*/g;
const encodedSeparatorRegEx = /%2f|%5c/i;
const emittedPackageWarnings = /* @__PURE__ */ new Set();
const doubleSlashRegEx = /[/\\]{2}/;
function emitInvalidSegmentDeprecation(target, request, match, packageJsonUrl, internal, base, isTarget) {
	if (process$1.noDeprecation) return;
	const pjsonPath = fileURLToPath(packageJsonUrl);
	const double = doubleSlashRegEx.exec(isTarget ? target : request) !== null;
	process$1.emitWarning(`Use of deprecated ${double ? "double slash" : "leading or trailing slash matching"} resolving "${target}" for module request "${request}" ${request === match ? "" : `matched to "${match}" `}in the "${internal ? "imports" : "exports"}" field module resolution of the package at ${pjsonPath}${base ? ` imported from ${fileURLToPath(base)}` : ""}.`, "DeprecationWarning", "DEP0166");
}
function emitLegacyIndexDeprecation(url, packageJsonUrl, base, main) {
	if (process$1.noDeprecation) return;
	if (defaultGetFormatWithoutErrors(url, { parentURL: base.href }) !== "module") return;
	const urlPath = fileURLToPath(url.href);
	const packagePath = fileURLToPath(new URL$1(".", packageJsonUrl));
	const basePath = fileURLToPath(base);
	if (!main) process$1.emitWarning(`No "main" or "exports" field defined in the package.json for ${packagePath} resolving the main entry point "${urlPath.slice(packagePath.length)}", imported from ${basePath}.\nDefault "index" lookups for the main are deprecated for ES modules.`, "DeprecationWarning", "DEP0151");
	else if (path.resolve(packagePath, main) !== urlPath) process$1.emitWarning(`Package ${packagePath} has a "main" field set to "${main}", excluding the full filename and extension to the resolved file at "${urlPath.slice(packagePath.length)}", imported from ${basePath}.\n Automatic extension resolution of the "main" field is deprecated for ES modules.`, "DeprecationWarning", "DEP0151");
}
function tryStatSync(path$1$1) {
	try {
		return statSync(path$1$1);
	} catch {}
}
/**
* Legacy CommonJS main resolution:
* 1. let M = pkg_url + (json main field)
* 2. TRY(M, M.js, M.json, M.node)
* 3. TRY(M/index.js, M/index.json, M/index.node)
* 4. TRY(pkg_url/index.js, pkg_url/index.json, pkg_url/index.node)
* 5. NOT_FOUND
*/
function fileExists(url) {
	const stats = statSync(url, { throwIfNoEntry: false });
	const isFile = stats ? stats.isFile() : void 0;
	return isFile === null || isFile === void 0 ? false : isFile;
}
function legacyMainResolve(packageJsonUrl, packageConfig, base) {
	let guess;
	if (packageConfig.main !== void 0) {
		guess = new URL$1(packageConfig.main, packageJsonUrl);
		if (fileExists(guess)) return guess;
		const tries$1 = [
			`./${packageConfig.main}.js`,
			`./${packageConfig.main}.json`,
			`./${packageConfig.main}.node`,
			`./${packageConfig.main}/index.js`,
			`./${packageConfig.main}/index.json`,
			`./${packageConfig.main}/index.node`
		];
		let i$1 = -1;
		while (++i$1 < tries$1.length) {
			guess = new URL$1(tries$1[i$1], packageJsonUrl);
			if (fileExists(guess)) break;
			guess = void 0;
		}
		if (guess) {
			emitLegacyIndexDeprecation(guess, packageJsonUrl, base, packageConfig.main);
			return guess;
		}
	}
	const tries = [
		"./index.js",
		"./index.json",
		"./index.node"
	];
	let i = -1;
	while (++i < tries.length) {
		guess = new URL$1(tries[i], packageJsonUrl);
		if (fileExists(guess)) break;
		guess = void 0;
	}
	if (guess) {
		emitLegacyIndexDeprecation(guess, packageJsonUrl, base, packageConfig.main);
		return guess;
	}
	throw new ERR_MODULE_NOT_FOUND(fileURLToPath(new URL$1(".", packageJsonUrl)), fileURLToPath(base));
}
function finalizeResolution(resolved, base, preserveSymlinks) {
	if (encodedSeparatorRegEx.exec(resolved.pathname) !== null) throw new ERR_INVALID_MODULE_SPECIFIER(resolved.pathname, String.raw`must not include encoded "/" or "\" characters`, fileURLToPath(base));
	let filePath;
	try {
		filePath = fileURLToPath(resolved);
	} catch (error) {
		Object.defineProperty(error, "input", { value: String(resolved) });
		Object.defineProperty(error, "module", { value: String(base) });
		throw error;
	}
	const stats = tryStatSync(filePath.endsWith("/") ? filePath.slice(-1) : filePath);
	if (stats && stats.isDirectory()) {
		const error = new ERR_UNSUPPORTED_DIR_IMPORT(filePath, fileURLToPath(base));
		error.url = String(resolved);
		throw error;
	}
	if (!stats || !stats.isFile()) {
		const error = new ERR_MODULE_NOT_FOUND(filePath || resolved.pathname, base && fileURLToPath(base), true);
		error.url = String(resolved);
		throw error;
	}
	if (!preserveSymlinks) {
		const real = realpathSync(filePath);
		const { search, hash } = resolved;
		resolved = pathToFileURL(real + (filePath.endsWith(path.sep) ? "/" : ""));
		resolved.search = search;
		resolved.hash = hash;
	}
	return resolved;
}
function importNotDefined(specifier, packageJsonUrl, base) {
	return new ERR_PACKAGE_IMPORT_NOT_DEFINED(specifier, packageJsonUrl && fileURLToPath(new URL$1(".", packageJsonUrl)), fileURLToPath(base));
}
function exportsNotFound(subpath, packageJsonUrl, base) {
	return new ERR_PACKAGE_PATH_NOT_EXPORTED(fileURLToPath(new URL$1(".", packageJsonUrl)), subpath, base && fileURLToPath(base));
}
function throwInvalidSubpath(request, match, packageJsonUrl, internal, base) {
	throw new ERR_INVALID_MODULE_SPECIFIER(request, `request is not a valid match in pattern "${match}" for the "${internal ? "imports" : "exports"}" resolution of ${fileURLToPath(packageJsonUrl)}`, base && fileURLToPath(base));
}
function invalidPackageTarget(subpath, target, packageJsonUrl, internal, base) {
	target = typeof target === "object" && target !== null ? JSON.stringify(target, null, "") : `${target}`;
	return new ERR_INVALID_PACKAGE_TARGET(fileURLToPath(new URL$1(".", packageJsonUrl)), subpath, target, internal, base && fileURLToPath(base));
}
function resolvePackageTargetString(target, subpath, match, packageJsonUrl, base, pattern, internal, isPathMap, conditions) {
	if (subpath !== "" && !pattern && target.at(-1) !== "/") throw invalidPackageTarget(match, target, packageJsonUrl, internal, base);
	if (!target.startsWith("./")) {
		if (internal && !target.startsWith("../") && !target.startsWith("/")) {
			let isURL = false;
			try {
				new URL$1(target);
				isURL = true;
			} catch {}
			if (!isURL) return packageResolve(pattern ? RegExpPrototypeSymbolReplace.call(patternRegEx, target, () => subpath) : target + subpath, packageJsonUrl, conditions);
		}
		throw invalidPackageTarget(match, target, packageJsonUrl, internal, base);
	}
	if (invalidSegmentRegEx.exec(target.slice(2)) !== null) if (deprecatedInvalidSegmentRegEx.exec(target.slice(2)) === null) {
		if (!isPathMap) {
			const request = pattern ? match.replace("*", () => subpath) : match + subpath;
			emitInvalidSegmentDeprecation(pattern ? RegExpPrototypeSymbolReplace.call(patternRegEx, target, () => subpath) : target, request, match, packageJsonUrl, internal, base, true);
		}
	} else throw invalidPackageTarget(match, target, packageJsonUrl, internal, base);
	const resolved = new URL$1(target, packageJsonUrl);
	const resolvedPath = resolved.pathname;
	const packagePath = new URL$1(".", packageJsonUrl).pathname;
	if (!resolvedPath.startsWith(packagePath)) throw invalidPackageTarget(match, target, packageJsonUrl, internal, base);
	if (subpath === "") return resolved;
	if (invalidSegmentRegEx.exec(subpath) !== null) {
		const request = pattern ? match.replace("*", () => subpath) : match + subpath;
		if (deprecatedInvalidSegmentRegEx.exec(subpath) === null) {
			if (!isPathMap) emitInvalidSegmentDeprecation(pattern ? RegExpPrototypeSymbolReplace.call(patternRegEx, target, () => subpath) : target, request, match, packageJsonUrl, internal, base, false);
		} else throwInvalidSubpath(request, match, packageJsonUrl, internal, base);
	}
	if (pattern) return new URL$1(RegExpPrototypeSymbolReplace.call(patternRegEx, resolved.href, () => subpath));
	return new URL$1(subpath, resolved);
}
function isArrayIndex(key) {
	const keyNumber = Number(key);
	if (`${keyNumber}` !== key) return false;
	return keyNumber >= 0 && keyNumber < 4294967295;
}
function resolvePackageTarget(packageJsonUrl, target, subpath, packageSubpath, base, pattern, internal, isPathMap, conditions) {
	if (typeof target === "string") return resolvePackageTargetString(target, subpath, packageSubpath, packageJsonUrl, base, pattern, internal, isPathMap, conditions);
	if (Array.isArray(target)) {
		const targetList = target;
		if (targetList.length === 0) return null;
		let lastException;
		let i = -1;
		while (++i < targetList.length) {
			const targetItem = targetList[i];
			let resolveResult;
			try {
				resolveResult = resolvePackageTarget(packageJsonUrl, targetItem, subpath, packageSubpath, base, pattern, internal, isPathMap, conditions);
			} catch (error) {
				const exception = error;
				lastException = exception;
				if (exception.code === "ERR_INVALID_PACKAGE_TARGET") continue;
				throw error;
			}
			if (resolveResult === void 0) continue;
			if (resolveResult === null) {
				lastException = null;
				continue;
			}
			return resolveResult;
		}
		if (lastException === void 0 || lastException === null) return null;
		throw lastException;
	}
	if (typeof target === "object" && target !== null) {
		const keys = Object.getOwnPropertyNames(target);
		let i = -1;
		while (++i < keys.length) {
			const key = keys[i];
			if (isArrayIndex(key)) throw new ERR_INVALID_PACKAGE_CONFIG(fileURLToPath(packageJsonUrl), fileURLToPath(base), "\"exports\" cannot contain numeric property keys.");
		}
		i = -1;
		while (++i < keys.length) {
			const key = keys[i];
			if (key === "default" || conditions && conditions.has(key)) {
				const conditionalTarget = target[key];
				const resolveResult = resolvePackageTarget(packageJsonUrl, conditionalTarget, subpath, packageSubpath, base, pattern, internal, isPathMap, conditions);
				if (resolveResult === void 0) continue;
				return resolveResult;
			}
		}
		return null;
	}
	if (target === null) return null;
	throw invalidPackageTarget(packageSubpath, target, packageJsonUrl, internal, base);
}
function isConditionalExportsMainSugar(exports, packageJsonUrl, base) {
	if (typeof exports === "string" || Array.isArray(exports)) return true;
	if (typeof exports !== "object" || exports === null) return false;
	const keys = Object.getOwnPropertyNames(exports);
	let isConditionalSugar = false;
	let i = 0;
	let keyIndex = -1;
	while (++keyIndex < keys.length) {
		const key = keys[keyIndex];
		const currentIsConditionalSugar = key === "" || key[0] !== ".";
		if (i++ === 0) isConditionalSugar = currentIsConditionalSugar;
		else if (isConditionalSugar !== currentIsConditionalSugar) throw new ERR_INVALID_PACKAGE_CONFIG(fileURLToPath(packageJsonUrl), fileURLToPath(base), "\"exports\" cannot contain some keys starting with '.' and some not. The exports object must either be an object of package subpath keys or an object of main entry condition name keys only.");
	}
	return isConditionalSugar;
}
function emitTrailingSlashPatternDeprecation(match, pjsonUrl, base) {
	if (process$1.noDeprecation) return;
	const pjsonPath = fileURLToPath(pjsonUrl);
	if (emittedPackageWarnings.has(pjsonPath + "|" + match)) return;
	emittedPackageWarnings.add(pjsonPath + "|" + match);
	process$1.emitWarning(`Use of deprecated trailing slash pattern mapping "${match}" in the "exports" field module resolution of the package at ${pjsonPath}${base ? ` imported from ${fileURLToPath(base)}` : ""}. Mapping specifiers ending in "/" is no longer supported.`, "DeprecationWarning", "DEP0155");
}
function packageExportsResolve(packageJsonUrl, packageSubpath, packageConfig, base, conditions) {
	let exports = packageConfig.exports;
	if (isConditionalExportsMainSugar(exports, packageJsonUrl, base)) exports = { ".": exports };
	if (own.call(exports, packageSubpath) && !packageSubpath.includes("*") && !packageSubpath.endsWith("/")) {
		const target = exports[packageSubpath];
		const resolveResult = resolvePackageTarget(packageJsonUrl, target, "", packageSubpath, base, false, false, false, conditions);
		if (resolveResult === null || resolveResult === void 0) throw exportsNotFound(packageSubpath, packageJsonUrl, base);
		return resolveResult;
	}
	let bestMatch = "";
	let bestMatchSubpath = "";
	const keys = Object.getOwnPropertyNames(exports);
	let i = -1;
	while (++i < keys.length) {
		const key = keys[i];
		const patternIndex = key.indexOf("*");
		if (patternIndex !== -1 && packageSubpath.startsWith(key.slice(0, patternIndex))) {
			if (packageSubpath.endsWith("/")) emitTrailingSlashPatternDeprecation(packageSubpath, packageJsonUrl, base);
			const patternTrailer = key.slice(patternIndex + 1);
			if (packageSubpath.length >= key.length && packageSubpath.endsWith(patternTrailer) && patternKeyCompare(bestMatch, key) === 1 && key.lastIndexOf("*") === patternIndex) {
				bestMatch = key;
				bestMatchSubpath = packageSubpath.slice(patternIndex, packageSubpath.length - patternTrailer.length);
			}
		}
	}
	if (bestMatch) {
		const target = exports[bestMatch];
		const resolveResult = resolvePackageTarget(packageJsonUrl, target, bestMatchSubpath, bestMatch, base, true, false, packageSubpath.endsWith("/"), conditions);
		if (resolveResult === null || resolveResult === void 0) throw exportsNotFound(packageSubpath, packageJsonUrl, base);
		return resolveResult;
	}
	throw exportsNotFound(packageSubpath, packageJsonUrl, base);
}
function patternKeyCompare(a, b$1) {
	const aPatternIndex = a.indexOf("*");
	const bPatternIndex = b$1.indexOf("*");
	const baseLengthA = aPatternIndex === -1 ? a.length : aPatternIndex + 1;
	const baseLengthB = bPatternIndex === -1 ? b$1.length : bPatternIndex + 1;
	if (baseLengthA > baseLengthB) return -1;
	if (baseLengthB > baseLengthA) return 1;
	if (aPatternIndex === -1) return 1;
	if (bPatternIndex === -1) return -1;
	if (a.length > b$1.length) return -1;
	if (b$1.length > a.length) return 1;
	return 0;
}
function packageImportsResolve(name, base, conditions) {
	if (name === "#" || name.startsWith("#/") || name.endsWith("/")) throw new ERR_INVALID_MODULE_SPECIFIER(name, "is not a valid internal imports specifier name", fileURLToPath(base));
	let packageJsonUrl;
	const packageConfig = getPackageScopeConfig(base);
	if (packageConfig.exists) {
		packageJsonUrl = pathToFileURL(packageConfig.pjsonPath);
		const imports = packageConfig.imports;
		if (imports) if (own.call(imports, name) && !name.includes("*")) {
			const resolveResult = resolvePackageTarget(packageJsonUrl, imports[name], "", name, base, false, true, false, conditions);
			if (resolveResult !== null && resolveResult !== void 0) return resolveResult;
		} else {
			let bestMatch = "";
			let bestMatchSubpath = "";
			const keys = Object.getOwnPropertyNames(imports);
			let i = -1;
			while (++i < keys.length) {
				const key = keys[i];
				const patternIndex = key.indexOf("*");
				if (patternIndex !== -1 && name.startsWith(key.slice(0, -1))) {
					const patternTrailer = key.slice(patternIndex + 1);
					if (name.length >= key.length && name.endsWith(patternTrailer) && patternKeyCompare(bestMatch, key) === 1 && key.lastIndexOf("*") === patternIndex) {
						bestMatch = key;
						bestMatchSubpath = name.slice(patternIndex, name.length - patternTrailer.length);
					}
				}
			}
			if (bestMatch) {
				const target = imports[bestMatch];
				const resolveResult = resolvePackageTarget(packageJsonUrl, target, bestMatchSubpath, bestMatch, base, true, true, false, conditions);
				if (resolveResult !== null && resolveResult !== void 0) return resolveResult;
			}
		}
	}
	throw importNotDefined(name, packageJsonUrl, base);
}
/**
* @param {string} specifier
* @param {URL} base
*/
function parsePackageName(specifier, base) {
	let separatorIndex = specifier.indexOf("/");
	let validPackageName = true;
	let isScoped = false;
	if (specifier[0] === "@") {
		isScoped = true;
		if (separatorIndex === -1 || specifier.length === 0) validPackageName = false;
		else separatorIndex = specifier.indexOf("/", separatorIndex + 1);
	}
	const packageName = separatorIndex === -1 ? specifier : specifier.slice(0, separatorIndex);
	if (invalidPackageNameRegEx.exec(packageName) !== null) validPackageName = false;
	if (!validPackageName) throw new ERR_INVALID_MODULE_SPECIFIER(specifier, "is not a valid package name", fileURLToPath(base));
	return {
		packageName,
		packageSubpath: "." + (separatorIndex === -1 ? "" : specifier.slice(separatorIndex)),
		isScoped
	};
}
function packageResolve(specifier, base, conditions) {
	if (nodeBuiltins.includes(specifier)) return new URL$1("node:" + specifier);
	const { packageName, packageSubpath, isScoped } = parsePackageName(specifier, base);
	const packageConfig = getPackageScopeConfig(base);
	if (packageConfig.exists && packageConfig.name === packageName && packageConfig.exports !== void 0 && packageConfig.exports !== null) return packageExportsResolve(pathToFileURL(packageConfig.pjsonPath), packageSubpath, packageConfig, base, conditions);
	let packageJsonUrl = new URL$1("./node_modules/" + packageName + "/package.json", base);
	let packageJsonPath = fileURLToPath(packageJsonUrl);
	let lastPath;
	do {
		const stat$1 = tryStatSync(packageJsonPath.slice(0, -13));
		if (!stat$1 || !stat$1.isDirectory()) {
			lastPath = packageJsonPath;
			packageJsonUrl = new URL$1((isScoped ? "../../../../node_modules/" : "../../../node_modules/") + packageName + "/package.json", packageJsonUrl);
			packageJsonPath = fileURLToPath(packageJsonUrl);
			continue;
		}
		const packageConfig$1 = read$1(packageJsonPath, {
			base,
			specifier
		});
		if (packageConfig$1.exports !== void 0 && packageConfig$1.exports !== null) return packageExportsResolve(packageJsonUrl, packageSubpath, packageConfig$1, base, conditions);
		if (packageSubpath === ".") return legacyMainResolve(packageJsonUrl, packageConfig$1, base);
		return new URL$1(packageSubpath, packageJsonUrl);
	} while (packageJsonPath.length !== lastPath.length);
	throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), false);
}
function isRelativeSpecifier(specifier) {
	if (specifier[0] === ".") {
		if (specifier.length === 1 || specifier[1] === "/") return true;
		if (specifier[1] === "." && (specifier.length === 2 || specifier[2] === "/")) return true;
	}
	return false;
}
function shouldBeTreatedAsRelativeOrAbsolutePath(specifier) {
	if (specifier === "") return false;
	if (specifier[0] === "/") return true;
	return isRelativeSpecifier(specifier);
}
/**
* The “Resolver Algorithm Specification” as detailed in the Node docs (which is
* sync and slightly lower-level than `resolve`).
*
* @param {string} specifier
*   `/example.js`, `./example.js`, `../example.js`, `some-package`, `fs`, etc.
* @param {URL} base
*   Full URL (to a file) that `specifier` is resolved relative from.
* @param {Set<string>} [conditions]
*   Conditions.
* @param {boolean} [preserveSymlinks]
*   Keep symlinks instead of resolving them.
* @returns {URL}
*   A URL object to the found thing.
*/
function moduleResolve(specifier, base, conditions, preserveSymlinks) {
	const protocol = base.protocol;
	const isData = protocol === "data:";
	let resolved;
	if (shouldBeTreatedAsRelativeOrAbsolutePath(specifier)) try {
		resolved = new URL$1(specifier, base);
	} catch (error_) {
		const error = new ERR_UNSUPPORTED_RESOLVE_REQUEST(specifier, base);
		error.cause = error_;
		throw error;
	}
	else if (protocol === "file:" && specifier[0] === "#") resolved = packageImportsResolve(specifier, base, conditions);
	else try {
		resolved = new URL$1(specifier);
	} catch (error_) {
		if (isData && !nodeBuiltins.includes(specifier)) {
			const error = new ERR_UNSUPPORTED_RESOLVE_REQUEST(specifier, base);
			error.cause = error_;
			throw error;
		}
		resolved = packageResolve(specifier, base, conditions);
	}
	assert.ok(resolved !== void 0, "expected to be defined");
	if (resolved.protocol !== "file:") return resolved;
	return finalizeResolution(resolved, base, preserveSymlinks);
}
const DEFAULT_CONDITIONS_SET = /* @__PURE__ */ new Set(["node", "import"]);
const isWindows = /* @__PURE__ */ (() => process.platform === "win32")();
const globalCache = /* @__PURE__ */ (() => globalThis["__EXSOLVE_CACHE__"] ||= /* @__PURE__ */ new Map())();
/**
* Synchronously resolves a module url based on the options provided.
*
* @param {string} input - The identifier or path of the module to resolve.
* @param {ResolveOptions} [options] - Options to resolve the module. See {@link ResolveOptions}.
* @returns {string} The resolved URL as a string.
*/
function resolveModuleURL(input, options) {
	const parsedInput = _parseInput(input);
	if ("external" in parsedInput) return parsedInput.external;
	const specifier = parsedInput.specifier;
	let url = parsedInput.url;
	let absolutePath = parsedInput.absolutePath;
	let cacheKey;
	let cacheObj;
	if (options?.cache !== false) {
		cacheKey = _cacheKey(absolutePath || specifier, options);
		cacheObj = options?.cache && typeof options?.cache === "object" ? options.cache : globalCache;
	}
	if (cacheObj) {
		const cached = cacheObj.get(cacheKey);
		if (typeof cached === "string") return cached;
		if (cached instanceof Error) {
			if (options?.try) return;
			throw cached;
		}
	}
	if (absolutePath) try {
		const stat$1 = lstatSync(absolutePath);
		if (stat$1.isSymbolicLink()) {
			absolutePath = realpathSync(absolutePath);
			url = pathToFileURL(absolutePath);
		}
		if (stat$1.isFile()) {
			if (cacheObj) cacheObj.set(cacheKey, url.href);
			return url.href;
		}
	} catch (error) {
		if (error?.code !== "ENOENT") {
			if (cacheObj) cacheObj.set(cacheKey, error);
			throw error;
		}
	}
	const conditionsSet = options?.conditions ? new Set(options.conditions) : DEFAULT_CONDITIONS_SET;
	const target = specifier || url.href;
	const bases = _normalizeBases(options?.from);
	const suffixes = options?.suffixes || [""];
	const extensions = options?.extensions ? ["", ...options.extensions] : [""];
	let resolved;
	for (const base of bases) {
		for (const suffix of suffixes) {
			let name = _join(target, suffix);
			if (name === ".") name += "/.";
			for (const extension of extensions) {
				resolved = _tryModuleResolve(name + extension, base, conditionsSet);
				if (resolved) break;
			}
			if (resolved) break;
		}
		if (resolved) break;
	}
	if (!resolved) {
		const error = /* @__PURE__ */ new Error(`Cannot resolve module "${input}" (from: ${bases.map((u) => _fmtPath(u)).join(", ")})`);
		error.code = "ERR_MODULE_NOT_FOUND";
		if (cacheObj) cacheObj.set(cacheKey, error);
		if (options?.try) return;
		throw error;
	}
	if (cacheObj) cacheObj.set(cacheKey, resolved.href);
	return resolved.href;
}
/**
* Synchronously resolves a module then converts it to a file path
*
* (throws error if reolved path is not file:// scheme)
*
* @param {string} id - The identifier or path of the module to resolve.
* @param {ResolveOptions} [options] - Options to resolve the module. See {@link ResolveOptions}.
* @returns {string} The resolved URL as a string.
*/
function resolveModulePath(id, options) {
	const resolved = resolveModuleURL(id, options);
	if (!resolved) return;
	if (!resolved.startsWith("file://") && options?.try) return;
	const absolutePath = fileURLToPath(resolved);
	return isWindows ? _normalizeWinPath(absolutePath) : absolutePath;
}
function _tryModuleResolve(specifier, base, conditions) {
	try {
		return moduleResolve(specifier, base, conditions);
	} catch {}
}
function _normalizeBases(inputs) {
	const urls = (Array.isArray(inputs) ? inputs : [inputs]).flatMap((input) => _normalizeBase(input));
	if (urls.length === 0) return [pathToFileURL("./")];
	return urls;
}
function _normalizeBase(input) {
	if (!input) return [];
	if (_isURL(input)) return [input];
	if (typeof input !== "string") return [];
	if (/^(?:node|data|http|https|file):/.test(input)) return new URL(input);
	try {
		if (input.endsWith("/") || statSync(input).isDirectory()) return pathToFileURL(input + "/");
		return pathToFileURL(input);
	} catch {
		return [pathToFileURL(input + "/"), pathToFileURL(input)];
	}
}
function _fmtPath(input) {
	try {
		return fileURLToPath(input);
	} catch {
		return input;
	}
}
function _cacheKey(id, opts) {
	return JSON.stringify([
		id,
		(opts?.conditions || ["node", "import"]).sort(),
		opts?.extensions,
		opts?.from,
		opts?.suffixes
	]);
}
function _join(a, b$1) {
	if (!a || !b$1 || b$1 === "/") return a;
	return (a.endsWith("/") ? a : a + "/") + (b$1.startsWith("/") ? b$1.slice(1) : b$1);
}
function _normalizeWinPath(path$1$1) {
	return path$1$1.replace(/\\/g, "/").replace(/^[a-z]:\//, (r$1) => r$1.toUpperCase());
}
function _isURL(input) {
	return input instanceof URL || input?.constructor?.name === "URL";
}
function _parseInput(input) {
	if (typeof input === "string") {
		if (input.startsWith("file:")) {
			const url = new URL(input);
			return {
				url,
				absolutePath: fileURLToPath(url)
			};
		}
		if (isAbsolute(input)) return {
			url: pathToFileURL(input),
			absolutePath: input
		};
		if (/^(?:node|data|http|https):/.test(input)) return { external: input };
		if (nodeBuiltins.includes(input) && !input.includes(":")) return { external: `node:${input}` };
		return { specifier: input };
	}
	if (_isURL(input)) {
		if (input.protocol === "file:") return {
			url: input,
			absolutePath: fileURLToPath(input)
		};
		return { external: input.href };
	}
	throw new TypeError("id must be a `string` or `URL`");
}

//#endregion
//#region node_modules/.pnpm/pkg-types@2.3.0/node_modules/pkg-types/dist/index.mjs
const defaultFindOptions = {
	startingFrom: ".",
	rootPattern: /^node_modules$/,
	reverse: false,
	test: (filePath) => {
		try {
			if (statSync(filePath).isFile()) return true;
		} catch {}
	}
};
async function findFile(filename, _options = {}) {
	const filenames = Array.isArray(filename) ? filename : [filename];
	const options = {
		...defaultFindOptions,
		..._options
	};
	const basePath = resolve$1(options.startingFrom);
	const leadingSlash = basePath[0] === "/";
	const segments = basePath.split("/").filter(Boolean);
	if (filenames.includes(segments.at(-1)) && await options.test(basePath)) return basePath;
	if (leadingSlash) segments[0] = "/" + segments[0];
	let root = segments.findIndex((r$1) => r$1.match(options.rootPattern));
	if (root === -1) root = 0;
	if (options.reverse) for (let index = root + 1; index <= segments.length; index++) for (const filename2 of filenames) {
		const filePath = join$1(...segments.slice(0, index), filename2);
		if (await options.test(filePath)) return filePath;
	}
	else for (let index = segments.length; index > root; index--) for (const filename2 of filenames) {
		const filePath = join$1(...segments.slice(0, index), filename2);
		if (await options.test(filePath)) return filePath;
	}
	throw new Error(`Cannot find matching ${filename} in ${options.startingFrom} or parent directories`);
}
function findNearestFile(filename, options = {}) {
	return findFile(filename, options);
}
function _resolvePath(id, opts = {}) {
	if (id instanceof URL || id.startsWith("file://")) return normalize$1(fileURLToPath(id));
	if (isAbsolute$1(id)) return normalize$1(id);
	return resolveModulePath(id, {
		...opts,
		from: opts.from || opts.parent || opts.url
	});
}
const lockFiles = [
	"yarn.lock",
	"package-lock.json",
	"pnpm-lock.yaml",
	"npm-shrinkwrap.json",
	"bun.lockb",
	"bun.lock",
	"deno.lock"
];
const packageFiles = [
	"package.json",
	"package.json5",
	"package.yaml"
];
const workspaceFiles = [
	"pnpm-workspace.yaml",
	"lerna.json",
	"turbo.json",
	"rush.json",
	"deno.json",
	"deno.jsonc"
];
const FileCache = /* @__PURE__ */ new Map();
async function readPackageJSON(id, options = {}) {
	const resolvedPath = await resolvePackageJSON(id, options);
	const cache$1 = options.cache && typeof options.cache !== "boolean" ? options.cache : FileCache;
	if (options.cache && cache$1.has(resolvedPath)) return cache$1.get(resolvedPath);
	const blob = await promises.readFile(resolvedPath, "utf8");
	let parsed;
	try {
		parsed = x(blob);
	} catch {
		parsed = h(blob);
	}
	cache$1.set(resolvedPath, parsed);
	return parsed;
}
async function resolvePackageJSON(id = process.cwd(), options = {}) {
	return findNearestFile("package.json", {
		...options,
		startingFrom: _resolvePath(id, options)
	});
}
const workspaceTests = {
	workspaceFile: (opts) => findFile(workspaceFiles, opts).then((r$1) => dirname$1(r$1)),
	gitConfig: (opts) => findFile(".git/config", opts).then((r$1) => resolve$1(r$1, "../..")),
	lockFile: (opts) => findFile(lockFiles, opts).then((r$1) => dirname$1(r$1)),
	packageJson: (opts) => findFile(packageFiles, opts).then((r$1) => dirname$1(r$1))
};
async function findWorkspaceDir(id = process.cwd(), options = {}) {
	const startingFrom = _resolvePath(id, options);
	const tests = options.tests || [
		"workspaceFile",
		"gitConfig",
		"lockFile",
		"packageJson"
	];
	for (const testName of tests) {
		const test = workspaceTests[testName];
		if (options[testName] === false || !test) continue;
		const direction = options[testName] || (testName === "gitConfig" ? "closest" : "furthest");
		const detected = await test({
			...options,
			startingFrom,
			reverse: direction === "furthest"
		}).catch(() => {});
		if (detected) return detected;
	}
	throw new Error(`Cannot detect workspace root from ${id}`);
}
async function resolveGitConfig(dir, opts) {
	return findNearestFile(".git/config", {
		...opts,
		startingFrom: dir
	});
}
async function readGitConfig(dir, opts) {
	return parseGitConfig(await readFile(await resolveGitConfig(dir, opts), "utf8"));
}
function parseGitConfig(ini) {
	return S(ini.replaceAll(/^\[(\w+) "(.+)"\]$/gm, "[$1.$2]"));
}

//#endregion
//#region node_modules/.pnpm/rc9@2.1.2/node_modules/rc9/dist/index.mjs
function isBuffer(obj) {
	return obj && obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
}
function keyIdentity(key) {
	return key;
}
function flatten(target, opts) {
	opts = opts || {};
	const delimiter$1 = opts.delimiter || ".";
	const maxDepth = opts.maxDepth;
	const transformKey = opts.transformKey || keyIdentity;
	const output = {};
	function step(object, prev, currentDepth) {
		currentDepth = currentDepth || 1;
		Object.keys(object).forEach(function(key) {
			const value = object[key];
			const isarray = opts.safe && Array.isArray(value);
			const type = Object.prototype.toString.call(value);
			const isbuffer = isBuffer(value);
			const isobject = type === "[object Object]" || type === "[object Array]";
			const newKey = prev ? prev + delimiter$1 + transformKey(key) : transformKey(key);
			if (!isarray && !isbuffer && isobject && Object.keys(value).length && (!opts.maxDepth || currentDepth < maxDepth)) return step(value, newKey, currentDepth + 1);
			output[newKey] = value;
		});
	}
	step(target);
	return output;
}
function unflatten(target, opts) {
	opts = opts || {};
	const delimiter$1 = opts.delimiter || ".";
	const overwrite = opts.overwrite || false;
	const transformKey = opts.transformKey || keyIdentity;
	const result = {};
	if (isBuffer(target) || Object.prototype.toString.call(target) !== "[object Object]") return target;
	function getkey(key) {
		const parsedKey = Number(key);
		return isNaN(parsedKey) || key.indexOf(".") !== -1 || opts.object ? key : parsedKey;
	}
	function addKeys(keyPrefix, recipient, target$1) {
		return Object.keys(target$1).reduce(function(result$1, key) {
			result$1[keyPrefix + delimiter$1 + key] = target$1[key];
			return result$1;
		}, recipient);
	}
	function isEmpty(val) {
		const type = Object.prototype.toString.call(val);
		const isArray = type === "[object Array]";
		const isObject = type === "[object Object]";
		if (!val) return true;
		else if (isArray) return !val.length;
		else if (isObject) return !Object.keys(val).length;
	}
	target = Object.keys(target).reduce(function(result$1, key) {
		const type = Object.prototype.toString.call(target[key]);
		if (!(type === "[object Object]" || type === "[object Array]") || isEmpty(target[key])) {
			result$1[key] = target[key];
			return result$1;
		} else return addKeys(key, result$1, flatten(target[key], opts));
	}, {});
	Object.keys(target).forEach(function(key) {
		const split = key.split(delimiter$1).map(transformKey);
		let key1 = getkey(split.shift());
		let key2 = getkey(split[0]);
		let recipient = result;
		while (key2 !== void 0) {
			if (key1 === "__proto__") return;
			const type = Object.prototype.toString.call(recipient[key1]);
			const isobject = type === "[object Object]" || type === "[object Array]";
			if (!overwrite && !isobject && typeof recipient[key1] !== "undefined") return;
			if (overwrite && !isobject || !overwrite && recipient[key1] == null) recipient[key1] = typeof key2 === "number" && !opts.object ? [] : {};
			recipient = recipient[key1];
			if (split.length > 0) {
				key1 = getkey(split.shift());
				key2 = getkey(split[0]);
			}
		}
		recipient[key1] = unflatten(target[key], opts);
	});
	return result;
}
const RE_KEY_VAL = /^\s*([^\s=]+)\s*=\s*(.*)?\s*$/;
const RE_LINES = /\n|\r|\r\n/;
const defaults = {
	name: ".conf",
	dir: process.cwd(),
	flat: false
};
function withDefaults(options) {
	if (typeof options === "string") options = { name: options };
	return {
		...defaults,
		...options
	};
}
function parse$1(contents, options = {}) {
	const config$1 = {};
	const lines = contents.split(RE_LINES);
	for (const line of lines) {
		const match = line.match(RE_KEY_VAL);
		if (!match) continue;
		const key = match[1];
		if (!key || key === "__proto__" || key === "constructor") continue;
		const value = destr((match[2] || "").trim());
		if (key.endsWith("[]")) {
			const nkey = key.slice(0, Math.max(0, key.length - 2));
			config$1[nkey] = (config$1[nkey] || []).concat(value);
			continue;
		}
		config$1[key] = value;
	}
	return options.flat ? config$1 : unflatten(config$1, { overwrite: true });
}
function parseFile(path$2, options) {
	if (!existsSync(path$2)) return {};
	return parse$1(readFileSync(path$2, "utf8"), options);
}
function read(options) {
	options = withDefaults(options);
	return parseFile(resolve(options.dir, options.name), options);
}
function readUser(options) {
	options = withDefaults(options);
	options.dir = process.env.XDG_CONFIG_HOME || homedir();
	return read(options);
}

//#endregion
//#region node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/package.json
var require_package = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/package.json": ((exports, module) => {
	module.exports = {
		"name": "dotenv",
		"version": "17.2.3",
		"description": "Loads environment variables from .env file",
		"main": "lib/main.js",
		"types": "lib/main.d.ts",
		"exports": {
			".": {
				"types": "./lib/main.d.ts",
				"require": "./lib/main.js",
				"default": "./lib/main.js"
			},
			"./config": "./config.js",
			"./config.js": "./config.js",
			"./lib/env-options": "./lib/env-options.js",
			"./lib/env-options.js": "./lib/env-options.js",
			"./lib/cli-options": "./lib/cli-options.js",
			"./lib/cli-options.js": "./lib/cli-options.js",
			"./package.json": "./package.json"
		},
		"scripts": {
			"dts-check": "tsc --project tests/types/tsconfig.json",
			"lint": "standard",
			"pretest": "npm run lint && npm run dts-check",
			"test": "tap run tests/**/*.js --allow-empty-coverage --disable-coverage --timeout=60000",
			"test:coverage": "tap run tests/**/*.js --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
			"prerelease": "npm test",
			"release": "standard-version"
		},
		"repository": {
			"type": "git",
			"url": "git://github.com/motdotla/dotenv.git"
		},
		"homepage": "https://github.com/motdotla/dotenv#readme",
		"funding": "https://dotenvx.com",
		"keywords": [
			"dotenv",
			"env",
			".env",
			"environment",
			"variables",
			"config",
			"settings"
		],
		"readmeFilename": "README.md",
		"license": "BSD-2-Clause",
		"devDependencies": {
			"@types/node": "^18.11.3",
			"decache": "^4.6.2",
			"sinon": "^14.0.1",
			"standard": "^17.0.0",
			"standard-version": "^9.5.0",
			"tap": "^19.2.0",
			"typescript": "^4.8.4"
		},
		"engines": { "node": ">=12" },
		"browser": { "fs": false }
	};
}) });

//#endregion
//#region node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/lib/main.js
var require_main = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/lib/main.js": ((exports, module) => {
	const fs$1 = __require("fs");
	const path$1 = __require("path");
	const os$1 = __require("os");
	const crypto = __require("crypto");
	const version = require_package().version;
	const TIPS = [
		"🔐 encrypt with Dotenvx: https://dotenvx.com",
		"🔐 prevent committing .env to code: https://dotenvx.com/precommit",
		"🔐 prevent building .env in docker: https://dotenvx.com/prebuild",
		"📡 add observability to secrets: https://dotenvx.com/ops",
		"👥 sync secrets across teammates & machines: https://dotenvx.com/ops",
		"🗂️ backup and recover secrets: https://dotenvx.com/ops",
		"✅ audit secrets and track compliance: https://dotenvx.com/ops",
		"🔄 add secrets lifecycle management: https://dotenvx.com/ops",
		"🔑 add access controls to secrets: https://dotenvx.com/ops",
		"🛠️  run anywhere with `dotenvx run -- yourcommand`",
		"⚙️  specify custom .env file path with { path: '/custom/path/.env' }",
		"⚙️  enable debug logging with { debug: true }",
		"⚙️  override existing env vars with { override: true }",
		"⚙️  suppress all logs with { quiet: true }",
		"⚙️  write to custom object with { processEnv: myObject }",
		"⚙️  load multiple .env files with { path: ['.env.local', '.env'] }"
	];
	function _getRandomTip() {
		return TIPS[Math.floor(Math.random() * TIPS.length)];
	}
	function parseBoolean(value) {
		if (typeof value === "string") return ![
			"false",
			"0",
			"no",
			"off",
			""
		].includes(value.toLowerCase());
		return Boolean(value);
	}
	function supportsAnsi() {
		return process.stdout.isTTY;
	}
	function dim(text) {
		return supportsAnsi() ? `\x1b[2m${text}\x1b[0m` : text;
	}
	const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;
	function parse(src) {
		const obj = {};
		let lines = src.toString();
		lines = lines.replace(/\r\n?/gm, "\n");
		let match;
		while ((match = LINE.exec(lines)) != null) {
			const key = match[1];
			let value = match[2] || "";
			value = value.trim();
			const maybeQuote = value[0];
			value = value.replace(/^(['"`])([\s\S]*)\1$/gm, "$2");
			if (maybeQuote === "\"") {
				value = value.replace(/\\n/g, "\n");
				value = value.replace(/\\r/g, "\r");
			}
			obj[key] = value;
		}
		return obj;
	}
	function _parseVault(options) {
		options = options || {};
		const vaultPath = _vaultPath(options);
		options.path = vaultPath;
		const result = DotenvModule.configDotenv(options);
		if (!result.parsed) {
			const err = /* @__PURE__ */ new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
			err.code = "MISSING_DATA";
			throw err;
		}
		const keys = _dotenvKey(options).split(",");
		const length = keys.length;
		let decrypted;
		for (let i = 0; i < length; i++) try {
			const attrs = _instructions(result, keys[i].trim());
			decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
			break;
		} catch (error) {
			if (i + 1 >= length) throw error;
		}
		return DotenvModule.parse(decrypted);
	}
	function _warn(message) {
		console.error(`[dotenv@${version}][WARN] ${message}`);
	}
	function _debug(message) {
		console.log(`[dotenv@${version}][DEBUG] ${message}`);
	}
	function _log(message) {
		console.log(`[dotenv@${version}] ${message}`);
	}
	function _dotenvKey(options) {
		if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) return options.DOTENV_KEY;
		if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) return process.env.DOTENV_KEY;
		return "";
	}
	function _instructions(result, dotenvKey) {
		let uri;
		try {
			uri = new URL(dotenvKey);
		} catch (error) {
			if (error.code === "ERR_INVALID_URL") {
				const err = /* @__PURE__ */ new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
				err.code = "INVALID_DOTENV_KEY";
				throw err;
			}
			throw error;
		}
		const key = uri.password;
		if (!key) {
			const err = /* @__PURE__ */ new Error("INVALID_DOTENV_KEY: Missing key part");
			err.code = "INVALID_DOTENV_KEY";
			throw err;
		}
		const environment = uri.searchParams.get("environment");
		if (!environment) {
			const err = /* @__PURE__ */ new Error("INVALID_DOTENV_KEY: Missing environment part");
			err.code = "INVALID_DOTENV_KEY";
			throw err;
		}
		const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
		const ciphertext = result.parsed[environmentKey];
		if (!ciphertext) {
			const err = /* @__PURE__ */ new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
			err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
			throw err;
		}
		return {
			ciphertext,
			key
		};
	}
	function _vaultPath(options) {
		let possibleVaultPath = null;
		if (options && options.path && options.path.length > 0) if (Array.isArray(options.path)) {
			for (const filepath of options.path) if (fs$1.existsSync(filepath)) possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
		} else possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
		else possibleVaultPath = path$1.resolve(process.cwd(), ".env.vault");
		if (fs$1.existsSync(possibleVaultPath)) return possibleVaultPath;
		return null;
	}
	function _resolveHome(envPath) {
		return envPath[0] === "~" ? path$1.join(os$1.homedir(), envPath.slice(1)) : envPath;
	}
	function _configVault(options) {
		const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
		const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
		if (debug || !quiet) _log("Loading env from encrypted .env.vault");
		const parsed = DotenvModule._parseVault(options);
		let processEnv = process.env;
		if (options && options.processEnv != null) processEnv = options.processEnv;
		DotenvModule.populate(processEnv, parsed, options);
		return { parsed };
	}
	function configDotenv(options) {
		const dotenvPath = path$1.resolve(process.cwd(), ".env");
		let encoding = "utf8";
		let processEnv = process.env;
		if (options && options.processEnv != null) processEnv = options.processEnv;
		let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
		let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
		if (options && options.encoding) encoding = options.encoding;
		else if (debug) _debug("No encoding is specified. UTF-8 is used by default");
		let optionPaths = [dotenvPath];
		if (options && options.path) if (!Array.isArray(options.path)) optionPaths = [_resolveHome(options.path)];
		else {
			optionPaths = [];
			for (const filepath of options.path) optionPaths.push(_resolveHome(filepath));
		}
		let lastError;
		const parsedAll = {};
		for (const path$2 of optionPaths) try {
			const parsed = DotenvModule.parse(fs$1.readFileSync(path$2, { encoding }));
			DotenvModule.populate(parsedAll, parsed, options);
		} catch (e) {
			if (debug) _debug(`Failed to load ${path$2} ${e.message}`);
			lastError = e;
		}
		const populated = DotenvModule.populate(processEnv, parsedAll, options);
		debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
		quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
		if (debug || !quiet) {
			const keysCount = Object.keys(populated).length;
			const shortPaths = [];
			for (const filePath of optionPaths) try {
				const relative$2 = path$1.relative(process.cwd(), filePath);
				shortPaths.push(relative$2);
			} catch (e) {
				if (debug) _debug(`Failed to load ${filePath} ${e.message}`);
				lastError = e;
			}
			_log(`injecting env (${keysCount}) from ${shortPaths.join(",")} ${dim(`-- tip: ${_getRandomTip()}`)}`);
		}
		if (lastError) return {
			parsed: parsedAll,
			error: lastError
		};
		else return { parsed: parsedAll };
	}
	function config(options) {
		if (_dotenvKey(options).length === 0) return DotenvModule.configDotenv(options);
		const vaultPath = _vaultPath(options);
		if (!vaultPath) {
			_warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
			return DotenvModule.configDotenv(options);
		}
		return DotenvModule._configVault(options);
	}
	function decrypt(encrypted, keyStr) {
		const key = Buffer.from(keyStr.slice(-64), "hex");
		let ciphertext = Buffer.from(encrypted, "base64");
		const nonce = ciphertext.subarray(0, 12);
		const authTag = ciphertext.subarray(-16);
		ciphertext = ciphertext.subarray(12, -16);
		try {
			const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
			aesgcm.setAuthTag(authTag);
			return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
		} catch (error) {
			const isRange = error instanceof RangeError;
			const invalidKeyLength = error.message === "Invalid key length";
			const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
			if (isRange || invalidKeyLength) {
				const err = /* @__PURE__ */ new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
				err.code = "INVALID_DOTENV_KEY";
				throw err;
			} else if (decryptionFailed) {
				const err = /* @__PURE__ */ new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
				err.code = "DECRYPTION_FAILED";
				throw err;
			} else throw error;
		}
	}
	function populate(processEnv, parsed, options = {}) {
		const debug = Boolean(options && options.debug);
		const override = Boolean(options && options.override);
		const populated = {};
		if (typeof parsed !== "object") {
			const err = /* @__PURE__ */ new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
			err.code = "OBJECT_REQUIRED";
			throw err;
		}
		for (const key of Object.keys(parsed)) if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
			if (override === true) {
				processEnv[key] = parsed[key];
				populated[key] = parsed[key];
			}
			if (debug) if (override === true) _debug(`"${key}" is already defined and WAS overwritten`);
			else _debug(`"${key}" is already defined and was NOT overwritten`);
		} else {
			processEnv[key] = parsed[key];
			populated[key] = parsed[key];
		}
		return populated;
	}
	const DotenvModule = {
		configDotenv,
		_configVault,
		_parseVault,
		config,
		decrypt,
		parse,
		populate
	};
	module.exports.configDotenv = DotenvModule.configDotenv;
	module.exports._configVault = DotenvModule._configVault;
	module.exports._parseVault = DotenvModule._parseVault;
	module.exports.config = DotenvModule.config;
	module.exports.decrypt = DotenvModule.decrypt;
	module.exports.parse = DotenvModule.parse;
	module.exports.populate = DotenvModule.populate;
	module.exports = DotenvModule;
}) });

//#endregion
//#region node_modules/.pnpm/c12@3.3.1/node_modules/c12/dist/shared/c12.8GPsgFQh.mjs
var import_main$1 = /* @__PURE__ */ __toESM(require_main(), 1);
async function setupDotenv(options) {
	const targetEnvironment = options.env ?? process.env;
	const environment = await loadDotenv({
		cwd: options.cwd,
		fileName: options.fileName ?? ".env",
		env: targetEnvironment,
		interpolate: options.interpolate ?? true
	});
	const dotenvVars = getDotEnvVars(targetEnvironment);
	for (const key in environment) {
		if (key.startsWith("_")) continue;
		if (targetEnvironment[key] === void 0 || dotenvVars.has(key)) targetEnvironment[key] = environment[key];
	}
	return environment;
}
async function loadDotenv(options) {
	const environment = /* @__PURE__ */ Object.create(null);
	const cwd$2 = resolve$1(options.cwd || ".");
	const _fileName = options.fileName || ".env";
	const dotenvFiles = typeof _fileName === "string" ? [_fileName] : _fileName;
	const dotenvVars = getDotEnvVars(options.env || {});
	Object.assign(environment, options.env);
	for (const file of dotenvFiles) {
		const dotenvFile = resolve$1(cwd$2, file);
		if (!statSync(dotenvFile, { throwIfNoEntry: false })?.isFile()) continue;
		const parsed = import_main$1.parse(await promises.readFile(dotenvFile, "utf8"));
		for (const key in parsed) {
			if (key in environment && !dotenvVars.has(key)) continue;
			environment[key] = parsed[key];
			dotenvVars.add(key);
		}
	}
	if (options.interpolate) interpolate(environment);
	return environment;
}
function interpolate(target, source = {}, parse$3 = (v$1) => v$1) {
	function getValue(key) {
		return source[key] === void 0 ? target[key] : source[key];
	}
	function interpolate2(value, parents = []) {
		if (typeof value !== "string") return value;
		return parse$3((value.match(/(.?\${?(?:[\w:]+)?}?)/g) || []).reduce((newValue, match) => {
			const parts = /(.?)\${?([\w:]+)?}?/g.exec(match) || [];
			const prefix = parts[1];
			let value2, replacePart;
			if (prefix === "\\") {
				replacePart = parts[0] || "";
				value2 = replacePart.replace(String.raw`\$`, "$");
			} else {
				const key = parts[2];
				replacePart = (parts[0] || "").slice(prefix.length);
				if (parents.includes(key)) {
					console.warn(`Please avoid recursive environment variables ( loop: ${parents.join(" > ")} > ${key} )`);
					return "";
				}
				value2 = getValue(key);
				value2 = interpolate2(value2, [...parents, key]);
			}
			return value2 === void 0 ? newValue : newValue.replace(replacePart, value2);
		}, value));
	}
	for (const key in target) target[key] = interpolate2(getValue(key));
}
function getDotEnvVars(targetEnvironment) {
	const globalRegistry = globalThis.__c12_dotenv_vars__ ||= /* @__PURE__ */ new Map();
	if (!globalRegistry.has(targetEnvironment)) globalRegistry.set(targetEnvironment, /* @__PURE__ */ new Set());
	return globalRegistry.get(targetEnvironment);
}
const _normalize = (p) => p?.replace(/\\/g, "/");
const ASYNC_LOADERS = {
	".yaml": () => import("../cli/_chunks/yaml.mjs").then((r$1) => r$1.parseYAML),
	".yml": () => import("../cli/_chunks/yaml.mjs").then((r$1) => r$1.parseYAML),
	".jsonc": () => import("../cli/_chunks/jsonc.mjs").then((r$1) => r$1.parseJSONC),
	".json5": () => import("../cli/_chunks/json5.mjs").then((r$1) => r$1.parseJSON5),
	".toml": () => import("../cli/_chunks/toml.mjs").then((r$1) => r$1.parseTOML)
};
const SUPPORTED_EXTENSIONS = Object.freeze([
	".js",
	".ts",
	".mjs",
	".cjs",
	".mts",
	".cts",
	".json",
	".jsonc",
	".json5",
	".yaml",
	".yml",
	".toml"
]);
async function loadConfig(options) {
	options.cwd = resolve$1(process.cwd(), options.cwd || ".");
	options.name = options.name || "config";
	options.envName = options.envName ?? process.env.NODE_ENV;
	options.configFile = options.configFile ?? (options.name === "config" ? "config" : `${options.name}.config`);
	options.rcFile = options.rcFile ?? `.${options.name}rc`;
	if (options.extend !== false) options.extend = {
		extendKey: "extends",
		...options.extend
	};
	const _merger = options.merger || defu;
	options.jiti = options.jiti || createJiti(join$1(options.cwd, options.configFile), {
		interopDefault: true,
		moduleCache: false,
		extensions: [...SUPPORTED_EXTENSIONS],
		...options.jitiOptions
	});
	const r$1 = {
		config: {},
		cwd: options.cwd,
		configFile: resolve$1(options.cwd, options.configFile),
		layers: [],
		_configFile: void 0
	};
	const rawConfigs = {
		overrides: options.overrides,
		main: void 0,
		rc: void 0,
		packageJson: void 0,
		defaultConfig: options.defaultConfig
	};
	if (options.dotenv) await setupDotenv({
		cwd: options.cwd,
		...options.dotenv === true ? {} : options.dotenv
	});
	const _mainConfig = await resolveConfig(".", options);
	if (_mainConfig.configFile) {
		rawConfigs.main = _mainConfig.config;
		r$1.configFile = _mainConfig.configFile;
		r$1._configFile = _mainConfig._configFile;
	}
	if (_mainConfig.meta) r$1.meta = _mainConfig.meta;
	if (options.rcFile) {
		const rcSources = [];
		rcSources.push(read({
			name: options.rcFile,
			dir: options.cwd
		}));
		if (options.globalRc) {
			const workspaceDir = await findWorkspaceDir(options.cwd).catch(() => {});
			if (workspaceDir) rcSources.push(read({
				name: options.rcFile,
				dir: workspaceDir
			}));
			rcSources.push(readUser({
				name: options.rcFile,
				dir: options.cwd
			}));
		}
		rawConfigs.rc = _merger({}, ...rcSources);
	}
	if (options.packageJson) {
		const keys = (Array.isArray(options.packageJson) ? options.packageJson : [typeof options.packageJson === "string" ? options.packageJson : options.name]).filter((t) => t && typeof t === "string");
		const pkgJsonFile = await readPackageJSON(options.cwd).catch(() => {});
		rawConfigs.packageJson = _merger({}, ...keys.map((key) => pkgJsonFile?.[key]));
	}
	const configs = {};
	for (const key in rawConfigs) {
		const value = rawConfigs[key];
		configs[key] = await (typeof value === "function" ? value({
			configs,
			rawConfigs
		}) : value);
	}
	if (Array.isArray(configs.main)) r$1.config = configs.main;
	else {
		r$1.config = _merger(configs.overrides, configs.main, configs.rc, configs.packageJson, configs.defaultConfig);
		if (options.extend) {
			await extendConfig(r$1.config, options);
			r$1.layers = r$1.config._layers;
			delete r$1.config._layers;
			r$1.config = _merger(r$1.config, ...r$1.layers.map((e) => e.config));
		}
	}
	r$1.layers = [...[
		configs.overrides && {
			config: configs.overrides,
			configFile: void 0,
			cwd: void 0
		},
		{
			config: configs.main,
			configFile: options.configFile,
			cwd: options.cwd
		},
		configs.rc && {
			config: configs.rc,
			configFile: options.rcFile
		},
		configs.packageJson && {
			config: configs.packageJson,
			configFile: "package.json"
		}
	].filter((l) => l && l.config), ...r$1.layers];
	if (options.defaults) r$1.config = _merger(r$1.config, options.defaults);
	if (options.omit$Keys) {
		for (const key in r$1.config) if (key.startsWith("$")) delete r$1.config[key];
	}
	if (options.configFileRequired && !r$1._configFile) throw new Error(`Required config (${r$1.configFile}) cannot be resolved.`);
	return r$1;
}
async function extendConfig(config$1, options) {
	config$1._layers = config$1._layers || [];
	if (!options.extend) return;
	let keys = options.extend.extendKey;
	if (typeof keys === "string") keys = [keys];
	const extendSources = [];
	for (const key of keys) {
		extendSources.push(...(Array.isArray(config$1[key]) ? config$1[key] : [config$1[key]]).filter(Boolean));
		delete config$1[key];
	}
	for (let extendSource of extendSources) {
		const originalExtendSource = extendSource;
		let sourceOptions = {};
		if (extendSource.source) {
			sourceOptions = extendSource.options || {};
			extendSource = extendSource.source;
		}
		if (Array.isArray(extendSource)) {
			sourceOptions = extendSource[1] || {};
			extendSource = extendSource[0];
		}
		if (typeof extendSource !== "string") {
			console.warn(`Cannot extend config from \`${JSON.stringify(originalExtendSource)}\` in ${options.cwd}`);
			continue;
		}
		const _config = await resolveConfig(extendSource, options, sourceOptions);
		if (!_config.config) {
			console.warn(`Cannot extend config from \`${extendSource}\` in ${options.cwd}`);
			continue;
		}
		await extendConfig(_config.config, {
			...options,
			cwd: _config.cwd
		});
		config$1._layers.push(_config);
		if (_config.config._layers) {
			config$1._layers.push(..._config.config._layers);
			delete _config.config._layers;
		}
	}
}
const GIGET_PREFIXES = [
	"gh:",
	"github:",
	"gitlab:",
	"bitbucket:",
	"https://",
	"http://"
];
const NPM_PACKAGE_RE = /^(@[\da-z~-][\d._a-z~-]*\/)?[\da-z~-][\d._a-z~-]*($|\/.*)/;
async function resolveConfig(source, options, sourceOptions = {}) {
	if (options.resolve) {
		const res2 = await options.resolve(source, options);
		if (res2) return res2;
	}
	const _merger = options.merger || defu;
	const customProviderKeys = Object.keys(sourceOptions.giget?.providers || {}).map((key) => `${key}:`);
	const gigetPrefixes = customProviderKeys.length > 0 ? [.../* @__PURE__ */ new Set([...customProviderKeys, ...GIGET_PREFIXES])] : GIGET_PREFIXES;
	if (options.giget !== false && gigetPrefixes.some((prefix) => source.startsWith(prefix))) {
		const { downloadTemplate } = await import("../cli/_chunks/dist5.mjs");
		const { digest } = await import("ohash");
		const cloneName = source.replace(/\W+/g, "_").split("_").splice(0, 3).join("_") + "_" + digest(source).slice(0, 10).replace(/[-_]/g, "");
		let cloneDir;
		const localNodeModules = resolve$1(options.cwd, "node_modules");
		const parentDir = dirname$1(options.cwd);
		if (basename$1(parentDir) === ".c12") cloneDir = join$1(parentDir, cloneName);
		else if (existsSync(localNodeModules)) cloneDir = join$1(localNodeModules, ".c12", cloneName);
		else cloneDir = process.env.XDG_CACHE_HOME ? resolve$1(process.env.XDG_CACHE_HOME, "c12", cloneName) : resolve$1(homedir(), ".cache/c12", cloneName);
		if (existsSync(cloneDir) && !sourceOptions.install) await rm(cloneDir, { recursive: true });
		source = (await downloadTemplate(source, {
			dir: cloneDir,
			install: sourceOptions.install,
			force: sourceOptions.install,
			auth: sourceOptions.auth,
			...options.giget,
			...sourceOptions.giget
		})).dir;
	}
	if (NPM_PACKAGE_RE.test(source)) source = tryResolve(source, options) || source;
	const ext = extname$1(source);
	const isDir = !ext || ext === basename$1(source);
	const cwd$2 = resolve$1(options.cwd, isDir ? source : dirname$1(source));
	if (isDir) source = options.configFile;
	const res = {
		config: void 0,
		configFile: void 0,
		cwd: cwd$2,
		source,
		sourceOptions
	};
	res.configFile = tryResolve(resolve$1(cwd$2, source), options) || tryResolve(resolve$1(cwd$2, ".config", source.replace(/\.config$/, "")), options) || tryResolve(resolve$1(cwd$2, ".config", source), options) || source;
	if (!existsSync(res.configFile)) return res;
	res._configFile = res.configFile;
	const configFileExt = extname$1(res.configFile) || "";
	if (configFileExt in ASYNC_LOADERS) res.config = (await ASYNC_LOADERS[configFileExt]())(await readFile(res.configFile, "utf8"));
	else res.config = await options.jiti.import(res.configFile, { default: true });
	if (typeof res.config === "function") res.config = await res.config(options.context);
	if (options.envName) {
		const envConfig = {
			...res.config["$" + options.envName],
			...res.config.$env?.[options.envName]
		};
		if (Object.keys(envConfig).length > 0) res.config = _merger(envConfig, res.config);
	}
	res.meta = defu(res.sourceOptions.meta, res.config.$meta);
	delete res.config.$meta;
	if (res.sourceOptions.overrides) res.config = _merger(res.sourceOptions.overrides, res.config);
	res.configFile = _normalize(res.configFile);
	res.source = _normalize(res.source);
	return res;
}
function tryResolve(id, options) {
	const res = resolveModulePath(id, {
		try: true,
		from: pathToFileURL(join$1(options.cwd || ".", options.configFile || "/")),
		suffixes: ["", "/index"],
		extensions: SUPPORTED_EXTENSIONS,
		cache: false
	});
	return res ? normalize$1(res) : void 0;
}

//#endregion
//#region node_modules/.pnpm/perfect-debounce@2.0.0/node_modules/perfect-debounce/dist/index.mjs
const DEBOUNCE_DEFAULTS = { trailing: true };
/**
Debounce functions
@param fn - Promise-returning/async function to debounce.
@param wait - Milliseconds to wait before calling `fn`. Default value is 25ms
@returns A function that delays calling `fn` until after `wait` milliseconds have elapsed since the last time it was called.
@example
```
import { debounce } from 'perfect-debounce';
const expensiveCall = async input => input;
const debouncedFn = debounce(expensiveCall, 200);
for (const number of [1, 2, 3]) {
console.log(await debouncedFn(number));
}
//=> 1
//=> 2
//=> 3
```
*/
function debounce(fn, wait = 25, options = {}) {
	options = {
		...DEBOUNCE_DEFAULTS,
		...options
	};
	if (!Number.isFinite(wait)) throw new TypeError("Expected `wait` to be a finite number");
	let leadingValue;
	let timeout;
	let resolveList = [];
	let currentPromise;
	let trailingArgs;
	const applyFn = (_this, args) => {
		currentPromise = _applyPromised(fn, _this, args);
		currentPromise.finally(() => {
			currentPromise = null;
			if (options.trailing && trailingArgs && !timeout) {
				const promise = applyFn(_this, trailingArgs);
				trailingArgs = null;
				return promise;
			}
		});
		return currentPromise;
	};
	const debounced = function(...args) {
		if (options.trailing) trailingArgs = args;
		if (currentPromise) return currentPromise;
		return new Promise((resolve$2) => {
			const shouldCallNow = !timeout && options.leading;
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				timeout = null;
				const promise = options.leading ? leadingValue : applyFn(this, args);
				trailingArgs = null;
				for (const _resolve of resolveList) _resolve(promise);
				resolveList = [];
			}, wait);
			if (shouldCallNow) {
				leadingValue = applyFn(this, args);
				resolve$2(leadingValue);
			} else resolveList.push(resolve$2);
		});
	};
	const _clearTimeout = (timer) => {
		if (timer) {
			clearTimeout(timer);
			timeout = null;
		}
	};
	debounced.isPending = () => !!timeout;
	debounced.cancel = () => {
		_clearTimeout(timeout);
		resolveList = [];
		trailingArgs = null;
	};
	debounced.flush = () => {
		_clearTimeout(timeout);
		if (!trailingArgs || currentPromise) return;
		const args = trailingArgs;
		trailingArgs = null;
		return applyFn(this, args);
	};
	return debounced;
}
async function _applyPromised(fn, _this, args) {
	return await fn.apply(_this, args);
}

//#endregion
//#region node_modules/.pnpm/c12@3.3.1/node_modules/c12/dist/index.mjs
var import_main = /* @__PURE__ */ __toESM(require_main(), 1);
const eventMap = {
	add: "created",
	change: "updated",
	unlink: "removed"
};
async function watchConfig(options) {
	let config$1 = await loadConfig(options);
	const configName = options.name || "config";
	const configFileName = options.configFile ?? (options.name === "config" ? "config" : `${options.name}.config`);
	const watchingFiles = [...new Set((config$1.layers || []).filter((l) => l.cwd).flatMap((l) => [
		...SUPPORTED_EXTENSIONS.flatMap((ext) => [
			resolve$1(l.cwd, configFileName + ext),
			resolve$1(l.cwd, ".config", configFileName + ext),
			resolve$1(l.cwd, ".config", configFileName.replace(/\.config$/, "") + ext)
		]),
		l.source && resolve$1(l.cwd, l.source),
		options.rcFile && resolve$1(l.cwd, typeof options.rcFile === "string" ? options.rcFile : `.${configName}rc`),
		options.packageJson && resolve$1(l.cwd, "package.json")
	]).filter(Boolean))];
	const watch$1 = await import("../cli/_chunks/esm.mjs").then((r$1) => r$1.watch || r$1.default || r$1);
	const { diff } = await import("ohash/utils");
	const _fswatcher = watch$1(watchingFiles, {
		ignoreInitial: true,
		...options.chokidarOptions
	});
	const onChange = async (event, path$2) => {
		const type = eventMap[event];
		if (!type) return;
		if (options.onWatch) await options.onWatch({
			type,
			path: path$2
		});
		const oldConfig = config$1;
		try {
			config$1 = await loadConfig(options);
		} catch (error) {
			console.warn(`Failed to load config ${path$2}
${error}`);
			return;
		}
		const changeCtx = {
			newConfig: config$1,
			oldConfig,
			getDiff: () => diff(oldConfig.config, config$1.config)
		};
		if (options.acceptHMR) {
			if (await options.acceptHMR(changeCtx)) return;
		}
		if (options.onUpdate) await options.onUpdate(changeCtx);
	};
	if (options.debounce === false) _fswatcher.on("all", onChange);
	else _fswatcher.on("all", debounce(onChange, options.debounce ?? 100));
	const utils = {
		watchingFiles,
		unwatch: async () => {
			await _fswatcher.close();
		}
	};
	return new Proxy(utils, { get(_$1, prop) {
		if (prop in utils) return utils[prop];
		return config$1[prop];
	} });
}

//#endregion
export { isAbsolute$1 as C, parse$2 as D, normalizeWindowsPath as E, relative$1 as O, extname$1 as S, normalize$1 as T, h as _, loadDotenv as a, basename$1 as b, findNearestFile as c, readGitConfig as d, readPackageJSON as f, resolveModuleURL as g, resolveModulePath as h, loadConfig as i, resolve$1 as k, findWorkspaceDir as l, resolvePackageJSON as m, debounce as n, setupDotenv as o, resolveGitConfig as p, SUPPORTED_EXTENSIONS as r, findFile as s, watchConfig as t, parseGitConfig as u, C as v, join$1 as w, dirname$1 as x, N as y };