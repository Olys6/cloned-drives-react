import { useEffect, useState } from 'react'
import './App.css'
import carData from './data/data.js'
import { 
  Card, TextField, Select, 
  MenuItem, Box, Pagination, 
  Stack, Accordion, AccordionSummary, 
  Typography, AccordionDetails, Slider 
} from '@mui/material'

// Lazy Image Loading components
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';

import Logo from './assets/logoblack.webp'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { themeOptions } from './Theme';

const theme = createTheme(themeOptions);

function valuetext(rqValue) {
  return `${rqValue} RQ`;
}

const minDistance = 10;

function App() {
  
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("all")
  const [page, setPage] = useState(1)
  const [rqValue, setRqValue] = useState([10, 40]);
  const numOfCars = 30
  // { Array.isArray(car.make) ? car.make[0] : car.make }

  // const smallCarData = carData.map((car, i) => (i < 20 ? car : <></>))

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearch = event => {
    setSearch(event.target.value)
    setPage(1)
  }

  const handleSelectChange = event => {
    setSelect(event.target.value)
    setPage(1)
    // console.log(search)
    // filteredCars()
  }



  const handleRQSliderChange = (event, newValue, activeThumb) => {
    setRqValue(newValue);
    if (!Array.isArray(newValue)) {
      return;
    }

    if (rqValue[1] - rqValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(rqValue[0], 100 - minDistance);
        setRqValue([clamped, clamped + minDistance]);
      } else {
        const clamped = Math.max(rqValue[1], minDistance);
        setRqValue([clamped - minDistance, clamped]);
      }
    } else {
      setRqValue(newValue);
    }
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
      <Box id="searchBox">
        
        <Box sx={{ width: "90%", display: "flex", alignItems: "center", justifyContent: "space-evenly" }}>
          <TextField color="secondary" focused id="standard-basic" label="Standard" variant="standard" value={search} onChange={handleSearch} />
          {/* <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={select}
            // label="Age"
            onChange={handleSelectChange}
            color="secondary"
            sx={{ minWidth: "10rem"}}
          >
            <MenuItem value="all">All</MenuItem>
            {[...Array(12)].map((_, i) => (<MenuItem value={(i + 1) * 10}>{'<'} {(i + 1) * 10} RQ</MenuItem>))}
          </Select> */}
          <Stack spacing={2} direction="row" sx={{ width: 400 }} alignItems="center">
            <Typography sx={{ wordBreak: "keep-all" }} variant="p">RQ</Typography>

            <Slider
              getAriaLabel={() => 'RQ'}
              value={rqValue}
              onChange={handleRQSliderChange}
              valueLabelDisplay="on"
              getAriaValueText={valuetext}
              valueLabelFormat={valuetext}
              disableSwap
              max={125}
            />
          </Stack>
        </Box>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>More Filters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
              malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Card style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", backgroundColor: "#242424", padding: "20px" }}>
        {filteredCars().sort((a, b) => (b.rq - a.rq)).map((car, i) => (
          i > (numOfCars * page - numOfCars) && i < numOfCars * page ? <a key={i} onClick={() => console.log(car)} className="carCard" href="#"><LazyLoadImage effect="blur" src={car.card} style={{ width: "15rem", height: "9.35rem", marginBottom: "-5px" }}/></a>
          :
          <></>
          ))}
      </Card>
      <Stack>
        <Pagination sx={{ width: "100%", display: "flex", justifyContent: "center", alignItem: "center" }} size="large" count={Math.ceil(filteredCars().length / numOfCars)} onChange={handlePageChange} page={page} variant="outlined" shape="rounded" />
      </Stack>
    </ThemeProvider>
  )
}

export default App
