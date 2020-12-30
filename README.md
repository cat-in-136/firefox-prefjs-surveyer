Prerequirement: node.js and firefox.

Install dependency after cloning the repository to your local working copy.

    % git clone https://github.com/cat-in-136/firefox-prefjs-surveyer.git
    % cd firefox-prefjs-surveyer
    % npm i

Execute fetcher.js to obtain all default prefs.

    % node fetcher.js /path/to/firefox > prefall.json

Do same procedure with another version of Firefox.

And then, we assume that we have two json file: prefall-old.json and prefall-new.json.

Run surveyer.js to obtain the diff table.

    % node surveyer.js prefall-old.json prefall-new.json > diff.html
