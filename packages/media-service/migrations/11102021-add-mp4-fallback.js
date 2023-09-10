require('dotenv').config();

const fs = require('fs');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const cliProgress = require('cli-progress');

const ffmpeg = require('fluent-ffmpeg');

const { generateFilenames, processVideo, readMetadata } = require('../routes/video');
const { uploadBlob, getUploadBlobURL } = require('../services/azure');

const { PostModel } = require('../../api/models/Post');

mongoose.connect( process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 20 });

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
    hideCursor: true
  }, cliProgress.Presets.shades_classic);

  const progress = {};

  try {
    const posts = await PostModel.find({ type: [ 'article', 'tip' ], $and: [ { 'media.0': { $exists: true } }, { 'media.0.type': 'video' } ] }, '_id media' );

    progress.total = multibar.create(posts.length, 0);

    await Promise.all( posts.map( async (post) => {
      const media = post.media[0];

      const { filename, filenames, responseData } = generateFilenames( media.filename );

      const tempFilePath = `/tmp/${ filename }-source.webm`;

      progress[filename] = multibar.create(200,0);

      try {
        await downloadFile( media.src.replace('mp4', 'webm'), tempFilePath );
        progress[filename].update(50, { filename });

        return new Promise( ( resolve, reject ) => {
          ffmpeg( tempFilePath )
            .videoCodec('libx265')
            .videoBitrate(1024, true)
            .audioCodec('aac')
            .outputOptions(
              '-threads', 1,
              '-tag:v', 'hvc1'
            )
            .on( 'progress', p => {
              progress[filename].update( 50 + p, { filename } );
            } )
            .on( 'end', async () => {
              progress[filename].update(150, { filename });

              await uploadBlob({
                filename: filenames.fallback,
                contentType: 'video/mp4',
                filePath: `/tmp/ffmpeg-out/${filenames.fallback}`
              });

              await PostModel.updateOne({ _id: post._id }, { media: [
                {
                  type: 'video',
                  ...responseData
                }
              ] });

              progress[filename].update(200, { filename });
              progress.total.increment();

              resolve();
            } )
            .on('error', reject)
            .save(`/tmp/ffmpeg-out/${filenames.fallback}`);
        });
      } catch (e) {
        console.log('this happened for ' + filename);
        console.error(e);

        return false;
      }
  }));


  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    // multibar.stop();
  }

  process.exit(0)
}

run()
