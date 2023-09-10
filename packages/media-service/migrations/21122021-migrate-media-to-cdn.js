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
  try {
    const posts = await PostModel.find({ 'media.0': { $exists: true } }, '_id media' );

    await Promise.all( posts.map( async (post) => {
      const media = post.media[0];

      const { filename, responseData } = generateFilenames( media.filename );

      try {
        await PostModel.updateOne({ _id: post._id }, { 'media.0': { ...media.toObject(), ...responseData } })
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
  }

  process.exit(0)
}

run()
