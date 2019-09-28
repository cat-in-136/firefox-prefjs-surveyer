const foxr = require('foxr').default;

(async () => {
  try {
    const browser = await foxr.connect()
    const page = await browser.newPage()

    await page.goto('about:config')

    //await page.evaluate('ShowPrefs()');
    const prefs = await page.evaluate(`(function(){
      const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
      const gPrefBranch = Services.prefs;
      const defaultBranch = gPrefBranch.getDefaultBranch("");
      let prefs = [];
      for (const name of gPrefBranch.getChildList('')) {
        try {
          let type = gPrefBranch.getPrefType(name);
          let pref = { name, type };
          switch (pref.type) {
            case gPrefBranch.PREF_BOOL:
              pref.value = defaultBranch.getBoolPref(pref.name);
              break;
            case gPrefBranch.PREF_INT:
              pref.value = defaultBranch.getIntPref(pref.name);
              break;
            default:
            case gPrefBranch.PREF_STRING:
              pref.value = defaultBranch.getStringPref(pref.name);
              break;
          }
          prefs.push(pref);
        } catch (err){
        }
      }
      return prefs.map(entry => [entry.name, gTypeStrs[entry.type], entry.value]);
    })()`);
    //console.log(prefs);
    process.stdout.write(JSON.stringify(prefs));
    //process.stdout.write("\n");
    await browser.close()
  } catch (error) {
    console.error(error)
  }
})();