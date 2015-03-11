var Tab = require('./lib/tab'),
  Common = require('./lib/common');

// require('babel/polyfill');  // http://babeljs.io/docs/usage/caveats/
require('./lib/omnibox');

console.log(Common);


Tab.onChange((tab) => console.log(tab));
