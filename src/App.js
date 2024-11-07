import './App.css';

import React, { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import clsx from 'clsx';
import Chip from '@mui/material/Chip';


import {
  Unstable_NumberInput as BaseNumberInput,
  numberInputClasses,
} from '@mui/base/Unstable_NumberInput';
import { FormControl, useFormControlContext } from '@mui/base/FormControl';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';


import Stack from '@mui/system/Stack';
import { styled } from '@mui/system';

const NumberInput = React.forwardRef(function CustomNumberInput(
  props,
  ref,
) {
  return (
    <BaseNumberInput
    slots={{
      root: StyledInputRoot,
      input: StyledInputElement,
      incrementButton: StyledInputButton,
      decrementButton: StyledInputButton,
    }}
      slotProps={{
        incrementButton: {
          children: '▴',
        },
        decrementButton: {
          children: '▾',
        },
      }}
      {...props}
      ref={ref}
    />
  );
});

const StyledInputRoot = styled('div')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  border-radius: 8px;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  display: grid;
  grid-template-columns: 1fr 19px;
  grid-template-rows: 1fr 1fr;
  overflow: hidden;
  column-gap: 8px;
  padding: 4px;
  margin-right: 15px;

  &.${numberInputClasses.focused} {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
  }

  &:hover {
    border-color: ${blue[400]};
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`,
);

const StyledInputElement = styled('input')(
  ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.5;
  grid-column: 1/2;
  grid-row: 1/3;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: inherit;
  border: none;
  border-radius: inherit;
  padding: 8px 12px;
  outline: 0;
`,
);

const StyledInputButton = styled('button')(
  ({ theme }) => `
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  appearance: none;
  padding: 0;
  width: 19px;
  height: 19px;
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
  line-height: 1;
  box-sizing: border-box;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 0;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    cursor: pointer;
  }

  &.${numberInputClasses.incrementButton} {
    grid-column: 2/3;
    grid-row: 1/2;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border: 1px solid;
    border-bottom: 0;
    &:hover {
      cursor: pointer;
      background: ${blue[400]};
      color: ${grey[50]};
    }

  border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  }

  &.${numberInputClasses.decrementButton} {
    grid-column: 2/3;
    grid-row: 2/3;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border: 1px solid;
    &:hover {
      cursor: pointer;
      background: ${blue[400]};
      color: ${grey[50]};
    }

  border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  }
  & .arrow {
    transform: translateY(-1px);
  }
`,
);

const Label = styled(({ children, className }) => {
  const formControlContext = useFormControlContext();
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (formControlContext?.filled) {
      setDirty(true);
    }
  }, [formControlContext]);

  if (formControlContext === undefined) {
    return <p>{children}</p>;
  }

  const { error, required, filled } = formControlContext;
  const showRequiredError = dirty && required && !filled;

  return (
    <p className={clsx(className, error || showRequiredError ? 'invalid' : '')}>
      {children}
      {required ? ' *' : ''}
    </p>
  );
})`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  margin-bottom: 4px;

  &.invalid {
    color: red;
  }
`;

const blue = {
  100: '#DAECFF',
  200: '#99CCF3',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  700: '#0059B2',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const width = 1024,
height = 500;

const tinySAUltra = { usbVendorId: 0x0483, usbProductId: 0x5740 }

const portBaudRate = {};
portBaudRate[tinySAUltra.usbProductId] = 115200;

const textEncoder = new TextEncoder();

const xAscii = 120;
const respOpening = 123;
const respClosing = new TextEncoder().encode("}ch>");

let port, reader;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

const heatmap = ["05000b", "05000b", "0a000a", "0a000a", "0e000f", "0e000f", "130014", "130014", "190018", "190018", "1e001e", "1e001e", "230022", "230022", "290029", "290029", "2e002e", "2e002e", "320033", "320033", "370037", "370037", "3d003d", "3d003d", "450046", "450046", "4e014e", "4e014e", "560157", "560157", "5f005e", "5f005e", "670167", "670167", "6f0070", "6f0070", "780179", "780179", "81017b", "81017b", "870278", "870278", "8d0272", "8d0272", "94036c", "94036c", "9a0467", "9a0467", "a00560", "a00560", "a8065a", "a8065a", "ad0753", "ad0753", "b4084d", "b4084d", "bb0a47", "bb0a47", "c10a40", "c10a40", "c60b38", "c60b38", "cc0c33", "cc0c33", "d30e2c", "d30e2c", "d90d26", "d90d26", "df0f1f", "df0f1f", "e61019", "e61019", "ec1213", "ec1213", "f3120d", "f3120d", "f91306", "f91306", "fc1601", "fc1601", "fe2000", "fe2000", "ff2a01", "ff2a01", "ff3501", "ff3501", "ff3f00", "ff3f00", "ff4b01", "ff4b01", "ff5500", "ff5500", "ff5f01", "ff5f01", "ff6901", "ff6901", "ff7300", "ff7300", "ff7f00", "ff7f00", "ff8901", "ff8901", "ff9400", "ff9400", "ff9f01", "ff9f01", "ffa900", "ffa900", "ffb401", "ffb401", "ffbd02", "ffbd02", "ffc303", "ffc303", "ffc704", "ffc704", "ffcb06", "ffcb06", "ffd009", "ffd009", "ffd30a", "ffd30a", "ffd70d", "ffd70d", "ffdb0d", "ffdb0d", "ffdf10", "ffdf10", "fee310", "fee310", "ffe713", "ffe713", "ffec15", "ffec15", "ffef17", "ffef17", "fff319", "fff319", "fff61b", "fff61b", "fffb1d", "fffb1d", "feff20", "feff20", "f9fb1f", "f9fb1f", "f3f71f", "f3f71f", "eff41f", "eff41f", "eaf01f", "eaf01f", "e5ed20", "e5ed20", "dee920", "dee920", "dae720", "dae720", "d5e320", "d5e320", "cfdf20", "cfdf20", "cbdc21", "cbdc21", "c5d720", "c5d720", "c1d521", "c1d521", "bad020", "bad020", "b5cd21", "b5cd21", "afc920", "afc920", "abc621", "abc621", "a6c220", "a6c220", "a1c021", "a1c021", "9bbc20", "9bbc20", "96b823", "96b823", "93b82a", "93b82a", "91b932", "91b932", "8ebb3c", "8ebb3c", "8bbb43", "8bbb43", "8abc4c", "8abc4c", "88bd54", "88bd54", "85bd5c", "85bd5c", "83be64", "83be64", "80bf6e", "80bf6e", "7dbf75", "7dbf75", "7bc07e", "7bc07e", "7ac187", "7ac187", "78c290", "78c290", "75c298", "75c298", "72c4a1", "72c4a1", "70c5aa", "70c5aa", "6ec4b2", "6ec4b2", "6cc5ba", "6cc5ba", "6ac7c3", "6ac7c3", "6ac6c6", "6ac6c6", "72cbcd", "72cbcd", "7aced1", "7aced1", "83d1d5", "83d1d5", "8ed5d7", "8ed5d7", "97d8da", "97d8da", "a0dcdd", "a0dcdd", "a9dfe1", "a9dfe1", "b3e3e5", "b3e3e5", "bee7e9", "bee7e9", "c6e9eb", "c6e9eb", "d0eef0", "d0eef0", "d9f1f3", "d9f1f3", "e3f5f7", "e3f5f7", "edf9fa", "edf9fa", "f6fcfd", "f6fcfd", "fdffff", "fdffff"],
moveBy = 1;


function App() {
  const [portState, setPort] = useState(undefined);
  const [startFrequency, setStartFrequency] = useState(88);
  const [startFrequencyMag, setStartFrequencyMag] = useState(1000000);
  const [stopFrequency, setStopFrequency] =   useState(108);
  const [stopFrequencyMag, setStopFrequencyMag] =   useState(1000000);
  const [points, setPoints] = useState(500);

  const [currLvl, setCurrLvl] = useState("N/A");

  useEffect(()=>{
    const canvas = document.getElementById("canvas");
    var rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, [])

  const filters = [tinySAUltra];

  const drawLines = (powers) => {
    // min 90, mx 10, add case for values higher 
    let powerLevels = []
    for(let i=0; i<powers.length; i++) {
      if(powers[i] <= -100) {
        powerLevels.push(0);
      } else if(powers[i] >= 10) {
        powerLevels.push(heatmap.length-1);
      } else {
        const range = 100 + 10
        const bucketSize = (range * 1.0) / heatmap.length
        const powerVal = powers[i] + 100;
        powerLevels.push(Math.floor(powerVal / bucketSize));
      }
    }
    const canvas = document.getElementById("canvas"),
    canvasContext = canvas.getContext("2d");
    canvasContext.drawImage(canvasContext.canvas, 0, 0, width, height - moveBy, 0, moveBy, width, height - moveBy);
    for(var i = 0; i < powerLevels.length; i++) {
      var mag = powerLevels[i];
      canvasContext.fillStyle = '#'+heatmap[mag];
      const pointVals = Math.floor(width/points);
      for(let j=0;j<pointVals; j++) {
        canvasContext.fillRect(i*pointVals+j, 0, 1, moveBy);
      }
    }
  };

  const processResponse = (response) => {
    const powers = []
    for(let i=0; i<points; i++) {
      const x_char = response[3 * i]  // This should be 'x'
      if(x_char !== xAscii) {
        console.warn("malformed response, skipping");
        return;
      }

      const lsb = response[3 * i + 1]
      const msb = response[3 * i + 2]
      const value = (lsb + msb*256)
      const dbm = (value / 32.0) - 174 // convert the value to dBm (TinySA Ultra adjustment), see https://groups.io/g/tinysa/topic/97630860
      // for tinySA:  level_dBm  = ((byte3 + (byte4 * 256)) / 32) - 128

      powers.push(dbm)
    }

    drawLines(powers);
  }

  let responseBuffer = new Int8Array([]);

  const readLoop = async () => {
    // let reader;
    while (port && port.readable) {
      try {
        reader = port.readable.getReader();
        for (;;) {
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
        console.error(e);
      } finally {
        if (reader) {
          reader.releaseLock();
          reader = undefined;
        }
      }
    }
  };

  const writeLoop = async () => {
    while (port && port.writable) {
      const writer = port.writable.getWriter();
  
      // TODO: check how it can be streamlined with param 3, as in https://github.com/mykhailopylyp/TinySAScanner/blob/main/scan.py#L35
      const command = `scanraw ${startFrequency*startFrequencyMag} ${stopFrequency*stopFrequencyMag} ${points}\r`;
      console.log(command)
      writer.write(textEncoder.encode(command));
      writer.releaseLock();
      await sleep(Math.max(1.6*points, 150));
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

const handleMouseMove = (event) => {
  const offsetX = event.nativeEvent.touches ? event.nativeEvent.touches[0].pageX : event.nativeEvent.offsetX
  const freq = startFrequency*startFrequencyMag + ((stopFrequency*stopFrequencyMag - startFrequency*startFrequencyMag)*(offsetX/width))

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

  setCurrLvl(freqStr)
};

return (
  <Container maxWidth="lg">
    <Box display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="10vh">
      <ButtonGroup variant="contained" aria-label="Basic button group" sx={{ marginRight: '30px' }}>
        <Button disabled={portState !== undefined} onClick={ async () => {
        port = await navigator.serial.requestPort({ filters });
        const productId = port.getInfo().usbProductId;
        await port.open({...defaultOptions, baudRate: portBaudRate[productId] });
        setPort(port);
        console.log("connected")
        console.log(port)

        const canvas = document.getElementById("canvas"),
        canvasContext = canvas.getContext("2d");
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        readLoop(port);
        writeLoop(port);
      }}>Connect</Button>
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

    <FormControl defaultValue="" >
      <Label>Points</Label>
      <NumberInput
        min={51}
        max={500}
        disabled={portState !== undefined}
        aria-label="Points"
        placeholder="Type a number…"
        value={points}
        onChange={(event, val) => setPoints(val)}
      />
    </FormControl>
    <FormControl defaultValue="" sx={{ marginRight: '15px' }}>
      <Label>Start frequency [Hz]</Label>
      <Stack direction="row" >
        <NumberInput
          disabled={portState !== undefined}
          aria-label="Start frequency"
          placeholder="Type a number…"
          value={startFrequency}
          onChange={(event, val) => setStartFrequency(val)}
        />
        <Select
          disabled={portState !== undefined}
          value={startFrequencyMag}
          onChange={(event) => setStartFrequencyMag(event.target.value)}
        >
          <MenuItem value={1}>Hz</MenuItem>
          <MenuItem value={1000}>kHz</MenuItem>
          <MenuItem value={1000000}>MHz</MenuItem>
          <MenuItem value={1000000000}>GHz</MenuItem>
        </Select>
      </Stack>
    </FormControl>
    
    <FormControl defaultValue="">
      <Label>Stop frequency [Hz]</Label>
      <Stack direction="row">
        <NumberInput
          disabled={portState !== undefined}
          aria-label="Stop frequency"
          placeholder="Type a number…"
          value={stopFrequency}
          onChange={(event, val) => setStopFrequency(val)}
        />
        <Select
          disabled={portState !== undefined}
          value={stopFrequencyMag}
          onChange={(event) => setStopFrequencyMag(event.target.value)}
        >
          <MenuItem value={1}>Hz</MenuItem>
          <MenuItem value={1000}>kHz</MenuItem>
          <MenuItem value={1000000}>MHz</MenuItem>
          <MenuItem value={1000000000}>GHz</MenuItem>
        </Select>
      </Stack>
    </FormControl>
    
  </Box>
  <Stack direction="row" spacing={1}>
      <Chip label={`Current Frequency: ${currLvl}`} variant="outlined" />
    </Stack>
  <Box
    display='flex'
    justifyContent='center'
  >
    <canvas
      id="canvas" 
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      ></canvas>
  </Box>
</Container>
);
}

export default App;
