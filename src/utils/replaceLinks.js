const url = require(`url`);
const cheerio = require('cheerio');

const replaceLinks = (htmlInput, siteUrlString) => {
  const siteUrl = url.parse(siteUrlString);
  const $ = cheerio.load(htmlInput);
  const links = $('a');
  links.attr('href', function(i, href){
    if (href) {
      const hrefUrl = url.parse(href);
      if (hrefUrl.protocol === siteUrl.protocol && hrefUrl.host === siteUrl.host) {
        return hrefUrl.path
      }

      return href;
    }

  });
  return $.html();
}

module.exports = replaceLinks;
