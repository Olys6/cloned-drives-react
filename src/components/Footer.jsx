import React from 'react';
import { Paper, Typography } from '@mui/material'

const Footer = () => {


  return(
    <Paper
    sx={{ 
      position: 'absolute',
      bottom: "0",
      left: "0",
      bgcolor: "black", 
      width: "100%", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center",
      height: "7rem" }}>
      <Typography>
        DISCLAIMER
      </Typography>
    </Paper>
  )
}

export default Footer