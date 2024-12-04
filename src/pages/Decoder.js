import React, { useState } from 'react';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';


import { FormControl } from '@mui/base/FormControl';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import Stack from '@mui/system/Stack';

import Label from '../components/Label';
import NumberInput from '../components/NumberInput';

function downloadFile(fileName, urlData) {
  var aLink = document.createElement('a');
  aLink.download = fileName;
  aLink.href = urlData;

  var event = new MouseEvent('click');
  aLink.dispatchEvent(event);
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const tinySAUltra = { usbVendorId: 0x0483, usbProductId: 0x5740 }

const portBaudRate = {};
portBaudRate[tinySAUltra.usbProductId] = 115200;

const textEncoder = new TextEncoder();

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

function Decoder() {
  const [portState, setPort] = useState(undefined);
  const [frequency, setFrequency] = useState(433900);
  const [frequencyMag, setFrequencyMag] = useState(1000);

  const filters = [tinySAUltra];

  const download = () => {
    let lines = ''
    downloadFile(`spectrum-${new Date().toISOString()}.csv`, 'data:text/csv;charset=UTF-8,' + encodeURIComponent(lines));
  };

  const readData = async () => {
    let responseBuffer = [];
    while (port && port.readable) {
      try {
        reader = port.readable.getReader();
        for (;;) {
          // we don't pass own buffer as we need to keep buffers to find response
          const {value, done} = await reader.read();
  
          if (value) {
            responseBuffer = new Uint8Array([ ...responseBuffer, ...value ]);
            console.log(new TextDecoder().decode(responseBuffer))
            // TODO return function once read data
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

  const setTriggerAndDecode = async () => {
    const writer = port.writable.getWriter();

    // see https://tinysa.org/wiki/pmwiki.php?n=Main.USBInterface
    let command = `abort on\r`;
    console.log(command)
    writer.write(textEncoder.encode(command));
    await sleep(150);

    command = `sweep cw ${frequency*frequencyMag}\r`;
    console.log(command)
    writer.write(textEncoder.encode(command));
    await sleep(150);

    command = `sweeptime 50m\r`; // TODO: needs to be configurable
    console.log(command)
    writer.write(textEncoder.encode(command));
    await sleep(150);

    command = `trigger -70\r`; // TODO: needs to be configurable
    console.log(command)
    writer.write(textEncoder.encode(command));
    await sleep(150);

    command = `wait\r`;
    console.log(command)
    writer.write(textEncoder.encode(command));

    command = `data 1\r`;
    console.log(command)
    writer.write(textEncoder.encode(command));

    writer.releaseLock();

    readData();
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
  <Container maxWidth="lg">
    <Box display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="10vh"
      sx={{ marginTop: '30px' }}>

      <Stack spacing={2} sx={{ marginRight: '30px' }}>
        <ButtonGroup variant="contained" aria-label="Basic button group">
        <Button disabled={portState !== undefined} onClick={ async () => {
        port = await navigator.serial.requestPort({ filters });
        const productId = port.getInfo().usbProductId;
        await port.open({...defaultOptions, baudRate: portBaudRate[productId] });
        setPort(port);
        console.log("connected")
        console.log(port)

        setTriggerAndDecode(port);
      }}>Trigger&Decode</Button>
      <Button disabled={portState === undefined} onClick={async ()=>{
      const writer = port.writable.getWriter();
        
      const command = `abort\r`;
      console.log(command)
      writer.write(textEncoder.encode(command));
      writer.releaseLock();

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
      }}>Disconnect</Button>
        </ButtonGroup>
        <Button onClick={download}>Download decoded data</Button>
      </Stack>
    <FormControl defaultValue="">
      <Label>Tested frequency [Hz]</Label>
      <Stack direction="row" >
        <NumberInput
          disabled={portState !== undefined}
          aria-label="Tested frequency"
          placeholder="Type a number…"
          value={frequency}
          onChange={(_, val) => setFrequency(val)}
        />
        <Select
          disabled={portState !== undefined}
          value={frequencyMag}
          onChange={(event) => setFrequencyMag(event.target.value)}
          sx={{ marginRight: '15px' }}
        >
          <MenuItem value={1}>Hz</MenuItem>
          <MenuItem value={1000}>kHz</MenuItem>
          <MenuItem value={1000000}>MHz</MenuItem>
          <MenuItem value={1000000000}>GHz</MenuItem>
        </Select>
      </Stack>
    </FormControl>    
  </Box>
  <Box
    display='flex'
    justifyContent='center'
  >
    Work in progress
  </Box>
</Container>
);
}

export default Decoder;
