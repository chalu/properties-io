module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(104);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 104:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const core = __webpack_require__(470);
const propertiesReader = __webpack_require__(114);

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


/***/ }),

/***/ 114:
/***/ (function(module, __unusedexports, __webpack_require__) {

const fs = __webpack_require__(747);

/**
 *
 * @param {String} sourceFile
 * @param encoding
 * @constructor
 * @name {PropertiesReader}
 */
function PropertiesReader (sourceFile, encoding) {
   this._properties = {};
   this._propertiesExpanded = {};

   this.append(sourceFile, encoding);
}

/**
 * @type {String} The name of a section that should be prefixed on an property as it is added
 * @ignore
 */
PropertiesReader.prototype._section = '';

/**
 * Gets the number of properties that have been read into this PropertiesReader.
 *
 * @name PropertiesReader#length
 * @type {Number}
 */
Object.defineProperty(PropertiesReader.prototype, 'length', {
   configurable: false,
   enumerable: false,
   get () {
      return Object.keys(this._properties).length;
   }
});

/**
 * Append a file to the properties into the PropertiesReader
 *
 * @param {string} sourceFile
 * @param {string} [encoding='utf-8']
 *
 * @return {PropertiesReader} this instance
 */
PropertiesReader.prototype.append = function (sourceFile, encoding) {
   if (sourceFile) {
      this.read(fs.readFileSync(sourceFile, typeof encoding === 'string' && encoding || 'utf-8'));
   }

   return this;
};

/**
 * Reads any string input into the PropertiesReader
 *
 * @param {String} input
 * @return {PropertiesReader} this instance
 */
PropertiesReader.prototype.read = function (input) {
   delete this._section;
   ('' + input).split('\n').forEach(this._readLine, this);
   return this;
};

/**
 * Used as a processor for the array of input lines when reading from a source file
 * @param {String} propertyString
 */
PropertiesReader.prototype._readLine = function (propertyString) {
   if (!!(propertyString = propertyString.trim())) {
      var section = /^\[([^=]+)]$/.exec(propertyString);
      var property = !section && /^([^#=]+)(={0,1})(.*)$/.exec(propertyString);

      if (section) {
         this._section = section[1];
      }
      else if (property) {
         section = this._section ? this._section + '.' : '';
         this.set(section + property[1].trim(), property[3].trim());
      }
   }
};

/**
 * Calls the supplied function for each property
 *
 * @param {Function} fn
 * @param {Object} scope
 * @return {PropertiesReader}
 */
PropertiesReader.prototype.each = function (fn, scope) {
   for (var key in this._properties) {
      if (this._properties.hasOwnProperty(key)) {
         fn.call(scope || this, key, this._properties[key]);
      }
   }
   return this;
};

/**
 * Given the supplied raw value, returns the parsed value
 */
PropertiesReader.prototype._parsed = function (value) {

   if (value !== null && value !== '' && !isNaN(value)) {
      return +value;
   }

   if (value === 'true' || value === 'false') {
      return value === 'true';
   }

   if (typeof value === "string") {
      var replacements = {'\\n': '\n', '\\r': '\r', '\\t': '\t'};
      return value.replace(/\\[nrt]/g, function (key) {
         return replacements[key];
      });
   }

   return value;
};

/**
 * Gets a single property value based on the full string key. When the property is not found in the
 * PropertiesReader, the return value will be null.
 *
 * @param {String} key
 * @return {*}
 */
PropertiesReader.prototype.get = function (key) {
   return this._parsed(this.getRaw(key));
};

/**
 * Gets the string representation as it was read from the properties file without coercions for type recognition.
 *
 * @param {string} key
 * @returns {string}
 */
PropertiesReader.prototype.getRaw = function (key) {
   return this._properties.hasOwnProperty(key) ? this._properties[key] : null;
};

/**
 * Sets the supplied key in the properties store with the supplied value, the value can be any string representation
 * that would be valid in a properties file (eg: true and false or numbers are converted to their real values).
 *
 * @param {String} key
 * @param {String} value
 * @return {PropertiesReader}
 */
PropertiesReader.prototype.set = function (key, value) {
   var parsedValue = ('' + value).trim();

   this._properties[key] = parsedValue;

   var expanded = key.split('.');
   var source = this._propertiesExpanded;

   while (expanded.length > 1) {
      var step = expanded.shift();
      if (expanded.length >= 1 && typeof source[step] === 'string') {
         source[step] = {'': source[step]};
      }
      source = (source[step] = source[step] || {});
   }

   if (typeof parsedValue === 'string' && typeof  source[expanded[0]] === 'object') {
      source[expanded[0]][''] = parsedValue;
   }
   else {
      source[expanded[0]] = parsedValue;
   }

   return this;
};

/**
 * Gets the object that represents the exploded properties.
 *
 * Note that this object is currently mutable without the option to persist or interrogate changes.
 *
 * @return {*}
 */
PropertiesReader.prototype.path = function () {
   return this._propertiesExpanded;
};

/**
 * Gets the object that represents all properties.
 *
 * @returns {Object}
 */
PropertiesReader.prototype.getAllProperties = function () {
   var properties = {};
   this.each(function (key, value) {
      properties[key] = value;
   });
   return properties;
};

/**
 * Creates and returns a new PropertiesReader based on the values in this instance.
 * @return {PropertiesReader}
 */
PropertiesReader.prototype.clone = function () {
   var propertiesReader = new PropertiesReader(null);
   this.each(propertiesReader.set, propertiesReader);

   return propertiesReader;
};

/**
 * Return a json from a root properties
 * @param root
 * @returns {{}}
 */
PropertiesReader.prototype.getByRoot = function (root) {
   var keys = Object.keys(this._properties);
   var outObj = {};

   for (var i = 0, prefixLength = String(root).length; i < keys.length; i++) {
      var key = keys[i];

      if (key.indexOf(root) === 0 && key.charAt(prefixLength) === '.') {
         outObj[key.substr(prefixLength + 1)] = this.get(key);
      }
   }

   return outObj;
};

/**
 * Binds the current properties object and all values in it to the supplied express app.
 *
 * @param {Object} app The express app (or any object that has a `set` function)
 * @param {String} [basePath] The absolute prefix to use for all path properties - defaults to the cwd.
 * @param {Boolean} [makePaths=false] When true will attempt to create the directory structure to any path property
 */
PropertiesReader.prototype.bindToExpress = function (app, basePath, makePaths) {
   var Path = __webpack_require__(622);

   if (!/\/$/.test(basePath = basePath || process.cwd())) {
      basePath += '/';
   }

   this.each(function (key, value) {
      if (value && /\.(path|dir)$/.test(key)) {
         value = Path.join(basePath, Path.relative(basePath, value));
         this.set(key, value);

         try {
            var directoryPath = /dir$/.test(key) ? value : Path.dirname(value);
            if (makePaths) {
               __webpack_require__(626).sync(directoryPath);
            }
            else if (!fs.statSync(directoryPath).isDirectory()) {
               throw new Error("Path is not a directory that already exists");
            }
         }
         catch (e) {
            throw new Error("Unable to create directory " + value);
         }
      }

      app.set(key, this.get(key));

      if (/^browser\./.test(key)) {
         app.locals[key.substr(8)] = this.get(key);
      }
   }, this);

   app.set('properties', this);

   return this;
};

/**
 * Stringify properties
 *
 * @returns {string[]} array of stringified properties
 */
PropertiesReader.prototype._stringifyProperties = function () {
   var lines = [];
   var section = null;
   this.each(function (key, value) {
      var tokens = key.split('.');
      if (tokens.length > 1) {
         if (section !== tokens[0]) {
            section = tokens[0];
            lines.push('[' + section + ']');
         }
         key = tokens.slice(1).join('.');
      }
      else {
         section = null;
      }

      lines.push(key + '=' + value);
   });
   return lines;
};

/**
 * Write properties into the file
 *
 * @param {String} destFile
 * @param {function} onComplete callback
 */
PropertiesReader.prototype.save = function (destFile, onComplete) {
   const content = this._stringifyProperties().join('\n');
   const onDone = new Promise((done, fail) => {
      fs.writeFile(destFile, content, (err) => {
         if (err) {
            return fail(err);
         }

         done(content);
      });
   });

   if (typeof onComplete === 'function') {
      if (onComplete.length > 1) {
         onDone.then(onComplete.bind(null, null), onComplete.bind(null));
      }
      else {
         onDone.then(onComplete)
      }
   }

   return onDone;
};

PropertiesReader.builder = function (sourceFile, encoding) {
   return new PropertiesReader(sourceFile, encoding);
};

module.exports = PropertiesReader.builder;


/***/ }),

/***/ 431:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(__webpack_require__(87));
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return (s || '')
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return (s || '')
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 470:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(431);
const os = __importStar(__webpack_require__(87));
const path = __importStar(__webpack_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable
 */
function exportVariable(name, val) {
    process.env[name] = val;
    command_1.issueCommand('set-env', { name }, val);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store
 */
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message
 */
function error(message) {
    command_1.issue('error', message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message
 */
function warning(message) {
    command_1.issue('warning', message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store
 */
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 626:
/***/ (function(module, __unusedexports, __webpack_require__) {

var path = __webpack_require__(622);
var fs = __webpack_require__(747);
var _0777 = parseInt('0777', 8);

module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

function mkdirP (p, opts, f, made) {
    if (typeof opts === 'function') {
        f = opts;
        opts = {};
    }
    else if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    
    if (mode === undefined) {
        mode = _0777
    }
    if (!made) made = null;
    
    var cb = f || function () {};
    p = path.resolve(p);
    
    xfs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                if (path.dirname(p) === p) return cb(er);
                mkdirP(path.dirname(p), opts, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, opts, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                xfs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made)
                    else cb(null, made);
                });
                break;
        }
    });
}

mkdirP.sync = function sync (p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    
    if (mode === undefined) {
        mode = _0777
    }
    if (!made) made = null;

    p = path.resolve(p);

    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), opts, made);
                sync(p, opts, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = xfs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};


/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ })

/******/ });