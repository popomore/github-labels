/* jshint esnext: true */
module.exports = function *createLabels(opt) {
  var github = opt.github;
  var config = opt.config;
  var user = opt.repo.split('/')[0];
  var repo = opt.repo.split('/')[1];

  if (config && config.length) {
    var labels = config.map(function(label) {
      return createLabel({
        user: user,
        repo: repo,
        name: label.name,
        color: label.color
      }, github);
    });
    yield labels;
  }
};

function createLabel (opt, github) {
  return function (callback) {
    github.issues.createLabel(opt, callback);
  };
}
