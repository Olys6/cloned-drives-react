import React from 'react';
import { Box, Typography, Container, Paper, Divider } from '@mui/material';

const Disclaimer = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: 2 
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Legal Disclaimer
        </Typography>
        
        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Trademark Notice
        </Typography>
        <Typography variant="body1" paragraph>
          All car manufacturer names, logos, and brand names (including but not limited to 
          Porsche, Ferrari, Lamborghini, BMW, Mercedes-Benz, Audi, Toyota, Honda, Ford, 
          Chevrolet, and all others featured on this site) are trademarks or registered 
          trademarks of their respective owners. The use of these names and brands on this 
          website is for identification purposes only and does not imply endorsement, 
          sponsorship, or affiliation.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Image Disclaimer
        </Typography>
        <Typography variant="body1" paragraph>
          Images displayed on this website have been edited and modified for use within 
          this project. The original images and photographs remain the property of their 
          respective copyright holders. This site does not claim ownership of any original 
          photographic content. All modifications are made for non-commercial, entertainment, 
          and educational purposes only.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          No Affiliation
        </Typography>
        <Typography variant="body1" paragraph>
          CD Club is an independent fan-made project and is not affiliated with, endorsed by, 
          sponsored by, or in any way officially connected with any automobile manufacturer, 
          racing organization, or any of their subsidiaries or affiliates. This website is 
          created purely for entertainment and educational purposes.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Fair Use Statement
        </Typography>
        <Typography variant="body1" paragraph>
          This website is a non-commercial, fan-made project intended for entertainment and 
          educational purposes. The use of trademarked names and modified images is believed 
          to constitute fair use under applicable copyright and trademark laws. No financial 
          gain is derived from the use of these materials.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Content Removal Requests
        </Typography>
        <Typography variant="body1" paragraph>
          If you are a rights holder and believe that any content on this website infringes 
          upon your intellectual property rights, please contact us and we will promptly 
          review and address your concerns. We respect intellectual property rights and will 
          remove any infringing content upon valid request.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          By using this website, you acknowledge that you have read and understood this 
          disclaimer. This disclaimer is subject to change without notice.
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Typography>
      </Paper>
    </Container>
  );
};

export default Disclaimer;
