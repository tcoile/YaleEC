import React from 'react'
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
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
            clubName: '',
            allClubNames: [],
            blankName: false,
            chooseOrg: true
        }
    }

    async componentDidMount() {
        const data = await this.getData();
        // then set the state using all names
        let allClubNames = []
        for(let i = 0; i < data.length; i++) {
            allClubNames.push(data[i].name);
        }
        this.setState({allClubNames: allClubNames})
    }

    async getData() {
        let response = await fetch('/get_organizations', {
            mode: 'cors'
        }).catch(() => console.log("could not fetch organizations"));
        let jsonRes = await response.json().catch(() => console.log("not a valid json thing"));
        return jsonRes;
    }

    handleChange = (event) => {
        this.setState({clubName: event.target.value})
    }

    handleTextChange = (event) => {
        if(event.target.value === "") {
            this.setState({blankName: true})
        } else {
            this.setState({blankName: false})
        }
        this.setState({clubName: event.target.value})
    }

    toggleView = () => {
        this.setState({chooseOrg: !this.state.chooseOrg});
    }

    render() {
        const { classes }  = this.props;
        const chooseOrg = (
            <div>
                <h3> Choose Your Organization </h3>
                <Select variant="outlined" value={this.state.clubName} onChange={this.handleChange}>
                    {this.state.allClubNames.map((name) => (
                        <MenuItem key={name} value={name} style={{fontWeight: 'medium'}}>
                        {name}
                        </MenuItem>
                    ))}
                </Select> 
                <p style={{fontStyle: 'italic', color: '#4f79a7'}} onClick={this.toggleView}> or register a new organization </p>
            </div>
        )

        const newOrg = (
            <div>
                <h3> New Organization Name </h3>
                <TextField required error={this.state.blankName} onChange={this.state.handleNewChange} variant="outlined"></TextField>
                <p style={{fontStyle: 'italic', color: '#4f79a7'}} onClick={this.toggleView}> or choose an existing organization </p>
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
                        <Button variant="contained" style={{backgroundColor: '#4f79a7', color: 'white'}}> next </Button>
                    </div>
                </div>
            </div>
        )
    }

}

export default withStyles(styles, {withTheme: true})(Step1);