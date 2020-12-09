import React from 'react';
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import ReactPlayer from "react-player";
import IconButton from '@material-ui/core/IconButton';
import LanguageIcon from '@material-ui/icons/Language';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import Chip from '@material-ui/core/Chip';

const styles = theme => ({
    chipDiv: {
        display: 'flex',
        justifyContent: 'flex-start',
          '& > *': {
          margin: theme.spacing(0.5),
        },
        marginBottom: '15px',
        flexWrap: 'wrap'
    },
    title: {
      fontSize: 'xx-large',
      fontWeight: 'bold',
      marginBlockEnd: '0.25em'
    },
    drawerMain: {
        marginLeft: 30,
        marginRight: 30,
        marginBottom: 30
    },
    dense: {
        marginBlockEnd: '0.25em',
        marginBlockStart: '0.25em'
    }
});

class Clubpage extends React.Component{
    constructor(props) {
        super(props);
    }

    // kindly written by Jon Kantner at https://css-tricks.com/converting-color-spaces-in-javascript/
    hexToRGB(h) {
        let r = 0, g = 0, b = 0;
      
        // 3 digits
        if (h.length == 4) {
          r = "0x" + h[1] + h[1];
          g = "0x" + h[2] + h[2];
          b = "0x" + h[3] + h[3];
      
        // 6 digits
        } else if (h.length == 7) {
          r = "0x" + h[1] + h[2];
          g = "0x" + h[3] + h[4];
          b = "0x" + h[5] + h[6];
        }
        
        return "rgb("+ +r + "," + +g + "," + +b + ", 0.4)";
      }

    sendToForm = () => {
        this.props.history.push({
            pathname: "/add",
            state: {
                clubName: this.props.clubInfo.name
            }
        });
    }

    render() {
        const { classes, clubInfo } = this.props;
        const tagChips = clubInfo.tags ? 
            clubInfo.tags.map(((tag, index) => 
                <Chip key={tag.toString()} 
                label={tag} 
                // okay there has to be a faster way to do this
                style={{backgroundColor: this.hexToRGB(clubInfo.colors[index])}}></Chip>))
            : <div></div>

        const emailDivs = clubInfo.contacts ? 
            clubInfo.contacts.map((contact => <p className={classes.dense}> {contact} </p>))
            : <p className={classes.dense}> no contacts yet </p> 

        return (
            <div className={classes.drawerMain}>
                <div style={{display: 'flex', alignItems: 'flex-start', alignContent: 'center'}}> 
                    <IconButton onClick={this.props.handleDrawerClose} style={{marginBlockStart: '1.15em'}}>
                        <ChevronRightIcon/>
                    </IconButton>
                    <p className={classes.title}> {clubInfo.name} </p>
                </div>
                <div className={classes.chipDiv}>{tagChips}</div>
                <ReactPlayer width="100%" url={clubInfo.videoLink ? clubInfo.videoLink : 'https://www.youtube.com/watch?v=DLzxrzFCyOs'} />
                <p style={{fontWeight: 'bold', fontSize: 'large'}}> Mission </p>
                <p> {clubInfo.mission ? clubInfo.mission : "Oops, this club hasn't written a mission yet."} </p>
                <p style={{fontWeight: 'bold', fontSize: 'large'}}> Links </p>
                <div style={{display:'flex', alignItems: 'center', alignContent: 'center'}}> 
                    <LanguageIcon />  
                    <p style={{marginLeft: 10}}> {clubInfo.url ? clubInfo.url : 'no website to show'} </p>
                </div>
                <div style={{display:'flex', alignItems: 'center', alignContent: 'center'}}> 
                    <MailOutlineIcon  style={{marginRight: 10}}/> 
                    {emailDivs}
                </div>
                <p style={{fontStyle: 'italic', color: '#4f79a7', cursor: 'pointer'}} onClick={this.sendToForm}> is this your organization? click to update information </p>
            </div>
        )
    }
}

export default withRouter(withStyles(styles, {withTheme: true})(Clubpage))