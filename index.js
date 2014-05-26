/* jshint esnext: true */
var fs = require('fs');
var path = require('path');
var co = require('co');
var auth = require('./lib/auth');
var label = require('./lib/label');
var color = require('./lib/colors.json');
var dotfile = getDotFile();
var GitHubApi = require('github');
var github = new GitHubApi({version: '3.0.0'});

module.exports = function(program){
  co(function*() {
    var username, password, token = readToken();

    /*
      If token is not exist, it will get token by basic authorization,
      and user should enter username and password.
    */

    if (!token) {
      console.info('>> No permission, enter your username and password:');
      var result = yield getUserAndPass();
      username = result.username;
      password = result.password;
    }

    var opt = {
      config: parse(program.config),
      token: token,
      username: username,
      password: password,
      repo: program.args[0],
      github: github
    };

    /*
      Github Authorization
    */

    console.info('>> Authorizing');
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

function getUserAndPass () {
  var prompt = require('prompt');
  prompt.delimiter = '';
  prompt.message = '>> ';
  prompt.colors = false;
  prompt.start();
  return function (callback) {
    prompt.get([{
      name: 'username',
      required: true
    }, {
      name: 'password',
      required: true,
      hidden: true
    }], callback);
  };
}

function parse (config) {
  try {
    config = require(path.resolve(config));
  } catch(e) {
    console.error('>> Parse config error');
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
