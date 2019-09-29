Prerequirement: node.js and firefox (47+). Note that no Selenium WebDriver is needed.

Create a temporary folder to use a *fresh clean* profile.

    % mkdir /tmp/profile_dir

Run firefox in headless mode.

    % /path/to/firefox -profile /tmp/profile_dir -marionette -headless

Execute fetcher.js to obtain all default prefs.

    % node fetcher.js > prefall.json

Note: After executing fetcher.js, the firefox process is killed. So, it is necessary to run firefox in headless mode again to retry fetcher.js.

Do same procedure with another version of Firefox.


And then, we assume that we have two json file: prefall-old.json and prefall-new.json.

Run surveyer.js to obtain the diff table.

    % node surveyer.js prefall-old.json prefall-new.json > diff.html



