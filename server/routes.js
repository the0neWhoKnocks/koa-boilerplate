// node modules
var _ = require('lodash');
var request = require('koa-request');

// Classes
var API = require('./API');
var logger = new(require('./Logger.js'))();

module.exports = function(opts){

  var router = opts.router;
  var baseModel = opts.baseModel;
  var API_V1 = 'api/v1';
  
  /**
   * Just an example generator function.
   *
   * @param {Object} reqData - Some data from GET or POST.
   * @return {String}
   */
  function *_exampleFunc(reqData){
    return ( reqData.data )
      ? `Saved data "${reqData.data}" for user with id: "${reqData.uid}"`
      : `Got data for user with id: "${reqData.uid}"`;
  }
  
// == Pages ====================================================================

  function *root(next){
    this.body = "It works!";
  };
  router.get('/', root);
  
// == API ======================================================================

  function *testEndpoint(next){
    logger.printReq(this.request, 'testEndpoint');

    var api = new API(this.request);
    var verbs = {
      GET : 'get',
      SAVE : 'save'
    };
    var queryParams = this.request.query;
    var postData = this.request.body || {};
    var missingParams = {};
    var resp, required;
    
    console.log(this.request);
    
    switch( this.params.verb ){
      case verbs.GET : // <GET> ?[params]
        required = [
          'uid'
        ];
        
        if( api.requiredIsSet(required, queryParams, missingParams) ){
          resp = api.success( yield _exampleFunc( queryParams ) );
        }else{
          resp = missingParams;
        }

        break;

      case verbs.SAVE : // <POST>
        required = [
          'uid',
          'data'
        ];
        
        if( api.method == 'POST' ){
          if( api.requiredIsSet(required, postData, missingParams) ){
            resp = api.success( yield _exampleFunc( postData ) );
          }else{
            resp = missingParams;
          }
        }else{
          resp = api.error(405, 'This endpoint requires a POST method');
        }

        break;

      default :
        resp = api.error( 400, api.verbsError(verbs) );
    }

    _.merge(this, resp);
  };
  router.get('/'+ API_V1 +'/user/:verb?', testEndpoint);
  router.post('/'+ API_V1 +'/user/:verb?', testEndpoint);
  

  function *apiCatchAll(next){
    logger.printReq(this.request, 'apiCatchAll');
    
    var api = new API(this.request);
    var resp = {};

    switch( this.accepts('json', 'html', 'text') ){
      case 'text':
      case 'html':
      case 'json':
        resp = ( api.endpoint )
          ? api.error( 400, "The endpoint '"+ api.endpoint +"' doesn't exist" )
          : api.error( 400, "No endpoint specified for the API request" );
    }

    _.merge(this, resp);
  };
  router.get( new RegExp('/'+ API_V1 +'/?.*', 'i'), apiCatchAll);
}