import React, { useState } from 'react';
import { 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton,
  Divider,
  Box,
  Link
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Footer = () => {
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  const handleOpen = () => setDisclaimerOpen(true);
  const handleClose = () => setDisclaimerOpen(false);

  return (
    <>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          py: 1
        }}
      >
        <Link
          component="button"
          variant="caption"
          onClick={handleOpen}
          sx={{
            color: 'rgba(255,255,255,0.3)',
            textDecoration: 'none',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontSize: '0.7rem',
            '&:hover': {
              color: 'rgba(255,255,255,0.6)'
            }
          }}
        >
          Legal Disclaimer
        </Link>
      </Box>

      <Dialog
        open={disclaimerOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'grey.900',
            backgroundImage: 'none',
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Legal Disclaimer
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: 'grey.400', fontSize: '1.25rem' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'grey.700' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Trademark Notice
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.300' }}>
                All car manufacturer names, logos, and brand names (including but not limited to 
                Porsche, Ferrari, Lamborghini, BMW, Mercedes-Benz, Audi, Toyota, Honda, Ford, 
                Chevrolet, and all others featured on this site) are trademarks or registered 
                trademarks of their respective owners. The use of these names and brands on this 
                website is for identification purposes only and does not imply endorsement, 
                sponsorship, or affiliation.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'grey.700' }} />

            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Image Disclaimer
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.300' }}>
                Images displayed on this website have been edited and modified for use within 
                this project. The original images and photographs remain the property of their 
                respective copyright holders. This site does not claim ownership of any original 
                photographic content. All modifications are made for non-commercial, entertainment, 
                and educational purposes only.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'grey.700' }} />

            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                No Affiliation
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.300' }}>
                CD Club is an independent fan-made project and is not affiliated with, endorsed by, 
                sponsored by, or in any way officially connected with any automobile manufacturer, 
                racing organization, or any of their subsidiaries or affiliates. This website is 
                created purely for entertainment and educational purposes.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'grey.700' }} />

            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Fair Use Statement
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.300' }}>
                This website is a non-commercial, fan-made project intended for entertainment and 
                educational purposes. The use of trademarked names and modified images is believed 
                to constitute fair use under applicable copyright and trademark laws. No financial 
                gain is derived from the use of these materials.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'grey.700' }} />

            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Content Removal Requests
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.300' }}>
                If you are a rights holder and believe that any content on this website infringes 
                upon your intellectual property rights, please contact us and we will promptly 
                review and address your concerns. We respect intellectual property rights and will 
                remove any infringing content upon valid request.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'grey.700' }} />

            <Typography variant="caption" sx={{ color: 'grey.500', fontStyle: 'italic', textAlign: 'center' }}>
              By using this website, you acknowledge that you have read and understood this disclaimer.
            </Typography>

          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Footer;
