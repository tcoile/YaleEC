import React from 'react';
import Data from './Data';
import Clubpage from './Clubpage';

import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';

const drawerWidth = 50;

const styles = theme => ({
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
  svgContainer: {
    height: '100vh',
  }
});

class DataHolder extends React.Component{
  constructor(props) {
    super(props);
    // this.handleDrawerClose = this.handleDrawerClose.bind(this);
    this.state = {
      open: false,
      clubInfo: {}
    }
  }

  handleDrawerOpen () {
    this.setState({open: true});
  };

  handleDrawerClose = () => {
    this.setState({open: false});
  };

  selectClub = (value) => {
    this.setState({clubInfo: value})
    this.handleDrawerOpen();
  };

  render() {
    const { classes } = this.props;

    // const clubInfo = {
    //   name: "Yale Women's Ultimate Team",
    //   tags: ["Cultural", "Advocacy/Policy", "Dance"],
    //   mission : "Yale Undergraduates at Connecticut Hospice (YUCH) is an organization that provides the unique opportunity to work at a palliative care facility a short drive away from campus in Branford, CT. Volunteers provide a service that is crucial to the Hospice organization and uplifting to the patients. There are a variety of volunteer departments ranging from patient assistance to art therapy, which all immerse volunteers in the real patient care experience.",
    //   url: "www.google.com",
    //   videoLink: "https://www.youtube.com/watch?v=MuPvStdEt58"
    // }
    return (
      <div className={classes.root}>
        <CssBaseline />
        <main
          className={classes.content}
          // gives it class classes.content and classes.contentShift if open
        >
          <div className={classes.svgContainer}> 
              <Data selectClub={this.selectClub} />
          </div>
          {/* <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={this.handleDrawerOpen}
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
          open={this.state.open}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <Clubpage handleDrawerClose={this.handleDrawerClose} clubInfo={this.state.clubInfo}/>
        </Drawer>
      </div>
    );
  }
}

export default withStyles(styles, {withTheme: true})(DataHolder)
