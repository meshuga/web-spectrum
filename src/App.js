import './App.css';

import React, { useState } from 'react';

const tinySAUltra = { usbVendorId: 0x0483, usbProductId: 0x5740 }

const portBaudRate = {};
portBaudRate[tinySAUltra.usbProductId] = 115200;

const textEncoder = new TextEncoder();

const respOpening = 123;
const respClosing = 125;

let port, reader;

function App() {
  const [portState, setPort] = useState(undefined);

  const filters = [tinySAUltra];

  const processResponse = (response) => {
    console.log("RESPONSE");
    console.log(response);
  }

  let responseBuffer = new Int8Array([]);

  const readLoop = async () => {
    // let reader;
    while (port && port.readable) {
      try {
        reader = port.readable.getReader();

        for (;;) {
          console.log("inner")
          // we don't pass own buffer as we need to keep buffers to find response
          const {value, done} = await reader.read();
  
          if (value) {
            responseBuffer = new Uint8Array([ ...responseBuffer, ...value ]);

            const closingBracketIdx = responseBuffer.findIndex(
              (element) => element === respClosing // checking if closing of a response is detected
            );
            if(closingBracketIdx > -1) {
              const openingBracketIdx = responseBuffer.findIndex(
                (element) => element === respOpening // checking placement of opening bracket
              );

              processResponse(responseBuffer.slice(openingBracketIdx+1, closingBracketIdx));
              responseBuffer = new Int8Array([]);
            }

          }
          if (done) {
            break;
          }
        }
      } catch (e) {
        debugger;
        console.error(e);
      } finally {
        if (reader) {
          reader.releaseLock();
          reader = undefined;
        }
      }
    }
  };

  const defaultOptions = {
    "baudRate": 115200,
    "dataBits": 8,
    "parity": "none",
    "stopBits": 1,
    "flowControl": "none",
    "baudrate": 115200,
    "databits": 8,
    "stopbits": 1,
    "rtscts": false
};

  return (
    <div className="App">
      <header className="App-header">
      <h1>Web spectrum analyzer</h1>
      <button disabled={portState !== undefined} onClick={ async () => {
          port = await navigator.serial.requestPort({ filters });
          const productId = port.getInfo().usbProductId;
          console.log(productId)
          await port.open({...defaultOptions, baudRate: portBaudRate[productId] });

          setPort(port);
          console.log("connected")

          readLoop(port);

          if (port.writable == null) {
            console.warn(`unable to find writable port`);
            return;
          }
          const writer = port.writable.getWriter();
          writer.write(textEncoder.encode('scanraw 1000000 1000000000\r'));
          writer.releaseLock();

      }}>
        Connect
      </button>

      <button disabled={portState === undefined} onClick={async ()=>{
        const localPort = port;
        port = undefined;
        setPort(undefined)
        if (reader) {
          await reader.cancel();
          reader = undefined;
        }
        
        if (localPort) {
          try {
            await localPort.close();
          } catch (e) {
            console.error(e);
          }
        }
        console.log("diconnected")

      }}>Disconnect</button>

        <div id="connected">
          <p>Device name: {port?.productName}</p>
          <p>Device manufacturer: {port?.manufacturerName}</p>
        </div>
      </header>
    </div>
  );
}

export default App;
