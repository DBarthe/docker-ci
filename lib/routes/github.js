import express from "express";
import octokitLib from "@octokit/rest";
import * as queue from '../queue.js';

const octokit = octokitLib();
const router = express.Router();

octokit.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_OAUTH_TOKEN
});

const basicAuth = `${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASSWORD}`;

octokit.repos.createHook({
  owner: 'strapdata',
  repo: 'elassandra',
  name: 'web',
  events: [
    "release"
  ],
  config: {
    url: `http://${basicAuth}@docker-ci.strapdata.com/github/hook/release`,
    content_type: "json"
  }
}).then(() => console.log("webhook created"))
  .catch(err => {
    console.warn(err.message);
  });


router.post('/hook/release', (req, res) => {
  res.status(200).send();
  return processReleaseEvent(req.body);
});

const processReleaseEvent = async ({ release, repository }) => {

  if (repository.name !== 'elassandra') {
    return ;
  }

  const latestRelease = await octokit.repos.getRelease({
    owner: 'strapdata',
    repo: 'elassandra'
  });

  const trimV = x => x.startsWith('v') ? x.slice(1) : x;

  const
    version = trimV(release.tag_name),
    latest = latestRelease.id === release.id,
    publish = true;

  return queue.submit({ version, latest, publish }, console.log);
};

export default router;