import { n as __require, t as __commonJS } from "../_chunks/Bqks5huO.mjs";

//#region node_modules/.pnpm/duplexer@0.1.2/node_modules/duplexer/index.js
var require_duplexer = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/duplexer@0.1.2/node_modules/duplexer/index.js": ((exports, module) => {
	var Stream = __require("stream");
	var writeMethods = [
		"write",
		"end",
		"destroy"
	];
	var readMethods = ["resume", "pause"];
	var readEvents = ["data", "close"];
	var slice = Array.prototype.slice;
	module.exports = duplex;
	function forEach(arr, fn) {
		if (arr.forEach) return arr.forEach(fn);
		for (var i = 0; i < arr.length; i++) fn(arr[i], i);
	}
	function duplex(writer, reader) {
		var stream = new Stream();
		var ended = false;
		forEach(writeMethods, proxyWriter);
		forEach(readMethods, proxyReader);
		forEach(readEvents, proxyStream);
		reader.on("end", handleEnd);
		writer.on("drain", function() {
			stream.emit("drain");
		});
		writer.on("error", reemit);
		reader.on("error", reemit);
		stream.writable = writer.writable;
		stream.readable = reader.readable;
		return stream;
		function proxyWriter(methodName) {
			stream[methodName] = method;
			function method() {
				return writer[methodName].apply(writer, arguments);
			}
		}
		function proxyReader(methodName) {
			stream[methodName] = method;
			function method() {
				stream.emit(methodName);
				var func = reader[methodName];
				if (func) return func.apply(reader, arguments);
				reader.emit(methodName);
			}
		}
		function proxyStream(methodName) {
			reader.on(methodName, reemit$1);
			function reemit$1() {
				var args = slice.call(arguments);
				args.unshift(methodName);
				stream.emit.apply(stream, args);
			}
		}
		function handleEnd() {
			if (ended) return;
			ended = true;
			var args = slice.call(arguments);
			args.unshift("end");
			stream.emit.apply(stream, args);
		}
		function reemit(err) {
			stream.emit("error", err);
		}
	}
}) });

//#endregion
export { require_duplexer as t };