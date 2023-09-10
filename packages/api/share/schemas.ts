const mongoose = require('mongoose');
const { LocationType } = require('./types');
const MediaSchema = mongoose.Schema({
  type: {
    type: String,
    required: true,
    index: true,
    enum: ['picture', 'audio', 'video', 'doc'],
  },
  src: {
    type: String,
    required: true,
  },
  duration: Number,
  filename: String,
  webm: String,
  thumbSmall: String,
  thumbLarge: String,
  version: String,
  backup: String,
});

const LocationSchema = new mongoose.Schema({
  type: { type: String, enum: LocationType },
  //latitude - values are between -90 and 90, both inclusive.
  //longitude values are between -180 and 180, both inclusive
  coordinates: [Number],
});

export { MediaSchema, LocationSchema };
