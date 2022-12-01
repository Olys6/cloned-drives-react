import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { themeOptions } from './Theme';

import Navbar from './components/Navbar.jsx'
import Home from './components/Home.jsx'
import Footer from './components/Footer.jsx';

const theme = createTheme(themeOptions);

function App() {

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Navbar />

        <Routes>
          <Route exact path='/cloned-drives-react/' element={<Home />} />
          {/* <Route exact path='/cloned-drives-react/foot' element={<Footer />} /> */}
          {/* <Route exact path='/404' element={<NoMatch />} />
          <Route element={<NoMatch />} /> */}
        </Routes>

        {/* <Home /> */}

        <Footer />

      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
