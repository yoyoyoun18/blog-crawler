import axios from "axios";
import * as cheerio from "cheerio";
import { parse, FeedItem } from "feedparser-promised";
import * as fs from "fs";
import * as path from "path";
import * as puppeteer from "puppeteer";
import * as dotenv from "dotenv";

// .env 파일에서 환경 변수 로드
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

    // iframe 내부로 이동
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

async function monitorRssFeed(rssUrl: string | undefined, name: string) {
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

const rssUrl1 = process.env.RSS_URL1; // 황호영
const rssUrl2 = process.env.RSS_URL2; // 김영조

// 주기적으로 RSS 피드를 확인
setInterval(() => {
  monitorRssFeed(rssUrl1, "황호영");
}, 5000); // 5초마다 확인

setInterval(() => {
  monitorRssFeed(rssUrl2, "김영조");
}, 7000); // 7초마다 확인
