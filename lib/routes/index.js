import express from "express";
import request from "request";

import * as queue from '../queue.js';
import {StreamPool} from "../stream.js";

const githubUser = process.env.GITHUB_USER;
const githubOAuthToken = process.env.GITHUB_OAUTH_TOKEN;

const router = express.Router();

const streamPool = new StreamPool();

const getReleases = () => {
  return new Promise((resolve, reject) => {
    request({
        url: `https://${githubUser}:${githubOAuthToken}@api.github.com/repos/strapdata/elassandra/releases`,
        json: true,
        headers: {'User-Agent': 'NodeJS'}
      },
      (error, response, body) => {
        if (error) reject(error);
        resolve(body.map(x => x.tag_name).map(x => x.startsWith('v') ? x.slice(1) : x));
      }
    );
  })
};

router.get('/', async (req, res, next) => {
  let releaseList = [];

  try {
    releaseList = await getReleases();
  }
  catch (err) {
    console.error(err);
  }

  return res.render('index', {
    title: 'Elassandra-docker CI',
    releaseList
  });
});


router.get('/trigger/:version', (req, res, next) => {
  const
    version = req.params.version,
    latest = !!req.query.latest,
    publish = !!req.query.publish;

  // const result = job.run(version, latest, publish);
  res.render('job', { title: `Job v${version}`, version, latest, publish });
});

router.post('/api/trigger/:version', (req, res, next) => {
  const
    version = req.params.version,
    latest = !!req.body.latest,
    publish = !!req.body.publish;

  console.log("creating stream");
  const streamKey = streamPool.create();

  const onProgress = ({ data }) => {
    console.log({ version, latest, publish, data });
    streamPool.supply(streamKey, data);
  };

  //const result = job.run(version, latest, publish);
  queue.submit({ version, latest, publish }, onProgress)
    .then(() => {
      console.log("success");
      streamPool.done(streamKey);
    })
    .catch(err => {
      console.log("fail", err);
      streamPool.fail(streamKey, err);
    });

  res.json({
    progressUrl: `/stream/${streamKey}`
  })
});

router.get('/stream/:key', (req, peer) => {
  peer.sseSetup();
  peer.sseSend("welcome");
  streamPool.join(req.params.key, peer);
});

module.exports = router;
