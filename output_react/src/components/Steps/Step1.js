import React from 'react'
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Input from '@material-ui/core/Input';
import DividerWithText from './DividerWithText.js';
import { withStyles } from '@material-ui/core/styles';


const styles = (theme) => ({
    root: {
        width: '100%',
        ...theme.typography.body2,
        '& > * + *': {
          marginTop: theme.spacing(2),
        },
    },
})

class Step1 extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            oldClubName: this.props.activeClub === -1 ? undefined : this.props.clubName,
            newClubName: this.props.activeClub === -1 ? this.props.clubName : '',
            blankName: false,
            chooseOrg: this.props.activeClub === -1 ? false : true
        }
    }

    handleChooseChange = (event, newValue) => {
        this.setState({oldClubName: newValue})
    }

    handleTextChange = (event) => {
        if(event.target.value === "") {
            this.setState({blankName: true})
        } else {
            this.setState({blankName: false})
        }
        this.setState({newClubName: event.target.value})
    }

    toggleView = () => {
        this.setState({chooseOrg: !this.state.chooseOrg});
    }

    nextDisabled() {
        if((this.state.chooseOrg && (this.state.oldClubName === "" || this.state.oldClubName === undefined)) || (!this.state.chooseOrg && this.state.newClubName === "")) {
            return true;
        }
        return false;
    }

    handleNext = () => {
        let clubName = ""
        if(this.state.chooseOrg) {
            clubName = this.state.oldClubName;
        } else {
            clubName = this.state.newClubName;
        }
        this.props.setParentState("activeClubIndex", this.props.allClubNames.indexOf(this.state.oldClubName))
        this.props.setParentState("clubName", clubName);
        this.props.handleNext();
    }

    render() {
        const { classes }  = this.props;
        const chooseOrg = (
            <div>
                <h3> Choose Your Organization </h3>
                <Autocomplete
                    onChange={this.handleChooseChange}
                    options={this.props.allClubNames}
                    defaultValue={this.props.activeClub === -1 ? undefined : this.state.oldClubName}
                    style={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="Organization Name" variant="outlined" />}
                />
                <p 
                    style={{fontStyle: 'italic', color: '#4f79a7', cursor: 'pointer'}} 
                    onClick={this.toggleView}
                > 
                    or register a new organization 
                </p>
            </div>
        )

        const newOrg = (
            <div>
                <h3> New Organization Name </h3>
                <TextField 
                    required 
                    error={this.state.blankName} 
                    defaultValue={this.props.activeClub === -1 ? this.props.clubName : ''} 
                    onChange={this.handleTextChange} 
                    variant="outlined" >
                </TextField>
                <p style={{fontStyle: 'italic', color: '#4f79a7', cursor: 'pointer'}} onClick={this.toggleView}> or choose an existing organization </p>
            </div>
        )
        let inputDiv;
        if(this.state.chooseOrg) {
            inputDiv = chooseOrg;
        } else {
            inputDiv = newOrg;
        }
        return(
            <div>
                <div style={{width: '50vw', marginLeft: '25vw', paddingTop: 20}}>
                    {inputDiv}
                    <div style={{display: 'flex', justifyContent: 'flex-end', width: '50vw', marginTop: 30}}>
                        <Button variant="contained" 
                        style={{backgroundColor: this.nextDisabled() ? 'lightgrey' : '#4f79a7', color: 'white'}}
                        onClick={this.handleNext}
                        disabled={this.nextDisabled()}
                        > 
                        next 
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

}

export default withStyles(styles, {withTheme: true})(Step1);