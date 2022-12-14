import React, { useState } from "react";
import {
  Card, TextField, Select,
  MenuItem, Box, Pagination,
  Stack, Accordion, AccordionSummary,
  Typography, AccordionDetails, Slider, Modal, Chip,
  Button
} from '@mui/material'

import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMoreIcon';

// Lazy Image Loading components
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';

// import Compressor from 'compressorjs';

const Cards = ({ filteredCars, page, numOfCars, carsSortType }) => {
  const [compressedFile, setCompressedFile] = useState(null);
  const [modalCar, setModalCar] = useState(filteredCars()[0])
  const [open, setOpen] = useState(false);
  const handleOpen = car => {
    // console.log("CAR ID =>", car.id)
    console.log("CAR ==>", car)
    setOpen(true);
    setModalCar(car)
  }
  const handleClose = () => setOpen(false);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { md: 500, xs: "80%" },
    bgcolor: (modalCar.isPrize ? 'background.prize' : 'background.paper'),
    border: '2px solid #fff',
    boxShadow: 24,
    p: 2,
    display: "flex",
    flexDirection: "column",
    gap: '1rem',
    borderRadius: "10px"
  };

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.71rem", justifyContent: "center", backgroundColor: "", padding: "20px" }}>
        {filteredCars().sort(
          (a, b) => {
            if (carsSortType === 1) {
              return a.rq - b.rq
            } else if (carsSortType === 2) {
              return b.rq - a.rq
            } else if (carsSortType === 3) {
              return a.topSpeed - b.topSpeed
            } else if (carsSortType === 4) {
              return b.topSpeed - a.topSpeed
            } else if (carsSortType === 5) {
              return b["0to60"] - a["0to60"]
            } else if (carsSortType === 6) {
              return a["0to60"] - b["0to60"]
            } else if (carsSortType === 7) {
              return a.handling - b.handling
            } else if (carsSortType === 8) {
              return b.handling - a.handling
            } else if (carsSortType === 9) {
              return b.modelYear - a.modelYear
            } else if (carsSortType === 10) {
              return a.modelYear - b.modelYear
            } else if (carsSortType === 11) {
              return b.mra - a.mra
            } else if (carsSortType === 12) {
              return a.mra - b.mra
            } else if (carsSortType === 13) {
              return a.ola - b.ola
            } else if (carsSortType === 14) {
              return a.ola - b.ola
            } else if (carsSortType === 15) {
              return a.weight - b.weight
            } else if (carsSortType === 16) {
              return b.weight - a.weight
            }
          }
        ).map((car, i) => (
          i >= (numOfCars * page - numOfCars) && i < (numOfCars * page) && (
            <Button key={i} onClick={() => handleOpen(car)} className="carCard">
              <LazyLoadImage
                threshhold={200}
                effect="blur"
                // delayMethod="debounce"
                src={
                  car.card
                }
                style={{ width: "15rem", height: "9.35rem", marginBottom: "-5px" }} />
            </Button>
          )))}
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* <a href="#" onClick={handleClose} style={{ position: "absolute", right: 10, top: 10, transform: "scale(1.5)" }}>
            <CloseIcon />
          </a> */}
          {/* <Typography id="modal-modal-title" variant="h4">
            {modalCar.model}
          </Typography> */}
          <LazyLoadImage src={modalCar.card} style={{ width: "100%" }} />

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", fontWeight: "bold" }}>
            {modalCar.tags.map((tag, i) => (
              <Chip key={i} color="success" label={tag} />
            ))}
          </Box>


          {modalCar.description !== "None." && modalCar.description !== "" ?
            <Accordion>
              <AccordionSummary
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Description</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography id="modal-modal-description" sx={{ mt: -1 }}>
                  {modalCar.description}
                </Typography>
              </AccordionDetails>
            </Accordion>
            :
            <></>
          }

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              {modalCar.isPrize === true ?
                <Typography id="modal-modal-description" sx={{ mt: 0, color: "yellow", display: "flex", alignItems: "center", gap: 0.5 }} variant="h6">
                  <EmojiEventsIcon /> Prize car
                </Typography>
                :
                <></>
              }
              <Typography sx={{ mt: 0 }} variant="h6">
                {Array.isArray(modalCar.bodyStyle) ? modalCar.bodyStyle.join(" / ") : modalCar.bodyStyle}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                {modalCar.fuelType}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                {modalCar.tcs === true ?
                  <>TCS</>
                  :
                  <>No TCS</>
                }
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                {modalCar.abs === true ?
                  <>ABS</>
                  :
                  <>No ABS</>
                }
              </Typography>
            </Box>
            <Box>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                {modalCar.weight} KG
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                {modalCar.seatCount} Seats
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                MRA: {modalCar.mra}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                OLA: {modalCar.ola}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                GC: {modalCar.gc}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }} >
            <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
              Creator: {modalCar.creator}
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
              Id: {modalCar.id.split(".")[0]}
            </Typography>
          </Box>
        </Box>
      </Modal>
    </>
  )
}

export default Cards