import mapKeys from 'lodash/mapKeys';
import { DateTime } from 'luxon';

function getDatesArray(startDate, times) {
  const dateArray = [];

  for (let index = 0; index < times; index++) {
    const dt = DateTime.fromJSDate(startDate).plus({ days: index });

    dateArray.push(
      dt.toFormat('yyyy-MM-dd')
    );
  }

  return dateArray;
}

function parseDateTimeQuery(query) {
  return mapKeys(query, (v, k) => '$' + k);
}

export {
  getDatesArray,
  parseDateTimeQuery
};
