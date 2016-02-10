// node modules
var clc = require('cli-color'); // chalk wasn't including the ANSI open/close escape codes

/**
 * This Class allows us to build out colored log messages. This can be done in a
 * couple of ways.
 *
 * @example
 *
 * var Logger = require('./path/to/compiled/classes/js/file').Logger;
 * var logger = new Logger();
 *
 * // standard message construction
 * console.log( logger.style.success("I'm green") +" and I'm the default color" );
 *
 * OR
 *
 * // with string substitution
 * console.log( logger.style.success("I'm green") +" %s", "and I'm the default color" );
 *
 * OR
 *
 * // with internal methods
 * logger.printReq( request, 'Inserted in middle of message' );
 */
class Logger {

  constructor(opts){
    this.style = {
      success : clc.green.bold,
      warn    : clc.yellow.bold,
      error   : clc.red.bold,
      debug   : clc.black.bold,
      request : clc.cyan.bold
    };

    this.label = {
      SUCCESS : this.style.success('[ SUCCESS ]'),
      WARN : this.style.warn('[ WARN ]'),
      ERROR : this.style.error('[ ERROR ]'),
      DEBUG : this.style.debug('[ DEBUG ]')
    };

    this.showDebugMessages = global.debug;
  }

  successMsg(message, label){
    label = (label) ? this.style.success('[ '+label.toUpperCase()+' ]') : this.label.SUCCESS;
    console.log( label, message );
  }

  warnMsg(message, label){
    label = (label) ? this.style.warn('[ '+label.toUpperCase()+' ]') : this.label.WARN;
    console.log( label, message );
  }

  errorMsg(message, label){
    label = (label) ? this.style.error('[ '+label.toUpperCase()+' ]') : this.label.ERROR;
    console.log( label, message );
  }

  debugMsg(message, label){
    label = (label) ? this.style.debug('[ '+label.toUpperCase()+' ]') : this.label.DEBUG;

    if( this.showDebugMessages ){
      console.log( label, message );
    }
  }

  printReq(req, funcName){
    // used to use `arguments.callee.name` but `strict mode` is retarded.
    var ex = (funcName) ? ' >> '+funcName : '';

    console.log(
      this.style.request('[ REQUEST: %s%s ]')+' %s',
      req.method,
      ex,
      req.url
    );
  }

  generalAccess(method, url){
    var start = new Date;
    var ms = new Date - start;

    console.log(
      this.style.debug('[ ACCESS ] %s %s - %s'),
      method,
      url,
      ms
    );
  }

  appLocation(portText, domain){
    console.log(
      this.style.success('[ START ]') +' Server running at '+ this.style.success('%s') +' OR '+ this.style.success('%s'),
      'localhost'+portText,
      'http://'+domain+portText
    );
    console.log(
      this.style.debug('[ NOTE ] Add `127.0.0.1  %s` to your `hosts` file'),
      domain
    );
  }

  appPortWarning(preferredPort, runningPort){
    console.log(
      this.label.WARN +' Preferred port %s is in use, using port %s',
      preferredPort,
      runningPort
    );
  }
}

module.exports = Logger;