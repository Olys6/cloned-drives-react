import react, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Card, TextField, Select,
  MenuItem, Box, Pagination,
  Stack, Accordion, AccordionSummary,
  Typography, AccordionDetails, Slider,
  Link, OutlinedInput, InputLabel,
  Chip, FormControl, Checkbox, ListItemText,
} from '@mui/material'

import carData from '../data/data.js'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function valuetext(rqValue) {
  return `${rqValue} RQ`;
}

const minDistance = 10;

const maxRQ = 125

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const carTags = []
  function getCarTags() {
  carData.forEach((car) => {
    if (Array.isArray(car.tags) && car.tags.length > 0) {
      car.tags.forEach((tag) => {
        if (!carTags.includes(tag)) {
          carTags.push(tag);
        }
      })
    }
  })
}
getCarTags()

function getStyles(name, carTag, theme) {
  return {
    fontWeight:
      carTag.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}


const CarFilter = ({ setSearch, search, setRqValue, rqValue, setPage, setRqOrder, rqOrder, carTag, setCarTag }) => {


  const theme = useTheme();

  const handleSelectTagChange = (event) => {
    const {
      target: { value },
    } = event;
    setCarTag(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleSearch = event => {
    setSearch(event.target.value)
    setPage(1)
  }

  const handleSelectChange = event => {
    setSelect(event.target.value)
    setPage(1)
  }
  

  const handleRQSliderChange = (event, newValue, activeThumb) => {
    setRqValue(newValue);
    if (!Array.isArray(newValue)) {
      return;
    }

    if (rqValue[1] - rqValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(rqValue[0], maxRQ - minDistance);
        setRqValue([clamped, clamped + minDistance]);
      } else {
        const clamped = Math.max(rqValue[1], minDistance);
        setRqValue([clamped - minDistance, clamped]);
      }
    } else {
      setRqValue(newValue);
    }
  };

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setCarTag(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <Box id="searchBox">
      {/* <Box sx={{ width: "90%", display: "flex", alignItems: "center", justifyContent: "space-evenly", flexDirection: "column" }}> */}
  
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
        <Stack spacing={2} direction="row" sx={{ width: "80%" }} alignItems="center">
          <TextField sx={{ minWidth: "30%" }} color="secondary" focused id="standard-basic" label="Standard" variant="standard" value={search} onChange={handleSearch} />
          {rqOrder ?
            <Link color="secondary" href="#" sx={{ display: "flex", alignItems: "center" }} onClick={() => setRqOrder(false)} variant="p">
              <KeyboardArrowDownIcon/> RQ
            </Link>
            :
            <Link color="secondary" href="#" sx={{ display: "flex", alignItems: "center" }} onClick={() => setRqOrder(true)} variant="p">
              <KeyboardArrowUpIcon /> RQ
            </Link>}

          <Slider
            getAriaLabel={() => 'RQ'}
            value={rqValue}
            onChange={handleRQSliderChange}
            valueLabelDisplay="auto"
            getAriaValueText={valuetext}
            valueLabelFormat={valuetext}
            disableSwap
            max={maxRQ}
          />

        </Stack>
        <FormControl sx={{ m: 1, width: "40%" }} color="secondary">
          <InputLabel id="demo-multiple-chip-label">Tags</InputLabel>
          <Select
            labelId="demo-multiple-chip-label"
            id="demo-multiple-chip"
            multiple
          value={carTag}
          onChange={handleSelectTagChange}
            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip sx={{ fontWeight: "bold" }} color="success" key={value} label={value} />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
          {carTags.map((tag) => (
              <MenuItem
              key={tag}
              value={tag}
              style={getStyles(tag, carTag, theme)}
              >
              {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      {/* <FormControl sx={{ m: 1, width: 300 }} color="secondary">
        <InputLabel id="demo-multiple-checkbox-label">Tag</InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={personName}
          onChange={handleChange}
          input={<OutlinedInput label="Tag" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
        >
          {names.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={personName.indexOf(name) > -1} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl> */}
      {/* </Box> */}

      {/* <Accordion>
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
          </Accordion> */}
    </Box >
  )
}

export default CarFilter;