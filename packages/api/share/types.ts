const { toUpper } = require('lodash');

enum PostType {
  ARTICLE = 'article',
  GIVE = 'give',
  ASK = 'ask',
  GAB = 'gab',
  OTHER = 'other',
}

enum ArticleType {
  WORLD = 'world',
  INSPIRING = 'inspiring',
  ANIMALS = 'animals',
  HEALTH = 'health',
}

enum TakeTime {
  QUARTER = '0-15 Mins',
  HALF = '15-30 Mins',
  HOUR = '-60 Mins',
  MOREHOURS = '60+ Mins',
}
enum TimeFrame {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night',
  ASAP = 'asap',
  ANYTIME = 'anytime',
}

enum TimeFrameExpired {
  MORNING = 12, // 6AM-12PM
  AFTERNOON = 17, // 12PM-17PM
  EVENING = 22, //17PM - 10PM
  NIGHT = 6, //22PM-6AM
}

enum ContactMethod {
  CALL = 'Over the Phone',
  TEXT = 'Text to Phone',
  APPCHAT = 'In App Chat',
}

enum PostStatus {
  DRAFT = 'draft',
  ARCHIVED = 'archived',
  ACTIVE = 'active',
  DELETE = 'delete',
}

enum LocationType {
  Point = 'Point',
  Polygon = 'Polygon',
}

const mediaFields = `
  "Attach any number of media"
  media: [PostMedia]
  "Video progress in seconds"
  videoProgress: Int
`;

const MediaType = {
  DOC: 'doc',
  AUDIO: 'audio',
  VIDEO: 'video',
  PICTURE: 'picture',
};

const pictureTypes = ['JPG', 'PNG', 'SVG', 'GIF'];
const videoTypes = ['MPG', 'MP4', 'MOV', 'WMV', 'FLV'];
const audioTypes = ['mp3', 'ogg'];

enum AppType {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
}

enum EnvironmentType {
  SANDBOX = 'sandbox',
  PROD = 'prod',
}

enum AppService {
  GOOGLE = 'google',
  APPLE = 'apple',
}

const getMediaType = (url: string) => {
  const toUpperURL = toUpper(url);
  if (pictureTypes.filter((pt) => toUpperURL.includes(pt)).length) {
    return MediaType.PICTURE;
  }

  if (videoTypes.filter((vt) => toUpperURL.includes(vt)).length) {
    return MediaType.VIDEO;
  }

  if (audioTypes.filter((at) => toUpperURL.includes(at)).length) {
    return MediaType.AUDIO;
  }

  return MediaType.DOC;
};

function getKeyByValue<T>(variables: T, value: string) {
  const indexOfS = Object.values(variables).indexOf(value as unknown as T);

  const key = Object.keys(variables)[indexOfS];

  return key;
}

const MAXIMUM_DISTANCE_DIFFERENCE = 1000; // 1000m

export {
  PostType,
  MediaType,
  mediaFields,
  AppType,
  EnvironmentType,
  AppService,
  getMediaType,
  TakeTime,
  TimeFrame,
  ContactMethod,
  PostStatus,
  ArticleType,
  getKeyByValue,
  TimeFrameExpired,
  MAXIMUM_DISTANCE_DIFFERENCE,
  LocationType,
};
