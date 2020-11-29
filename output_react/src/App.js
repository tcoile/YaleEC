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
import Home from "./components/Home";
import DataHolder from "./components/DataHolder";

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
      main: '#fff',
    },
    secondary: {
      main: '#4f79a7',
    },
  },
})

// this seems to be materialUI's convoluted way of doing CSS, and I'm not sure why...
// except you can use theme.whatever then within your CSS
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  }
}));


export default function App() {
  const classes = useStyles(); // pass theme object in in order to use it
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className={classes.root}>
            <AppBar position="fixed">
              <Toolbar>
                <Typography variant="h6" className={classes.title} to="/">
                  Yale Extracurricular Search
                </Typography>
                <Button style={{color: '#4f79a7'}} component={Link} to="/data">Explore</Button>
                <Button style={{color: '#4f79a7'}} component={Link} to="/search">Search</Button>
              </Toolbar>
            </AppBar>
          </div>
          <Paper style={{marginTop: "9vh"}} m={2}>
            <Switch>
              <Route path="/data">
                <div className="svg-container"><DataHolder /></div> 
              </Route>
              <Route path="/">
                <Home />
              </Route>
              <Route>
                <Search />
              </Route>
            </Switch>
          </Paper>
        </Router>
      </ThemeProvider>
    </React.Fragment>
  );
}

