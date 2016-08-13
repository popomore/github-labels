/* jshint esnext: true */
exports.create = function*(opt) {
  var github = opt.github;
  var config = opt.config;
  var user = opt.repo.split('/')[0];
  var repo = opt.repo.split('/')[1];

  /*
    Fetch all existing labels and transform
  */

  var labelsObj = {};
  var labels = yield github.issues.getLabels({
    user: user,
    repo: repo
  });
  labels.forEach(function(label) {
    labelsObj[label.name] = label;
  });

  if (config && config.length) {
    labels = config.map(function(label) {
      var old = labelsObj[label.name];

      /*
        Update label when existing label has different color.
      */

      if (old) {
        if (label.color !== old.color) {
          console.info('>>   Update label ' + label.name);
          return github.issues.updateLabel({
            user: user,
            repo: repo,
            name: label.name,
            color: label.color
          });
        }
      }

      /*
        Create label when not exist
      */

      else {
        console.info('>>   Create label ' + label.name);
        return github.issues.createLabel({
          user: user,
          repo: repo,
          name: label.name,
          color: label.color
        });
      }
    }).filter(function(label) {
      return !!label;
    });
    yield labels;
  }
};

exports.deleteAll = function*(opt) {
  var github = opt.github;
  var user = opt.repo.split('/')[0];
  var repo = opt.repo.split('/')[1];

  /*
    Fetch all existing labels
  */

  var labels = yield github.issues.getLabels({
    user: user,
    repo: repo
  });

  /*
    Delete all existing labels
  */

  if (labels.length) {
    labels = labels.map(function(label) {
      return github.issues.deleteLabel({
        user: user,
        repo: repo,
        name: label.name
      });
    });
    yield labels;
  }
};
