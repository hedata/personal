'use strict';
// A throw-away git repository for the gates that select posts by diff:
// `master` holds one old post (copied from a fixture), `topic` is checked out
// for the files a test adds. Not a test file itself (node --test picks
// scripts/test/*.test.js only).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function tempRepo(prefix, oldPostDir) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
  const git = (...a) =>
    execFileSync('git', ['-C', root, ...a], {
      encoding: 'utf8',
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t',
      },
    }).trim();
  // Copies a fixture post folder (or one file) to `rel` under the repo.
  const put = (rel, from) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.cpSync(from, path.join(root, rel), { recursive: true });
  };
  const write = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  const commit = (msg) => {
    git('add', '.');
    git('commit', '-q', '-m', msg);
  };
  git('init', '-q', '-b', 'master');
  put('content/post/old-post', oldPostDir);
  commit('old post');
  git('checkout', '-q', '-b', 'topic');
  return { root, git, put, write, commit };
}

module.exports = { tempRepo };
