import './App.css';

import React, { useState } from 'react';

const tinySAUltra = { usbVendorId: 0x0483, usbProductId: 0x5740 }

const portBaudRate = {};
portBaudRate[tinySAUltra.usbProductId] = 115200;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const bufferSize = 8 * 1024; // 8kB

let port, reader;

function App() {
  const [portState, setPort] = useState(undefined);

  const filters = [tinySAUltra];

  const processResponse = (response) => {
    console.log(response)
  }

  const readLoop = async () => {
    // let reader;
    while (port && port.readable) {
      console.log(port)
      try {
        try {
          reader = port.readable.getReader({mode: 'byob'});
        } catch {
          reader = port.readable.getReader();
        }
  
        let buffer = null;
        for (;;) {
          console.log("inner")
          const {value, done} = await (async () => {
            if (reader instanceof ReadableStreamBYOBReader) {
              if (!buffer) {
                buffer = new ArrayBuffer(bufferSize);
              }
              const {value, done} =
                  await reader.read(new Uint8Array(buffer, 0, bufferSize));
              buffer = value?.buffer;
              return {value, done};
            } else {
              return await reader.read();
            }
          })();
  
          if (value) {
            console.log(textDecoder.decode(value));
          }
          if (done) {
            break;
          }
        }
      } catch (e) {
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
    "bufferSize": 8192,
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
