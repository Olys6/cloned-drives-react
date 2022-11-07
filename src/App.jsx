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
  
  const [search, setSearch] = useState("");
  const [select, setSelect] = useState("all");
  const [page, setPage] = useState(1);
  const [rqValue, setRqValue] = useState([80, 110]);
  const [rqOrder, setRqOrder] = useState(true);
  const [carTag, setCarTag] = useState([]);
  // { Array.isArray(car.make) ? car.make[0] : car.make }
  const numOfCars = 20;
  const carTags = [];
  // const smallCarData = carData.map((car, i) => (i < 20 ? car : <></>))

  const handlePageChange = (event, value) => {
    setPage(value);
  };


  const filteredCars = () => {
    const regexSearch = new RegExp(`\\b${search}`, 'ig')
    return carData.filter(car => {
      return (
      regexSearch.exec(Array.isArray(car.make) ? car.make[0] : car.make) || 
      regexSearch.exec(car.model)
      ) &&
      car.rq <= rqValue[1] && car.rq >= rqValue[0] &&
      (carTag.length > 0 ? carTag.some(elem => car.tags.includes(elem)) : true)
    })
  }


  const getAllTags = () => (
    carData.forEach((car) => {
      if (Array.isArray(car.tags) && car.tags.length > 0) {
        car.tags.forEach((tag) => {
          if (!carTags.includes(tag)) {
            carTags.push(tag);
          }
          if(car.tags.includes("Unqiue")) {
            console.log(`CAR THAT HAS TYPOS ${car.make}| ${car.model}`)
          }
        })
      }
    })
  )

  useEffect(() => {
    getAllTags()
    console.log("CAR TAGS --->", carTags)
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <Box style={{ width: "100%", backgroundColor: "white", marginBottom: "5rem", borderRadius: "10px" }}>
        <img src={Logo} style={{ width: "90%", backgroundColor: "white", border: "5px solid white" }} />
      </Box>

      <CarFilter carTag={carTag} setCarTag={setCarTag} carTags={carTags} setRqOrder={setRqOrder} rqOrder={rqOrder} setSearch={setSearch} search={search} setRqValue={setRqValue} rqValue={rqValue} setPage={setPage} />

      <Cards rqOrder={rqOrder} filteredCars={filteredCars} page={page} numOfCars={numOfCars} />

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
