# A boilerplate Koa Node server

This boiler plate utilizes Koa instead of the standard Express.

---

## Installation

* `npm install`
* `node app` or `node --harmony app` (for node 0.12.0, which is the lowest Node version supported)
   * The default port `conf.port` within `app.js` is set to `80`. On Linux based
   systems you'll need to prefix the commands above with `sudo` since nothing can
   run below port `1024` without admin privileges. Or as an alternative, you can
   simply change `conf.port` to `8080`, or something greater than `1024`.

####Continuously run the server

**Nodemon** worked well, but kept an extra `node` process running on exit (`CTRL + C`).

* `npm install -g nodemon`
* `nodemon`

Nodemon config examples - https://github.com/remy/nodemon/blob/master/doc/sample-nodemon.md

Tried **Forever** as well, but it wasn't displaying any of the output of the app.

* `npm install -g forever`
* `forever start -c "node --harmony" app.js`

---

## Testing API Endpoints

* **<GET>** `curl -i "http://localhost/api/v1/user/get?uid=2"`
* **<POST>** `curl -i "http://localhost/api/v1/user/save" -d "uid=2&data=blah"`

If port `80` was in use, or you changed the default port, make sure to suffix
`localhost` with the new port number like so `http://localhost:8080`.

If you want to use Postman to test your endpoints, be sure to choose the
`x-www-form-urlencoded` option under the `Body` section. Otherwise the body won't
come through to node.
