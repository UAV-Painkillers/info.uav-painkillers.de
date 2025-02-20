var oe = Object.create;
var k = Object.defineProperty;
var ae = Object.getOwnPropertyDescriptor;
var se = Object.getOwnPropertyNames;
var ce = Object.getPrototypeOf,
  le = Object.prototype.hasOwnProperty;
var f = (t, e) => k(t, "name", { value: e, configurable: !0 }),
  E = ((t) =>
    typeof require < "u"
      ? require
      : typeof Proxy < "u"
        ? new Proxy(t, {
            get: (e, c) => (typeof require < "u" ? require : e)[c],
          })
        : t)(function (t) {
    if (typeof require < "u") return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + t + '" is not supported');
  });
var T = (t, e) => () => (e || t((e = { exports: {} }).exports, e), e.exports);
var de = (t, e, c, o) => {
  if ((e && typeof e == "object") || typeof e == "function")
    for (let a of se(e))
      !le.call(t, a) &&
        a !== c &&
        k(t, a, {
          get: () => e[a],
          enumerable: !(o = ae(e, a)) || o.enumerable,
        });
  return t;
};
var fe = (t, e, c) => (
  (c = t != null ? oe(ce(t)) : {}),
  de(
    e || !t || !t.__esModule
      ? k(c, "default", { value: t, enumerable: !0 })
      : c,
    t,
  )
);
var $ = T((R, U) => {
  (function (t, e) {
    "use strict";
    typeof define == "function" && define.amd
      ? define("stackframe", [], e)
      : typeof R == "object"
        ? (U.exports = e())
        : (t.StackFrame = e());
  })(R, function () {
    "use strict";
    function t(d) {
      return !isNaN(parseFloat(d)) && isFinite(d);
    }
    f(t, "_isNumber");
    function e(d) {
      return d.charAt(0).toUpperCase() + d.substring(1);
    }
    f(e, "_capitalize");
    function c(d) {
      return function () {
        return this[d];
      };
    }
    f(c, "_getter");
    var o = ["isConstructor", "isEval", "isNative", "isToplevel"],
      a = ["columnNumber", "lineNumber"],
      r = ["fileName", "functionName", "source"],
      n = ["args"],
      u = ["evalOrigin"],
      i = o.concat(a, r, n, u);
    function s(d) {
      if (d)
        for (var y = 0; y < i.length; y++)
          d[i[y]] !== void 0 && this["set" + e(i[y])](d[i[y]]);
    }
    f(s, "StackFrame"),
      (s.prototype = {
        getArgs: function () {
          return this.args;
        },
        setArgs: function (d) {
          if (Object.prototype.toString.call(d) !== "[object Array]")
            throw new TypeError("Args must be an Array");
          this.args = d;
        },
        getEvalOrigin: function () {
          return this.evalOrigin;
        },
        setEvalOrigin: function (d) {
          if (d instanceof s) this.evalOrigin = d;
          else if (d instanceof Object) this.evalOrigin = new s(d);
          else
            throw new TypeError("Eval Origin must be an Object or StackFrame");
        },
        toString: function () {
          var d = this.getFileName() || "",
            y = this.getLineNumber() || "",
            h = this.getColumnNumber() || "",
            v = this.getFunctionName() || "";
          return this.getIsEval()
            ? d
              ? "[eval] (" + d + ":" + y + ":" + h + ")"
              : "[eval]:" + y + ":" + h
            : v
              ? v + " (" + d + ":" + y + ":" + h + ")"
              : d + ":" + y + ":" + h;
        },
      }),
      (s.fromString = f(function (y) {
        var h = y.indexOf("("),
          v = y.lastIndexOf(")"),
          ee = y.substring(0, h),
          te = y.substring(h + 1, v).split(","),
          I = y.substring(v + 1);
        if (I.indexOf("@") === 0)
          var N = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(I, ""),
            re = N[1],
            ne = N[2],
            ie = N[3];
        return new s({
          functionName: ee,
          args: te || void 0,
          fileName: re,
          lineNumber: ne || void 0,
          columnNumber: ie || void 0,
        });
      }, "StackFrame$$fromString"));
    for (var l = 0; l < o.length; l++)
      (s.prototype["get" + e(o[l])] = c(o[l])),
        (s.prototype["set" + e(o[l])] = (function (d) {
          return function (y) {
            this[d] = !!y;
          };
        })(o[l]));
    for (var m = 0; m < a.length; m++)
      (s.prototype["get" + e(a[m])] = c(a[m])),
        (s.prototype["set" + e(a[m])] = (function (d) {
          return function (y) {
            if (!t(y)) throw new TypeError(d + " must be a Number");
            this[d] = Number(y);
          };
        })(a[m]));
    for (var p = 0; p < r.length; p++)
      (s.prototype["get" + e(r[p])] = c(r[p])),
        (s.prototype["set" + e(r[p])] = (function (d) {
          return function (y) {
            this[d] = String(y);
          };
        })(r[p]));
    return s;
  });
});
var C = T((x, M) => {
  (function (t, e) {
    "use strict";
    typeof define == "function" && define.amd
      ? define("error-stack-parser", ["stackframe"], e)
      : typeof x == "object"
        ? (M.exports = e($()))
        : (t.ErrorStackParser = e(t.StackFrame));
  })(
    x,
    f(function (e) {
      "use strict";
      var c = /(^|@)\S+:\d+/,
        o = /^\s*at .*(\S+:\d+|\(native\))/m,
        a = /^(eval@)?(\[native code])?$/;
      return {
        parse: f(function (n) {
          if (typeof n.stacktrace < "u" || typeof n["opera#sourceloc"] < "u")
            return this.parseOpera(n);
          if (n.stack && n.stack.match(o)) return this.parseV8OrIE(n);
          if (n.stack) return this.parseFFOrSafari(n);
          throw new Error("Cannot parse given Error object");
        }, "ErrorStackParser$$parse"),
        extractLocation: f(function (n) {
          if (n.indexOf(":") === -1) return [n];
          var u = /(.+?)(?::(\d+))?(?::(\d+))?$/,
            i = u.exec(n.replace(/[()]/g, ""));
          return [i[1], i[2] || void 0, i[3] || void 0];
        }, "ErrorStackParser$$extractLocation"),
        parseV8OrIE: f(function (n) {
          var u = n.stack
            .split(
              `
`,
            )
            .filter(function (i) {
              return !!i.match(o);
            }, this);
          return u.map(function (i) {
            i.indexOf("(eval ") > -1 &&
              (i = i
                .replace(/eval code/g, "eval")
                .replace(/(\(eval at [^()]*)|(,.*$)/g, ""));
            var s = i
                .replace(/^\s+/, "")
                .replace(/\(eval code/g, "(")
                .replace(/^.*?\s+/, ""),
              l = s.match(/ (\(.+\)$)/);
            s = l ? s.replace(l[0], "") : s;
            var m = this.extractLocation(l ? l[1] : s),
              p = (l && s) || void 0,
              d = ["eval", "<anonymous>"].indexOf(m[0]) > -1 ? void 0 : m[0];
            return new e({
              functionName: p,
              fileName: d,
              lineNumber: m[1],
              columnNumber: m[2],
              source: i,
            });
          }, this);
        }, "ErrorStackParser$$parseV8OrIE"),
        parseFFOrSafari: f(function (n) {
          var u = n.stack
            .split(
              `
`,
            )
            .filter(function (i) {
              return !i.match(a);
            }, this);
          return u.map(function (i) {
            if (
              (i.indexOf(" > eval") > -1 &&
                (i = i.replace(
                  / line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g,
                  ":$1",
                )),
              i.indexOf("@") === -1 && i.indexOf(":") === -1)
            )
              return new e({ functionName: i });
            var s = /((.*".+"[^@]*)?[^@]*)(?:@)/,
              l = i.match(s),
              m = l && l[1] ? l[1] : void 0,
              p = this.extractLocation(i.replace(s, ""));
            return new e({
              functionName: m,
              fileName: p[0],
              lineNumber: p[1],
              columnNumber: p[2],
              source: i,
            });
          }, this);
        }, "ErrorStackParser$$parseFFOrSafari"),
        parseOpera: f(function (n) {
          return !n.stacktrace ||
            (n.message.indexOf(`
`) > -1 &&
              n.message.split(`
`).length >
                n.stacktrace.split(`
`).length)
            ? this.parseOpera9(n)
            : n.stack
              ? this.parseOpera11(n)
              : this.parseOpera10(n);
        }, "ErrorStackParser$$parseOpera"),
        parseOpera9: f(function (n) {
          for (
            var u = /Line (\d+).*script (?:in )?(\S+)/i,
              i = n.message.split(`
`),
              s = [],
              l = 2,
              m = i.length;
            l < m;
            l += 2
          ) {
            var p = u.exec(i[l]);
            p &&
              s.push(new e({ fileName: p[2], lineNumber: p[1], source: i[l] }));
          }
          return s;
        }, "ErrorStackParser$$parseOpera9"),
        parseOpera10: f(function (n) {
          for (
            var u =
                /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i,
              i = n.stacktrace.split(`
`),
              s = [],
              l = 0,
              m = i.length;
            l < m;
            l += 2
          ) {
            var p = u.exec(i[l]);
            p &&
              s.push(
                new e({
                  functionName: p[3] || void 0,
                  fileName: p[2],
                  lineNumber: p[1],
                  source: i[l],
                }),
              );
          }
          return s;
        }, "ErrorStackParser$$parseOpera10"),
        parseOpera11: f(function (n) {
          var u = n.stack
            .split(
              `
`,
            )
            .filter(function (i) {
              return !!i.match(c) && !i.match(/^Error created at/);
            }, this);
          return u.map(function (i) {
            var s = i.split("@"),
              l = this.extractLocation(s.pop()),
              m = s.shift() || "",
              p =
                m
                  .replace(/<anonymous function(: (\w+))?>/, "$2")
                  .replace(/\([^)]*\)/g, "") || void 0,
              d;
            m.match(/\(([^)]*)\)/) &&
              (d = m.replace(/^[^(]+\(([^)]*)\)$/, "$1"));
            var y =
              d === void 0 || d === "[arguments not available]"
                ? void 0
                : d.split(",");
            return new e({
              functionName: p,
              args: y,
              fileName: l[0],
              lineNumber: l[1],
              columnNumber: l[2],
              source: i,
            });
          }, this);
        }, "ErrorStackParser$$parseOpera11"),
      };
    }, "ErrorStackParser"),
  );
});
var z = fe(C());
var g =
    typeof process == "object" &&
    typeof process.versions == "object" &&
    typeof process.versions.node == "string" &&
    typeof process.browser > "u",
  F =
    g &&
    typeof module < "u" &&
    typeof module.exports < "u" &&
    typeof E < "u" &&
    typeof __dirname < "u",
  j = g && !F,
  ue = typeof Deno < "u",
  B = !g && !ue,
  W =
    B &&
    typeof window < "u" &&
    typeof document < "u" &&
    typeof document.createElement < "u" &&
    typeof sessionStorage < "u",
  H = B && typeof importScripts < "u" && typeof self < "u";
var q,
  _,
  P,
  V,
  L,
  pe = `"fetch" is not defined, maybe you're using node < 18? From Pyodide >= 0.25.0, node >= 18 is required. Older versions of Node.js may work, but it is not guaranteed or supported. Falling back to "node-fetch".`;
async function D() {
  if (
    !g ||
    ((q = (await import("url")).default),
    (L = await import("fs/promises")),
    globalThis.fetch
      ? (_ = fetch)
      : (console.warn(pe), (_ = (await import("node-fetch")).default)),
    (V = (await import("vm")).default),
    (P = await import("path")),
    (A = P.sep),
    typeof E < "u")
  )
    return;
  let t = await import("fs"),
    e = await import("crypto"),
    c = await import("ws"),
    o = await import("child_process"),
    a = { fs: t, crypto: e, ws: c, child_process: o };
  globalThis.require = function (r) {
    return a[r];
  };
}
f(D, "initNodeModules");
function me(t, e) {
  return P.resolve(e || ".", t);
}
f(me, "node_resolvePath");
function ye(t, e) {
  return e === void 0 && (e = location), new URL(t, e).toString();
}
f(ye, "browser_resolvePath");
var S;
g ? (S = me) : (S = ye);
var A;
g || (A = "/");
function ge(t, e) {
  return (
    t.startsWith("file://") && (t = t.slice(7)),
    t.includes("://")
      ? { response: _(t) }
      : {
          binary: L.readFile(t).then(
            (c) => new Uint8Array(c.buffer, c.byteOffset, c.byteLength),
          ),
        }
  );
}
f(ge, "node_getBinaryResponse");
function he(t, e) {
  let c = new URL(t, location);
  return { response: fetch(c, e ? { integrity: e } : {}) };
}
f(he, "browser_getBinaryResponse");
var b;
g ? (b = ge) : (b = he);
async function G(t, e) {
  let { response: c, binary: o } = b(t, e);
  if (o) return o;
  let a = await c;
  if (!a.ok) throw new Error(`Failed to load '${t}': request failed.`);
  return new Uint8Array(await a.arrayBuffer());
}
f(G, "loadBinaryFile");
var w;
if (W) w = f(async (t) => await import(t), "loadScript");
else if (H)
  w = f(async (t) => {
    try {
      globalThis.importScripts(t);
    } catch (e) {
      if (e instanceof TypeError) await import(t);
      else throw e;
    }
  }, "loadScript");
else if (g) w = ve;
else throw new Error("Cannot determine runtime environment");
async function ve(t) {
  t.startsWith("file://") && (t = t.slice(7)),
    t.includes("://")
      ? V.runInThisContext(await (await _(t)).text())
      : await import(q.pathToFileURL(t).href);
}
f(ve, "nodeLoadScript");
async function K(t) {
  if (g) {
    await D();
    let e = await L.readFile(t);
    return JSON.parse(e);
  } else return await (await fetch(t)).json();
}
f(K, "loadLockFile");
async function X() {
  if (F) return __dirname;
  let t;
  try {
    throw new Error();
  } catch (o) {
    t = o;
  }
  let e = z.default.parse(t)[0].fileName;
  if (j) {
    let o = await import("path");
    return (await import("url")).fileURLToPath(o.dirname(e));
  }
  let c = e.lastIndexOf(A);
  if (c === -1)
    throw new Error(
      "Could not extract indexURL path from pyodide module location",
    );
  return e.slice(0, c);
}
f(X, "calculateDirname");
function J(t) {
  let e = t.FS,
    c = t.FS.filesystems.MEMFS,
    o = t.PATH,
    a = {
      DIR_MODE: 16895,
      FILE_MODE: 33279,
      mount: function (r) {
        if (!r.opts.fileSystemHandle)
          throw new Error("opts.fileSystemHandle is required");
        return c.mount.apply(null, arguments);
      },
      syncfs: async (r, n, u) => {
        try {
          let i = a.getLocalSet(r),
            s = await a.getRemoteSet(r),
            l = n ? s : i,
            m = n ? i : s;
          await a.reconcile(r, l, m), u(null);
        } catch (i) {
          u(i);
        }
      },
      getLocalSet: (r) => {
        let n = Object.create(null);
        function u(l) {
          return l !== "." && l !== "..";
        }
        f(u, "isRealDir");
        function i(l) {
          return (m) => o.join2(l, m);
        }
        f(i, "toAbsolute");
        let s = e.readdir(r.mountpoint).filter(u).map(i(r.mountpoint));
        for (; s.length; ) {
          let l = s.pop(),
            m = e.stat(l);
          e.isDir(m.mode) && s.push.apply(s, e.readdir(l).filter(u).map(i(l))),
            (n[l] = { timestamp: m.mtime, mode: m.mode });
        }
        return { type: "local", entries: n };
      },
      getRemoteSet: async (r) => {
        let n = Object.create(null),
          u = await we(r.opts.fileSystemHandle);
        for (let [i, s] of u)
          i !== "." &&
            (n[o.join2(r.mountpoint, i)] = {
              timestamp:
                s.kind === "file"
                  ? (await s.getFile()).lastModifiedDate
                  : new Date(),
              mode: s.kind === "file" ? a.FILE_MODE : a.DIR_MODE,
            });
        return { type: "remote", entries: n, handles: u };
      },
      loadLocalEntry: (r) => {
        let u = e.lookupPath(r).node,
          i = e.stat(r);
        if (e.isDir(i.mode)) return { timestamp: i.mtime, mode: i.mode };
        if (e.isFile(i.mode))
          return (
            (u.contents = c.getFileDataAsTypedArray(u)),
            { timestamp: i.mtime, mode: i.mode, contents: u.contents }
          );
        throw new Error("node type not supported");
      },
      storeLocalEntry: (r, n) => {
        if (e.isDir(n.mode)) e.mkdirTree(r, n.mode);
        else if (e.isFile(n.mode)) e.writeFile(r, n.contents, { canOwn: !0 });
        else throw new Error("node type not supported");
        e.chmod(r, n.mode), e.utime(r, n.timestamp, n.timestamp);
      },
      removeLocalEntry: (r) => {
        var n = e.stat(r);
        e.isDir(n.mode) ? e.rmdir(r) : e.isFile(n.mode) && e.unlink(r);
      },
      loadRemoteEntry: async (r) => {
        if (r.kind === "file") {
          let n = await r.getFile();
          return {
            contents: new Uint8Array(await n.arrayBuffer()),
            mode: a.FILE_MODE,
            timestamp: n.lastModifiedDate,
          };
        } else {
          if (r.kind === "directory")
            return { mode: a.DIR_MODE, timestamp: new Date() };
          throw new Error("unknown kind: " + r.kind);
        }
      },
      storeRemoteEntry: async (r, n, u) => {
        let i = r.get(o.dirname(n)),
          s = e.isFile(u.mode)
            ? await i.getFileHandle(o.basename(n), { create: !0 })
            : await i.getDirectoryHandle(o.basename(n), { create: !0 });
        if (s.kind === "file") {
          let l = await s.createWritable();
          await l.write(u.contents), await l.close();
        }
        r.set(n, s);
      },
      removeRemoteEntry: async (r, n) => {
        await r.get(o.dirname(n)).removeEntry(o.basename(n)), r.delete(n);
      },
      reconcile: async (r, n, u) => {
        let i = 0,
          s = [];
        Object.keys(n.entries).forEach(function (p) {
          let d = n.entries[p],
            y = u.entries[p];
          (!y ||
            (e.isFile(d.mode) &&
              d.timestamp.getTime() > y.timestamp.getTime())) &&
            (s.push(p), i++);
        }),
          s.sort();
        let l = [];
        if (
          (Object.keys(u.entries).forEach(function (p) {
            n.entries[p] || (l.push(p), i++);
          }),
          l.sort().reverse(),
          !i)
        )
          return;
        let m = n.type === "remote" ? n.handles : u.handles;
        for (let p of s) {
          let d = o.normalize(p.replace(r.mountpoint, "/")).substring(1);
          if (u.type === "local") {
            let y = m.get(d),
              h = await a.loadRemoteEntry(y);
            a.storeLocalEntry(p, h);
          } else {
            let y = a.loadLocalEntry(p);
            await a.storeRemoteEntry(m, d, y);
          }
        }
        for (let p of l)
          if (u.type === "local") a.removeLocalEntry(p);
          else {
            let d = o.normalize(p.replace(r.mountpoint, "/")).substring(1);
            await a.removeRemoteEntry(m, d);
          }
      },
    };
  t.FS.filesystems.NATIVEFS_ASYNC = a;
}
f(J, "initializeNativeFS");
var we = f(async (t) => {
  let e = [];
  async function c(a) {
    for await (let r of a.values())
      e.push(r), r.kind === "directory" && (await c(r));
  }
  f(c, "collect"), await c(t);
  let o = new Map();
  o.set(".", t);
  for (let a of e) {
    let r = (await t.resolve(a)).join("/");
    o.set(r, a);
  }
  return o;
}, "getFsHandles");
function Y() {
  let t = {};
  return (
    (t.noImageDecoding = !0),
    (t.noAudioDecoding = !0),
    (t.noWasmDecoding = !1),
    (t.preRun = []),
    (t.quit = (e, c) => {
      throw ((t.exited = { status: e, toThrow: c }), c);
    }),
    t
  );
}
f(Y, "createModule");
function be(t, e) {
  t.preRun.push(function () {
    let c = "/";
    try {
      t.FS.mkdirTree(e);
    } catch (o) {
      console.error(`Error occurred while making a home directory '${e}':`),
        console.error(o),
        console.error(`Using '${c}' for a home directory instead`),
        (e = c);
    }
    t.FS.chdir(e);
  });
}
f(be, "createHomeDirectory");
function Ee(t, e) {
  t.preRun.push(function () {
    Object.assign(t.ENV, e);
  });
}
f(Ee, "setEnvironment");
function _e(t, e) {
  t.preRun.push(() => {
    for (let c of e)
      t.FS.mkdirTree(c), t.FS.mount(t.FS.filesystems.NODEFS, { root: c }, c);
  });
}
f(_e, "mountLocalDirectories");
function Se(t, e) {
  let c = G(e);
  t.preRun.push(() => {
    let o = t._py_version_major(),
      a = t._py_version_minor();
    t.FS.mkdirTree("/lib"),
      t.FS.mkdirTree(`/lib/python${o}.${a}/site-packages`),
      t.addRunDependency("install-stdlib"),
      c
        .then((r) => {
          t.FS.writeFile(`/lib/python${o}${a}.zip`, r);
        })
        .catch((r) => {
          console.error(
            "Error occurred while installing the standard library:",
          ),
            console.error(r);
        })
        .finally(() => {
          t.removeRunDependency("install-stdlib");
        });
  });
}
f(Se, "installStdlib");
function Q(t, e) {
  let c;
  e.stdLibURL != null
    ? (c = e.stdLibURL)
    : (c = e.indexURL + "python_stdlib.zip"),
    Se(t, c),
    be(t, e.env.HOME),
    Ee(t, e.env),
    _e(t, e._node_mounts),
    t.preRun.push(() => J(t));
}
f(Q, "initializeFileSystem");
function Z(t, e) {
  let { binary: c, response: o } = b(e + "pyodide.asm.wasm");
  t.instantiateWasm = function (a, r) {
    return (
      (async function () {
        try {
          let n;
          o
            ? (n = await WebAssembly.instantiateStreaming(o, a))
            : (n = await WebAssembly.instantiate(await c, a));
          let { instance: u, module: i } = n;
          typeof WasmOffsetConverter < "u" &&
            (wasmOffsetConverter = new WasmOffsetConverter(wasmBinary, i)),
            r(u, i);
        } catch (n) {
          console.warn("wasm instantiation failed!"), console.warn(n);
        }
      })(),
      {}
    );
  };
}
f(Z, "preloadWasm");
var O = "0.25.0";
async function We(t = {}) {
  await D();
  let e = t.indexURL || (await X());
  (e = S(e)), e.endsWith("/") || (e += "/"), (t.indexURL = e);
  let c = {
      fullStdLib: !1,
      jsglobals: globalThis,
      stdin: globalThis.prompt ? globalThis.prompt : void 0,
      lockFileURL: e + "pyodide-lock.json",
      args: [],
      _node_mounts: [],
      env: {},
      packageCacheDir: e,
      packages: [],
    },
    o = Object.assign(c, t);
  o.env.HOME || (o.env.HOME = "/home/pyodide");
  let a = Y();
  (a.print = o.stdout), (a.printErr = o.stderr), (a.arguments = o.args);
  let r = { config: o };
  (a.API = r), (r.lockFilePromise = K(o.lockFileURL)), Z(a, e), Q(a, o);
  let n = new Promise((s) => (a.postRun = s));
  if (
    ((a.locateFile = (s) => o.indexURL + s),
    typeof _createPyodideModule != "function")
  ) {
    let s = `${o.indexURL}pyodide.asm.js`;
    await w(s);
  }
  if ((await _createPyodideModule(a), await n, a.exited))
    throw a.exited.toThrow;
  if (
    (t.pyproxyToStringRepr && r.setPyProxyToStringMethod(!0), r.version !== O)
  )
    throw new Error(
      `Pyodide version does not match: '${O}' <==> '${r.version}'. If you updated the Pyodide version, make sure you also updated the 'indexURL' parameter passed to loadPyodide.`,
    );
  a.locateFile = (s) => {
    throw new Error("Didn't expect to load any more file_packager files!");
  };
  let u = r.finalizeBootstrap();
  if (
    (u.version.includes("dev") ||
      r.setCdnUrl(`https://cdn.jsdelivr.net/pyodide/v${u.version}/full/`),
    await r.packageIndexReady,
    r._pyodide._importhook.register_module_not_found_hook(
      r._import_name_to_package_name,
      r.lockfile_unvendored_stdlibs_and_test,
    ),
    r.lockfile_info.version !== O)
  )
    throw new Error("Lock file version doesn't match Pyodide version");
  return (
    r.package_loader.init_loaded_packages(),
    o.fullStdLib && (await u.loadPackage(r.lockfile_unvendored_stdlibs)),
    r.initializeStreams(o.stdin, o.stdout, o.stderr),
    u
  );
}
f(We, "loadPyodide");
export { We as loadPyodide, O as version };
//# sourceMappingURL=pyodide.mjs.map
