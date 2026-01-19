// javascript
import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// -------- CONFIG --------
const CONTENT_DIR = "content/docs";   // your MDX root
const ROUTE_PREFIX = "/docs";         // your docs route prefix
const BASE_URL = "http://localhost:3001";
const OUT_DIR = "out-docx";
const PANDOC = "pandoc";              // expects pandoc on PATH
// ------------------------

// Node 18+ has fetch built-in.
function fileToRoute(relFile) {
    const noExt = relFile.replace(/\.mdx$/, "");
    const noIndex = noExt.endsWith("/index") ? noExt.slice(0, -"/index".length) : noExt;
    const slug = noIndex.length ? `/${noIndex}` : "";
    return `${ROUTE_PREFIX}${slug}`;
}

function fileToDocxOut(relFile) {
    const noExt = relFile.replace(/\.mdx$/, "");
    const outRel = noExt.endsWith("/index") ? noExt.slice(0, -"/index".length) : noExt;
    const finalRel = outRel.length ? outRel : "index";
    return path.join(OUT_DIR, `${finalRel}.docx`);
}

// New: try <main>, then <body>, then whole HTML
function extractMainOrBody(html) {
    const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) return mainMatch[1];

    const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) return bodyMatch[1];

    return html;
}

function wrapHtml(title, innerHtml) {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
${innerHtml}
</body>
</html>`;
}

function escapeHtml(s) {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

async function main() {
    await fs.mkdir(OUT_DIR, { recursive: true });

    const mdxFiles = await fg(["**/*.mdx"], { cwd: CONTENT_DIR });
    if (mdxFiles.length === 0) {
        console.error(`No .mdx files found under ${CONTENT_DIR}`);
        process.exit(1);
    }

    console.log(`Found ${mdxFiles.length} MDX files. Exporting to DOCX...`);

    for (const rel of mdxFiles) {
        const route = fileToRoute(rel);
        const url = `${BASE_URL}${route}`;
        const outDocx = fileToDocxOut(rel);

        await fs.mkdir(path.dirname(outDocx), { recursive: true });

        console.log(`\n→ ${rel}`);
        console.log(`  GET ${url}`);

        const res = await fetch(url, {
            headers: {
                "User-Agent": "mdx-to-docx-exporter",
            },
        });

        if (!res.ok) {
            console.warn(`  ⚠️  Failed to fetch (${res.status}) ${url} — skipping`);
            continue;
        }

        const html = await res.text();

        const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
        const title = titleMatch?.[1]?.trim() || path.basename(rel, ".mdx");

        const inner = extractMainOrBody(html);

        const tmpHtmlPath = path.join(OUT_DIR, ".tmp.html");
        await fs.writeFile(tmpHtmlPath, wrapHtml(title, inner), "utf8");

        console.log(`  pandoc -> ${outDocx}`);

        await execFileAsync(PANDOC, [
            tmpHtmlPath,
            "-f", "html",
            "-t", "docx",
            "-o", outDocx,
        ]);

        await fs.rm(tmpHtmlPath, { force: true });
    }

    console.log(`\n✅ Done. DOCX files are in: ${OUT_DIR}/`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});