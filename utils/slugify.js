const slugifyLib = require('slugify');

const slugify = (text) => {
  return slugifyLib(text, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
    trim: true
  });
};

module.exports = slugify;
