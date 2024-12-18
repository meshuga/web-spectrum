import React, { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

import Stack from '@mui/system/Stack';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { RtlDevice, RtlDeviceProvider } from "../device/rtlsdr/rtldevice.ts";
import { RTL2832U_Provider } from "../device/rtlsdr/rtl2832u.ts";
import { Radio } from '../device/radio.ts';
import { LoggingReceiver } from '../device/sample_receiver.ts';

function RtlDecoder() {
  const [radio, setRadio] = useState<Radio>();
  const [device, setDevice] = useState<RtlDevice>();

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

            const rtlProvider = new RTL2832U_Provider();
            const rtlRadio = new Radio(rtlProvider, new LoggingReceiver())
            rtlRadio.start();

            setRadio(rtlRadio);
      }}>Trigger&Decode</Button>
      <Button onClick={async ()=>{
        if(device){
          console.log("yeahhhhh")
        }
        await device?.close();
      }}>Disconnect</Button>
        </ButtonGroup>
      </Stack>
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
