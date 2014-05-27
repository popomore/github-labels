/* jshint esnext: true */
module.exports = function *auth(opt) {
  var github = opt.github;

  /*
    Use oauth when token exist
  */

  if (opt.token) {
    github.authenticate({
      type: 'oauth',
      token: opt.token
    });
    // Test the token.
    try {
      yield test(github);
    } catch(e) {
      console.error('>> Token error');
      console.log(e.message);
      process.exit(1);
    }
  }

  /*
    Otherwise use base authorization
  */

  else {
    github.authenticate({
      type: 'basic',
      username: opt.username,
      password: opt.password
    });
    var res;
    try {
      res = yield create(github);
      return res.token;
    } catch(e) {
      console.error('>> Authorize error');
      console.log(e.message);
      process.exit(1);
    }
  }
};

function create (github) {
  return function (callback) {
    github.authorization.create({
      scopes: ['public_repo'],
      note: 'github-labels'
    }, callback);
  };
}

function test (github) {
  return function (callback) {
    // Test the github user who will always exist.
    github.user.getFrom({
      user:'github'
    }, callback);
  };
}
