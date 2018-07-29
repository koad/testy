# Testy the Example Discord Bot

After a few nights of having dreams about the damn discord bot i was working on, i came up with this framework for it.

Beware of bugs,  PRs are appreciated.

---

## Installation

Its easy to install testy into a portable package.

* Make a directory for your app's data, copy the example-config.js and set up directories for the command and utility scripts
```
mkdir ~/.testy && cd ~/.testy
git clone https://github.com/koad/testy.git repo
cp repo/sample-config.js config.js && mkdir commands && mkdir utilities
```

Now you will have a data directory (`.testy` in your home directory), this repo inside it in a directory called `repo`, a commands folder where you will put the commands for your bot (in javascript) and a similar directory for your utilities

* Open up ``config.js`` in your favorite editor and edit the values to reflect your machine/situation
```
cd ~/.testy && subl config.js
```

* Then to update then run the bot from the repo.
```
cd ~/.testy/repo && git pull && DATADIR=~/.testy/ node index.js
```
---

Now you can create various commands and utilities for your bot.  Look at the samples in the repo for inspiration and guidance.

---

## References

Don't be silly, use [nodemon](https://github.com/remy/nodemon)!  
[The Canada eCoin Discord Channels](https://discord.gg/9wAtaBG)    
[An Idiots Guide to Discord](https://anidiotsguide_old.gitbooks.io/discord-js-bot-guide/content/information/understanding-collections.html)  
[]()  
[]()  
