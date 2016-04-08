var ipc = require('ipc');

onload = function()
{
  var webview = document.getElementById("wv");
  webview.setAttribute('src', 'https://web.whatsapp.com');

  webview.addEventListener('page-title-set', function(title, explicitSet )
  {
      document.title = title.title;
  });

  webview.addEventListener('did-finish-load', function() {
      ipc.send('did-finish-load-from-renderer', '');
  });

  webview.addEventListener('dom-ready', function() {
  });

  webview.addEventListener('did-get-response-details', function() {
  });


  window.onkeypress = function (e)
  {
    if (e.keyCode == 23 && e.ctrlKey) // ctrl + w
    {
      ipc.send('ctrl+w__pressed', '');
    }
  }
}

ipc.on('set-theme', function(css)
{
  var webview = document.getElementById("wv");
  webview.executeJavaScript("document.getElementById('style').href ='';" );
  webview.insertCSS(css);
});

ipc.on('reload', function()
{
  var webview = document.getElementById("wv");
  webview.reload();
});

