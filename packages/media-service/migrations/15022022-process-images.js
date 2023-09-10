require('dotenv').config();

const fs = require('fs');
const fsPromises = require('fs').promises;
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const cliProgress = require('cli-progress');
const isEmpty = require('lodash/isEmpty');
const pLimit = require('p-limit');
const { nanoid } = require('nanoid');

const { resize, convert } = require('easyimage');

const { uploadBlob, getUploadBlobURL } = require('../services/azure');

const { PostModel } = require('../../api/models/Post');

mongoose.connect( process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 20 });

const VERSION = '05012022'

const downloadFile = async (url, path) => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(path);

  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
};

async function run() {

  const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: '{bar} {percentage}% | {speed}'
  }, cliProgress.Presets.rect);

  const progress = {};

  const limiter = pLimit(5);

  try {
    const posts = await PostModel.find({ type: [ 'userStory' ], media: { $exists: true } });
    const iteratable = posts.filter( post => post.media[0] && post.media[0].type === 'picture' && !isEmpty(post.media[0].src) && post.media[0].version !== VERSION )

    progress.total = multibar.create(iteratable.length, 0);
    progress.total.update(0, { speed: `Total Progress (found ${ iteratable.length } pictures)` });

    await Promise.all( iteratable.map( async post => limiter( async () => {
      const media = post.media[0].toObject();
      const filename = media.src.split('/').pop();
      const name = filename.split('.')[0];

      const convertedFileName = `${ name }-converted.jpg`;
      const resizedFileName = `${ name }-resized.jpg`;

      const tempFilePath = `/tmp/imagemagick/${filename}`;
      const convertedFilePath = `/tmp/imagemagick/${convertedFileName}`;
      const resizedFilePath = `/tmp/imagemagick/${resizedFileName}`;

      progress[post._id] = multibar.create(301,0);
      progress[post._id].update(0, { speed: `${ post._id } Downloading picture` });

      try {
        await downloadFile( media.src, tempFilePath );
        progress[post._id].update(50, { speed: `${ post._id } Converting to JPEG` });

        await convert({
          src: tempFilePath,
          dst: convertedFilePath,
          quality: 94
        });

        progress[post._id].update(100, { speed: `${ post._id } Resizing the JPEG` });

        await resize({
          src: convertedFilePath,
          dst: resizedFilePath,
          width: 1920,
          height: 1080
        });

        progress[post._id].update(200, { speed: `${ post._id } Uploading the blob` });

        const blobURL = getUploadBlobURL({ filename: resizedFileName }).cdn;

        await uploadBlob({
          filename: resizedFileName,
          contentType: 'image/jpeg',
          filePath: resizedFilePath
        });

        progress[post._id].update(250, { speed: `${ post._id } Updating the post` });

        await PostModel.updateOne({ _id: post._id }, { media: [
          {
            ...media,
            backup: media.src,
            src: blobURL,
            version: VERSION
          }
        ] });

        progress[post._id].update(300, { speed: `${ post._id } Removing temp files` });

        await fsPromises.unlink(tempFilePath);
        await fsPromises.unlink(convertedFilePath);
        await fsPromises.unlink(resizedFilePath);

      } catch (e) {
        console.log('this happened for ' + post._id);
        console.error(e);
      }

      progress[post._id].update(301, { speed: `${post._id} Done` });

      progress.total.increment();
    } ) ) );
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    multibar.stop();
  }

  process.exit(0);
}

run();
