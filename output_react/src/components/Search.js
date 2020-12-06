import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import Drawer from '@material-ui/core/Drawer';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

import Clubpage from './Clubpage';

const drawerWidth = 50;

const styles = theme => ({
    horiFlex: {
    
    },
    searchDiv: {
        paddingTop: 20,
        paddingBottom: 20,
        marginLeft: 20,
        paddingLeft: 20,
        paddingRight: 20
    },
    searchInput: {
        fontSize: 20,
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
})

class Search extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            clubInfo: {}
        };
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
        return (
            <div>
                <CssBaseline/>
                <div className={classes.horiFlex}>
                    <div className={classes.searchDiv}>
                        <TextField 
                            id="search" 
                            size="medium" 
                            variant="standard"
                            label="What are you looking for?"
                            style={{width: '95%'}}
                            InputProps={{ classes: { input: classes.searchInput }, variant: 'standard' }}
                            ></TextField>
                        <IconButton>
                            <SearchIcon />
                        </IconButton>
                    </div>
                    <div> 
                        {/* the other svg container goes here */}
                    </div>
                </div>
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
        )
    }
}

export default withStyles(styles, {withTheme: true})(Search);