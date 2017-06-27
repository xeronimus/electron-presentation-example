const {render, h} = require('preact');
const electron = require('electron');

const {ipcRenderer, remote: {dialog}} = electron;

let ipcMessageInputField;

render((
  <div className="api-demo">
    <div className="example-buttons">
      <h2>Dialogs</h2>
      <button onClick={nativeInfoDialog}>Native Info Dialog</button>
      <button onClick={nativeErrorDialog}>Native Error Dialog</button>
    </div>

    <div className="ipc-form">
      <h2>IPC Communication</h2>
      <input type="text" ref={(ref) => ipcMessageInputField = ref}/>
      <button onClick={sendIpcMessage}>Send Message</button>
    </div>

    <div className="ipc-form">
      <h2>Global Shortcuts</h2>
      <div>Defocus this electron app and press "CommandOrControl+Shift+Z". The electron main thread will print a log
        message.
      </div>
    </div>
  </div>
), document.body);


function nativeInfoDialog() {
  dialog.showMessageBox({
    type: 'info',
    title: 'Info Message',
    message: 'The Text',
    buttons: ['Got it!']
  });
}

function nativeErrorDialog() {
  dialog.showErrorBox('This is my Error', 'Error Message...');
}

function sendIpcMessage() {
  ipcRenderer.send('demoMessage', ipcMessageInputField.value);
}
