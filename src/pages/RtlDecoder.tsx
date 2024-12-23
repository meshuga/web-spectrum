/*!
meshuga/web-spectrum
Copyright (C) 2024 Patryk Orwat

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import React, { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { FormControl } from '@mui/base/FormControl';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import Label from '../components/Label.tsx';
import NumberInput from '../components/NumberInput.tsx';
import Stack from '@mui/system/Stack';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { RTL2832U_Provider } from "../device/rtlsdr/rtl2832u.ts";
import { Radio } from '../device/radio.ts';
import { LoggingReceiver } from '../device/sample_receiver.ts';

let latestDecodedItems = [];

function toHex(buffer) {
  return Array.prototype.map.call(buffer, x => ('00' + x.toString(16)).slice(-2)).join('');
}

function RtlDecoder() {
  const [radio, setRadio] = useState<Radio>();
  const [frequency, setFrequency] = useState<number>(1090);
  const [frequencyMag, setFrequencyMag] = useState<number>(1000000);

  const [decodedItems, setDecodedItems] = useState<any>([]);

  useEffect(() => {
    latestDecodedItems = decodedItems;
  }, [decodedItems]);

return (
  <Container maxWidth="lg">
    <Box display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="10vh"
      sx={{ marginTop: '30px' }}>

      <Stack spacing={2} sx={{ marginRight: '30px' }}>
        <ButtonGroup variant="contained" aria-label="Basic button group">
        <Button disabled={radio?.isPlaying()} onClick={ async () => {
          const freqHz = frequency*frequencyMag;
          console.log("frequency to be set", freqHz);
            if (radio === undefined) {
              const rtlProvider = new RTL2832U_Provider();
              const rtlRadio = new Radio(rtlProvider, new LoggingReceiver((msg) => {
                console.log(msg);
                const nonEmptyFields = {};
                Object.keys(msg).forEach(field => {
                  if (msg[field] && field !== 'msg') {
                    nonEmptyFields[field] = msg[field];
                  }
                })
                setDecodedItems([{
                  time: new Date(),
                  msg: msg.msg,
                  decoded: JSON.stringify(nonEmptyFields)
                }, ...latestDecodedItems]);
              }))
              rtlRadio.setFrequency(freqHz);
              rtlRadio.setGain(40);
              rtlRadio.start();
              setRadio(rtlRadio);
            } else {
              radio.setFrequency(freqHz);
              radio.start();
            }
      }}>Listen&Decode</Button>
      <Button disabled={radio === undefined || !radio.isPlaying()} onClick={async ()=>{
        await radio?.stop();
      }}>Disconnect</Button>
        </ButtonGroup>
      </Stack>
      <FormControl defaultValue="">
      <Label>Tested frequency [Hz]</Label>
      <Stack direction="row" >
        <NumberInput
          disabled={radio?.isPlaying()}
          aria-label="Tested frequency"
          placeholder="Type a number…"
          value={frequency}
          onChange={(_, val) => setFrequency(val)}
        />
        <Select
          disabled={radio?.isPlaying()}
          value={frequencyMag}
          onChange={(event: any) => setFrequencyMag(event.target.value)}
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
    justifyContent='center'
  >
    <TableContainer component={Paper}>
    <Table size="small" aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell width='60%'>Decoded</TableCell>
          <TableCell width='20%'>Time</TableCell>
          <TableCell width='20%'>Data</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
      {decodedItems.map((row, index) => (
          <TableRow
            key={index}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell width='60%' sx={{'fontSize': 11, wordBreak: 'break-all'}} component="th" scope="row">
              {row.decoded}
            </TableCell>
            <TableCell width='20%' component="th" scope="row">
              {row.time.toISOString()}
            </TableCell>
            <TableCell width='20%' component="th" scope="row">
              {toHex(row.msg).replace(/0+$/, '')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  </Box>
</Container>
);
}

export default RtlDecoder;
