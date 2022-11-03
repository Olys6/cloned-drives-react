import react, { useState } from 'react';
import {
  Card, TextField, Select,
  MenuItem, Box, Pagination,
  Stack, Accordion, AccordionSummary,
  Typography, AccordionDetails, Slider
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function valuetext(rqValue) {
  return `${rqValue} RQ`;
}

const minDistance = 10;

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;
// const MenuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//       width: 250,
//     },
//   },
// };

// const names = [
//   'Oliver Hansen',
//   'Van Henry',
//   'April Tucker',
//   'Ralph Hubbard',
//   'Omar Alexander',
//   'Carlos Abbott',
//   'Miriam Wagner',
//   'Bradley Wilkerson',
//   'Virginia Andrews',
//   'Kelly Snyder',
// ];

const CarFilter = ({ setSearch, search, setRqValue, rqValue, setPage }) => {
  const [personName, setPersonName] = useState([]);

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

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
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