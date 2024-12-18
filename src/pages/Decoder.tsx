import React, { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { LineChart } from '@mui/x-charts/LineChart';

import { FormControl } from '@mui/base/FormControl';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import Stack from '@mui/system/Stack';

import Label from '../components/Label.tsx';
import NumberInput from '../components/NumberInput.tsx';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

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

const width = 1024;

const sweeptimeCommand = 'sweeptime';
const sweeptimeUsage = `${sweeptimeCommand} 0.003..60`;
const getDataCommand = 'data 0';
const prompt = 'ch> ';
const newlineResp = '\r\n';
const respNumberPart = textEncoder.encode('e+0')
const respDone = textEncoder.encode(prompt)

const concatUint8Arrays = (a, b) => { // a, b TypedArray of same type
  var c = new Uint8Array(a.length + b.length);
  c.set(a, 0);
  c.set(b, a.length);
  return c;
};

const formatFrequency = (freq) => {
  let freqStr;
  if (freq > 1000000000) {
    freqStr = `${(freq / 1000000000).toFixed(2)} GHz`;
  } else if (freq > 1000000) {
    freqStr = `${(freq / 1000000).toFixed(2)} MHz`;
  } else if (freq > 1000) {
    freqStr = `${(freq / 1000).toFixed(2)} kHz`;
  } else {
    freqStr = `${Math.trunc(freq)} Hz`;
  }
  return freqStr;
};


// Our precondition for the measurments is that transmision is quantized into slices of 1ms.
// Usually, 1 is of length 240 us and 0 of 640 us, which leaves max gap of size 760 us.
// Below approximations are set to allow for correct detection of signals while sweeping over long  
const oneOOKwidth = 0.3; // [ms] equal or smaller is one, wider is zero
const maxGap = 1; // [ms] max gap equal to typical OOK signal length

const detectPulses = (responses, stepMSecond, triggerLevel) => {
  const pulsePackages = []; // contains auto detected groups of bits;

  // 0 - idle
  // 1 - pulse
  // 2 - gap
  let currentState = 0;

  let dataCounter;
  let packageData;
  let gapCounter;

  for(let i=0; i< responses.length; i++) {
    if (currentState === 0) {
      if (responses[i] < triggerLevel) {
        // it's idle state and idle state detected, continue
        continue
      } else {
        // new data package detected, new pulse must be initiated and package must be established
        currentState = 1;
        dataCounter = 1;
        packageData = [];
      }
    } else if (currentState === 1) {
      if (responses[i] < triggerLevel) {
        // no data received, it's a gap, can transform the peak into a bit
        currentState = 2;
        gapCounter = 1;
        if (dataCounter * stepMSecond <= oneOOKwidth) {
          // 1 bit detected, need to add to a package
          packageData.push("1");
        } else {
          // 0 detected, need to add to a package
          packageData.push("0");
        }
      } else {
        // we are still detecting a pulse, need to count the puse
        dataCounter++;
      }
    } else if (currentState === 2) {
      // gap detected, can continue gap, end transmission or detect new signal
      if (responses[i] < triggerLevel) {
        // no data received
        if (gapCounter * stepMSecond > maxGap) {
          // max gap exceeded with no new signal, end of transmission
          currentState = 0;
          pulsePackages.push(packageData);
        } else {
          // still in gap period
          gapCounter++;
        }
      } else {
        // we detected a new pulse
        currentState = 1;
        dataCounter = 0;
      }
    } else {
      console.warn("Unknown state, decoding logic is broken")
      break
    }
  }

  console.log("Found unfinished package in state: ", currentState, ", data: ", packageData)

  return pulsePackages;
};

const decodePulseGroups = (pulsePackages) => {
  const responses = [];
  // remove leading zero from package
  for (let i=0; i< pulsePackages.length; i++) {
    // simple pre-abmle for GateTX type of a message (in Flipper nomenclature)
    pulsePackages[i].shift();

    const decimalOutput = parseInt(pulsePackages[i].join(""), 2);
    const hexOutput = decimalOutput.toString(16).toUpperCase();
    responses.push(hexOutput);
  }
  return responses;
};

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

// eslint-disable-next-line no-extend-native
Uint8Array.prototype.endsWith = function(suffix) {
  if(this.length<suffix.length) {
    return false;
  }
  for(var i = this.length - suffix.length, j = 0; i < this.length; i++, j++) {
      if(this[i] !== suffix[j]) {
          return false;
      }
  }
  return true;
};

let latestDecodedItems = [];

function Decoder() {
  const [portState, setPort] = useState(undefined);
  const [frequency, setFrequency] = useState(433900);
  const [frequencyMag, setFrequencyMag] = useState(1000);
  const [sweeptimeValue, setSweeptimeValue] = useState(100);
  const [sweeptimeUnit, setSweeptimeUnit] = useState("m");
  const [triggerLevel, setTriggerLevel] = useState(-70);

  const [powerLevels, setPowerLevels] = useState([]);
  const [xPoints, setXPoints] = useState([]);

  const [decodedItems, setDecodedItems] = useState([]);

  useEffect(() => {
    latestDecodedItems = decodedItems;
  }, [decodedItems]);


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
            responseBuffer = concatUint8Arrays(responseBuffer, value);
            if (responseBuffer.indexOfMulti(respNumberPart) !== -1) {
              if (responseBuffer.endsWith(respDone)) {
                if(responseBuffer.indexOfMulti(textEncoder.encode(sweeptimeUsage)) === -1) {
                  const writer = port.writable.getWriter();
                  const command = `sweeptime\r`; // used to retrieve sweep time
                  console.log(command);
                  writer.write(textEncoder.encode(command));
                  writer.releaseLock();
                } else {
                  const fullResponse = new TextDecoder().decode(responseBuffer);
                  console.log(fullResponse);

                  const startIdx = fullResponse.indexOf(getDataCommand) + getDataCommand.length + newlineResp.length;
                  const endIdx = fullResponse.indexOf(prompt+sweeptimeCommand, startIdx) - newlineResp.length;
                  const responses = fullResponse.slice(startIdx, endIdx).split(newlineResp).map(numStr => parseFloat(numStr));

                  const sweeptimeStartIdx = fullResponse.indexOf(sweeptimeUsage) + sweeptimeUsage.length + newlineResp.length;
                  const sweeptimeEndIdx = fullResponse.indexOf('ms', sweeptimeStartIdx);

                  const sweeptime = parseFloat(fullResponse.slice(sweeptimeStartIdx, sweeptimeEndIdx));
                  const stepMSecond = sweeptime / responses.length;
                  const respXPoints = responses.map((_, idx) => idx*stepMSecond);

                  setPowerLevels(responses);
                  setXPoints(respXPoints);

                  let pulsePackages = detectPulses(responses, stepMSecond, triggerLevel);
                  let decodedMessages = decodePulseGroups(pulsePackages);

                  console.log(decodedMessages)

                  setDecodedItems([{
                    data: decodedMessages,
                    time: new Date().toISOString(),
                    frequency: formatFrequency(frequency*frequencyMag),
                    sweeptime: sweeptime + (sweeptimeUnit === "" ? " s" : " ms"),
                    triggerLevel: triggerLevel + " dBm"
                  }, ...latestDecodedItems]);

                  // decoding logic completed, can arm trigger for more data
                  // await armTrigger();
                }
              }
            }
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

  const armTrigger = async () => {
    const writer = port.writable.getWriter();

    // there's too many commands sent, so not using "abort on" command

    let command = `spur off\r`;
    console.log(command);
    writer.write(textEncoder.encode(command));
    await sleep(130);

    command = `sweep cw ${frequency*frequencyMag}\r`;
    console.log(command);
    writer.write(textEncoder.encode(command));
    await sleep(130);

    command = `${sweeptimeCommand} ${sweeptimeValue}${sweeptimeUnit}\r`; // TODO: needs to be configurable
    console.log(command);
    writer.write(textEncoder.encode(command));
    await sleep(130);

    command = `trigger ${triggerLevel}\r`; // TODO: needs to be configurable
    console.log(command);
    writer.write(textEncoder.encode(command));
    await sleep(150);

    command = `wait\r`;
    console.log(command);
    writer.write(textEncoder.encode(command));

    command = `${getDataCommand}\r`;
    console.log(command);
    writer.write(textEncoder.encode(command));

    writer.releaseLock();
  }

  const setTriggerAndDecode = async () => {
    readData(); // response buffer in tinySA can hold only one response, so it must be read continously, must be invoked asynchrously, cannot await.
    await armTrigger();
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
    <FormControl defaultValue="" >
      <Label>Sweep time</Label>

      <Stack direction="row" >
        <NumberInput
          min={1}
          max={5000}
          disabled={portState !== undefined}
          aria-label="Sweep time"
          placeholder="Type a number…"
          value={sweeptimeValue}
          onChange={(_, val) => setSweeptimeValue(val)}
        />
        <Select
          disabled={portState !== undefined}
          value={sweeptimeUnit}
          onChange={(event) => setSweeptimeUnit(event.target.value)}
          sx={{ marginRight: '15px' }}
        >
          <MenuItem value={""}>sec</MenuItem>
          <MenuItem value={"m"}>ms</MenuItem>
        </Select>
      </Stack>
    </FormControl>
    <FormControl defaultValue="" >
      <Label>Trigger level [dBm]</Label>
      <NumberInput
        min={-100}
        max={0}
        disabled={portState !== undefined}
        aria-label="Trigger level [dBm]"
        placeholder="Type a number…"
        value={triggerLevel}
        onChange={(_, val) => setTriggerLevel(val)}
      />
    </FormControl>
  </Box>
  <Box
    justifyContent='center'
  >
    <LineChart
      width={width+80}
      height={300}
      slotProps={{ legend: { hidden: true } }}
      series={[{ data: powerLevels, label: 'dB',  showMark: false, color: '#cc0052' }]}
      xAxis={[{ data: xPoints}]}
      sx={{ }}
    />
    <TableContainer component={Paper}>
    <Table sx={{ minWidth: 650 }} aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell>Data</TableCell>
          <TableCell align="right">Time</TableCell>
          <TableCell align="right">Frequency</TableCell>
          <TableCell align="right">Sweep time</TableCell>
          <TableCell align="right">Trigger level</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {decodedItems.map((row) => (
          <TableRow
            key={row.time}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              {row.data}
            </TableCell>
            <TableCell align="right">{row.time}</TableCell>
            <TableCell align="right">{row.frequency}</TableCell>
            <TableCell align="right">{row.sweeptime}</TableCell>
            <TableCell align="right">{row.triggerLevel}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  </Box>
</Container>
);
}

export default Decoder;
