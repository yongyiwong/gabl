const express = require('express');
const { nanoid } = require('nanoid');
const fs = require('fs').promises;
const isEmpty = require('lodash/isEmpty');
const ffmpeg = require('fluent-ffmpeg');
const router = express.Router();

const { data, error } = require('../helpers/response');
const { uploadBlob, getUploadBlobURL } = require('../services/azure');

function generateFilenames( name = false, format ) {
  const filename = name || nanoid(8);

  const filenames = {
    video: `${filename}.webm`,
    original: `${ filename }.mp4`,
    thumbSmall: `${filename}-thumb-sm.jpg`,
    thumbLarge: `${filename}-thumb-lg.jpg`
  };

  const responseData = {
    //  Track in memory using this prop
    filename,
    //
    src: getUploadBlobURL({ filename: filenames.fallback }).cdn,
    thumbSmall: getUploadBlobURL({
      filename: filenames.thumbSmall
    }).cdn,
    thumbLarge: getUploadBlobURL({
      filename: filenames.thumbLarge
    }).cdn
  };

  return {
    filename,
    filenames,
    responseData
  };
}

async function processPicture({ video, key, filenames, onProgress }) {

}

router.post('/', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).lenght === 0) {
      throw new Error('No input files passes');
    }

    if (!req.files.picture) {
      throw new Error('Invalid input format. Use `picture` key to pass the file');
    }

    const { filename, filenames, responseData } = generateFilenames();

    const metadata = await readMetadata(req.files.video.tempFilePath);

    responseData.duration = metadata.format.duration;

    processPicture({
      picture: req.files.picture,
      key: filename,
      filenames
    });

    data(res, responseData);
  } catch (e) {
    console.error(e);
    error(res, e);
  }
})

module.exports = {
  router
}
