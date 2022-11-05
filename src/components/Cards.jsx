import React from "react";
import {
  Card, TextField, Select,
  MenuItem, Box, Pagination,
  Stack, Accordion, AccordionSummary,
  Typography, AccordionDetails, Slider
} from '@mui/material'

// Lazy Image Loading components
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';

const Cards = ({ filteredCars, page, numOfCars }) => {

  return (
    <>
      <Card style={{ display: "flex", flexWrap: "wrap", gap: "0.71rem", justifyContent: "center", backgroundColor: "#242424", padding: "20px" }}>
        {filteredCars().sort((a, b) => (b.rq - a.rq)).map((car, i) => (
          i >= (numOfCars * page - numOfCars) && i <= (numOfCars * page ) && (
            <a key={i} onClick={() => console.log(car)} className="carCard" href="#">
              <LazyLoadImage onClick={() => console.log}effect="blur" src={car.card} style={{ width: "15rem", height: "9.35rem", marginBottom: "-5px" }} />
            </a>
        )))}
      </Card>
    </>
  )
}

export default Cards