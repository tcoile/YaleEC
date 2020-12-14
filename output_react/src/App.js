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

import Search from "./components/Search";
import DataHolder from "./components/DataHolder";
import ClubForm from "./components/ClubForm";


import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";

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
    cursor: 'pointer'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  }
}));

function handleClick() {
  console.log("getting clicked");
  window.location.replace('http://localhost:5000/home'); 
}

export default function App() {
  const classes = useStyles(); // pass theme object in in order to use it
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className={classes.appRoot}>
            <AppBar style={{backgroundColor: '#fff'}} position="fixed">
              <Toolbar>
                <Typography variant="h6" className={classes.title} onClick={handleClick}>
                  Yale Extracurricular Search
                </Typography>
                <Button style={{color: '#4f79a7'}} component={Link} to="/explore">Explore</Button>
                <Button style={{color: '#4f79a7'}} component={Link} to="/search">Search</Button>
              </Toolbar>
            </AppBar>
          </div>
          <Paper style={{marginTop: "9vh", height: "91vh"}} m={2}>
            <Switch>
              <Route path="/explore">
                <div className="svg-container"><DataHolder /></div> 
              </Route>
              <Route path="/search">
                <Search />
              </Route>
              <Route path="/add">
                <ClubForm />
              </Route>
              <Route path="/">
                <div className="svg-container"><DataHolder /></div> 
              </Route>
            </Switch>
          </Paper>
        </Router>
      </ThemeProvider>
    </React.Fragment>
  );
}

