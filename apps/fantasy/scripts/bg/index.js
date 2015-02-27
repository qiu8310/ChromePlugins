var Tab = require('../lib/tab'),
  Common = require('../lib/common');

require('../lib/omnibox');

console.log(Common);


Tab.onChange((tab) => console.log(tab));
