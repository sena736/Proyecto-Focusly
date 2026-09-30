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
 * Each entry also carries `context`: the selector / at-rule preludes of every
 * enclosing block, outermost first (used to tell dark rules from light ones).
 */
const walkDeclarations = (css) => {
  const found = [];
  const context = [];
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
        context: [...context],
      });
    }
    buf = "";
  };

  for (const ch of css) {
    if (ch === "(") parens += 1;
    else if (ch === ")") parens = Math.max(0, parens - 1);

    if (parens === 0 && ch === "{") {
      context.push(buf.trim());
      buf = "";
      depth += 1;
    } else if (parens === 0 && ch === ";") {
      flush();
    } else if (parens === 0 && ch === "}") {
      flush();
      context.pop();
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

/** `#abc` -> `#aabbcc`, `#abcd` -> `#aabbccdd` (input already lower-cased). */
const expandHex = (value) =>
  value.replace(/#([0-9a-f]{3,4})\b/g, (_, digits) =>
    `#${[...digits].map((d) => d + d).join("")}`,
  );

const normalize = (value) =>
  expandHex(value.replace(/\s+/g, " ").trim().toLowerCase());

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

const DARK_CONTEXT_RE = /\[data-theme=["']dark["']\]/;

/**
 * Custom properties DECLARED (inside a declaration block, never in a selector)
 * in rules that apply in light mode: any block whose selector chain does not
 * mention the dark attribute. A token declared only in the dark block (or under
 * a dark descendant selector) is therefore NOT in this set.
 */
const lightDeclaredTokens = (css) =>
  new Set(
    walkDeclarations(stripComments(css))
      .filter(
        ({ depth, prop, context }) =>
          depth > 0 &&
          prop.startsWith("--") &&
          !context.some((prelude) => DARK_CONTEXT_RE.test(prelude)),
      )
      .map(({ prop }) => prop),
  );

/**
 * Tokens used through `var()` that are defined neither in the global light
 * palette, nor in a light-applicable rule of the file itself, nor set at
 * runtime from JSX.
 */
const undefinedTokenUses = (css, globalLight, runtime = []) => {
  const own = lightDeclaredTokens(css);
  return [...usedTokens(css)].filter(
    (token) => !globalLight.has(token) && !own.has(token) && !runtime.includes(token),
  );
};

/** Value of a plain (non-custom) property declared directly in a matching block. */
const blockProperty = (css, selectorSource, property) => {
  for (const body of findBlocks(stripComments(css), selectorSource)) {
    const hit = walkDeclarations(body).find(
      ({ depth, prop }) => depth === 0 && prop === property,
    );
    if (hit) return hit.value;
  }
  return undefined;
};

/* WCAG helpers (6-digit hex only: that is all the resolved palette uses). */
const hexToRgb = (hex) => {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) throw new Error(`expected a 6-digit hex colour, got "${hex}"`);
  return [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16));
};

/** `fg` painted at `alpha` over `backdrop` (both hex) -> [r, g, b]. */
const blendOver = (fg, backdrop, alpha) => {
  const top = hexToRgb(fg);
  const back = hexToRgb(backdrop);
  return top.map((channel, i) => channel * alpha + back[i] * (1 - alpha));
};

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

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

  it("treats shorthand hex as the same colour as its expanded form", () => {
    const shorthandLight = new Map([["--bg", "#ffffff"], ["--fg", "#AABBCC"]]);
    expect(themeIssues(["--bg"], shorthandLight, new Map([["--bg", "#fff"]]))).toHaveLength(1);
    expect(themeIssues(["--fg"], shorthandLight, new Map([["--fg", "#abc"]]))).toHaveLength(1);
    // #rgba expands too.
    const alphaLight = new Map([["--a", "#11223344"]]);
    expect(themeIssues(["--a"], alphaLight, new Map([["--a", "#1234"]]))).toHaveLength(1);
    // A genuinely different shorthand still counts as adapted.
    expect(themeIssues(["--bg"], shorthandLight, new Map([["--bg", "#000"]]))).toEqual([]);
  });
});

describe("custom property declarations (mutation checks)", () => {
  const globalLight = new Set(["--global"]);

  it("ignores selector fragments that merely look like `--x:`", () => {
    const css = ".a--missing:hover { color: red; }\n.b { color: var(--missing); }";
    expect(undefinedTokenUses(css, globalLight)).toEqual(["--missing"]);
  });

  it("fails a token that is declared ONLY in the dark block", () => {
    const css =
      ':root[data-theme="dark"] { --dark-only: #000; }\n.b { color: var(--dark-only); }';
    expect(undefinedTokenUses(css, globalLight)).toEqual(["--dark-only"]);
  });

  it("fails a token declared only under a dark descendant selector", () => {
    const css =
      '[data-theme="dark"] .card { --dark-only: #000; }\n.b { color: var(--dark-only); }';
    expect(undefinedTokenUses(css, globalLight)).toEqual(["--dark-only"]);
  });

  it("accepts a token defined in the light palette (even if dark overrides it)", () => {
    const css =
      ':root { --x: #fff; }\n:root[data-theme="dark"] { --x: #000; }\n.b { color: var(--x); }';
    expect(undefinedTokenUses(css, globalLight)).toEqual([]);
  });

  it("accepts tokens from global :root", () => {
    expect(undefinedTokenUses(".b { color: var(--global); }", globalLight)).toEqual([]);
  });

  it("accepts component-scoped properties declared in a normal rule", () => {
    const css = ".toggle { --toggle-width: 40px; width: var(--toggle-width); }";
    expect(undefinedTokenUses(css, globalLight)).toEqual([]);
  });

  it("accepts runtime tokens only when listed", () => {
    const css = ".b { width: var(--progress); }";
    expect(undefinedTokenUses(css, globalLight)).toEqual(["--progress"]);
    expect(undefinedTokenUses(css, globalLight, ["--progress"])).toEqual([]);
  });
});

describe("color-scheme helper (mutation checks)", () => {
  it("reads the declaration from the matching block only", () => {
    const css = ':root { color-scheme: light; }\n[data-theme="dark"] { color-scheme: dark; }';
    expect(blockProperty(css, LIGHT_SELECTOR, "color-scheme")).toBe("light");
    expect(blockProperty(css, DARK_SELECTOR, "color-scheme")).toBe("dark");
  });

  it("returns undefined when the block lacks the property", () => {
    expect(blockProperty(":root { --a: #fff; }", LIGHT_SELECTOR, "color-scheme")).toBeUndefined();
  });

  it("does not read a nested rule's declaration as the block's own", () => {
    const css = ':root { .x { color-scheme: dark; } }';
    expect(blockProperty(css, LIGHT_SELECTOR, "color-scheme")).toBeUndefined();
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

  // Without `color-scheme` the native date picker icon, select popups and
  // scrollbars keep the light UA theme on a dark page.
  it("declares color-scheme: light on :root and color-scheme: dark in the dark block", () => {
    const css = stripComments(read("styles/global.css"));
    expect(blockProperty(css, LIGHT_SELECTOR, "color-scheme")).toBe("light");
    expect(blockProperty(css, DARK_SELECTOR, "color-scheme")).toBe("dark");
  });

  it("themes the scrollbar thumb through tokens (no literals, different in dark)", () => {
    const css = stripComments(read("styles/global.css"));
    const thumbRules = css.match(/::-webkit-scrollbar-thumb[^{]*\{[^}]*\}/g) ?? [];
    expect(thumbRules.length).toBeGreaterThan(0);
    expect(findLiterals(thumbRules.join("\n"))).toEqual([]);
    const tokens = ["--scrollbar-thumb", "--scrollbar-thumb-hover"];
    tokens.forEach((token) => expect(usedTokens(thumbRules.join("\n")).has(token)).toBe(true));
    expect(themeIssues(tokens, lightTokens, darkTokens)).toEqual([]);
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
 *
 * Known, pre-existing exception (NOT a regression, identical in light): the
 * white-on-warning/danger fills in ConfirmModal/Modal are low-contrast brand
 * constants (#d99a24 2.44:1, #d95353 3.95:1, #c45c68 4.14:1). They are
 * deliberately left unchanged here.
 */
const THEMED_APP_STYLESHEETS = [
  "pages/Dashboard/Dashboard.css",
  "components/ui/Avatar/Avatar.css",
  "components/ui/Alert/Alert.css",
  // Pomodoro page
  "components/pomodoro/PomodoroTimer/PomodoroTimer.css",
  "components/pomodoro/PomodoroControls/PomodoroControls.css",
  "components/pomodoro/PomodoroHistory/PomodoroHistory.css",
  "components/pomodoro/PomodoroSettings/PomodoroSettings.css",
  // Motivation page (pages/Motivation/Motivation.css is an orphan: nothing imports it)
  "components/motivation/MotivationCard/MotivationCard.css",
  // Profile page
  "pages/Profile/Profile.css",
  "components/profile/ProfileCard/ProfileCard.css",
  // Tasks page (pages/Tasks/Tasks.css is token-only, see TOKEN_ONLY_STYLESHEETS)
  "components/tasks/TaskCard/TaskCard.css",
  "components/tasks/TaskForm/TaskForm.css",
  "components/tasks/TaskFilters/TaskFilters.css",
  // Admin users page (pages/admin/UserTable/UserTable.css is an orphan: no importer)
  "components/admin/UserTable/UserTable.css",
  "components/admin/RoleSelect/RoleSelect.css",
  // Page header shared by Tasks, Pomodoro, Profile, Motivation and admin Users
  "components/layout/PageHeader/PageHeader.css",
  // Bottom navigation bar mounted by UserLayout (mobile only)
  "components/layout/MobileNavigation/MobileNavigation.css",
  // Admin panel (/admin)
  "pages/admin/AdminDashboard/AdminDashboard.css",
  // Form primitives used by Login, Register, TaskForm and TaskCard. Card,
  // Checkbox and Select are NOT listed: no live code imports those components.
  "components/ui/Input/Input.css",
  "components/ui/Button/Button.css",
  "components/ui/IconButton/IconButton.css",
  // Shared UI that live pages render.
  "components/ui/Modal/Modal.css",
  "components/ui/ConfirmModal/ConfirmModal.css",
  "components/ui/EmptyState/EmptyState.css",
  "components/ui/Loader/Loader.css",
  "components/ui/ToggleSwitch/ToggleSwitch.css",
];

/**
 * Stylesheets that own NO palette: they already use global tokens only. They
 * get the same literal / undefined-token / dark-differs checks as the palette
 * stylesheets, without requiring their own dark block.
 */
const TOKEN_ONLY_STYLESHEETS = ["pages/Tasks/Tasks.css", "pages/admin/Users/Users.css"];

/**
 * Extra colour tokens that are allowed NOT to change in dark mode, per
 * stylesheet. Each entry needs a written reason (same rule as the lists above).
 */
const EXTRA_CONSTANT_TOKENS = {
  // Teal fills that always sit behind --on-primary text: #4e767d is ~5:1 against
  // white and ~3.3:1 against the dark surface, so the same fill works on both.
  "components/tasks/TaskFilters/TaskFilters.css": [
    "--tfilt-active-bg",
    "--tfilt-active-hover",
  ],
  // Light-blue focus ring/border: ~9:1 against the dark surface and ~1.9:1 on
  // white (same as before), so it reads as a ring on both themes.
  "components/admin/RoleSelect/RoleSelect.css": [
    "--rsel-focus",
    "--rsel-focus-glow",
  ],
  // Danger fill (#c45c68) only ever sits behind white text; the white spinner
  // ring is drawn on that same fill.
  "components/ui/Modal/Modal.css": ["--modal-danger", "--modal-spinner-track"],
  // Solid confirm-button fills: always behind --on-primary text, same on both themes.
  "components/ui/ConfirmModal/ConfirmModal.css": [
    "--cmodal-danger-fill",
    "--cmodal-danger-fill-hover",
    "--cmodal-warning-fill",
    "--cmodal-warning-fill-hover",
  ],
};

const constantsFor = (relative) => [
  ...APP_THEME_CONSTANT_TOKENS,
  ...(EXTRA_CONSTANT_TOKENS[relative] ?? []),
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
    "%s only uses tokens defined in the light palette (global.css or its own non-dark rules)",
    (relative) => {
      // Component-scoped custom properties (e.g. `.focusly-toggle { --toggle-width }`)
      // declared in a normal rule of the file are fine. A token declared ONLY in
      // the dark block is NOT: in light it would resolve to nothing.
      expect(
        undefinedTokenUses(read(relative), new Set(lightTokens.keys()), RUNTIME_TOKENS),
      ).toEqual([]);
    },
  );

  it("TaskCard: the completed opacity keeps every chip >= 4.5:1 in dark, light stays .75", () => {
    const css = read("components/tasks/TaskCard/TaskCard.css");
    const own = parseThemes(css);
    const light = new Map([...lightTokens, ...own.light]);
    const dark = new Map([...darkTokens, ...own.dark]);

    expect(light.get("--tcard-done-opacity")).toBe("0.75");
    expect(stripComments(css)).toMatch(
      /\.task-card-completed\s*{[^}]*opacity:\s*var\(--tcard-done-opacity\)/,
    );

    const opacity = parseFloat(dark.get("--tcard-done-opacity") ?? light.get("--tcard-done-opacity"));
    const chips = [
      ["--tcard-tint", "--tcard-accent"],
      ["--tcard-low-bg", "--tcard-low-text"],
      ["--tcard-high-bg", "--tcard-high-text"],
      ["--tcard-date-bg", "--tcard-date-text"],
    ];
    const resolve = (token) => effectiveValue(token, dark, light);
    // The dimmed card is blended over whatever sits behind it (page or surface).
    for (const backdrop of ["--background", "--surface"]) {
      for (const [bg, fg] of chips) {
        const ratio = contrastRatio(
          blendOver(resolve(fg), resolve(backdrop), opacity),
          blendOver(resolve(bg), resolve(backdrop), opacity),
        );
        expect(ratio, `${fg} on ${bg} over ${backdrop} at opacity ${opacity}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it.each(THEMED_APP_STYLESHEETS)(
    "%s only uses colour tokens whose dark value differs from light",
    (relative) => {
      const css = read(relative);
      const own = parseThemes(css);
      const light = new Map([...lightTokens, ...own.light]);
      const dark = new Map([...darkTokens, ...own.dark]);
      expect(
        themeIssues(usedTokens(css), light, dark, constantsFor(relative)),
      ).toEqual([]);
    },
  );

  it.each(THEMED_APP_STYLESHEETS)(
    "%s has a dark palette block (light values alone would never switch)",
    (relative) => {
      const { lightBlocks, darkBlocks, dark } = parseThemes(read(relative));
      expect(lightBlocks).toBeGreaterThan(0);
      expect(darkBlocks).toBeGreaterThan(0);
      expect(dark.size).toBeGreaterThan(0);
    },
  );

  it.each(TOKEN_ONLY_STYLESHEETS)(
    "%s (token-only) has no colour literals and only themed global tokens",
    (relative) => {
      const css = read(relative);
      expect(findLiterals(css)).toEqual([]);
      expect(
        [...usedTokens(css)].filter((token) => !lightTokens.has(token)),
      ).toEqual([]);
      expect(
        themeIssues(usedTokens(css), lightTokens, darkTokens, constantsFor(relative)),
      ).toEqual([]);
    },
  );

  it.each([...THEMED_APP_STYLESHEETS, ...TOKEN_ONLY_STYLESHEETS])(
    "%s never uses the brand fill --primary as text colour (use --primary-text)",
    (relative) => {
      const css = withoutPalette(read(relative));
      expect(css).not.toMatch(/(?<![-\w])color:\s*var\(--primary\)/);
    },
  );

  it("text on a brand fill uses --on-primary, never --surface (dark surface on purple is ~2.8:1)", () => {
    const css = stripComments(read("pages/Tasks/Tasks.css"));
    const button = css.match(/\.tasks-create-button\s*{[^}]*}/)?.[0] ?? "";
    expect(button).toMatch(/color:\s*var\(--on-primary\)/);
    expect(button).not.toMatch(/(?<![-\w])color:\s*var\(--surface\)/);
  });

  it("dashboard has no dead `.is-dark` rules (the theme lives on <html data-theme>)", () => {
    expect(stripComments(read(THEMED_APP_STYLESHEETS[0]))).not.toMatch(/\.is-dark/);
  });
});

describe("text contrast of shared form / header tokens", () => {
  const themed = (relative) => {
    const own = parseThemes(read(relative));
    return {
      light: new Map([...lightTokens, ...own.light]),
      dark: new Map([...darkTokens, ...own.dark]),
    };
  };

  it("dark input placeholder is >= 4.5:1 on the dark input surface", () => {
    const { light, dark } = themed("components/ui/Input/Input.css");
    const ratio = contrastRatio(
      hexToRgb(effectiveValue("--inp-placeholder", dark, light)),
      hexToRgb(effectiveValue("--inp-surface", dark, light)),
    );
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("light input placeholder keeps its original value", () => {
    expect(themed("components/ui/Input/Input.css").light.get("--inp-placeholder")).toBe("#aaa5b2");
  });

  it("light page header subtitle is >= 4.5:1 on the page background and differs in dark", () => {
    const { light, dark } = themed("components/layout/PageHeader/PageHeader.css");
    const bg = effectiveValue("--background", light, light);
    const lightColour = effectiveValue("--phdr-subtitle", light, light);

    expect(contrastRatio(hexToRgb(lightColour), hexToRgb(bg))).toBeGreaterThanOrEqual(4.5);
    expect(normalize(effectiveValue("--phdr-subtitle", dark, light))).not.toBe(
      normalize(lightColour),
    );
  });

  it.each(["pages/Login/Login.css", "pages/Register/Register.css"])(
    "%s never paints text with the brand fill tokens --primary / --primary-hover",
    (relative) => {
      const css = stripComments(read(relative));
      expect(css).not.toMatch(/(?<![-\w])color:\s*var\(--primary(?:-hover)?\)/);
    },
  );
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

const listFiles = (test, dir = src) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(test, full);
    return test(entry.name)
      ? [path.relative(src, full).split(path.sep).join("/")]
      : [];
  });

const listStylesheets = () => listFiles((name) => name.endsWith(".css"));
const listSources = () => listFiles((name) => /\.jsx?$/.test(name));

/* ------------------------------------------------------------------ */
/* Import graph (is a stylesheet reachable from the app entry point?)  */
/* ------------------------------------------------------------------ */

/** The bundle root. Everything the app renders is reachable from here. */
const ENTRY_POINTS = ["main.jsx"];

const TEST_FILE_RE = /\.test\.jsx?$/;

const stripJsComments = (code) =>
  code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");

/**
 * Relative specifiers of static imports, `export ... from`, side-effect imports
 * and dynamic `import("...")` (which also covers `lazy(() => import(...))`).
 */
const importSpecifiers = (code) => {
  const clean = stripJsComments(code);
  const specs = [];
  const staticRe = /\b(?:import|export)\s+(?:[^"'();]*?\s+from\s+)?["']([^"']+)["']/g;
  const dynamicRe = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
  for (const match of clean.matchAll(staticRe)) specs.push(match[1]);
  for (const match of clean.matchAll(dynamicRe)) specs.push(match[1]);
  return specs.filter((spec) => spec.startsWith("."));
};

/** Resolves `spec` against `from` to a known file (exact, +ext, or /index). */
const resolveImport = (from, spec, known) => {
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));
  return [base, `${base}.jsx`, `${base}.js`, `${base}/index.jsx`, `${base}/index.js`].find(
    (candidate) => known.has(candidate),
  );
};

/**
 * Edges `file -> imported file` between non-test sources and stylesheets.
 * Specifiers are resolved from each importing file's own directory, so two
 * stylesheets that share a basename are never confused. Test files are not
 * nodes: a test importing a component must not make it "live".
 */
const buildImportGraph = (sources, stylesheets) => {
  const files = [...sources.keys()].filter((file) => !TEST_FILE_RE.test(file));
  const known = new Set([...files, ...stylesheets]);
  const graph = new Map();
  for (const file of files) {
    const targets = new Set();
    for (const spec of importSpecifiers(sources.get(file))) {
      const target = resolveImport(file, spec, known);
      if (target) targets.add(target);
    }
    graph.set(file, targets);
  }
  return graph;
};

/** Every file reachable from `entries` (entries included); cycles are safe. */
const reachableFrom = (entries, graph) => {
  const seen = new Set();
  const queue = entries.filter((entry) => graph.has(entry));
  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    for (const target of graph.get(file) ?? []) queue.push(target);
  }
  return seen;
};

/** True when some REACHABLE file imports exactly this stylesheet. */
const isLiveStylesheet = (stylesheet, graph, reachable) =>
  [...reachable].some((file) => graph.get(file)?.has(stylesheet));

describe("import graph walker (mutation checks)", () => {
  const entries = ["main.jsx"];
  const liveCss = (sources, css, stylesheets) => {
    const graph = buildImportGraph(new Map(sources), new Set(stylesheets));
    return isLiveStylesheet(css, graph, reachableFrom(entries, graph));
  };

  it("reaches a stylesheet through entry -> component -> css", () => {
    const sources = [
      ["main.jsx", 'import App from "./App";'],
      ["App.jsx", 'import Card from "./Card/Card";'],
      ["Card/Card.jsx", 'import "./Card.css";'],
    ];
    expect(liveCss(sources, "Card/Card.css", ["Card/Card.css"])).toBe(true);
  });

  it("rejects a stylesheet whose only importer is a dead component", () => {
    const sources = [
      ["main.jsx", 'import App from "./App";'],
      ["App.jsx", "export default () => null;"],
      ["Card/Card.jsx", 'import "./Card.css";'],
    ];
    expect(liveCss(sources, "Card/Card.css", ["Card/Card.css"])).toBe(false);
  });

  it("does not let a test file make a component live", () => {
    const sources = [
      ["main.jsx", "export {};"],
      ["Dead/Dead.jsx", 'import "./Dead.css";'],
      ["Dead/Dead.test.jsx", 'import Dead from "./Dead";'],
    ];
    expect(liveCss(sources, "Dead/Dead.css", ["Dead/Dead.css"])).toBe(false);
  });

  it("resolves basename collisions by directory, not by file name", () => {
    const sources = [
      ["main.jsx", 'import T from "./components/UserTable/UserTable";'],
      ["components/UserTable/UserTable.jsx", 'import "./UserTable.css";'],
    ];
    const sheets = ["components/UserTable/UserTable.css", "pages/admin/UserTable/UserTable.css"];
    expect(liveCss(sources, sheets[0], sheets)).toBe(true);
    expect(liveCss(sources, sheets[1], sheets)).toBe(false);
  });

  it("does not treat an import cycle among dead files as live", () => {
    const sources = [
      ["main.jsx", "export {};"],
      ["a.jsx", 'import b from "./b";\nimport a from "./a";'],
      ["b.jsx", 'import a from "./a";\nimport "./X.css";'],
    ];
    expect(liveCss(sources, "X.css", ["X.css"])).toBe(false);
  });

  it("follows extension-less, index, re-export and dynamic imports", () => {
    const sources = [
      ["main.jsx", 'import A from "./a";\nexport { default as B } from "./b";\nconst C = lazy(() => import("./c"));'],
      ["a/index.jsx", 'import "./A.css";'],
      ["b.js", 'import "./B.css";'],
      ["c.jsx", 'import "./C.css";'],
    ];
    const sheets = ["a/A.css", "B.css", "C.css"];
    sheets.forEach((css) => expect(liveCss(sources, css, sheets)).toBe(true));
  });

  it("resolves parent-relative specifiers and ignores bare packages", () => {
    const sources = [
      ["main.jsx", 'import P from "./pages/P/P";\nimport React from "react";'],
      ["pages/P/P.jsx", 'import W from "../../widgets/W/W";'],
      ["widgets/W/W.jsx", 'import "./W.css";'],
    ];
    expect(liveCss(sources, "widgets/W/W.css", ["widgets/W/W.css"])).toBe(true);
  });

  it("handles multi-line imports", () => {
    const sources = [
      ["main.jsx", 'import {\n  a,\n  b,\n} from "./lib";'],
      ["lib.js", 'import "./lib.css";'],
    ];
    expect(liveCss(sources, "lib.css", ["lib.css"])).toBe(true);
  });
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

describe("guarded stylesheets are imported by live code", () => {
  const sources = new Map(listSources().map((file) => [file, read(file)]));
  const graph = buildImportGraph(sources, new Set(listStylesheets()));
  const live = reachableFrom(ENTRY_POINTS, graph);

  it("finds the entry points in src", () => {
    ENTRY_POINTS.forEach((entry) => expect(sources.has(entry)).toBe(true));
    expect(live.size).toBeGreaterThan(ENTRY_POINTS.length);
  });

  it.each([...PUBLIC_STYLESHEETS, ...THEMED_APP_STYLESHEETS, ...TOKEN_ONLY_STYLESHEETS])(
    "%s is imported by a component reachable from main.jsx (dead components must not be converted)",
    (relative) => {
      expect(isLiveStylesheet(relative, graph, live)).toBe(true);
    },
  );
});
