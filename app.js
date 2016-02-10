// module includes
var koa = require('koa');
var hbs = require('koa-hbs');
var vhost = require('koa-vhost');
var router = require('koa-router')();
var koaBody = require('koa-body');
var serve = require('koa-static');
var rewrite = require('koa-rewrite');
var portscanner = require('portscanner');
require('babel-polyfill');
require('babel-register')({
  presets: [ 'es2015', 'stage-0' ]
});
// optional
/*
var nopt = require('nopt');
*/


var app = koa();
var testServer = koa();
var app_root = __dirname;
var logger = new (require('./server/Logger.js'))();
var conf = {
  domain : 'node-server',
  port : 80,
  portFallback : 3000
};
var baseModel = {
  // constants
  IMG_PATH  : '/imgs',
  CSS_PATH  : '/css',
  JS_PATH   : '/js',
  MIN       : '',

  head : {
    title : 'Node Server',
    js : [],
    css : []
  },
  page : {
    attributes : {},
    content : ''
  }
};
var runningPortText = '';
var appPort;

// Optional
/*
var validOpts = {
  'debug' : Boolean
};
var shortHandOpts = {
  'd' : ['-debug']
};
var appOpts = nopt(validOpts, shortHandOpts, process.argv, 2);
*/

// == headers ==================================================================

app.use(function* (next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
});

// == logger ===================================================================

app.use(function* (next){
  yield next;
  
  logger.generalAccess( this.method, this.url );
});

// == page routing =============================================================

require('./server/routes')({
  router: router,
  baseModel: baseModel
});

// == serve files ==============================================================

app.use(serve('.'));

// == views ====================================================================

app.use(hbs.middleware({
  disableCache: true,
  defaultLayout: 'shell',
  partialsPath: app_root+'/view',
  viewPath: app_root+'/view'
}));

// == rewrites =================================================================

app.use(rewrite('/favicon.ico', '/imgs/favicon.ico'));

// == response =================================================================

function startApp(){
  app.listen(appPort, function(){
    logger.appLocation( runningPortText, conf.domain );
  });
}

app.use( koaBody( {formidable:{uploadDir: app_root}} ) ); // request body parser
app.use(router.routes()).use(router.allowedMethods());

// == vhost ====================================================================

app.use(vhost({
  host: conf.domain,
  app: app
}));

// == port =====================================================================

/**
 * Ideally the app will run on port 80 so it's one less thing to type in.
 * If port 80 is in use by another program (most likely Apache) use another
 * port and display that to the user.
 */
portscanner.checkPortStatus(conf.port, '127.0.0.1', function(error, status){
  // Status is 'open' if currently in use or 'closed' if available
  switch(status){
    case 'open' : // port isn't available, so find one that is
      portscanner.findAPortNotInUse(conf.portFallback, conf.portFallback+20, '127.0.0.1', function(error, port){
        logger.appPortWarning( conf.port, port );

        appPort = port;
        runningPortText = ':'+appPort;

        startApp();
      });
      break;

    default :
      appPort = conf.port;

      startApp();
  }
});