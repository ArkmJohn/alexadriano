import puppeteer from "puppeteer";
import http from "http";
import { readFile } from "fs/promises";
import path from "path";
import mime from "mime-types";

const root = process.cwd();

const server = http.createServer(async (req, res) => {
  try {
    const requestPath = req.url === "/" ? "/index.html" : req.url;
    const filePath = path.join(root, decodeURIComponent(requestPath));
    const content = await readFile(filePath);
    const contentType = mime.lookup(filePath) || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(404);
    res.end("Not found");
  }
});

await new Promise((resolve) => server.listen(4321, resolve));

const browser = await puppeteer.launch();
const [page] = await browser.pages();

const consoleMessages = [];
page.on("console", (msg) => {
  consoleMessages.push({ type: msg.type(), text: msg.text() });
});

await page.goto("http://127.0.0.1:4321/index.html", { waitUntil: "networkidle0" });

const errors = consoleMessages.filter((m) => m.type === "error");
if (errors.length > 0) {
  console.log("Console errors:");
  errors.forEach((err) => console.log(`- ${err.text}`));
} else {
  console.log("No console errors detected.");
}

const cardCount = await page.evaluate(() => document.querySelectorAll(".js-card").length);
const activeTitleInitial = await page.evaluate(
  () => document.querySelector("[data-active-title]")?.textContent ?? ""
);

await page.click("[data-next]");
await new Promise((resolve) => setTimeout(resolve, 700));
const activeTitleAfterNext = await page.evaluate(
  () => document.querySelector("[data-active-title]")?.textContent ?? ""
);

await page.keyboard.press("ArrowRight");
await new Promise((resolve) => setTimeout(resolve, 700));
const activeTitleAfterKey = await page.evaluate(
  () => document.querySelector("[data-active-title]")?.textContent ?? ""
);

console.log(`Card elements detected: ${cardCount}`);
console.log(`Initial active title: ${activeTitleInitial}`);
console.log(`After NEXT button: ${activeTitleAfterNext}`);
console.log(`After ArrowRight: ${activeTitleAfterKey}`);

const reducedMotion = await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
console.log(`prefers-reduced-motion? ${reducedMotion}`);

await browser.close();
server.close();
