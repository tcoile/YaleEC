import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
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

const tags = ['AAAC Affiliate Org', 
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
            clubTags: this.props.clubInfo ? this.props.clubInfo.tags : [],
            mission: (this.props.clubInfo ? this.props.clubInfo.mission : ''),
            website: (this.props.clubInfo ? this.props.clubInfo.website : ''),
            youtube: (this.props.clubInfo ? this.props.clubInfo.youtube : ''),
            contact: (this.props.clubInfo ? this.props.clubInfo.contact : ''),
        };
    }

    // changes state 
    handleChange = (event) => {
        this.setClubTag(event.target.value);
    };

    setClubTag(value) {
        this.setState({clubTags: value})
    }

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

    handleDelete = (chip) => {
        console.log(chip);
    }

    handleSubmit = () => {
        const clubInfo = {
            name: this.props.clubName,
            mission: this.state.mission,
            tags: this.state.clubTags,
            website: this.state.website,
            youtube: this.state.youtube,
            contact: this.state.contact
        }
        this.props.handleSubmit(clubInfo);
    }

    render() {    
        const { classes } = this.props;
        return (
            <div className={classes.stepRoot}>
                <p className={classes.title}> {this.props.clubName} </p>
                <h3 style={{marginBottom: 0}}> Tags </h3>
                <FormControl className={classes.formControl}>
                    <Select
                        multiple
                        value={this.state.clubTags}
                        onChange={this.handleChange}
                        input={<Input id="select-multiple-chip" />}
                        variant="outlined"
                        renderValue={(selected) => (
                            <div className={classes.chips} ref={this.wrapper}>
                            {selected.map((value) => (
                                <Chip 
                                    key={value} 
                                    label={value} 
                                    className={classes.chip} 
                                    // onDelete={() => this.handleDelete(value)} 
                                    // onMouseDown={(event) => {
                                    // event.stopPropagation();}}
                                />
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
                    onChange={(event) => this.setState({mission: event.target.value})}
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
                        {/* youtube link */}
                        <TextField 
                            style={{width: 300}} 
                            value={this.state.youtube}
                            variant="standard" size="small" 
                            className={classes.linkText}
                            onChange={(event) => this.setState({youtube: event.target.value})}
                        >   
                        </TextField>
                        <div>
                            {/* website */}
                            <TextField 
                                style={{marginRight: 5, width: 300}} 
                                value={this.state.website}
                                variant="standard" size="small" 
                                className={classes.linkText} 
                                onChange={(event) => this.setState({website: event.target.value})}
                                ></TextField>
                            {/* <TextField defaultValue={this.state.email} variant="standard" size="small" className={classes.linkText}></TextField> */}
                        </div>                        
                        <div>
                            <TextField 
                                style={{marginRight: 5}} 
                                value={this.state.contact} 
                                variant="standard" size="small"
                                className={classes.linkText}
                                onChange={(event) => this.setState({contact: event.target.value})}
                            ></TextField>
                            {/* <TextField defaultValue={this.state.email} variant="standard" size="small" className={classes.linkText}></TextField> */}
                        </div>
                    </div>
                </div>
                <div style={{display: 'flex', justifyContent: 'flex-end', width: '50vw', marginTop: 30}}>
                    <Button style={{marginRight: 20}} onClick={this.props.handleBack}> back </Button>
                    <Button variant="contained" style={{backgroundColor: '#4f79a7', color: 'white'}} onClick={this.handleSubmit}> submit </Button>
                </div>
            </div>
        )
    }
}

export default withStyles(styles, {withTheme: true})(Step3)