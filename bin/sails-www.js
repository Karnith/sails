#!/usr/bin/env node


/**
 * Module dependencies
 */

var nodepath = require('path');
var _ = require('lodash');
var CaptainsLog = require('captains-log');
var Sails = require('../lib/app');
var rconf = require('../lib/app/configuration/rc');
var __Gulp = require('../lib/hooks/gulp');
var Err = require('../errors');

/**
 * `sails www`
 *
 * Run the `gulp build` task
 */

module.exports = function() {
  var log = CaptainsLog(rconf.log);

  var wwwPath = nodepath.resolve(process.cwd(), './www'),
    GULP_TASK_NAME = 'build',
    GULP_TASK_PROD_NAME = 'buildProd';

  var sails = Sails();
  sails.load(_.merge({}, rconf, {
    hooks: {
      gulp: false
    },
    globals: false
  }), function sailsReady(err) {
    if (err) return Err.fatal.failedToLoadSails(err);

    var overrideGulpTask = (sails.config.environment == 'production' ? GULP_TASK_PROD_NAME : GULP_TASK_NAME)

    // Run Gulp task
    var Gulp = __Gulp(sails);

    log.info('Compiling assets into standalone `www` directory with `gulp ' + overrideGulpTask + '`...');
    Gulp.runTask(overrideGulpTask);

    // Bind error event
    sails.on('hook:gulp:error', function(err) {
      log.error('Error occured starting `gulp ' + overrideGulpTask + '`');
      log.error('Please resolve any issues and try running `sails www` again.');
      log.error(err);
      process.exit(1);
    });

    // Task is not actually complete yet-- it's just been started
    // We'll bind an event listener so we know when it is
    sails.on('hook:gulp:done', function() {
      log.info();
      log.info('Created `www` directory at:');
      log.info(wwwPath);
      process.exit(0);
    });
  });
};
