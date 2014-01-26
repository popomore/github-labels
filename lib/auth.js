/* jshint esnext: true */
module.exports = function *auth(opt) {
  var github = opt.github;
  if (opt.token) {
    github.authenticate({
      type: 'oauth',
      token: opt.token
    });
  } else {
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
      console.error('auth error');
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
