const core = require('@actions/core');
const propertiesReader = require('properties-reader');

const run = async () => {
  try {
    const file = core.getInput('path');
    const properties = propertiesReader(file);

    let values = [];
    const readFrom = core.getInput('read-from');
    if (readFrom) {
      values = readFrom
        .trim()
        .split(/\s+/)
        .reduce((props, field) => {
          props.push(properties.get(field));
          return props;
        }, []);
    }

    core.setOutput('values', values);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
