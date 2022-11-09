import { useEffect, useState } from 'react'
import './App.css'
import carData from './data/data.js'
import { 
  Card, TextField, Select, 
  MenuItem, Box, Pagination, 
  Stack, Accordion, AccordionSummary, 
  Typography, AccordionDetails, Slider 
} from '@mui/material'



import Logo from './logowhite.png'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { themeOptions } from './Theme';

import CarFilter from './components/CarFilter.jsx';
import Cards from './components/Cards';

const theme = createTheme(themeOptions);

let highestCarSpeed = 0;

const getHighestSpeed = () => {
  carData.forEach((car) => {
    highestCarSpeed < car.topSpeed ? highestCarSpeed = car.topSpeed : null
  })
}

getHighestSpeed()

function App() {
  
  const [search, setSearch] = useState("");
  const [select, setSelect] = useState("all");
  const [page, setPage] = useState(1);
  const [rqValue, setRqValue] = useState([40, 110]);
  const [carsSortType, setCarsSortType] = useState(2);
  const [carTag, setCarTag] = useState([]);
  const [carCountryValue, setCarCountryValue] = useState([]);
  const [carMake, setCarMake] = useState([]);
  const [carTyre, setCarTyre] = useState([]);
  const [carDriveType, setCarDriveType] = useState([]);
  const [topSpeed, setTopSpeed] = useState([0, highestCarSpeed]);
  // { Array.isArray(car.make) ? car.make[0] : car.make }
  const numOfCars = 20;
  const carTags = [];

  // const smallCarData = carData.map((car, i) => (i < 20 ? car : <></>))

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredCars = () => {
    const regexSearch = new RegExp(`\\b${search}`, 'i')
    return carData.filter(car => {
      return (
      regexSearch.exec(Array.isArray(car.make) ? car.make[0] : car.make) || 
      regexSearch.exec(car.model) || 
      regexSearch.exec(Array.isArray(car.make) ? `${car.make[0]} ${car.model}` : `${car.make} ${car.model}`)
      ) &&
      car.rq <= rqValue[1] && car.rq >= rqValue[0] &&
      car.topSpeed <= topSpeed[1] && car.topSpeed >= topSpeed[0] &&
        (carMake.length > 0 ? carMake.some(elem => car.make.includes(elem)) : true) &&
      (carTag.length > 0 ? carTag.some(elem => car.tags.includes(elem)) : true) &&
      (carCountryValue.length > 0 ? carCountryValue.some(elem => elem.code === car.country) : true) &&
        (carTyre.length > 0 ? carTyre.some(elem => elem === car.tyreType) : true) &&
        (carDriveType.length > 0 ? carDriveType.some(elem => elem === car.driveType) : true)
    })
  }

  useEffect(() => {
    filteredCars()
  }, [rqValue])


  const getAllTags = () => (
    carData.forEach((car) => {
      if (Array.isArray(car.tags) && car.tags.length > 0) {
        car.tags.forEach((tag) => {
          if (!carTags.includes(tag)) {
            carTags.push(tag);
          }
        })
      }
    })
  )

  useEffect(() => {
    getAllTags()
    // console.log("CAR TAGS --->", carTags)
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <Box style={{ position: {md: "absolute", xs: "inherit"}, top: 10, left: 0, width: {md: 500, xs: "100%"}, marginBottom: "5rem", borderRadius: "10px" }}>
        <img src={Logo} style={{ width: "80%" }} />
      </Box>

      <CarFilter 
        highestCarSpeed={highestCarSpeed}
        topSpeed={topSpeed}
        setTopSpeed={setTopSpeed}
        carDriveType={carDriveType}
        setCarDriveType={setCarDriveType}
        carTyre={carTyre}
        setCarTyre={setCarTyre}
        carMake={carMake}
        setCarMake={setCarMake}
        carCountryValue={carCountryValue} 
        setCarCountryValue={setCarCountryValue} 
        carTag={carTag} 
        setCarTag={setCarTag} 
        carTags={carTags} 
        setCarsSortType={setCarsSortType} 
        carsSortType={carsSortType} 
        setSearch={setSearch} 
        search={search} 
        setRqValue={setRqValue} 
        rqValue={rqValue} 
        setPage={setPage} 
      />

      <Cards carsSortType={carsSortType} filteredCars={filteredCars} page={page} numOfCars={numOfCars} />

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
