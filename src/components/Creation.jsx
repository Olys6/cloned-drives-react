import React, { useState, useEffect } from 'react';
import { Box, Paper, TextField, Button, Typography, Link } from '@mui/material'

const Creation = () => {
  const [copyText, setCopyText] = useState(<></>)
  const [topSpeed, setTopSpeed] = useState("")
  const [acceleration, setAcceleration] = useState("")
  const [handling, sethandling] = useState("")

  let topSpeed333;
  let accel333;
  let handling333;

  let topSpeed666;
  let accel666;
  let handling666;

  let topSpeed699;
  let accel699;
  let handling699;

  let topSpeed969;
  let accel969;
  let handling969;

  let topSpeed996;
  let accel996;
  let handling996;

  const calculateTune = () => {

    // Calculate 333 values
    if (topSpeed < 60) {
      topSpeed333 = Math.round(Number(topSpeed) + (26 * (1 / 3)))
    } else {
      topSpeed333 = Math.round(Number(topSpeed) + (520 / topSpeed))
    }
    accel333 = Number((acceleration * 0.95).toFixed(1))
    handling333 = Math.round(handling * 1.033)

    // Calculate 666 values
    if (topSpeed < 60) {
      topSpeed666 = Math.round(Number(topSpeed) + (26 * (2 / 3)))
    } else {
      topSpeed666 = Math.round(Number(topSpeed) + (520 / topSpeed * 2))
    }
    accel666 = Number((acceleration * 0.9).toFixed(1))
    handling666 = Math.round(handling * 1.066)

    // Calculate 699 values
    if (topSpeed < 60) {
      topSpeed699 = Math.round(Number(topSpeed) + (26 * (2 / 3)))
    } else {
      topSpeed699 = Math.round(Number(topSpeed) + (520 / topSpeed * 2))
    }
    accel699 = Number((acceleration * 0.85).toFixed(1))
    handling699 = Math.round(handling * 1.11)

    // Calculate 969 values
    if (topSpeed < 60) {
      topSpeed969 = Math.round(Number(topSpeed) + 26)
    } else {
      topSpeed969 = Math.round(Number(topSpeed) + (520 / topSpeed * 3))
    }
    accel969 = Number((acceleration * 0.9).toFixed(1))
    handling969 = Math.round(handling * 1.11)

    // Calculate 996 values
    if (topSpeed < 60) {
      topSpeed996 = Math.round(Number(topSpeed) + 26)
    } else {
      topSpeed996 = Math.round(Number(topSpeed) + (520 / topSpeed * 3))
    }
    accel996 = Number((acceleration * 0.85).toFixed(1))
    handling996 = Math.round(handling * 1.066)

    setCopyText(
      <Paper sx={{ padding: "2rem 7rem 2rem 2rem", textAlign: 'left' }}>
        <Typography variant="h5">
          "333TopSpeed": {topSpeed333},
          <br />
          "3330to60": {accel333},
          <br />
          "333Handling": {handling333},
          <br /><br />
          "666TopSpeed": {topSpeed666},
          <br />
          "6660to60": {accel666},
          <br />
          "666Handling": {handling666},
          <br /><br />
          "699TopSpeed": {topSpeed699},
          <br />
          "6990to60": {accel699},
          <br />
          "699Handling": {handling699},
          <br /><br />
          "969TopSpeed": {topSpeed969},
          <br />
          "9690to60": {accel969},
          <br />
          "969Handling": {handling969},
          <br /><br />
          "996TopSpeed": {topSpeed996},
          <br />
          "9960to60": {accel996},
          <br />
          "996Handling": {handling996},
        </Typography>
      </Paper>
    )
  }

  // const copy = async () => {
  //   await navigator.clipboard.writeText(`
  //   "333TopSpeed": ${topSpeed333},
  //   "3330to60": ${accel333},
  //   "333Handling": ${handling333},
  //   "666TopSpeed": ${topSpeed666},
  //   "6660to60": ${accel666},
  //   "666Handling": ${handling666},
  //   "699TopSpeed": ${topSpeed699},
  //   "6990to60": ${accel699},
  //   "699Handling": ${handling699},
  //   "969TopSpeed": ${topSpeed969},    
  //   "9690to60": ${accel969},
  //   "969Handling": ${handling969},
  //   "996TopSpeed": ${topSpeed996},
  //   "9960to60": ${accel996},
  //   "996Handling": ${handling996},`
  //   );
  //   alert('COPIED!');
  // }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
      <Paper sx={{ display: 'flex', justifyContent: 'center', gap: 5, padding: 5 }}>
        <TextField value={topSpeed} onChange={(e) => setTopSpeed(e.target.value)} label="Top Speed" variant="outlined" />
        <TextField value={acceleration} onChange={(e) => setAcceleration(e.target.value)} label="Acceleration" variant="outlined" />
        <TextField value={handling} onChange={(e) => sethandling(e.target.value)} label="Handling" variant="outlined" />
      </Paper>

      <Button color="success" variant="contained" onClick={() => calculateTune()}>Calculate</Button>

      {copyText}
    </Box>
  )
}

export default Creation;