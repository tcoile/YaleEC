import React from 'react';
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
        marginBottom: '15px'
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

    render() {
        const { classes, clubInfo } = this.props;

        const tagChips = clubInfo.tags.map((tag => 
            <Chip key={tag.toString()} label={tag}></Chip>
        ))

        const emailDivs = clubInfo.contacts ? 
            clubInfo.contacts.map((contact => <p className={classes.dense}> {contact} </p>))
            : <p className={classes.dense}> no contacts yet </p> 

        return (
            <div className={classes.drawerMain}>
                <div style={{display: 'flex', alignItems: 'flex-end', alignContent: 'center'}}> 
                    <IconButton onClick={this.props.handleDrawerClose} style={{marginBlockEnd: '0.25em'}}>
                        <ChevronRightIcon/>
                    </IconButton>
                    <p className={classes.title}> {clubInfo.name} </p>
                </div>
                <div className={classes.chipDiv}>{tagChips}</div>
                <ReactPlayer width="100%" url={clubInfo.videoLink} />
                <p style={{fontWeight: 'bold', fontSize: 'large'}}> Mission </p>
                <p> {clubInfo.mission} </p>
                <p style={{fontWeight: 'bold', fontSize: 'large'}}> Links </p>
                <div style={{display:'flex', alignItems: 'center', alignContent: 'center'}}> 
                    <LanguageIcon />  
                    <p style={{marginLeft: 10}}> {clubInfo.url} </p>
                </div>
                <div style={{display:'flex', alignItems: 'center', alignContent: 'center'}}> 
                    <MailOutlineIcon  style={{marginRight: 10}}/> 
                    {emailDivs}
                </div>
            </div>
        )
    }
}

export default withStyles(styles, {withTheme: true})(Clubpage)