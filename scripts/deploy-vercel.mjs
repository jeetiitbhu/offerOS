import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const token = process.env.VERCEL_TOKEN;
const projectName = process.env.VERCEL_PROJECT_NAME || "help-near-me";
const root = process.cwd();
const textExtensions = new Set([".css", ".html", ".js", ".json", ".mjs", ".txt"]);
const staticFiles = [
  "index.html",
  "public/images/community-hero.png",
  "src/app.js",
  "src/resources.js",
  "src/styles.css"
];

if (!token) {
  console.error("Missing VERCEL_TOKEN. Run with: VERCEL_TOKEN=... node scripts/deploy-vercel.mjs");
  process.exit(1);
}

async function collectFiles() {
  const files = [
    {
      file: ".vercel/output/config.json",
      data: JSON.stringify({ version: 3 }),
      encoding: "utf-8"
    }
  ];

  for (const sourcePath of staticFiles) {
    const fullPath = join(root, sourcePath);
    const body = await readFile(fullPath);
    const isText = textExtensions.has(extname(fullPath));

    files.push({
      file: `.vercel/output/static/${sourcePath}`,
      data: isText ? body.toString("utf8") : body.toString("base64"),
      encoding: isText ? "utf-8" : "base64"
    });
  }

  return files;
}

async function createDeployment(files) {
  const response = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: projectName,
      project: projectName,
      target: "production",
      files,
      projectSettings: {
        buildCommand: null,
        devCommand: null,
        framework: null,
        installCommand: null,
        outputDirectory: null
      }
    })
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(json, null, 2));
  }

  return json;
}

const files = await collectFiles();
const deployment = await createDeployment(files);

console.log(`Deployment created: https://${deployment.url}`);
if (deployment.alias?.length) {
  console.log(`Aliases: ${deployment.alias.map((alias) => `https://${alias}`).join(", ")}`);
}
