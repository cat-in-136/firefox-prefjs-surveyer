
class PrefData {
  constructor() {
    this.data = {};
  }
  loadJSON(path) {
    return new Promise((resolve, reject) => {
      const fs = require('fs');
      fs.readFile(path, 'utf8', (err, content) => {
        if (err) {
          reject(err);
        } else {
          JSON.parse(content).forEach(entry => {
            this.data[entry[0]] = entry[2];
          });
          resolve(this.data);
        }
      });
    });
  }
  get(key) {
    return this.data[key];
  }
  getKeies() {
    return Object.keys(this.data);
  }
};

class PrefSurveyer {
  constructor() {
    this.sideA = new PrefData();
    this.sideB = new PrefData();
  }
  getSideData(side) {
    if (side == "a") {
      return this.sideA;
    } else if (side == "b") {
      return this.sideB;
    } else {
      throw new Error("Wrong side");
    }
  }
  getKeies() {
    const akeies = this.sideA.getKeies();
    const bkeies = this.sideB.getKeies();

    return Array.from(new Set(akeies.concat(bkeies)));
  }
  getCompareData() {
    return this.getKeies().sort().map(key => {
      return {
        name: key,
        data: [
          this.sideA.get(key),
          this.sideB.get(key)
        ]
      }
    });
  }
  async captureJSON(path, side) {
    await this.getSideData(side).loadJSON(path);
  }
}

// https://qiita.com/saekis/items/c2b41cd8940923863791
function escape_html (string) {
  if(typeof string !== 'string') {
    return string;
  }
  return string.replace(/[&'`"<>]/g, function(match) {
    return {
      '&': '&amp;',
      "'": '&#x27;',
      '`': '&#x60;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    }[match]
  });
}

(async () => {
  const [, , pathA, pathB] = process.argv;
  const surveyer = new PrefSurveyer();
  await surveyer.captureJSON(pathA, "a");
  await surveyer.captureJSON(pathB, "b");

  const compData = surveyer.getCompareData();

  let output = "";

  process.stdout.write(`<!DOCTYPE html>\n<html>\n<head>
    <title>prefdiff</title>
    <style type="text/css"><!-- /* --><![CDATA[ /* */
    #output table { border-collapse: collapse; font-size: x-small; overflow: auto; }
    #output table td { border: 1px solid #ddd; padding: 1px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; }
    #output table tr:hover { background-color: #eee; }
    #output table td.json, #output table td.uri, #output table td.dump { word-break: break-all; }
    #output table td.undefined { color: #888; font-style: italic; }
    #output table tr.sameval td:first-child { color: #444; }
    #output table tr.newkey  td:first-child { text-decoration: underline;    }
    #output table tr.oldkey  td:first-child { text-decoration: line-through; }
    /* ]]><!-- */ --></style>\n`);
  process.stdout.write(`</head>\n<body id="output">
  <table>
    <tbody>`);
  for (const c of compData) {
    const name = c.name;
    const valA = c.data[0];
    const valB = c.data[1];

    let nameInnerHTML = escape_html(String(name));
    let valAInnerHTML = escape_html(String(valA));
    let valBInnerHTML = escape_html(String(valB));

    const valAclassList = [];
    const valBclassList = [];
    const rowclassList = [];

    // undefined
    if (c.data[0] == undefined) valAclassList.push("undefined");
    if (c.data[1] == undefined) valBclassList.push("undefined");
    // json
    try {
      const d = JSON.parse(c.data[0]);
      if (typeof(d) == "object") { valAclassList.push("json"); }
    } catch (ex) {}
    try {
      const d = JSON.parse(c.data[1]);
      if (typeof(d) == "object") { valBclassList.push("json"); }
    } catch (ex) {}
    // uri
    if (/^(https?|ftp|mailto|file|news|tv|tel|urn|data|jar|about|chrome):/.test(c.data[0])) valAclassList.push("uri");
    if (/^(https?|ftp|mailto|file|news|tv|tel|urn|data|jar|about|chrome):/.test(c.data[1])) valBclassList.push("uri");

    // fix format
    nameInnerHTML = name.replace(/([\.,;:_]+)/g, "$1<wbr />");
    if (!valAclassList.length > 0) {
      valAInnerHTML = valAInnerHTML.replace(/([\.,;:_]+)\b/g, "$1<wbr />");
    }
    if (!valBclassList.length > 0) {
      valBInnerHTML = valBInnerHTML.replace(/([\.,;:_]+)\b/g, "$1<wbr />");
    }

    if (c.data[0] == c.data[1]) {
      rowclassList.push("sameval");
    } else if (c.data[0] === undefined && c.data[1] !== undefined) {
      rowclassList.push("newkey");
    } else if (c.data[0] !== undefined && c.data[1] === undefined) {
      rowclassList.push("oldkey");
    }

    const valAattr = (valAclassList.length > 0)? ` class="${valAclassList.join(' ')}"` : '';
    const valBattr = (valBclassList.length > 0)? ` class="${valBclassList.join(' ')}"` : '';
    const rowattr = (rowclassList.length > 0)? ` class="${rowclassList.join(' ')}"` : '';

    if (c.data[0] != c.data[1]) {
      process.stdout.write(`
      <tr${rowattr}>
        <td>${nameInnerHTML}</td>
        <td${valAattr}>${valAInnerHTML}</td>
        <td${valBattr}>${valBInnerHTML}</td>
      </tr>\n`);
    }
  }
  process.stdout.write(`
    </tbody>
  </table>\n`);
  process.stdout.write(`</body>\n</html>\n`);
})();

