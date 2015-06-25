/* jshint esnext: true */
var oauth = require('github-oauth-prompt');
module.exports = function *auth(opt) {
  var github = opt.github;
  var authName = 'github-labels';

  if (opt.token) {
    /*
      Use oauth when token exist
    */
    authenticateWithToken(opt.token);
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
    try {
      var token = yield getOauth();
      authenticateWithToken(token);
      return token;
    } catch(e) {
      console.error('>> Authorize error');
      console.log(e.message);
      process.exit(1);
    }
  }

  function getOauth () {
    return function (callback) {
      /*
        Get an oauth token
      */
      var options = {
        name: authName,
        url: 'http://github.com/popomore/github-labels',
        scopes: ['public_repo', 'repo']
      };
      oauth(options, callback);
    };
  }

  function authenticateWithToken (token) {
    /*
      Save the token to the github object
    */
    github.authenticate({
      type: 'oauth',
      token: token
    });
  }

  function testAuth () {
    return function (callback) {
      github.user.getFrom({
        user: opt.repo.split('/')[0]
      }, callback);
    };
  }

};
