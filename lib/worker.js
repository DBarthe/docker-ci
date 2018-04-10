import * as queue from './queue.js'
import * as job from './job.js'

queue.subscribe((data, onProgress) => {

  const { version, publish, latest } = data;

  try {
    const res = job.run(version, latest, publish, output => {
      if (output.length > 0) {
        onProgress({ output });
      }
    });

    if (res.error) {
      console.log("error", res.error);
      return Promise.reject(res.error)
    }

    console.log("success", res);
    return Promise.resolve(res);
  }
  catch (err) {
    console.log("error2", err);
    return Promise.reject(err)
  }
});

