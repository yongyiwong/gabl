if ( process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config();
}

const fs = require('fs');
const cliProgress = require('cli-progress');
const pLimit = require('p-limit');
const { processVideo, readMetadata, generateFilenames } = require('../routes/video');

const FOLDER = process.argv[2];

async function main() {
  try {
    const multibar = new cliProgress.MultiBar({
      clearOnComplete: false,
      hideCursor: true
    }, cliProgress.Presets.shades_grey);

    const files = await fs.promises.readdir( FOLDER );

    const processed = [];

    const limiter = pLimit(5);

    const globalBar = multibar.create(files.length, 0);

    await Promise.all( files.map( async filename => limiter( async () => {
      const path = `${ FOLDER }/${ filename }`;
      const { filenames, responseData } = generateFilenames(filename);
      const bar = multibar.create(100,0);

      const metadata = await readMetadata(path);

      responseData.duration = metadata.format.duration;

      await processVideo({
        video: {
          tempFilePath: path
        },
        key: filename,
        filenames,
        onProgress: progress => {
          bar.update(progress, { filename });
        }
      });

      bar.stop();
      globalBar.increment();
      processed.push(responseData);
    } ) ) );

    globalBar.stop();

    await fs.promises.writeFile(`${ FOLDER }/processed.json`, JSON.stringify(processed));

    console.log('processed everything and written JSON');

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main()
