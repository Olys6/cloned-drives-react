import React, { useState } from "react";
import {
  Card, TextField, Select,
  MenuItem, Box, Pagination,
  Stack, Accordion, AccordionSummary,
  Typography, AccordionDetails, Slider, Modal, Chip
} from '@mui/material'

import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Lazy Image Loading components
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: {md: "60%", xs: "80%"},
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
  display: "flex",
  flexDirection: "column",
  gap: '1rem',
  borderRadius: "10px"
};

const Cards = ({ filteredCars, page, numOfCars, rqOrder }) => {
  const [modalCar, setModalCar] = useState(filteredCars()[0])
  const [open, setOpen] = useState(false);
  const handleOpen = car => {
    setOpen(true);
    setModalCar(car)
  }
  const handleClose = () => setOpen(false);

  return (
    <>
      <Card style={{ display: "flex", flexWrap: "wrap", gap: "0.71rem", justifyContent: "center", backgroundColor: "#242424", padding: "20px" }}>
        {filteredCars().sort((a, b) => rqOrder ? b.rq - a.rq : a.rq - b.rq).map((car, i) => (
          i >= (numOfCars * page - numOfCars) && i <= (numOfCars * page ) && (
              <a key={i} onClick={() => handleOpen(car)} className="carCard" href="#">
                <LazyLoadImage effect="blur" src={car.card} style={{ width: "15rem", height: "9.35rem", marginBottom: "-5px" }} />
              </a>
        )))}
      </Card>
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
            {modalCar.tags.map((tag) => (
              <Chip color="success" label={tag} />
            ))}
          </Box>
          

            {modalCar.description !== "None." ? 
              <Typography id="modal-modal-description" sx={{ mt: 3 }} variant="h6">
                {modalCar.description}
              </Typography>
            : 
            <></>
            }

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                {modalCar.isPrize === true ?
                  <Typography id="modal-modal-description" sx={{ mt: 0, color: "yellow", display: "flex", alignItems: "center", gap: 0.5 }} variant="h6">
                    <EmojiEventsIcon /> This is a prize car
                  </Typography>
                  :
                  <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                    This is not a prize car
                  </Typography>
                }
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                Body style: {modalCar.bodyStyle}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                Fuel type: {modalCar.fuelType}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
              {modalCar.tcs === true ?
                <>Includes TCS</>
                :
                <>Does not include TCS</>
              }
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
              {modalCar.abs === true ?
                <>Includes ABS</>
                :
                <>Does not include ABS</>
              }
              </Typography>
            </Box>
            <Box>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                Weight: {modalCar.weight}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 0 }} variant="h6">
                Seat count: {modalCar.seatCount}
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
          
        </Box>
      </Modal>
    </>
  )
}

export default Cards