'use strict';

exports.create = function* (opt) {
  const github = opt.github;
  const config = opt.config;
  const user = opt.repo.split('/')[0];
  const repo = opt.repo.split('/')[1];

  /*
    Fetch all existing labels and transform
  */

  const labelsObj = {};
  let labels = yield github.issues.getLabels({ user, repo });
  labels.forEach(function(label) {
    labelsObj[label.name] = label;
  });

  if (config && config.length) {
    labels = config.map(label => {
      const old = labelsObj[label.name];

      /*
        Update label when existing label has different color.
      */

      if (old) {
        if (label.color !== old.color) {
          console.info('>>   Update label ' + label.name);
          return github.issues.updateLabel({
            user,
            repo,
            name: label.name,
            color: label.color,
          });
        }

      /*
        Create label when not exist
      */
      } else {
        console.info('>>   Create label ' + label.name);
        return github.issues.createLabel({
          user,
          repo,
          name: label.name,
          color: label.color,
        });
      }

      return null;
    }).filter(function(label) {
      return !!label;
    });
    yield labels;
  }
};

exports.deleteAll = function* (opt) {
  const github = opt.github;
  const user = opt.repo.split('/')[0];
  const repo = opt.repo.split('/')[1];

  /*
    Fetch all existing labels
  */

  let labels = yield github.issues.getLabels({ user, repo });

  /*
    Delete all existing labels
  */

  if (labels.length) {
    labels = labels.map(label => {
      return github.issues.deleteLabel({
        user,
        repo,
        name: label.name,
      });
    });
    yield labels;
  }
};
