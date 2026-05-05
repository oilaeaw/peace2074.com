// No-op debug stub for Cloudflare Workers builds.
// The real `debug` package uses CJS module.exports = function(...) which rollup
// wraps in a namespace, breaking callers that expect a callable default export.

type Debugger = {
    (...args: unknown[]): void;
    enabled: boolean;
    namespace: string;
    extend: (sub: string) => Debugger;
    destroy: () => void;
};

function debug(ns: string): Debugger {
    const fn = (..._args: unknown[]) => { };
    (fn as unknown as Debugger).enabled = false;
    (fn as unknown as Debugger).namespace = ns;
    (fn as unknown as Debugger).extend = (sub: string) => debug(ns + ":" + sub);
    (fn as unknown as Debugger).destroy = () => { };
    return fn as unknown as Debugger;
}

debug.enable = (_namespaces: string) => { };
debug.disable = () => "";
debug.enabled = (_namespace: string) => false;
debug.formatters = {} as Record<string, unknown>;
debug.names = [] as RegExp[];
debug.skips = [] as RegExp[];

export default debug;
