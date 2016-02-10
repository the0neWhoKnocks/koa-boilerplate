// node modules
var _ = require('lodash');

// Classes
var toolbox = new (require('./Util.js'))();

class API {
  /**
   * API constructor
   * @param {Object} [request] - The current request
   */
  constructor(request){
    // remove the beginning of the request
    if( request ){
      request.url = request.url.replace(/\/api\/v\d{1,3}/, '');
    }

    /**
     * The HTTP method this request was made in, either GET, POST, PUT or DELETE
     * @type {String}
     */
    this.method = (request) ? request.method : '';
    /**
     * The Model requested in the URI. eg: /files
     * @type {String}
     */
    this.endpoint = '';
    /**
     * An optional additional descriptor about the endpoint, used for things that can
     * not be handled by the basic methods. eg: /files/process
     * @type {String}
     */
    this.verb = '';
    /**
     * Any additional URI components after the endpoint and verb have been removed, in our
     * case, an integer ID for the resource. eg: /<endpoint>/<verb>/<arg0>/<arg1>
     * or /<endpoint>/<arg0>
     * @type {Array}
     */
    this.args = [];
    /**
     * Stores the input of the PUT request
     * @type {String|Boolean|Null}
     */
    this.file = null;
    /**
     * Whether or not the current request ends in a slash
     * @type {Boolean}
     */
    this.requestEndsInSlash = (request) ? request.url.match(/\/$/) : false;
    /**
     * The format in which the data will be returned.
     * @type {String}
     */
    this.returnType = 'json';
    /**
     * The content types the API can return
     * @type {Array}
     */
    this.returnTypes = {
      JSON: 'json',
      JSONP: 'jsonp',
      XML: 'xml',
      PHP: 'php'
    };
    /**
     * The HTTP status codes used by the API
     * @type {Array}
     */
    this.httpStatusCodes = {
      200 : 'OK',
      400 : 'Bad Request',
      401 : 'Unauthorized',
      404 : 'Not Found',
      405 : 'Method Not Allowed',
      408 : 'Request Timeout',
      500 : 'Internal Server Error',
      501 : 'Not Implemented'
    };


    this.args = (request) ? request.url.split('/').filter(Boolean) : [];
    this.endpoint = this.args.shift();

    if(
      this.args.length
      && !this.numeric(this.args[0])
    ){
      this.verb = this.args.shift();
    }
  }

  numeric(val){
    return !isNaN(parseFloat(val)) && isFinite(val);
  }

  /**
   * Builds out a grammatically correct error message when a verb is missing from an endpoint call.
   *
   * @param {Object} verbs - An Array of verbs the current endpoint allows calls to.
   * @return {String}
   */
  verbsError(verbs){
    var vals = [];
    var s, isAre;

    for( var key in verbs ){
      vals.push( verbs[key] );
    }

    if( vals.length > 1 ){
      s = 's';
      isAre = 'are';
    }else{
      s = '';
      isAre = 'is';
    }

    var trailing = ( this.requestEndsInSlash ) ? ' Or you may just want to remove the trailing slash.' : '';

    return "You're missing a verb, here "+ isAre +" the supported verb"+ s +" for this endpoint: "+ this.separateAndPunctuate(vals, "'") + trailing;
  }

  /**
   * Loop through an Array of Strings and build out the proper separators and punctuation.
   *
   * @param {Array} arr - An Array of Strings
   * @param {String} wrapper - Each item will start & end with this String
   * @return {String}
   * @example
   * // returns "'one', 'two', & 'three'"
   * separateAndPunctuate(['one', 'two', 'three'], "'");
   */
  separateAndPunctuate(arr, wrapper=''){
    var result = '';
    var count = arr.length;

    for( var i=0; i<count; i++ ){
      if( i === count-1 && count > 1 ){
        result += ( count > 2 ) ? ', & ' : ' & ';
      }else if( i > 0 ){
        result += ', ';
      }

      // break the param into pieces for parsing later
      var matches = arr[i].match(/^\[?(\w+)(?::(\w+))?\]?$/);

      // index 1 will always be set
      var param = matches[1];
      // the type may not always be set
      var type = (
        matches.length >= 2
        && matches[2] !== undefined
      ) ? '[:'+ util.ucFirst(matches[2]) +']' : '';

      result += wrapper+param+wrapper+type;
    }

    return result;
  }

  /**
   * Creates a standard success response. Koa uses status for status codes and
   * body for the response body. The ret Object will be merged with Koa's response
   * Object before it's served up.
   *
   * @param {Object|String} [data] - If data is passed in, it will be merged with the response.
   * @return {Object}
   */
  success(data){
    var ret = {
      status : 200,
      body : {
        httpStatusCode : 200,
        message : 'Your request was successful'
      }
    };

    if( data ){
      // allow the user to pass in a string for the error message
      if( typeof data == 'string' ){
        ret.body.message = data;
      }else{
        ret.body = _.merge(ret.body, data);
      }
    }

    return ret;
  }

  /**
   * Creates a standard error response. Koa uses status for status codes and
   * body for the response body. The ret Object will be merged with Koa's response
   * Object before it's served up.
   *
   * @param {Number} statusCode - An http error status code
   * @param {Object|String} [data] - If data is passed in, it will be merged with the response.
   * @return {Object}
   */
  error(statusCode, data){
    var ret = {
      status : statusCode,
      body : {
        httpStatusCode : statusCode,
        message : this.statusText(statusCode)
      }
    };

    if( data ){
      // allow the user to pass in a string for the error message
      if( typeof data == 'string' ){
        ret.body.message = data;
      }else{
        ret.body = _.merge(ret.body, data);
      }
    }

    return ret;
  }

  /**
   * A helper function to grab the status text that's associated with the status code.
   *
   * @param {Number} statusCode - An http status code
   * @return {String}
   */
  statusText(statusCode){
    return (this.httpStatusCodes[statusCode]) ? this.httpStatusCodes[statusCode] : this.httpStatusCodes[500];
  }

  /**
   * Loops through a given Array and verifies that key exists in the current query
   *
   * @param {Array} keys - The parameter names we're expecting, if the Strings are surrounded with brackets, they won't be counted as required.
   * @param {Object} data - The data from the current query
   * @param {Object} [missingParams] - A reference var. If passed, it will be set and you can use it to print out what was missing.
   * @return boolean
   */
  requiredIsSet(keys, data, missingParams){
    var requiredButNotSet = [];
    var optionalButNotSet = [];

    for( var i in keys ){
      var key = keys[i];
      // break the param into pieces for parsing later
      var param = key.match(/^\[?(\w+)(:(\w+))?\]?$/);
      param = param[1];

      if( !data[param] || data[param] == '' ){
        // check if param is surrounded in brackets, if so, it's not required
        if( key.indexOf(']') !== -1 ){
          optionalButNotSet.push( key );
        }else{
          requiredButNotSet.push( key );
        }
      }
    }

    // build out a grammatically correct error message
    var notSetCount = requiredButNotSet.length;
    var s, isAre, wasWere;

    if( notSetCount ){
      if( notSetCount > 1 ){
        s = 's';
        isAre = 'are';
        wasWere = 'were';
      }else{
        s = '';
        isAre = 'is';
        wasWere = 'was';
      }

      var optional = ( optionalButNotSet.length )
        ? ' Optional param'+s+' not yet added: '+ this.separateAndPunctuate(optionalButNotSet, "'")
        : '';

      _.merge(
        missingParams,
        this.error(400, 'The param'+s+' '+ this.separateAndPunctuate(requiredButNotSet, "'") +' '+ isAre +' missing from the request or '+wasWere+' not set.'+ optional)
      );

      return false;
    }

    return true;
  }
}

module.exports = API;