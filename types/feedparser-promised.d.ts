declare module "feedparser-promised" {
  export interface FeedItem {
    title: string;
    description: string;
    summary: string;
    link: string;
    origlink: string;
    permalink: string;
    date: Date;
    pubdate: Date;
    pubDate: Date;
    author: string;
    guid: string;
    comments: string;
    image: { url: string };
    categories: string[];
    source: { url: string; title: string };
    enclosures: Array<{ url: string; type: string }>;
    meta: {
      title: string;
      description: string;
      link: string;
      xmlurl: string;
      date: Date;
      pubdate: Date;
      pubDate: Date;
      author: string;
      language: string;
      image: { url: string };
      favicon: string;
      copyright: string;
      generator: string;
      categories: string[];
    };
  }

  export function parse(url: string): Promise<FeedItem[]>;
}
