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
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';

import Data from "./components/Data";
import Login from "./components/Login";
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
      main: purple[500],
    },
    secondary: {
      main: green[500],
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
                <Typography variant="h6" className={classes.title}>
                  Yale Extracurricular Search
                </Typography>
                <Button style={{color: "white"}} component={Link} to="/">Home</Button>
                <Button style={{color: "white"}} component={Link} to="/data">Organizations</Button>
                <Login />
              </Toolbar>
            </AppBar>
          </div>
          <Paper style={{marginTop: "65px"}} m={2}>
            <Switch>
              <Route path="/data">
                <Data />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Paper>
        </Router>
      </ThemeProvider>
    </React.Fragment>
  );
}

function Home() {
  return <h2>You are not currently logged in</h2>;
}

