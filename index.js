/* jshint esnext: true */
var fs = require('fs');
var path = require('path');
var co = require('co');
var auth = require('./lib/auth');
var label = require('./lib/label');
var color = require('./lib/colors.json');
var dotfile = getDotFile();
var GitHubApi = require('github');

module.exports = function(program){
  console.info(program.host);
  var github = new GitHubApi({
    version: '3.0.0',
    port: '80',
    pathPrefix: program.host ? "/api/v3/":"",
    protocol: 'http',
    host: program.host || 'api.github.com'
  });
  co(function*() {
    var token = readToken();

    var opt = {
      config: parse(program.config),
      token: token,
      repo: program.args[0],
      github: github
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
  })();
};

function parse (config) {
  try {
    config = JSON.parse(fs.readFileSync(path.resolve(config)));
  } catch(e) {
    console.error('>> Parse config error');
    console.error(e.stack);
    process.exit(1);
  }

  if (!(config && Array.isArray(config))) return null;

  return config.map(function(item) {
    if (typeof item !== 'object') {
      item = {name: item, color: randomColor()};
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

function saveToken (token) {
  return function (callback) {
    console.info('>> Saving token');
    fs.writeFile(dotfile, token, callback);
  };
}

function randomColor () {
  var len = color.length;
  return color[Math.floor(Math.random() * len)];
}

function getDotFile () {
  var home = process.env.HOME;
  if (!home) {
    home = process.env.HOMEDRIVE + process.env.HOMEPATH;
  }
  return home + '/.github-labels';
}
