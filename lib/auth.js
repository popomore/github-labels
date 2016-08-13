'use strict';

const oauth = require('github-oauth-prompt');
const authName = 'github-labels';

module.exports = function* auth(opt) {
  const github = opt.github;

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
    } catch (e) {
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
    return;
  }

  /*
    If token is not exist, it will get token by basic authorization,
    and user should enter username and password.
  */
  console.info('>> No permission, enter your username and password:');
  try {
    const token = yield getOauth();
    authenticateWithToken(token);
    return token;
  } catch (e) {
    console.error('>> Authorize error');
    process.exit(1);
  }

  function getOauth() {
    return function(callback) {
      /*
        Get an oauth token
      */
      const options = {
        name: authName,
        url: 'http://github.com/popomore/github-labels',
        scopes: [ 'public_repo', 'repo' ],
        host: github.config.host,
      };
      oauth(options, callback);
    };
  }

  function authenticateWithToken(token) {
    /*
      Save the token to the github object
    */
    github.authenticate({
      type: 'oauth',
      token,
    });
  }

  function testAuth() {
    return function(callback) {
      github.users.getForUser({
        user: opt.repo.split('/')[0],
      }, callback);
    };
  }
};
