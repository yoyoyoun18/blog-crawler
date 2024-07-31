import axios from "axios";
import * as cheerio from "cheerio";
import { parse, FeedItem } from "feedparser-promised";
import * as fs from "fs";
import * as path from "path";
import * as puppeteer from "puppeteer";
import * as dotenv from "dotenv";
import { parseStringPromise } from "xml2js";

dotenv.config();

let lastLinks: { [key: string]: string | null } = {};

async function fetchRssFeed(url: string): Promise<FeedItem[]> {
  try {
    const feed = await parse(url);
    return feed;
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return [];
  }
}

async function getArticleContent(url: string): Promise<string> {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const frames = await page.frames();
    const contentFrame = frames.find((frame) =>
      frame.url().includes("PostView.naver")
    );

    const content = await contentFrame?.evaluate(() => {
      const element = document.querySelector(".se-main-container");
      return element ? (element as HTMLElement).innerText : "";
    });

    await browser.close();
    return content || "";
  } catch (error) {
    console.error("Error fetching article content:", error);
    return "";
  }
}

function getCurrentDateFormatted(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

function saveContentToFile(content: string, fileName: string): void {
  const filePath = path.join(__dirname, fileName);
  fs.writeFile(filePath, content, "utf8", (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log(`Content saved to ${filePath}`);
    }
  });
}

async function monitorRssFeed(rssUrl: string | undefined, name: any) {
  if (!rssUrl) {
    console.error(`RSS URL for ${name} is not defined.`);
    return;
  }

  const feed = await fetchRssFeed(rssUrl);
  if (feed && feed.length > 0) {
    const latestEntry = feed[0];
    if (latestEntry.link !== lastLinks[rssUrl]) {
      lastLinks[rssUrl] = latestEntry.link;
      console.log(`New article found: ${latestEntry.title}`);
      const articleContent = await getArticleContent(latestEntry.link);
      console.log(articleContent);
      const dateFormatted = getCurrentDateFormatted();
      const fileName = `article_${name}_${dateFormatted}.txt`;
      saveContentToFile(articleContent, fileName);
    } else {
      console.log("No new articles.");
    }
  }
}

async function fetchRssFeedForBlex(url: string): Promise<any[]> {
  try {
    const response = await axios.get(url);
    const feed = await parseStringPromise(response.data);
    return feed.rss.channel[0].item;
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return [];
  }
}

async function getArticleContentForBlex(description: string): Promise<string> {
  try {
    const $ = cheerio.load(description);
    const contentText = $.text().trim();
    console.log("Description content:", contentText);
    return contentText;
  } catch (error) {
    console.error("Error parsing article content:", error);
    return "";
  }
}

async function monitorRssFeedForBlex(rssUrl: string | undefined, name: any) {
  if (!rssUrl) {
    console.error(`RSS URL for ${name} is not defined.`);
    return;
  }

  const feed = await fetchRssFeedForBlex(rssUrl);
  if (feed && feed.length > 0) {
    const latestEntry = feed[0];
    if (latestEntry.link[0] !== lastLinks[rssUrl]) {
      lastLinks[rssUrl] = latestEntry.link[0];
      console.log(`New article found: ${latestEntry.title[0]}`);
      const articleContent = await getArticleContentForBlex(
        latestEntry.description[0]
      );
      console.log(articleContent);
      const dateFormatted = getCurrentDateFormatted();
      const fileName = `article_${name}_${dateFormatted}.txt`;
      saveContentToFile(articleContent, fileName);
    } else {
      console.log("No new articles.");
    }
  }
}

const rssUrl1 = process.env.RSS_URL1;
const rssUrl2 = process.env.RSS_URL2;
const rssUrl3 = process.env.RSS_URL3;
const rssUrl4 = process.env.RSS_URL4;
const rssUrl5 = process.env.RSS_URL5;
const rssUrl6 = process.env.RSS_URL6;

const teamMate1 = process.env.TEAM_MATE1;
const teamMate2 = process.env.TEAM_MATE2;
const teamMate3 = process.env.TEAM_MATE3;
const teamMate4 = process.env.TEAM_MATE4;
const teamMate5 = process.env.TEAM_MATE5;
const teamMate6 = process.env.TEAM_MATE6;

// 순서대로 확인
setInterval(() => {
  monitorRssFeed(rssUrl3, teamMate3);
}, 3000);

setInterval(() => {
  monitorRssFeed(rssUrl1, teamMate1);
}, 5000);

setInterval(() => {
  monitorRssFeedForBlex(rssUrl2, teamMate2);
}, 1000);

setInterval(() => {
  monitorRssFeed(rssUrl4, teamMate4);
}, 9000);

setInterval(() => {
  monitorRssFeed(rssUrl5, teamMate5);
}, 11000);

setInterval(() => {
  monitorRssFeed(rssUrl6, teamMate6);
}, 13000);
