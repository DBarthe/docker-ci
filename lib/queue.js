import kue from 'kue'

const queue = kue.createQueue({
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1'
  }
});

export const submit = (params, onProgress) => {
  return new Promise((accept, reject) => {
    const job = queue.create('job', params).save();
    job.on('complete', accept);
    job.on('failed', reject);
    job.on('progress', (progress, data) => onProgress({ ...params, data }));
  });
};

export const subscribe = fn => {
  queue.process('job', 1, (job, done) => {

    const onProgress = data => {
      job.progress(42, 84, data)
    };

    fn(job.data, onProgress)
      .then(result => done())
      .catch(err => done(err))
  })
};
