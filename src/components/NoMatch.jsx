import React from 'react';
import { Box, Paper, Typography, Link } from '@mui/material'

const NoMatch = () => {


  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper sx={{ padding: 10, display: "flex", flexDirection: "column", gap: "2rem", backgroundColor: "#fcbc4e" }}>
        <Typography variant="h1">404 Page not found</Typography>
        <Typography variant="h4">Click <Link href="/">here</Link> to go back to homepage.</Typography>
      </Paper>
    </Box>
  )
}

export default NoMatch;