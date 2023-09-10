import axios from 'axios';
import parser from 'xml2json';
import {
  getKeyByValue,
  ArticleType,
  PostType,
  MediaType,
} from '../share/types';
import { PostMedia } from '../../shared/types';

enum NewsUrl {
  WORLD = 'https://www.goodnewsnetwork.org/category/news/world/feed/',
  INSPIRING = 'https://www.goodnewsnetwork.org/category/news/inspiring/feed/',
  ANIMALS = 'https://www.goodnewsnetwork.org/category/news/animals/feed/',
  HEALTH = 'https://www.goodnewsnetwork.org/category/news/health/feed/',
}

type NewsType = {
  title?: string;
  body?: string;
  image?: PostMedia;
  link?: string;
  articleType?: string;
  published_at?: Date;
};

const fetchNews = async (url: string) => {
  try {
    const feed = await axios.get(url);
    return parser.toJson(feed.data);
  } catch (e) {
    console.log('FetchNews Error', e);
  }
};

const fetchAllNews = async () => {
  let allNews = [];
  await Promise.all(
    Object.values(NewsUrl).map(async (url) => {
      const key = getKeyByValue(NewsUrl, url);
      const news = parseNews(await fetchNews(url), key);
      allNews = allNews.concat(news);
    })
  );
  return allNews;
};

const parseNews = (request: string, key: string): [NewsType] => {
  const newsObject: any = JSON.parse(request);
  const items = newsObject.rss.channel?.item || [];
  const news: [NewsType] = items.map((item) => {
    return {
      title: item?.title,
      body: item?.description,
      type: PostType.ARTICLE,
      articleType: ArticleType[key],
      link: item?.link,
      published_at: item.pubDate ? new Date(item.pubDate) : null,
      media: [
        {
          type: MediaType.PICTURE,
          src: item['media:content']?.url,
        },
      ],
    };
  });
  return news;
};

export { fetchAllNews };
