import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Static guard for the public (unauthenticated) surfaces.
 *
 * jsdom cannot render CSS, so we assert on the source instead:
 *  1. The public stylesheets must not hard-code colours. Every colour has to
 *     come from a design token so `[data-theme="dark"]` can override it.
 *  2. Every `var(--token)` used there must exist in global.css, and colour
 *     tokens must be overridden (with a DIFFERENT value) in the dark block.
 *
 * The scanning logic lives in small pure functions that are themselves tested
 * ("mutation checks") so the guard cannot silently go blind.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "..");

const PUBLIC_STYLESHEETS = [
  "components/layout/PublicHeader/PublicHeader.css",
  "components/layout/Footer/Footer.css",
  "layouts/PublicLayout/PublicLayout.css",
  "pages/Home/Home.css",
  "pages/About/About.css",
];

/**
 * Colour literals that are allowed in the public stylesheets. Kept EMPTY on
 * purpose: even "white text on the brand button" goes through `--on-primary`.
 * Add an entry here only with a written justification.
 */
const ALLOWED_LITERALS = [];

/**
 * Colour tokens that intentionally do NOT change in dark mode because they are
 * only used as a background/border behind `--on-primary` text or as a border,
 * where the same brand purple stays legible on both themes.
 * Text uses `--primary-text` / `--public-accent`, which ARE themed.
 */
const THEME_CONSTANT_TOKENS = [
  "--primary",
  "--primary-hover",
  "--secondary",
  "--on-primary",
  // Brand button/logo fill (always paired with --on-primary text) and its glow.
  "--public-btn-bg",
  "--public-btn-bg-hover",
  "--public-btn-shadow",
  "--public-btn-shadow-hover",
];

/**
 * Extra constants allowed ONLY on the app surfaces (dashboard status dot).
 * `--success` (#35b26f) is ~2.6:1 on white, which is fine for a decorative
 * status dot but not for public text, so it is NOT allow-listed for the public
 * guard.
 */
const APP_THEME_CONSTANT_TOKENS = [...THEME_CONSTANT_TOKENS, "--success"];

const read = (relative) =>
  fs.readFileSync(path.join(src, relative), "utf8").replace(/\r\n/g, "\n");

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const stripStrings = (css) =>
  css.replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, '""');

/* ------------------------------------------------------------------ */
/* Declaration walker                                                  */
/* ------------------------------------------------------------------ */

/**
 * Walks CSS and returns every `prop: value` declaration with the brace depth
 * it lives at. Selectors / at-rule preludes are discarded, so `#header {}` or
 * `a:hover {}` can never be mistaken for a declaration. `;` and braces inside
 * parentheses (e.g. `url(data:...;base64,...)`) do not split declarations.
 */
const walkDeclarations = (css) => {
  const found = [];
  let depth = 0;
  let parens = 0;
  let buf = "";

  const flush = () => {
    const colon = buf.indexOf(":");
    if (colon > 0) {
      found.push({
        depth,
        prop: buf.slice(0, colon).trim().toLowerCase(),
        value: buf.slice(colon + 1).trim(),
      });
    }
    buf = "";
  };

  for (const ch of css) {
    if (ch === "(") parens += 1;
    else if (ch === ")") parens = Math.max(0, parens - 1);

    if (parens === 0 && ch === "{") {
      buf = "";
      depth += 1;
    } else if (parens === 0 && ch === ";") {
      flush();
    } else if (parens === 0 && ch === "}") {
      flush();
      depth = Math.max(0, depth - 1);
    } else {
      buf += ch;
    }
  }
  flush(); // last declaration may lack a trailing `;` (block body without `}`)
  return found;
};

/* ------------------------------------------------------------------ */
/* Colour literal scanner                                             */
/* ------------------------------------------------------------------ */

const NAMED_COLORS = (
  "aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond " +
  "blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue " +
  "cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey " +
  "darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon " +
  "darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet " +
  "deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen " +
  "fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew " +
  "hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon " +
  "lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey " +
  "lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey " +
  "lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine " +
  "mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue " +
  "mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose " +
  "moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid " +
  "palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink " +
  "plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon " +
  "sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey " +
  "snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white " +
  "whitesmoke yellow yellowgreen"
).split(" ");

// `transparent`, `currentColor`, `inherit`, `none`, `initial`, `unset` are
// deliberately NOT in the list: they are theme-neutral.
const NAMED_COLOR_RE = new RegExp(
  `(?<![\\w#-])(?:${NAMED_COLORS.join("|")})(?![\\w-])`,
  "gi",
);

const HEX_RE = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi;

const COLOR_FN_RE =
  /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi;

/** Properties whose values can carry a colour keyword. */
const COLOR_PROP_RE =
  /^(?:-\w+-)?(?:background(?:-.*)?|border(?:-.*)?|outline(?:-.*)?|.*-color|color|.*shadow|fill|stroke|filter|mask(?:-.*)?|column-rule(?:-.*)?|--.*)$/;

/** Removes `var(...)` (balanced, one nesting level inside args is enough). */
const stripVar = (value) =>
  value.replace(/var\((?:[^()]|\([^()]*\))*\)/gi, "");

/**
 * Returns every hard-coded colour literal found in declaration VALUES:
 * hex, rgb/hsl/hwb/lab/lch/oklab/oklch/color(), and named colours (only in
 * colour-bearing properties). Selectors, comments, strings, `url(...)` and
 * `var(...)` contents are ignored.
 */
const findColorLiterals = (css) => {
  const hits = [];
  const clean = stripStrings(stripComments(css));

  for (const { depth, prop, value } of walkDeclarations(clean)) {
    if (depth === 0) continue;
    const noUrl = value.replace(/url\((?:[^()]|\([^()]*\))*\)/gi, "url()");

    hits.push(...(noUrl.match(HEX_RE) ?? []));
    hits.push(...(noUrl.match(COLOR_FN_RE) ?? []));
    if (COLOR_PROP_RE.test(prop)) {
      hits.push(...(stripVar(noUrl).match(NAMED_COLOR_RE) ?? []));
    }
  }
  return hits.filter((literal) => !ALLOWED_LITERALS.includes(literal));
};

const findLiterals = (css) => findColorLiterals(css);

/** True when a (token) value contains a colour literal of any kind. */
const isColorValue = (value) =>
  findColorLiterals(`x{color:${value};}`).length > 0 ||
  findColorLiterals(`x{box-shadow:${value};}`).length > 0;

/* ------------------------------------------------------------------ */
/* Theme block parsing                                                 */
/* ------------------------------------------------------------------ */

const LIGHT_SELECTOR = ":root";
const DARK_SELECTOR = `(?::root|html|body)?\\[data-theme=["']dark["']\\]`;

/** Index of the `}` that closes the `{` at `openIdx`, or -1. */
const matchBrace = (css, openIdx) => {
  let depth = 0;
  for (let i = openIdx; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
};

/** Bodies of every top-level-ish block whose selector is exactly `selector`. */
const findBlocks = (css, selectorSource) => {
  const re = new RegExp(`(?:^|[};{\\s,])(?:${selectorSource})\\s*\\{`, "g");
  const bodies = [];
  for (const match of css.matchAll(re)) {
    const open = match.index + match[0].length - 1;
    const close = matchBrace(css, open);
    if (close !== -1) bodies.push(css.slice(open + 1, close));
  }
  return bodies;
};

/** Custom properties declared directly in the given bodies (nested rules ignored). */
const tokensFrom = (bodies) => {
  const map = new Map();
  for (const body of bodies) {
    for (const { depth, prop, value } of walkDeclarations(body)) {
      if (depth === 0 && prop.startsWith("--")) map.set(prop, value);
    }
  }
  return map;
};

const parseThemes = (css) => {
  const clean = stripComments(css);
  const lightBlocks = findBlocks(clean, LIGHT_SELECTOR);
  const darkBlocks = findBlocks(clean, DARK_SELECTOR);
  return {
    lightBlocks: lightBlocks.length,
    darkBlocks: darkBlocks.length,
    light: tokensFrom(lightBlocks),
    dark: tokensFrom(darkBlocks),
  };
};

/* ------------------------------------------------------------------ */
/* Dark override analysis                                              */
/* ------------------------------------------------------------------ */

const normalize = (value) => value.replace(/\s+/g, " ").trim().toLowerCase();

const aliasTarget = (value) =>
  value?.match(/^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/i)?.[1] ?? null;

/**
 * Value of `token` in a theme, resolving ONE level of `var()` aliasing.
 * `primary` wins over `fallback` (dark values fall back to the light map
 * because the dark block only overrides, it does not redeclare everything).
 */
const effectiveValue = (token, primary, fallback) => {
  const get = (name) => primary.get(name) ?? fallback.get(name);
  const raw = get(token);
  const target = aliasTarget(raw);
  return target ? (get(target) ?? raw) : raw;
};

/**
 * Colour tokens in `used` that would not change between light and dark.
 * Direct tokens need their own dark override; alias tokens (`var(--x)`) may
 * inherit theming from their target. Either way the EFFECTIVE value must differ.
 */
const themeIssues = (used, light, dark, constants = THEME_CONSTANT_TOKENS) => {
  const issues = [];
  for (const token of used) {
    if (!light.has(token) || constants.includes(token)) continue;
    const lightValue = effectiveValue(token, light, light);
    if (!isColorValue(lightValue)) continue;

    const isAlias = aliasTarget(light.get(token)) !== null;
    if (!dark.has(token) && !isAlias) {
      issues.push(`${token}: no override in the dark block`);
      continue;
    }
    const darkValue = effectiveValue(token, dark, light);
    if (normalize(lightValue) === normalize(darkValue)) {
      issues.push(`${token}: dark value is identical to light (${lightValue})`);
    }
  }
  return issues;
};

const usedTokens = (css) =>
  new Set(
    [...stripComments(css).matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]),
  );

/* ------------------------------------------------------------------ */
/* Tests of the guard itself (mutation checks)                         */
/* ------------------------------------------------------------------ */

describe("guard scanner (mutation checks)", () => {
  it.each([
    ["#FFF", "a { color: #FFF; }"],
    ["8-digit hex", "a { color: #ffffff80; }"],
    ["RGBA(", "a { box-shadow: 0 0 1px RGBA(0,0,0,.1); }"],
    ["HSL(", "a { color: HSL(10 10% 10%); }"],
    ["WHITE", "a { color: WHITE; }"],
    ["black border", "a { border: 1px solid black; }"],
    ["grey", "a { background-color: grey; }"],
    ["gradient names", "a { background: linear-gradient(red, blue); }"],
    ["oklch(", "a { color: oklch(0.5 0.1 200); }"],
    ["oklab(", "a { color: oklab(0.5 0.1 0.1); }"],
    ["lab(", "a { color: lab(50% 10 10); }"],
    ["lch(", "a { color: lch(50% 10 10); }"],
    ["hwb(", "a { color: hwb(10 10% 10%); }"],
    ["color(", "a { color: color(display-p3 1 0 0); }"],
    ["hex in var fallback", "a { color: var(--x, #fff); }"],
    ["svg fill", "a { fill: Red; }"],
    ["nested in @media", "@media (min-width: 1px) { a { color: #abc; } }"],
  ])("flags %s", (_label, css) => {
    expect(findColorLiterals(css).length).toBeGreaterThan(0);
  });

  it.each([
    ["var()", "a { color: var(--x); }"],
    ["var() with named fallback", "a { color: var(--x, white); }"],
    ["transparent/currentColor", "a { background: transparent; color: currentColor; }"],
    ["inherit/none/initial/unset", "a { color: inherit; fill: none; stroke: initial; border-color: unset; }"],
    ["id selector", "#header { margin: 0; }\n#abc .x, #fed:hover { margin: 0; }"],
    ["url(#id)", "a { fill: url(#gradient); }"],
    ["hex inside url()", "a { background: url(img.svg#abc123); }"],
    ["comments", "/* #fff white rgb(0,0,0) */ a { margin: 0; /* color: red; */ }"],
    ["strings", 'a::after { content: "#fff white rgb("; }'],
    ["colour word in a class", ".white, .red-card { margin: 0; }"],
    ["colour word in a non-colour property", "a { font-family: Tan, serif; }"],
    ["token definitions via var", "a { box-shadow: 0 1px 2px var(--shadow); }"],
  ])("does not flag %s", (_label, css) => {
    expect(findColorLiterals(css)).toEqual([]);
  });
});

describe("theme block parser (mutation checks)", () => {
  it("parses blocks without a space before the brace", () => {
    const { light, dark } = parseThemes(
      ':root{--a:#fff;--b:#eee}[data-theme="dark"]{--a:#000}',
    );
    expect(light.get("--a")).toBe("#fff");
    expect(dark.get("--a")).toBe("#000");
  });

  it('parses the `:root[data-theme="dark"]` form and keeps it out of :root', () => {
    const { light, dark, darkBlocks } = parseThemes(
      ':root { --a: #fff; }\n:root[data-theme="dark"] { --a: #000; }',
    );
    expect(darkBlocks).toBe(1);
    expect(light.get("--a")).toBe("#fff");
    expect(dark.get("--a")).toBe("#000");
  });

  it("does not truncate the block at a nested rule's closing brace", () => {
    const { dark } = parseThemes(
      '[data-theme="dark"] { --a: #000; .x { color: red; } --b: #111; }',
    );
    expect(dark.get("--a")).toBe("#000");
    expect(dark.get("--b")).toBe("#111");
    expect(dark.has("--x")).toBe(false);
  });

  it("ignores selectors that merely contain the dark attribute", () => {
    const { darkBlocks } = parseThemes(
      '[data-theme="dark"] .card { --a: #000; }',
    );
    expect(darkBlocks).toBe(0);
  });

  it("reports a missing dark block", () => {
    expect(parseThemes(":root { --a: #fff; }").darkBlocks).toBe(0);
  });
});

describe("dark override analysis (mutation checks)", () => {
  const light = new Map([
    ["--bg", "#ffffff"],
    ["--text", "#111111"],
    ["--alias", "var(--bg)"],
    ["--brand", "#7c3aed"],
    ["--gap", "8px"],
  ]);

  it("flags a colour token with no dark override", () => {
    expect(themeIssues(["--text"], light, new Map())).toHaveLength(1);
  });

  it("flags a dark override equal to the light value", () => {
    const dark = new Map([["--text", "#111111"]]);
    expect(themeIssues(["--text"], light, dark)).toHaveLength(1);
  });

  it("accepts a real override", () => {
    const dark = new Map([["--text", "#eeeeee"]]);
    expect(themeIssues(["--text"], light, dark)).toEqual([]);
  });

  it("resolves aliases: passes when the target is themed", () => {
    const dark = new Map([["--bg", "#000000"]]);
    expect(themeIssues(["--alias"], light, dark)).toEqual([]);
  });

  it("resolves aliases: flags when the target is not themed", () => {
    expect(themeIssues(["--alias"], light, new Map())).toHaveLength(1);
  });

  it("skips documented theme-constant tokens and non-colour tokens", () => {
    expect(themeIssues(["--brand", "--gap"], light, new Map(), ["--brand"])).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/* Real files                                                          */
/* ------------------------------------------------------------------ */

const {
  light: lightTokens,
  dark: darkTokens,
  lightBlocks,
  darkBlocks,
} = parseThemes(read("styles/global.css"));

describe("global.css theme blocks", () => {
  it("has a :root block with tokens", () => {
    expect(lightBlocks, "light block :root not found in global.css").toBeGreaterThan(0);
    expect(lightTokens.size, "light block :root has no custom properties").toBeGreaterThan(0);
  });

  it('has a [data-theme="dark"] block with tokens', () => {
    expect(darkBlocks, 'dark block [data-theme="dark"] not found in global.css').toBeGreaterThan(0);
    expect(darkTokens.size, 'dark block [data-theme="dark"] has no custom properties').toBeGreaterThan(0);
  });
});

describe("public surfaces respect the theme", () => {
  it.each(PUBLIC_STYLESHEETS)(
    "%s has no hard-coded colour literals",
    (relative) => {
      expect(findLiterals(read(relative))).toEqual([]);
    },
  );

  it.each(PUBLIC_STYLESHEETS)(
    "%s only uses tokens defined in global.css",
    (relative) => {
      const undefinedTokens = [...usedTokens(read(relative))].filter(
        (token) => !lightTokens.has(token),
      );
      expect(undefinedTokens).toEqual([]);
    },
  );

  it.each(PUBLIC_STYLESHEETS)(
    "%s only uses colour tokens whose dark value differs from light",
    (relative) => {
      expect(
        themeIssues(usedTokens(read(relative)), lightTokens, darkTokens),
      ).toEqual([]);
    },
  );

  it("footer no longer declares its own root tokens (they live in global.css)", () => {
    expect(stripComments(read(PUBLIC_STYLESHEETS[1]))).not.toMatch(/:root\s*{/);
  });
});

/* ------------------------------------------------------------------ */
/* Themed app surfaces (dashboard + the shared widgets it renders)     */
/* ------------------------------------------------------------------ */

/**
 * These stylesheets own a small PALETTE: a `:root` block with the light values
 * (hard-coded colours are allowed ONLY there, exactly like global.css) and a
 * `:root[data-theme="dark"]` block that maps each entry to a global token or a
 * dark literal. Every rule outside those two blocks must use `var(--token)`.
 */
const THEMED_APP_STYLESHEETS = [
  "pages/Dashboard/Dashboard.css",
  "components/ui/Avatar/Avatar.css",
  "components/ui/Alert/Alert.css",
];

/** Custom properties that are set at runtime from JSX (`style={{ "--x": ... }}`). */
const RUNTIME_TOKENS = ["--timer-progress", "--progress"];

/** Removes the body of every block whose selector is exactly `selectorSource`. */
const removeBlocks = (css, selectorSource) => {
  const re = new RegExp(`(?:^|[};{\\s,])(?:${selectorSource})\\s*\\{`, "g");
  let out = "";
  let cursor = 0;
  for (const match of css.matchAll(re)) {
    const open = match.index + match[0].length - 1;
    if (open < cursor) continue;
    const close = matchBrace(css, open);
    if (close === -1) continue;
    out += css.slice(cursor, open + 1);
    cursor = close;
  }
  return out + css.slice(cursor);
};

/** CSS with the palette (light + dark theme blocks) removed. */
const withoutPalette = (css) =>
  removeBlocks(removeBlocks(stripComments(css), LIGHT_SELECTOR), DARK_SELECTOR);

/** Non-custom-property declarations hiding inside the palette blocks. */
const paletteIntruders = (css) => {
  const clean = stripComments(css);
  return [...findBlocks(clean, LIGHT_SELECTOR), ...findBlocks(clean, DARK_SELECTOR)]
    .flatMap((body) => walkDeclarations(body))
    .filter(({ depth, prop }) => depth === 0 && !prop.startsWith("--"))
    .map(({ prop }) => prop);
};

describe("palette scanner (mutation checks)", () => {
  it("allows colour literals inside the palette blocks only", () => {
    const css =
      ':root { --a: #fff; }\n:root[data-theme="dark"] { --a: rgba(0,0,0,.5); }\na { color: #abc; }';
    expect(findLiterals(withoutPalette(css))).toEqual(["#abc"]);
  });

  it("does not let a rule hide after a palette block", () => {
    const css = ":root { --a: #fff; }\n.x { color: red; }\n.y { background: #000; }";
    expect(findLiterals(withoutPalette(css))).toEqual(["red", "#000"]);
  });

  it("flags real declarations placed inside a palette block", () => {
    expect(paletteIntruders(":root { --a: #fff; color: red; }")).toEqual(["color"]);
    expect(paletteIntruders(':root[data-theme="dark"] { background: #000; }')).toEqual([
      "background",
    ]);
    expect(paletteIntruders(":root { --a: #fff; }")).toEqual([]);
  });
});

describe("themed app surfaces respect the theme", () => {
  it.each(THEMED_APP_STYLESHEETS)(
    "%s has no hard-coded colour literals outside its palette",
    (relative) => {
      expect(findLiterals(withoutPalette(read(relative)))).toEqual([]);
    },
  );

  it.each(THEMED_APP_STYLESHEETS)(
    "%s keeps only custom properties inside its palette blocks",
    (relative) => {
      expect(paletteIntruders(read(relative))).toEqual([]);
    },
  );

  it.each(THEMED_APP_STYLESHEETS)(
    "%s only uses tokens defined in global.css or in its own palette",
    (relative) => {
      const css = read(relative);
      const own = parseThemes(css).light;
      const undefinedTokens = [...usedTokens(css)].filter(
        (token) =>
          !lightTokens.has(token) &&
          !own.has(token) &&
          !RUNTIME_TOKENS.includes(token),
      );
      expect(undefinedTokens).toEqual([]);
    },
  );

  it.each(THEMED_APP_STYLESHEETS)(
    "%s only uses colour tokens whose dark value differs from light",
    (relative) => {
      const css = read(relative);
      const own = parseThemes(css);
      const light = new Map([...lightTokens, ...own.light]);
      const dark = new Map([...darkTokens, ...own.dark]);
      expect(
        themeIssues(usedTokens(css), light, dark, APP_THEME_CONSTANT_TOKENS),
      ).toEqual([]);
    },
  );

  it("dashboard has no dead `.is-dark` rules (the theme lives on <html data-theme>)", () => {
    expect(stripComments(read(THEMED_APP_STYLESHEETS[0]))).not.toMatch(/\.is-dark/);
  });
});

/* ------------------------------------------------------------------ */
/* Cross-file custom-property collisions                               */
/* ------------------------------------------------------------------ */

/** Names of custom properties defined in any `:root`-level block (light or dark). */
const rootTokenNames = (css) => {
  const { light, dark } = parseThemes(css);
  return new Set([...light.keys(), ...dark.keys()]);
};

/**
 * `:root` tokens are global: when two stylesheets define the same name, the one
 * bundled LAST silently wins for the whole app. Returns, for a guarded file,
 * every palette name that another stylesheet (global.css excluded, it is the
 * source of truth and is referenced, not redefined) also defines.
 */
const findCollisions = (guardedPath, sheets) => {
  const own = rootTokenNames(sheets.get(guardedPath));
  const hits = [];
  for (const [otherPath, css] of sheets) {
    if (otherPath === guardedPath || otherPath === "styles/global.css") continue;
    for (const name of rootTokenNames(css)) {
      if (own.has(name)) hits.push(`${name} (also defined in ${otherPath})`);
    }
  }
  return hits;
};

const listStylesheets = (dir = src) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listStylesheets(full);
    return entry.name.endsWith(".css")
      ? [path.relative(src, full).split(path.sep).join("/")]
      : [];
  });

describe("palette collision scanner (mutation checks)", () => {
  const sheets = (extra) =>
    new Map([
      ["a.css", ":root { --x: #fff; }"],
      ["styles/global.css", ":root { --x: #000; --y: #000; }"],
      ...extra,
    ]);

  it("flags a name redefined in another :root block", () => {
    expect(findCollisions("a.css", sheets([["b.css", ":root { --x: #111; }"]]))).toHaveLength(1);
  });

  it("flags a name redefined in another dark block", () => {
    const b = ':root[data-theme="dark"] { --x: #111; }';
    expect(findCollisions("a.css", sheets([["b.css", b]]))).toHaveLength(1);
  });

  it("ignores global.css and unrelated names", () => {
    expect(findCollisions("a.css", sheets([["b.css", ":root { --z: #111; }"]]))).toEqual([]);
  });

  it("ignores the same name when it is not declared at :root level", () => {
    expect(findCollisions("a.css", sheets([["b.css", ".card { --x: #111; }"]]))).toEqual([]);
  });
});

describe("app-surface palettes do not collide with other stylesheets", () => {
  const sheets = new Map(listStylesheets().map((file) => [file, read(file)]));

  it.each(THEMED_APP_STYLESHEETS)("%s palette names are unique across src", (relative) => {
    expect(sheets.has(relative)).toBe(true);
    expect(findCollisions(relative, sheets)).toEqual([]);
  });
});
