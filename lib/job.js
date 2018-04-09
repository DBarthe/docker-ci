import * as shell from 'shelljs'
import * as os from "os";
import * as randomstring from "randomstring";

const repoUrl = "git@github.com:strapdata/docker-elassandra.git";

// set the global shell config
shell.config.verbose = true;
shell.config.fatal = false;

// Error type raised by jobs
class JobError extends Error {
  constructor() {
    super("Job failed");
  }
}

// Run the docker-elassandra job
export const run = (version, latest=false, publish=false) => {

  let output = "", error = false;

  // wrap each shell call by this function to record output and stop when a error occurs
  // return the return code of the command
  const log = ({ stdout, stderr, code }, { ignoreErrors=false } = {}) => {
    if (stdout) output += stdout.trim();
    if (stderr) output += stderr.trim();
    if (!ignoreErrors) {
      error = shell.error();
      if (error) {
        throw new JobError();
      }
    }
    return code;
  };

  // generate a temporary directory path
  const
    basedir=`${os.tmpdir()}/docker-ci`,
    tmpdir = `${basedir}/${randomstring.generate(7)}`;

  try {
    // run the job
    ensureDependencies(shell);

    log(shell.mkdir('-p', basedir));
    log(shell.exec(`git clone ${repoUrl} ${tmpdir}`));
    log(shell.pushd(tmpdir));
    log(shell.exec(`./build.sh ${version}`, {env: {...process.env, LATEST: latest, PUBLISH: publish}}));
    log(shell.exec(`git add ${version}`));
    if (log(shell.exec(`git diff --cached --exit-code`), { ignoreErrors: true }) !== 0) {
      log(shell.exec(`git commit -m "robot: build image v${version}"`));
      log(shell.exec(`git push origin master`));
    }
    log(shell.popd());
    log(shell.rm('-rf', tmpdir));
  }
  catch (e) {
    if (!(e instanceof JobError)) {
      throw e;
    }
    // catch any JobError exception
    console.log(e);
  }
  finally {
    // noinspection UnreachableCodeJS
    return { output: output.split("\n"), error };
  }
};

const ensureDependencies = (shell) => {

  for (let cmd of ['git', 'docker']) {
    if (!shell.which(cmd)) {
      throw `Sorry, this script requires ${cmd}`;
    }
  }
};
