/* jshint esnext: true */
module.exports = function *deleteLabels(opt) {
  var github = opt.github;
  var user = opt.repo.split('/')[0];
  var repo = opt.repo.split('/')[1];
  var labels = yield getLabels({
    user: user,
    repo: repo
  }, github);

  if (labels.length) {
    labels = labels.map(function(label) {
      return deleteLabel({
        user: user,
        repo: repo,
        name: label.name
      }, github);
    });
    yield labels;
  }
};

function getLabels (opt, github) {
  return function (callback) {
    github.issues.getLabels(opt, callback);
  };
}

function deleteLabel (opt, github) {
  return function (callback) {
    github.issues.deleteLabel(opt, callback);
  };
}
