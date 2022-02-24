'use strict';

exports.create = function* (opt) {
  const github = opt.github;
  const config = opt.config;
  const owner = opt.owner;
  const repo = opt.repo;

  /*
    Fetch all existing labels and transform
  */

  const labelsObj = {};
  let labels = yield github.issues.listLabelsForRepo({ owner, repo });
  labels.data.forEach(function(label) {
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
          console.info('>>   Update label ' + label.name + ', color ' + label.color);
          return github.issues.updateLabel({
            owner,
            repo,
            name: label.name,
            color: label.color.replace(/^#/, ''),
          });
        }

      /*
        Create label when not exist
      */
      } else {
        console.info('>>   Create label ' + label.name + ', color ' + label.color);
        return github.issues.createLabel({
          owner,
          repo,
          name: label.name,
          color: label.color.replace(/^#/, ''),
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
  const owner = opt.owner;
  const repo = opt.repo;

  /*
    Fetch all existing labels
  */

  let labels = yield github.issues.listLabelsForRepo({ owner, repo });

  /*
    Delete all existing labels
  */

  if (labels.data.length) {
    labels = labels.data.map(label => {
      return github.issues.deleteLabel({
        owner,
        repo,
        name: label.name,
      });
    });
    yield labels;
  }
};
