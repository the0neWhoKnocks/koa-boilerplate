# A boilerplate Koa Node server

This boiler plate utilizes Koa instead of the standard Express.

---

## Installation

* `npm install`
* `node app` or `node --harmony app` (for node 0.12.0)

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

* **<GET>** `curl -i "http://localhost:3000/api/v1/user/get?uid=2"`
* **<POST>** `curl -i "http://localhost:3000/api/v1/user/save" -d "uid=2&data=blah"`

If you want to use Postman to test your endpoints, be sure to choose the
`x-www-form-urlencoded` option under the `Body` section. Otherwise the body won't
come through to node.
