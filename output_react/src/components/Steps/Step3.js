import React from 'react'
import clsx from 'clsx';
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';


const styles = theme => ({
    stepRoot: {
        paddingTop: 10,
        marginLeft: '25vw',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        maxWidth: '50vw',
        paddingRight: 10
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
    title: {
        fontSize: 'xx-large',
        fontWeight: 'bold',
        marginBlockEnd: '0.5em'
    },
    linkText: {
        marginBlock: '0.6em',
        width: 200
    }
});

// function getStyles(name, clubTag, theme) {
//     return {
//         fontWeight:
//         clubTag.indexOf(name) === -1
//             ? theme.typography.fontWeightRegular
//             : theme.typography.fontWeightMedium,
//     };
// }

// styling for the tags dropdown
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 6 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const tags = ['AAC Affiliate Org', 
    'Academic', 
    'Administrative', 
    'Advocacy/Policy', 
    'AfAm Affiliate Org', 
    'Arts: Other', 
    'Arts: Visual Arts',
    'Cultural',
    'Cultural: Mixed Race',
    'Entrepreneurial/Business',
    'Food/Culinary',
    'Funding',
    'Games/Gaming',
    'Greek-Letter Organizations',
    'Health/Wellness',
    'International Affairs',
    'La Casa Affiliate Org',
    'Leadership',
    'LGBTQ',
    'Media/Technology',
    'Medical/Nursing/Public Health',
    'NACC Affiliate Org',
    'OISS Affiliate Org',
    'Performance: Comedy',
    'Performance: Dance',
    'Performance: Instruments',
    'Performance: Other',
    'Performance: Singing',
    'Performance: Theater',
    'Political',
    'Pre-Professional',
    'Professional',
    'Publication',
    'Religious/Spiritual',
    'Science/Technology',
    'Service/Volunteering',
    'Social',
    'Special Interest',
    'Speech/Debate',
    'Sports/Outdoors',
    'Student Government',
    'Veteran/Military']

class Step3 extends React.Component {
    constructor(props) {
        super(props);
        this.wrapper = React.createRef();
        this.state = {
            open: false,
            clubTags: [],
            mission: ''
        };
    }

    setClubTag(value) {
        this.setState({clubTags: value})
    }

    handleMissionChange = (event) => {
        this.setState({mission: event.target.value});
    }
    // changes state 
    handleChange = (event) => {
        this.setClubTag(event.target.value);
    };

    // changes state for multiple, which is what we want
    handleChangeMultiple = (event) => {
        const { options } = event.target;
        const value = [];
        for (let i = 0, l = options.length; i < l; i += 1) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        this.setClubTag(value);
    };

    handleDelete = (value) => {
        console.log(value);
    }

    render() {    
        const { classes } = this.props;
        return (
            <div className={classes.stepRoot}>
                <p className={classes.title}> Yale Ramona </p>
                <h3 style={{marginBottom: 0}}> Tags </h3>
                <FormControl className={classes.formControl}>
                    <Select
                        labelId="demo-mutiple-chip-label"
                        id="demo-mutiple-chip"
                        multiple
                        value={this.state.clubTags}
                        onChange={this.handleChange}
                        input={<Input id="select-multiple-chip" />}
                        variant="outlined"
                        renderValue={(selected) => (
                            <div className={classes.chips} ref={this.wrapper}>
                            {selected.map((value) => (
                                <Chip key={value} label={value} className={classes.chip}/>
                            ))}
                            </div>
                        )}
                        MenuProps={MenuProps}
                        >
                        {tags.map((tag) => (
                            <MenuItem key={tag} value={tag} style={{fontWeight: 'medium'}}>
                            {tag}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <h3> Mission </h3>
                <TextField
                    multiline
                    rows={4}
                    value={this.state.mission}
                    onChange={this.handleMissionChange}
                    variant="outlined"
                    style={{width: '50vw'}}
                >
                </TextField>
                <h3 style={{marginTop: 20}}> Links </h3>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <div style={{display: 'flex', flexDirection: 'column', marginRight: 30}}>
                        <p style={{marginRight: 5}}> Youtube Link </p>
                        <p style={{marginRight: 5}}> Websites </p>
                        <p style={{marginRight: 5}}> Contact Emails </p>
                        
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <TextField defaultValue={this.state.website} variant="standard" size="small" className={classes.linkText}></TextField>
                        <div>
                            <TextField style={{marginRight: 5}} defaultValue={this.state.email} variant="standard" size="small"className={classes.linkText} ></TextField>
                            <TextField defaultValue={this.state.email} variant="standard" size="small" className={classes.linkText}></TextField>
                        </div>                        <div>
                            <TextField style={{marginRight: 5}} defaultValue={this.state.email} variant="standard" size="small"className={classes.linkText} ></TextField>
                            <TextField defaultValue={this.state.email} variant="standard" size="small" className={classes.linkText}></TextField>
                        </div>
                    </div>
                </div>
                <div style={{display: 'flex', justifyContent: 'flex-end', width: '50vw', marginTop: 30}}>
                    <Button style={{marginRight: 20}}> back </Button>
                    <Button variant="contained" style={{backgroundColor: '#4f79a7', color: 'white'}}> submit </Button>
                </div>
            </div>
        )
    }
}

export default withStyles(styles, {withTheme: true})(Step3)