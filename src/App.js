import './App.css';

import React, { useState } from 'react';

const tinySAUltra = { usbVendorId: 0x0483, usbProductId: 0x5740 }

const portBaudRate = {};
portBaudRate[tinySAUltra.usbProductId] = 115200;

const textEncoder = new TextEncoder();

const respOpening = 123;
const respClosing = new TextEncoder().encode("}ch>");

let port, reader;

// eslint-disable-next-line no-extend-native
Uint8Array.prototype.indexOfMulti = function(searchElements, fromIndex) {
  fromIndex = fromIndex || 0;

  var index = Array.prototype.indexOf.call(this, searchElements[0], fromIndex);
  if(searchElements.length === 1 || index === -1) {
      // Not found or no other elements to check
      return index;
  }

  for(var i = index, j = 0; j < searchElements.length && i < this.length; i++, j++) {
      if(this[i] !== searchElements[j]) {
          return this.indexOfMulti(searchElements, index + 1);
      }
  }

  return(i === index + searchElements.length) ? index : -1;
};

function App() {
  const [portState, setPort] = useState(undefined);
  const [startFrequency, setStartFrequency] = useState(0);
  const [stopFrequency, setStopFrequency] = useState(100000000);
  const [points, setPoints] = useState(100);

  const filters = [tinySAUltra];

  const processResponse = (response) => {
    console.log("RESPONSE");
    console.log(new TextDecoder().decode(response));
  }

  let responseBuffer = new Int8Array([]);

  const readLoop = async () => {
    // let reader;
    while (port && port.readable) {
      console.log("readable");
      try {
        reader = port.readable.getReader();
        for (;;) {
          // console.log("innner");

          // we don't pass own buffer as we need to keep buffers to find response
          const {value, done} = await reader.read();
  
          if (value) {
            responseBuffer = new Uint8Array([ ...responseBuffer, ...value ]);

            // checking if closing of a response is detected
            const closingBracketIdx = responseBuffer.indexOfMulti(respClosing);
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
          await port.open({...defaultOptions, baudRate: portBaudRate[productId] });
          setPort(port);
          console.log("connected")

          readLoop(port);

          if (port.writable == null) {
            console.warn(`unable to find writable port`);
            return;
          }
          const writer = port.writable.getWriter();

          // TODO: check how it can be streamlined with param 3, as in https://github.com/mykhailopylyp/TinySAScanner/blob/main/scan.py#L35
          writer.write(textEncoder.encode(`scanraw ${startFrequency} ${stopFrequency} ${points}\r`));
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
        <p>Device name: {port?.getInfo()?.productName}</p>
        <p>Device manufacturer: {port?.getInfo()?.manufacturerName}</p>
      </div>
      </header>
    </div>
  );
}

export default App;
