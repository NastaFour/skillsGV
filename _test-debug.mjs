import { runScriptGuarded } from "./_shared/script-utils.mjs";

const r = await runScriptGuarded('"C:\\Users\\j1347\\bin\\engram.exe" search "test F4 conflict Z"', { timeoutMs: 10000 });
console.log(JSON.stringify(r, null, 2));
process.exit(0);
