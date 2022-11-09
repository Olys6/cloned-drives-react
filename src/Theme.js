export const themeOptions = {
  typography: {
    fontFamily: 'Open Sans, sans-serif',
  },
  palette: {
    type: 'dark',
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#242424',
      paper2: "#b8860b",
      prize: '#b8860b',
    },
    success: {
      main: '#fcbc4e',
    },
    text: {
      primary: 'rgba(255,255,255,0.87)',
      secondary: 'rgba(243,240,243,0.9)',
      disabled: 'rgba(220,220,220,0.61)',
      hint: 'rgba(238,115,245,0.57)',
    },
  },
  props: {
    MuiList: {
      dense: true,
    },
    MuiMenuItem: {
      dense: true,
    },
    MuiTable: {
      size: 'small',
    },
    MuiAppBar: {
      color: 'inherit',
    },
  },
  overrides: {
    MuiAppBar: {
      colorInherit: {
        backgroundColor: 'rgb(178, 10, 97)',
        color: '#fff',
      },
    },
  },
};