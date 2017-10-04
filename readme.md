# <img src="media/logo.png" width="45" align="left">&nbsp;WhatsDesktop

> Unofficial WhatsApp app

*Heavily inspired and adapted from [Caprine](https://github.com/sindresorhus/caprine) by [Sindre Sorhus](https://github.com/sindresorhus).*

*<strong>Note:</strong> In order to use this app a WhatsApp Web compatible device is required.*

<br>
[![](media/screenshot.png)](https://github.com/mawie81/whatsdesktop/releases/latest)

*Requires OS X 10.8+, Linux or Windows.*

## Install

```
npm install
npm start
```

## Build exe

```
electron-packager .  --overwrite --out=dist --ignore='^/dist$' --prune --platform=win32 --arch=ia32 --icon=media/logo.ico   && cd dist/WhatsDesktop-win32-ia32/ && zip -ryq9 ../WhatsDesktop-win32-\"$npm_package_version\".zip *
```

