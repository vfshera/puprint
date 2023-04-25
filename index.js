const express = require("express");
const puppeteer = require("puppeteer");

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.post("/api/pdf", async (req, res) => {
  const { printUrl } = req.body;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(printUrl, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4", landscape: true });

  await browser.close();

  res.header({
    "Content-Type": "application/pdf",
  });
  res.status(200).send(pdfBuffer);
});

app.all("*", (req, res) => res.send(""));

app.listen(port);
