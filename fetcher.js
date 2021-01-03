const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

require('geckodriver');

const executablePath = process.argv[2];
if (!executablePath) {
  console.error(`Usage: ${process.argv[0]} ${process.argv[1]} path_to_firefox`);
  process.exit(1);
} else {
  console.error(`Firefox Executable Path: ${executablePath}`);
}

(async () => {
  const options = new firefox.Options()
    .headless()
    .setBinary(executablePath);

  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .build();
  try {
    await driver.get('about:config');

    //await driver.executeScript('ShowPrefs()');
    const prefs = await driver.executeScript(function() {
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

      let gTypeStrs = [];
      gTypeStrs[gPrefBranch.PREF_STRING] = 'string';
      gTypeStrs[gPrefBranch.PREF_INT] = 'integer';
      gTypeStrs[gPrefBranch.PREF_BOOL] = 'bool';

      return prefs.map(entry => [entry.name, gTypeStrs[entry.type], entry.value]);
    });
    //console.log(prefs);
    process.stdout.write(JSON.stringify(prefs));
    //process.stdout.write("\n");
  } catch (error) {
    console.error(error)
  } finally {
    await driver.quit();
  }
})();
