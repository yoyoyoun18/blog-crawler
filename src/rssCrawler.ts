import axios from "axios";
import * as cheerio from "cheerio";
import { parse, FeedItem } from "feedparser-promised";
import * as fs from "fs";
import * as path from "path";
import * as puppeteer from "puppeteer";
import * as dotenv from "dotenv";
import { parseStringPromise } from "xml2js";
import dayjs from "dayjs";

dotenv.config();

const START_DATE = dayjs("2024-08-02");
const END_DATE = dayjs("2024-08-05");

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
      const element = document.querySelector(
        ".se-main-container, ._postViewArea223532170007"
      );
      return element ? (element as HTMLElement).innerText : "";
    });
    await browser.close();
    return content || "";
  } catch (error) {
    console.error("Error fetching article content:", error);
    return "";
  }
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

function isWithinDateRange(date: Date): boolean {
  const articleDate = dayjs(date);
  return (
    (articleDate.isAfter(START_DATE) && articleDate.isBefore(END_DATE)) ||
    articleDate.isSame(START_DATE) ||
    articleDate.isSame(END_DATE)
  );
}

async function monitorRssFeed(rssUrl: string | undefined, name: any) {
  if (!rssUrl) {
    console.error(`RSS URL for ${name} is not defined.`);
    return;
  }

  const feed = await fetchRssFeed(rssUrl);
  if (feed && feed.length > 0) {
    const entriesWithinRange = feed.filter((entry) =>
      isWithinDateRange(new Date(entry.pubDate))
    );

    let combinedContent = "";

    for (const entry of entriesWithinRange) {
      console.log(`Article found within date range: ${entry.title}`);
      const articleContent = await getArticleContent(entry.link);

      combinedContent += `Title: ${entry.title}\n`;
      combinedContent += `Date: ${dayjs(entry.pubDate).format(
        "YYYY-MM-DD HH:mm:ss"
      )}\n`;
      combinedContent += `Content:\n${articleContent}\n\n`;
      combinedContent += "-----------------------------------\n\n";
    }

    if (entriesWithinRange.length > 0) {
      const fileName = `articles_${name}_${START_DATE.format(
        "YYYY-MM-DD"
      )}_to_${END_DATE.format("YYYY-MM-DD")}.txt`;
      saveContentToFile(combinedContent, fileName);
      console.log(`Saved ${entriesWithinRange.length} articles to ${fileName}`);
    } else {
      console.log("No articles found within the specified date range.");
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
    const entriesWithinRange = feed.filter((entry) =>
      isWithinDateRange(new Date(entry.pubDate[0]))
    );

    let combinedContent = "";

    for (const entry of entriesWithinRange) {
      console.log(`Article found within date range: ${entry.title[0]}`);
      const articleContent = await getArticleContentForBlex(
        entry.description[0]
      );

      combinedContent += `Title: ${entry.title[0]}\n`;
      combinedContent += `Date: ${dayjs(entry.pubDate[0]).format(
        "YYYY-MM-DD HH:mm:ss"
      )}\n`;
      combinedContent += `Content:\n${articleContent}\n\n`;
      combinedContent += "-----------------------------------\n\n";
    }

    if (entriesWithinRange.length > 0) {
      const fileName = `articles_${name}_${START_DATE.format(
        "YYYY-MM-DD"
      )}_to_${END_DATE.format("YYYY-MM-DD")}.txt`;
      saveContentToFile(combinedContent, fileName);
      console.log(`Saved ${entriesWithinRange.length} articles to ${fileName}`);
    } else {
      console.log("No articles found within the specified date range.");
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

// 모든 RSS 피드를 한 번에 처리
async function processAllFeeds() {
  await monitorRssFeed(rssUrl1, teamMate1);
  await monitorRssFeedForBlex(rssUrl2, teamMate2);
  await monitorRssFeed(rssUrl3, teamMate3);
  await monitorRssFeed(rssUrl4, teamMate4);
  await monitorRssFeed(rssUrl5, teamMate5);
  await monitorRssFeed(rssUrl6, teamMate6);
}

// 프로그램 실행
processAllFeeds()
  .then(() => {
    console.log("All RSS feeds processed.");
  })
  .catch((error) => {
    console.error("Error processing feeds:", error);
  });
