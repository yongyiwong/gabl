import lru from 'lru-cache';

const DEFAULT_TTL = 480 * 1000;
const DEFAULT_MAX = 1000;

interface LruOption {
  max?: number;
  ttl?: number;
  private?: boolean;
}

export class LruCache {
  cache: lru<any, any>;
  constructor(options: LruOption = {}) {
    this.cache = new lru({
      max: options.max || DEFAULT_MAX,
      ttl: options.ttl || DEFAULT_TTL,
    });
  }
}

export function withCache(func, options: LruOption = {}) {
  return async (root, args, context, info) => {
    if (!context.resolverCache) {
      throw new Error('Missing resolverCache property on the Graphql context.');
    }

    const key =
      options.private && context.user
        ? `${info.path.prev ? info.path.prev.key : ''}:${root._id}:${
          info.fieldName
        }:${context.user._id}`
        : `${info.path.prev ? info.path.prev.key : ''}:${root._id}:${
          info.fieldName
        }`;

    const hasKey = context.resolverCache.cache.has(key);

    if (!hasKey) {
      // console.log(`Key ${ key } not found in cache, resolving and caching`);
      const value = await func(root, args, context, info);

      context.resolverCache.cache.set(key, value, {
        ttl: options.ttl || DEFAULT_TTL,
      });

      return value;
    } else {
      // console.log(`Key ${ key } was found in cache`)
      return context.resolverCache.cache.get(key);
    }
  };
}
