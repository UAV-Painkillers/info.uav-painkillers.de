import fs from "fs";
import { execSync } from "child_process";

const outDir = "public/pwa";
const faviconDescriptionPath = "scripts/faviconDescription.json";
const faviconDataPath = "tmp.favicon/faviconData.json";
const mockHtmlPath = "tmp.favicon/mock.html";
const routerHeadPath = "src/components/router-head/router-head.tsx";
const generatedWebManifestPath = `${outDir}/site.webmanifest`;

function createTempDir() {
  if (!fs.existsSync("tmp.favicon")) {
    fs.mkdirSync("tmp.favicon");
  }
}

function increaseFaviconVersion() {
  const faviconDescription = JSON.parse(
    fs.readFileSync(faviconDescriptionPath, "utf8"),
  );
  faviconDescription.versioning.paramValue++;
  fs.writeFileSync(
    faviconDescriptionPath,
    JSON.stringify(faviconDescription, null, 2),
  );
}

function generateNewFavicons() {
  // make sure stdio is inherited so that the user can see the progress of the command
  const command = `npx cli-real-favicon generate ${faviconDescriptionPath} ${faviconDataPath} ${outDir}`;

  console.log("running command:", command);
  execSync(command, { stdio: "inherit" });
}

function createTemporaryHtmlFile() {
  const html = "<html><head></head><body></body></html>";
  fs.writeFileSync(mockHtmlPath, html);
}

function extractFaviconsFromTemporaryHtml() {
  const faviconData = JSON.parse(fs.readFileSync(faviconDataPath, "utf8"));
  const head = faviconData.favicon.html_code as string;
  const tags = head
    .split(">")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
  // make sure each html tag is closed
  const closedTags = tags.map((tag) => {
    if (!tag.endsWith("/")) {
      tag = tag + "/";
    }

    return tag + ">";
  });

  return closedTags.join("\n");
}

function replaceFaviconsInRouterHead() {
  const head = extractFaviconsFromTemporaryHtml();
  const routerHead = fs.readFileSync(routerHeadPath, "utf8");
  const startIndicator = "{/* GENERATED AUTOMATICALLY DO NOT TOUCH */}";
  const endIndicator = "{/* END OF AUTOGENERATED CONTENT */}";
  const startIndexOfAutoGeneratedContent =
    routerHead.indexOf(startIndicator) + startIndicator.length;
  const endIndexOfAutoGeneratedContent = routerHead.indexOf(endIndicator);
  const start = routerHead.slice(0, startIndexOfAutoGeneratedContent);
  const end = routerHead.slice(endIndexOfAutoGeneratedContent);
  const newRouterHead = start + head + end;
  fs.writeFileSync(routerHeadPath, newRouterHead);
}

function mergeWebManifests() {
  const baseWebManifestPath = "scripts/base.webmanifest";

  const generatedWebManifest = JSON.parse(
    fs.readFileSync(generatedWebManifestPath, "utf8"),
  );
  const baseWebManifest = JSON.parse(
    fs.readFileSync(baseWebManifestPath, "utf8"),
  );

  const newWebManifest = {
    ...baseWebManifest,
    icons: generatedWebManifest.icons,
  };

  fs.writeFileSync(
    generatedWebManifestPath,
    JSON.stringify(newWebManifest, null, 2),
  );
}

function cleanup() {
  fs.unlinkSync(faviconDataPath);
  fs.unlinkSync(mockHtmlPath);
  fs.rmdirSync("tmp.favicon");
}

createTempDir();
increaseFaviconVersion();
generateNewFavicons();
createTemporaryHtmlFile();
replaceFaviconsInRouterHead();
mergeWebManifests();
cleanup();
