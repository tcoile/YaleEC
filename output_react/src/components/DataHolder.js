import React from 'react';
import clsx from 'clsx';
import ReactPlayer from "react-player";
import Data from './Data';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import LanguageIcon from '@material-ui/icons/Language';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const drawerWidth = 50;

const useStyles = makeStyles((theme) => ({
  root: {
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}%)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: `${drawerWidth}%`,
  },
  title: {
    flexGrow: 1,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: `${drawerWidth}%`,
    flexShrink: 0,
    zIndex: theme.zIndex.appBar - 1,
  },
  drawerPaper: {
    width: `${drawerWidth}%`,
    paddingTop: 60,
    zIndex: theme.zIndex.appBar - 1,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    alignContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  },
  drawerMain: {
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 30
  },
  content: {
    // padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    // marginRight: -`${drawerWidth}%`,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },
  chipDiv: {
      display: 'flex',
      justifyContent: 'flex-start',
        '& > *': {
        margin: theme.spacing(0.5),
      },
      marginBottom: '15px'
  },
  title: {
    fontSize: 'xx-large',
    fontWeight: 'bold',
    marginBlockEnd: '0.25em'
  },
  svgContainer: {
    height: '100vh',
  }
}));

export default function DataHolder() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const tags = ["Cultural", "Advocacy/Policy", "Dance"]
  const tagChips = tags.map((tag => 
      <Chip label={tag}></Chip>
  ))
  const mission = "Yale Undergraduates at Connecticut Hospice (YUCH) is an organization that provides the unique opportunity to work at a palliative care facility a short drive away from campus in Branford, CT. Volunteers provide a service that is crucial to the Hospice organization and uplifting to the patients. There are a variety of volunteer departments ranging from patient assistance to art therapy, which all immerse volunteers in the real patient care experience."
  const website = "www.google.com"

  return (
    <div className={classes.root}>
      <CssBaseline />
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
        // gives it class classes.content and classes.contentShift if open
      >
        <div className={classes.svgContainer}> 
            <Data />
        </div>
        {/* <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerOpen}
            disableRipple
            className={clsx(open && classes.hide)}
          >
            <MenuIcon  />
        </IconButton> */}
      </main>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerMain}>
            <div style={{display: 'flex', alignItems: 'flex-end', alignContent: 'center'}}> 
              <IconButton onClick={handleDrawerClose} style={{marginBlockEnd: '0.25em'}}>
                <ChevronRightIcon/>
              </IconButton>
              <p className={classes.title}> Yale Women's Ultimate Team </p>
            </div>
            <div className={classes.chipDiv}>{tagChips}</div>
            <ReactPlayer width="100%" url="https://www.youtube.com/watch?v=MuPvStdEt58"/>
            <p style={{fontWeight: 'bold'}}> Mission </p>
            <p> {mission} </p>
            <LanguageIcon />  <p> {website} </p>
        </div>
      </Drawer>
    </div>
  );
}
