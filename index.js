'use strict';

const fs = require('fs');
const path = require('path');
const co = require('co');
const auth = require('./lib/auth');
const label = require('./lib/label');
const color = require('./lib/colors.json');
const dotfile = getDotFile();
const GitHubApi = require('github');

module.exports = program => {
  const github = new GitHubApi({
    version: '3.0.0',
    protocol: 'https',
    pathPrefix: program.host,
    host: program.host,
  });
  co(function* () {
    let token = readToken();

    const opt = {
      config: parse(program.config),
      token,
      repo: program.args[0],
      github,
    };

    /*
      Github Authorization
    */

    token = yield auth(opt);
    if (token) {
      yield saveToken(token);
    }
    console.info('>> Authorized');

    /*
      Force option will delete add existing labels
    */

    if (program.force) {
      console.info('>> Delete existing labels');
      yield label.deleteAll(opt);
    }

    /*
      Create labels from your given config
    */

    console.info('>> Create labels');
    yield label.create(opt);

    console.info('>> Done');
  }).catch(err => console.error(err));
};

function parse(config) {
  try {
    config = JSON.parse(fs.readFileSync(path.resolve(config)));
  } catch (e) {
    console.error('>> Parse config error');
    console.error(e.stack);
    process.exit(1);
  }

  if (!(config && Array.isArray(config))) return null;

  return config.map(function(item) {
    if (typeof item !== 'object') {
      item = { name: item, color: randomColor() };
    } else {
      item.color = item.color || randomColor();
    }
    return item;
  });
}

function readToken() {
  if (fs.existsSync(dotfile)) {
    return fs.readFileSync(dotfile, 'utf8').replace(/\n$/, '');
  }
  return null;
}

function saveToken(token) {
  return function(callback) {
    fs.writeFile(dotfile, token, callback);
  };
}

function randomColor() {
  const len = color.length;
  return color[Math.floor(Math.random() * len)];
}

function getDotFile() {
  let home = process.env.HOME;
  if (!home) {
    home = process.env.HOMEDRIVE + process.env.HOMEPATH;
  }
  return home + '/.github-labels';
}
