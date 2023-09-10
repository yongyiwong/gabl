import { parseDateTimeQuery } from './dates';

function transformQuery(q) {
  //  Clone query to avoid mutation
  const query = { ...q };

  if (query.created_at) {
    query.created_at = parseDateTimeQuery(query.created_at);
  }

  if (query.updated_at) {
    query.updated_at = parseDateTimeQuery(query.updated_at);
  }

  if (query.published_at) {
    query.published_at = parseDateTimeQuery(query.published_at);
  }

  return query;
}

export {
  transformQuery
};
