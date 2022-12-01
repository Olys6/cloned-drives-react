import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { themeOptions } from './Theme';

import Navbar from './components/Navbar.jsx'
import Home from './components/Home.jsx'
import Creation from './components/Creation.jsx'
import NoMatch from './components/NoMatch.jsx'
import Footer from './components/Footer.jsx';

const theme = createTheme(themeOptions);

function App() {

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Navbar />

        <div style={{ marginTop: "5rem" }} />

        <Routes>
          <Route exact path='/cloned-drives-react/' element={<Home />} />
          <Route exact path='/cloned-drives-react/tune-calculator' element={<Creation />} />
          {/* <Route exact path='/cloned-drives-react/foot' element={<Footer />} /> */}
          <Route exact path='/cloned-drives-react/*' element={<NoMatch />} />
          {/* <Route element={<Footer />} /> */}
        </Routes>

        {/* <Footer /> */}

      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
