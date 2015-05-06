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
  var labels = yield getLabels({
    user: user,
    repo: repo
  }, github);
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
          return updateLabel({
            user: user,
            repo: repo,
            name: label.name,
            color: label.color
          }, github);
        }
      }

      /*
        Create label when not exist
      */

      else {
        console.info('>>   Create label ' + label.name);
        return createLabel({
          user: user,
          repo: repo,
          name: label.name,
          color: label.color
        }, github);
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

  var labels = yield getLabels({
    user: user,
    repo: repo
  }, github);

  /*
    Delete all existing labels
  */

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


function createLabel (opt, github) {
  return function (callback) {
    github.issues.createLabel(opt, callback);
  };
}


function updateLabel (opt, github) {
  return function (callback) {
    github.issues.updateLabel(opt, callback);
  };
}
