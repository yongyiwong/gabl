const express = require('express');
const { nanoid } = require('nanoid');
const fs = require('fs').promises;
const isEmpty = require('lodash/isEmpty');
const ffmpeg = require('fluent-ffmpeg');
const router = express.Router();

const { data, error } = require('../helpers/response');
const { uploadBlob, getUploadBlobURL } = require('../services/azure');

/**
 *  Temporary unscalable solution while we need to keep things
 *  simple and fast.
 *
 *  Later this should be rewritten using redis
 * */
const inMemoryProgress = {};

const readMetadata = ( path ) => {
  return new Promise( (resolve, reject) => {
    ffmpeg.ffprobe( path, ( err, data ) => {
      if ( err ) {
        reject( err );
      }

      resolve(data);
    } );
  });
};

/**
 *  As load increases, this should be offloaded into a worker thread
 * */
const processVideo = async ({ video, key, filenames, onProgress }) => {
  const promises = [];
  //  Small thumbnail
  promises.push(
    new Promise((resolve, reject) => {
      ffmpeg(video.tempFilePath)
        .on('end', () => {
          const filePath = `/tmp/ffmpeg-out/${filenames.thumbSmall}`;

          uploadBlob({
            filename: filenames.thumbSmall,
            contentType: 'image/jpeg',
            filePath
          }).then(async () => {
            await fs.unlink(filePath);
            resolve();
          });
        })
        .on('error', reject)
        .thumbnails({
          timestamps: ['50%'],
          size: '320x240',
          filename: filenames.thumbSmall,
          folder: '/tmp/ffmpeg-out/'
        });
    })
  );

  //  Large thumbnail
  promises.push(
    new Promise((resolve, reject) => {
      ffmpeg(video.tempFilePath)
        .on('end', () => {
          const filePath = `/tmp/ffmpeg-out/${filenames.thumbLarge}`;

          uploadBlob({
            filename: filenames.thumbLarge,
            contentType: 'image/jpeg',
            filePath,
          }).then(async () => {

            await fs.unlink(filePath);
            resolve();
          });
        })
        .on('error', reject)
        .thumbnails({
          timestamps: ['50%'],
          size: '1920x1080',
          filename: filenames.thumbLarge,
          folder: '/tmp/ffmpeg-out/'
        });
    })
  );

  //  mp4 video
  promises.push(
    new Promise((resolve, reject) => {
      ffmpeg(video.tempFilePath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioBitrate(128)
        .size('1280x720')
        .on('progress', progress => {
          if ( typeof onProgress === 'function' ) {
            onProgress({ mp4: progress.percent })
          } else {
            inMemoryProgress[key] = { ...inMemoryProgress[key], mp4: progress.percent };
            console.log( `Written mp4 progress for ${ key }: ${ inMemoryProgress[key].mp4 }%` );
          }
        })
        .on('end', () => {
          const filePath = `/tmp/ffmpeg-out/${filenames.fallback}`;

          uploadBlob({
            filename: filenames.fallback,
            contentType: 'video/mp4',
            filePath
          })
            .then( async () => {
              await fs.unlink(filePath);

              if ( typeof onProgress === 'function' ) {
                onProgress({ mp4: 100 })
              } else {
                inMemoryProgress[key] = { ...inMemoryProgress[key], mp4: 100 };
                console.log( `Completed processing mp4 for ${ key }: ${ inMemoryProgress[key].mp4 }%` );
              }

              resolve();
            })
        })
        .on('error', reject)
        .save(`/tmp/ffmpeg-out/${filenames.fallback}`);
    })
  );

  //  webm video
  promises.push(
    new Promise((resolve, reject) => {
      ffmpeg(video.tempFilePath)
        .videoCodec('libvpx-vp9')
        .videoBitrate(1000, true) //Outputting a constrained 1Mbit VP8 video stream
        .size('1280x720')
        .outputOptions(
          '-minrate',
          '1000',
          '-maxrate',
          '1000',
          '-threads',
          '1',
          '-flags',
          '+global_header' // WebM won't love if you if you don't give it some headers
        )
        .on('progress', progress => {
          if ( typeof onProgress === 'function' ) {
            onProgress({ webm: progress.percent })
          } else {
            inMemoryProgress[key] = { ...inMemoryProgress[key], webm: progress.percent };
            console.log( `Written progress for ${ key }: ${ inMemoryProgress[key].webm }%` );
          }
        })
        .on('end', () => {
          const filePath = `/tmp/ffmpeg-out/${filenames.video}`;

          uploadBlob({
            filename: filenames.video,
            contentType: 'video/webm',
            filePath
          })
            .then( async () => {
              await fs.unlink(filePath);

              if ( typeof onProgress === 'function' ) {
                onProgress({ webm: 100 })
              } else {
                inMemoryProgress[key] = { ...inMemoryProgress[key], webm: 100 };
                console.log( `Completed processing for ${ key }: ${ inMemoryProgress[key].webm }%` );
              }

              resolve();
            });
        })
        .on('error', reject)
        .save(`/tmp/ffmpeg-out/${filenames.video}`);
    })
  );

  try {
    //  Convert everything we need
    await Promise.all(promises);
    //  Remove temporary file
    await fs.unlink(video.tempFilePath);
  } catch(e) {
    inMemoryProgress[key] = { ...inMemoryProgress[key], error: e.message };
    console.error(e);
  }
};

function generateFilenames( name = false ) {
  const filename = name || nanoid(8);

  const filenames = {
    video: `${filename}.webm`,
    fallback: `${ filename }.mp4`,
    thumbSmall: `${filename}-thumb-sm.jpg`,
    thumbLarge: `${filename}-thumb-lg.jpg`
  };

  const responseData = {
    //  Track in memory using this prop
    filename,
    //
    src: getUploadBlobURL({ filename: filenames.fallback }).cdn,
    webm: getUploadBlobURL({ filename: filenames.video }).cdn,
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

/**
 *  Get video id's progress
 * */
router.get('/status/:key', async (req, res) => {
  try {
    if ( isEmpty(req.params.key) ) {
      throw new Error('No key provided');
    }

    console.log( `Accessed progress for ${ req.params.key }: ${ inMemoryProgress[req.params.key].progress }%` );

    data(res, inMemoryProgress[req.params.key]);
  } catch (e) {
    console.error(e);
    error(res, e);
  }
});

/**
 *  Upload video and transform it for use in web
 * */
router.post('/', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).lenght === 0) {
      throw new Error('No input files passes');
    }

    if (!req.files.video) {
      throw new Error('Invalid input format. Use `video` key to pass the file');
    }

    const { filename, filenames, responseData } = generateFilenames();

    const metadata = await readMetadata(req.files.video.tempFilePath);

    responseData.duration = metadata.format.duration;

    processVideo({
      video: req.files.video,
      key: filename,
      filenames
    });

    data(res, responseData);
  } catch (e) {
    console.error(e);
    error(res, e);
  }
});

module.exports = {
  generateFilenames,
  processVideo,
  readMetadata,
  router
};
