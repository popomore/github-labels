/* jshint esnext: true */
module.exports = function *auth(opt) {
  var github = opt.github;
  var authName = 'github-labels';

  if (opt.token) {
    /*
      Use oauth when token exist
    */
    github.authenticate({
      type: 'oauth',
      token: opt.token
    });
    try {
      /*
        Test token
      */
      yield testAuth();
    } catch(e) {
      /*
        Token no longer authorized
      */
      console.error('>> Token error, fetching new token');
      delete opt.token;
    }
  }

  if (opt.token) {
    /*
      Token exists
    */
    return null;
  } else {
    /*
      If token is not exist, it will get token by basic authorization,
      and user should enter username and password.
    */
    console.info('>> No permission, enter your username and password:');
    var result = yield getUserAndPass();
    github.authenticate({
      type: 'basic',
      username: result.username,
      password: result.password
    });
    try {
      var has2FA = yield userRequires2FA();
      var headers = yield createHeaders(has2FA);
      var token = yield createAuth(headers);
      github.authenticate({
        type: 'oauth',
        token: token
      });
      return token;
    } catch(e) {
      console.error('>> Authorize error');
      console.log(e.message);
      process.exit(1);
    }
  }

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

  function testAuth () {
    return function (callback) {
      /*
        Test the github user who will always exist
      */
      github.user.getFrom({
        user:'github'
      }, callback);
    };
  }

  function userRequires2FA () {
    return function (callback) {
      github.authorization.getAll({}, function (err, res) {
        var has2FA = false;
        if (err && err.code === 401) {
          if (JSON.parse(err.message).message === 'Bad credentials') {
            /*
              Username and password are wrong
            */
            callback(err);
          } else {
            has2FA = true;
          }
        }
        callback(null, has2FA);
      });
    }
  }

  function get2FA (callback) {
    var prompt = require('prompt');
    prompt.delimiter = '';
    prompt.message = '>> ';
    prompt.colors = false;
    prompt.start();
    prompt.get([{
      name: 'code',
      description: 'two-factor authentication code',
      required: true
    }], function (err, answers) {
      if (err) {
        callback(err);
      } else {
        callback(null, answers.code);
      }
    });
  }

  function createHeaders (has2FA) {
    return function (callback) {
      var headers = {};
      if (has2FA) {
        get2FA(function (err, code) {
          if (code) {
            headers['X-GitHub-OTP'] = code;
          }
          callback(err, headers);
        });
      } else {
        callback(null, headers);
      }
    }
  }

  function getCurrentToken (headers, callback) {
    github.authorization.getAll({
      headers: headers
    }, function (err, res) {
      if (err) {
        return callback(new Error(err));
      } else {
        var token;
        res.forEach(function (authItem) {
          if (authItem.note === authName) {
            console.log('>> Existing token found');
            token = authItem.token;
          }
        });
        callback(null, token);
      }
    });
  }

  function createAuth (headers) {
    return function (callback) {
      github.authorization.create({
        scopes: ['public_repo'],
        note: authName,
        note_url: 'http://github.com/popomore/github-labels',
        headers: headers
      }, function (err, res) {
        if (err) {
          if (err.code === 422) {
            /*
              Token for github-labels already exists, so get it
            */
            getCurrentToken(headers, callback);
          } else {
            return callback(new Error(err));
          }
        } else {
          /*
            Token created
          */
          console.log('>> Token created');
          callback(null, res.token);
        }
      });
    }
  }
};
