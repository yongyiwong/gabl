import scheduler from 'node-schedule';
import forOwn from 'lodash/forOwn';

const jobs = {};

function schedule(name, time, func) {
  console.log(
    `Scheduled [${name}] for ${time.hour}:${time.minute} in ${time.tz}`
  );

  const rule = new scheduler.RecurrenceRule();

  forOwn(time, (value, key) => {
    rule[key] = value;
  });

  jobs[name] = scheduler.scheduleJob(time, func);

  return jobs[name];
}

function unschedule(name) {
  if (jobs[name]) {
    return jobs[name].cancel();
  }
}

function init() {
  //  Gracefully shutdown running jobs on process stop
  process.on('SIGINT', function () {
    scheduler.gracefulShutdown().then(() => process.exit(0));
  });
}

export { init, schedule, unschedule };
