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

function RtlDecoder() {
  const [radio, setRadio] = useState<Radio>();
  const [frequency, setFrequency] = useState<number>(1090);
  const [frequencyMag, setFrequencyMag] = useState<number>(1000000);

return (
  <Container maxWidth="lg">
    <Box display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="10vh"
      sx={{ marginTop: '30px' }}>

      <Stack spacing={2} sx={{ marginRight: '30px' }}>
        <ButtonGroup variant="contained" aria-label="Basic button group">
        <Button  onClick={ async () => {
            if (radio === undefined) {
              const rtlProvider = new RTL2832U_Provider();
              const rtlRadio = new Radio(rtlProvider, new LoggingReceiver())
              rtlRadio.setFrequency(frequency*frequencyMag);
              rtlRadio.start();
              setRadio(rtlRadio);
            } else {
              radio.setFrequency(frequency*frequencyMag);
              radio.start();
            }
      }}>Trigger&Decode</Button>
      <Button onClick={async ()=>{
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
      </TableBody>
    </Table>
  </TableContainer>
  </Box>
</Container>
);
}

export default RtlDecoder;
