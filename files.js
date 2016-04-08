const fs = require('fs');

module.exports = {
  /**
   * @return the css of the theme
   */
  getThemeCss: function(theme, callback) {
    const themePath =  __dirname + '/themes/clean.css';// +theme+'.css';
    fs.readFile(themePath, 'utf-8', function(err, css) {
      if (err) {
        logError(err);
      } else {
        callback(css);
      }
    });
  },
};
