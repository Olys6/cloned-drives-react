import { useEffect, useState } from 'react'
import './App.css'
import carData from './data/data.js'
import { Card, TextField, Select, MenuItem, Box } from '@mui/material'

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { themeOptions } from './Theme';

const theme = createTheme(themeOptions);

function App() {
  const [search, setSearch] = useState("")
  const [select, setSelect] = useState("all")
  // { Array.isArray(car.make) ? car.make[0] : car.make }

  const smallCarData = carData.map((car, i) => (i < 20 ? car : <></>))

  const handleSearch = event => {
    setSearch(event.target.value)
    
  }

  const handleChange = event => {
    // setSelect(event.target.value)
    // console.log(search)
    // filteredCars()
  }

  const filteredCars = () => {
    const regexSearch = new RegExp(search, 'ig')
    return smallCarData.filter(car => {
      // console.log(regexSearch.exec(Array.isArray(car.make) ? car.make[0] : car.make))
      return regexSearch.exec(Array.isArray(car.make) ? car.make[0] : car.make) && (car.model === select || select === 'all')
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <Box style={{ width: "100%", backgroundColor: "white", marginBottom: "5rem", borderRadius: "10px" }}>
        <img src="src/assets/logoblack.webp" style={{ width: "90%", backgroundColor: "white", border: "5px solid white" }} />
      </Box>
      <Box id="searchBox">
        <TextField color="secondary" focused id="standard-basic" label="Standard" variant="standard" value={search} onChange={handleSearch} />
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={select}
          label="Age"
          onChange={handleChange}
          color="secondary"
        >
          <MenuItem value="all">All</MenuItem>
        </Select>
      </Box>
      <Card style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", backgroundColor: "#242424", padding: "20px" }}>
        {filteredCars().map((car, i) => (
          i < 20 ? <a key={i} className="carCard" href="#"><img src={car.card} style={{ width: "15rem", height: "9.35rem", marginBottom: "-5px" }}/></a>
          :
          <></>
          ))}
      </Card>
    </ThemeProvider>
  )
}

export default App
