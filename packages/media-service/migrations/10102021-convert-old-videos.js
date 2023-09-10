require('dotenv').config();

const fs = require('fs');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const cliProgress = require('cli-progress');
const isEmpty = require('lodash/isEmpty');
const pLimit = require('p-limit');

const { generateFilenames, processVideo } = require('../routes/video');

const { PostModel } = require('../../api/models/Post');

mongoose.connect( process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 20 });

const VERSION =  '05012022'

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
    const posts = await PostModel.find({ type: [ 'article', 'tip' ], media: { $exists: true } });
    const iteratable = posts.filter( post => post.media[0] && post.media[0].type === 'video' && !isEmpty(post.media[0].filename) && post.media[0].version !== VERSION )

    progress.total = multibar.create(iteratable.length, 0)
    progress.total.update(0, { speed: `Total Progress (found ${ iteratable.length } videos)` })

    await Promise.all( iteratable.map( async post => limiter( async () => {
      const media = post.media[0].toObject();
      const { filename, filenames, responseData } = generateFilenames( media.filename );
      const tempFilePath = `/tmp/${ filename }-source.mp4`;

      let videoProgress = {};

      progress[filename] = multibar.create(301,0)
      progress[filename].update(0, { speed: `${ post._id } Downloading video` })

      try {
        await downloadFile( media.src, tempFilePath );
        progress[filename].update(50, { speed: `${ post._id } Getting metadata` })

        await processVideo({
          video: {
            tempFilePath
          },
          key: filename,
          filenames,
          onProgress: function(p) {
            videoProgress = { ...videoProgress, ...p };
            const number = parseInt( 100 + (videoProgress.webm ? videoProgress.webm : 0) + (videoProgress.mp4 ? videoProgress.mp4 : 0) );

            progress[filename].update(number, { speed: `${ post._id } Processing video (mp4: ${ videoProgress.mp4 === 100 ? 'ready' : '-' }, webm: ${ videoProgress.webm === 100 ? 'ready' : '-' })` })
          }
        })

        await PostModel.updateOne({ _id: post._id }, { media: [
          {
            ...media,
            ...responseData,
            version: VERSION
          }
        ] })
      } catch (e) {
        console.log('this happened for ' + filename);
        console.error(e);
      }

      progress[filename].update(301, { speed: `${post._id} Done` });

      progress.total.increment()
    } ) ) );
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    multibar.stop();
  }

  process.exit(0)
}

run()
