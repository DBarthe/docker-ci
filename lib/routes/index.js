import express from "express";
import request from "request";
import * as job from '../job.js'

const githubUser = process.env.GITHUB_USER;
const githubOAuthToken = process.env.GITHUB_OAUTH_TOKEN;

const router = express.Router();

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
    publish = !!req.query.publish,
    json = !!req.query.json;

  const result = job.run(version, latest, publish);

  if (json) {
    res.json(result);
  }
  else {
    res.render('job', { title: `Job v${version}`, version, ...result });
  }
});

module.exports = router;
