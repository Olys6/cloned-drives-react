import { useEffect, useState } from 'react'
import './App.css'
import carData from './data/data.js'
import { 
  Card, TextField, Select, 
  MenuItem, Box, Pagination, 
  Stack, Accordion, AccordionSummary, 
  Typography, AccordionDetails, Slider 
} from '@mui/material'



import Logo from './logoblack.webp'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { themeOptions } from './Theme';

import CarFilter from './components/CarFilter.jsx';
import Cards from './components/Cards';

const theme = createTheme(themeOptions);



function App() {
  
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("all")
  const [page, setPage] = useState(1)
  const [rqValue, setRqValue] = useState([80, 110]);
  // { Array.isArray(car.make) ? car.make[0] : car.make }
  const numOfCars = 20
  // const smallCarData = carData.map((car, i) => (i < 20 ? car : <></>))

  const handlePageChange = (event, value) => {
    setPage(value);
  };


  const filteredCars = () => {
    const regexSearch = new RegExp(search, 'ig')
    return carData.filter(car => {
      // console.log(regexSearch.exec(Array.isArray(car.make) ? car.make[0] : car.make))
      return regexSearch.exec(Array.isArray(car.make) ? car.make[0] : car.make) &&
        car.rq <= rqValue[1] && car.rq >= rqValue[0]
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <Box style={{ width: "100%", backgroundColor: "white", marginBottom: "5rem", borderRadius: "10px" }}>
        <img src={Logo} style={{ width: "90%", backgroundColor: "white", border: "5px solid white" }} />
      </Box>

      <CarFilter setSearch={setSearch} search={search} setRqValue={setRqValue} rqValue={rqValue} setPage={setPage} />

      <Cards filteredCars={filteredCars} page={page} numOfCars={numOfCars} />

      <Stack>
        <Pagination 
          sx={{ width: "100%", display: "flex", justifyContent: "center", alignItem: "center" }} 
          size="large" count={Math.ceil(filteredCars().length / numOfCars)} 
          onChange={handlePageChange} 
          page={page} 
          variant="outlined" 
          shape="rounded" />
      </Stack>

    </ThemeProvider>
  )
}

export default App
