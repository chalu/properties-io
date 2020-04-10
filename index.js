const core = require('@actions/core');
const propertiesReader = require('properties-reader');

const run = async () => {
  try {
    const file = core.getInput('file');
    const properties = propertiesReader(file);

    let value = '';
    const readFrom = core.getInput('read-from');
    if (readFrom) {
      value = properties.get(readFrom);
    }

    // TODO
    // handle write-to

    core.setOutput('value', value);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
