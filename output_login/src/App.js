import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline'
import React from 'react';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import './App.css';


const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#4f79a7',
    },
    secondary: {
      main: '#4f79a7',
    },
  },
})

// this seems to be materialUI's convoluted way of doing CSS, and I'm not sure why...
// except you can use theme.whatever then within your CSS
const useStyles = makeStyles((theme) => ({
  appRoot: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: 'black',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  }
}));

export default function App() {
  const classes = useStyles(); 
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
          <div className={classes.appRoot}>
            <AppBar style={{backgroundColor: '#fff'}} position="fixed">
              <Toolbar>
                <Typography variant="h6" className={classes.title}>
                  Yale Extracurricular Search
                </Typography>
              </Toolbar>
            </AppBar>
          </div>
          <Paper style={{marginTop: "9vh", height: "91vh"}} m={2}>
            <div className="background"> 
              <div className="center">
                  <p className="title"> What are you doing outside of class? </p>
                  <Button color="secondary" href='login'> login with CAS </Button>
              </div>
            </div>
          </Paper>
      </ThemeProvider>
    </React.Fragment>
  );
}
