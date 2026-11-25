/**
 * test/mobile-gates.test.mjs — TDD suite for standalone check-mobile-antipatterns.mjs
 * and verify-frontend-gates.mjs mobile/Expo gating without web false positives.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scanMobileAntipatterns } from "../05-frontend/expo-production-auditor/scripts/check-mobile-antipatterns.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const MOBILE_CHECK_CLI = join(
  REPO_ROOT,
  "05-frontend",
  "expo-production-auditor",
  "scripts",
  "check-mobile-antipatterns.mjs"
);
const FRONTEND_GATES_CLI = join(
  REPO_ROOT,
  "05-frontend",
  "design-driven",
  "scripts",
  "verify-frontend-gates.mjs"
);

function makeFixture(t, prefix = "skillsgv-mobile-") {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  t.after(() => {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {}
  });
  return dir;
}

function runCli(script, args, cwd = REPO_ROOT) {
  const res = spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: "utf8",
  });
  return { code: res.status ?? 1, stdout: res.stdout ?? "", stderr: res.stderr ?? "" };
}

test("check-mobile-antipatterns.mjs has zero _shared imports and supports --help", () => {
  const src = readFileSync(MOBILE_CHECK_CLI, "utf8");
  assert.equal(/from\s+["'][^"']*_shared/.test(src), false, "must have zero _shared imports");
  assert.equal(/_shared/.test(src), false, "standalone runner must not reference _shared");

  const help = runCli(MOBILE_CHECK_CLI, ["--help"]);
  assert.equal(help.code, 0, help.stderr);
  assert.match(help.stdout, /--srcDir/);
  assert.match(help.stdout, /--strict/);
});

test("check-mobile-antipatterns.mjs detects all 4 React Native / Expo antipatterns", (t) => {
  const dir = makeFixture(t, "skillsgv-rn-dirty-");
  mkdirSync(join(dir, "app"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "rn-dirty",
      dependencies: {
        expo: "^55.0.0",
        "react-native": "^0.81.0",
        "react-native-reanimated": "^4.1.0",
        "react-native-worklets": "^0.5.0",
      },
    }),
    "utf8"
  );
  writeFileSync(
    join(dir, "app", "FeedScreen.tsx"),
    [
      'import { Audio } from "expo-av";',
      'import { ScrollView, FlatList } from "react-native";',
      "export function FeedScreen({ iconName, onDone }) {",
      "  runOnJS(onDone)();",
      "  const img = require('./assets/' + iconName + '.png');",
      "  return (",
      "    <ScrollView>",
      "      <FlatList data={[]} renderItem={() => null} />",
      "    </ScrollView>",
      "  );",
      "}",
    ].join("\n"),
    "utf8"
  );

  // Test omitting --srcDir auto-falls back to app/ when src/ does not exist
  const res = runCli(MOBILE_CHECK_CLI, ["--webDir", dir, "--json"], dir);
  assert.equal(res.code, 1, `Expected exit 1 on dirty RN fixture: ${res.stdout} ${res.stderr}`);
  const parsed = JSON.parse(res.stdout);
  assert.equal(parsed.ok, false);
  const checks = new Set(parsed.issues.map((i) => i.check));
  for (const expected of [
    "removed-rn-run-on-js",
    "deprecated-expo-av",
    "dynamic-require-asset",
    "nested-virtualized-list",
  ]) {
    assert.ok(checks.has(expected), `Missing check ${expected} in ${[...checks]}`);
  }
});

test("check-mobile-antipatterns.mjs passes clean Expo SDK 55 + Reanimated 4 code", (t) => {
  const dir = makeFixture(t, "skillsgv-rn-clean-");
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "rn-clean",
      dependencies: {
        expo: "^55.0.0",
        "react-native": "^0.81.0",
        "react-native-reanimated": "^4.1.0",
        "react-native-worklets": "^0.5.0",
      },
    }),
    "utf8"
  );
  writeFileSync(
    join(dir, "src", "FeedScreen.tsx"),
    [
      'import { useAudioPlayer } from "expo-audio";',
      'import { scheduleOnRN } from "react-native-worklets";',
      'import { ScrollView, View } from "react-native";',
      'import { FlashList } from "@shopify/flash-list";',
      "const LOGO = require('./assets/logo.png');",
      "export function FeedScreen({ onDone }) {",
      "  scheduleOnRN(onDone);",
      "  return (",
      "    <View>",
      "      <ScrollView horizontal><View /></ScrollView>",
      "      <FlashList data={[]} renderItem={() => null} />",
      "    </View>",
      "  );",
      "}",
    ].join("\n"),
    "utf8"
  );

  const res = runCli(MOBILE_CHECK_CLI, ["--srcDir", join(dir, "src"), "--webDir", dir, "--json"], dir);
  assert.equal(res.code, 0, `Expected clean pass: ${res.stdout} ${res.stderr}`);
  const parsed = JSON.parse(res.stdout);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.errors, 0);
  assert.equal(parsed.warnings, 0);
});

test("verify-frontend-gates chains check-mobile-antipatterns and passes --dir to check-deep-links on Expo projects", (t) => {
  const dir = makeFixture(t, "skillsgv-vfg-expo-");
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "expo-gate-test",
      dependencies: {
        expo: "^55.0.0",
        "expo-router": "^55.0.0",
        "react-native": "^0.81.0",
        "react-native-reanimated": "^4.1.0",
      },
    }),
    "utf8"
  );
  writeFileSync(
    join(dir, "app.json"),
    JSON.stringify({
      expo: {
        name: "DemoApp",
        scheme: "demoapp",
        ios: { associatedDomains: ["applinks:demo.example.com"] },
      },
    }),
    "utf8"
  );
  writeFileSync(
    join(dir, "src", "App.tsx"),
    [
      'import { Audio } from "expo-av";',
      "export function App() { return null; }",
    ].join("\n"),
    "utf8"
  );

  const res = runCli(FRONTEND_GATES_CLI, [
    "--srcDir", join(dir, "src"),
    "--webDir", dir,
    "--skip-build-config",
    "--json",
  ]);
  assert.equal(res.code, 1, `Expected exit 1 from deprecated-expo-av: ${res.stdout}`);
  const parsed = JSON.parse(res.stdout);
  const mobileScript = parsed.scripts.find((s) => s.name === "check-mobile-antipatterns");
  assert.ok(mobileScript && mobileScript.status === "fail", `Expected check-mobile-antipatterns fail: ${JSON.stringify(parsed.scripts)}`);
  assert.ok(mobileScript.issues.some((i) => i.check === "deprecated-expo-av"));

  const deepLinkScript = parsed.scripts.find((s) => s.name === "check-deep-links");
  assert.ok(deepLinkScript && deepLinkScript.status === "pass", `Expected check-deep-links pass with --dir webDir: ${JSON.stringify(deepLinkScript)}`);
});

test("verify-frontend-gates does NOT fire mobile checks on pure web projects", (t) => {
  const dir = makeFixture(t, "skillsgv-vfg-web-");
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ name: "pure-web", dependencies: { react: "^19.0.0" } }),
    "utf8"
  );
  writeFileSync(
    join(dir, "src", "App.tsx"),
    `export function App() { return <main className="bg-surface-canvas text-text-primary">Web</main>; }\n`,
    "utf8"
  );

  const res = runCli(FRONTEND_GATES_CLI, [
    "--srcDir", join(dir, "src"),
    "--webDir", dir,
    "--skip-build-config",
    "--json",
  ]);
  assert.equal(res.code, 0, res.stdout);
  const parsed = JSON.parse(res.stdout);
  assert.equal(parsed.scripts.some((s) => s.name === "check-mobile-antipatterns"), false);
  assert.equal(parsed.scripts.some((s) => s.name === "check-deep-links"), false);
});

test("scanMobileAntipatterns handles single-line nesting, arrow-prop horizontal ScrollView, SectionList, and literal '+' requires", () => {
  const singleLine = scanMobileAntipatterns(
    "export const A = () => (<ScrollView><FlatList data={[]} renderItem={() => null} /></ScrollView>);",
    "A.tsx"
  );
  assert.equal(singleLine.some((i) => i.check === "nested-virtualized-list"), true, "detects single-line ScrollView > FlatList");

  const multiArrowHorizontal = scanMobileAntipatterns(
    [
      "<ScrollView",
      "  onScroll={() => handle()}",
      "  horizontal>",
      "  <FlatList data={[]} renderItem={() => null} />",
      "</ScrollView>",
    ].join("\n"),
    "B.tsx"
  );
  assert.deepEqual(multiArrowHorizontal, [], "arrow callback with '>' must not drop horizontal prop");

  const sectionNested = scanMobileAntipatterns(
    "<ScrollView>\n  <SectionList sections={[]} />\n</ScrollView>",
    "Section.tsx"
  );
  assert.equal(sectionNested.some((i) => i.check === "nested-virtualized-list"), true, "detects SectionList inside ScrollView");

  const plusLiteral = scanMobileAntipatterns(
    "const icon = require('./assets/icon+2x.png');",
    "Literal.tsx"
  );
  assert.deepEqual(plusLiteral, [], "literal filename containing '+' is static and valid");

  const dynamicIdent = scanMobileAntipatterns("const mod = require(dynamicPath);", "DynIdent.tsx");
  assert.equal(dynamicIdent.some((i) => i.check === "dynamic-require-asset"), true, "detects identifier require(var)");

  const dynamicConcat = scanMobileAntipatterns("const mod = require('./a/' + name);", "DynConcat.tsx");
  assert.equal(dynamicConcat.some((i) => i.check === "dynamic-require-asset"), true, "detects string concat require()");
});

test("verify-frontend-gates resolves app/ automatically when --srcDir is omitted on Expo Router projects", (t) => {
  const dir = makeFixture(t, "skillsgv-vfg-expo-appdir-");
  mkdirSync(join(dir, "app"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "expo-appdir-test",
      dependencies: {
        expo: "^55.0.0",
        "expo-router": "^55.0.0",
        "react-native": "^0.81.0",
      },
    }),
    "utf8"
  );
  writeFileSync(
    join(dir, "app.json"),
    JSON.stringify({
      expo: {
        name: "AppDirDemo",
        scheme: "appdirdemo",
        ios: { associatedDomains: ["applinks:appdirdemo.example.com"] },
      },
    }),
    "utf8"
  );
  writeFileSync(
    join(dir, "app", "index.tsx"),
    `import { View, Text } from "react-native";\nexport default function Home() { return <View><Text>OK</Text></View>; }\n`,
    "utf8"
  );

  const res = runCli(FRONTEND_GATES_CLI, [
    "--webDir", dir,
    "--skip-build-config",
    "--json",
  ]);
  assert.equal(res.code, 0, `Expected app/ auto-detection pass: ${res.stdout} ${res.stderr}`);
  const parsed = JSON.parse(res.stdout);
  assert.equal(parsed.ok, true);
  assert.ok(parsed.scripts.some((s) => s.name === "check-mobile-antipatterns" && s.status === "pass"));
  assert.ok(parsed.scripts.some((s) => s.name === "check-deep-links" && s.status === "pass"));
});

test("verify-frontend-gates ignores non-Expo app.json on pure web projects", (t) => {
  const dir = makeFixture(t, "skillsgv-vfg-nonexpo-appjson-");
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ name: "web-with-appjson", dependencies: { react: "^19.0.0" } }),
    "utf8"
  );
  writeFileSync(
    join(dir, "app.json"),
    JSON.stringify({ name: "web-app", version: "1.0.0" }),
    "utf8"
  );
  writeFileSync(
    join(dir, "src", "App.tsx"),
    `export function App() { return <main className="bg-surface-canvas text-text-primary">Web</main>; }\n`,
    "utf8"
  );

  const res = runCli(FRONTEND_GATES_CLI, [
    "--srcDir", join(dir, "src"),
    "--webDir", dir,
    "--skip-build-config",
    "--json",
  ]);
  assert.equal(res.code, 0, `Expected non-Expo app.json to pass without deep-links error: ${res.stdout}`);
  const parsed = JSON.parse(res.stdout);
  assert.equal(parsed.scripts.some((s) => s.name === "check-deep-links"), false);
});
