# <img src="media/logo.png" width="45" align="left">&nbsp;WhatsDesktop

> Unofficial WhatsApp app with tray notification and shortcut

*Heavily inspired and adapted from [Caprine](https://github.com/sindresorhus/caprine) by [Sindre Sorhus](https://github.com/sindresorhus).*


<br>
<img src="promo.jpg" align="center">

*Requires OS X 10.8+, Linux or Windows.*


## Features		
 - - Custom clean theme		
 - - Minimaze in tray		
 - - Notifications		
 - - Click on tray icon shows/hides app		
 - - Ctrl+w hides window		
 - - Alt - shows menu 		


## Install

```
npm install
npm start
```

## Build exe

```
electron-packager .  --overwrite --out=dist --ignore='^/dist$' --prune --platform=win32 --arch=ia32 --icon=media/logo.ico   && cd dist/WhatsDesktop-win32-ia32/ && zip -ryq9 ../WhatsDesktop-win32-\"$npm_package_version\".zip *
```

