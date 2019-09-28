

Create a temporary folder to use a *clean* profile.

    % mkdir /tmp/profile_dir

Run firefox in headless mode.

    % /path/to/firefox -profile /tmp/profile_dir -marionette -headless

Execute fetcher.js to obtain all default prefs.

    % node fetcher.js > prefall.json

Note: After executing fetcher.js, the firefox process is killed. So, it is necessary to run firefox in headless mode again to retry fetcher.js.

Do same procedure with another version of Firefox.


And then, we assume that we have two json file: prefall.json and prefall2.json.
