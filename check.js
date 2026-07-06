try {
  eval(new ActiveXObject('Scripting.FileSystemObject').OpenTextFile('c:/Users/hp/OneDrive/Desktop/web/dynamic.js', 1).ReadAll());
  WScript.Echo('Syntax OK');
} catch(e) {
  WScript.Echo('Syntax Error: ' + e.description + ' at line ' + e.line);
}
