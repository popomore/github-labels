'use strict';

const fs = require('fs');
const path = require('path');
const co = require('co');
const label = require('./lib/label');
const color = require('./lib/colors.json');
const dotfile = getDotFile();
const { Octokit } = require('@octokit/rest');

module.exports = program => {
  co(function* () {
    const token = program.token || readToken();

    const octokit = new Octokit({
      auth: token,
    });

    const repo = program.args[0].split('/');

    const opt = {
      config: parse(program.config),
      owner: repo[0],
      repo: repo[1],
      github: octokit.rest,
    };

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
