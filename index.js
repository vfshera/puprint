const express = require("express");
const puppeteer = require("puppeteer");
require("dotenv").config();

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (req.hostname === "localhost") {
    return res.status(418).send("☕☕☕");
  }
  next();
});

app.get("/_health", (req, res) => {
  res.status(200).send("ok");
});

app.post("/api/pdf", async (req, res) => {
  const { printUrl } = req.body;

  const browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
      "--disable-setuid-sandbox",
    ],
    headless: true,
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  const page = await browser.newPage();
  await page.goto(printUrl, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4", landscape: true });

  await browser.close();

  res.header({
    "Content-Type": "application/pdf",
  });
  res.status(200).send(pdfBuffer);
});

app.all("*", (req, res) => res.status(418).send("☕☕☕"));

process.on("uncaughtException", (error, origin) => {
  console.log("----- Uncaught exception -----");
  console.log(error);
  console.log("----- Exception origin -----");
  console.log(origin);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("----- Unhandled Rejection at -----");
  console.log(promise);
  console.log("----- Reason -----");
  console.log(reason);
});

process.on("SIGTERM", (signal) => {
  console.log(`Process ${process.pid} received a SIGTERM signal`);
  process.exit(0);
});

process.on("SIGINT", (signal) => {
  console.log(`Process ${process.pid} has been interrupted`);
  process.exit(0);
});

app.listen(port);
