import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class Step2 extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            noEmail: this.props.email !== "" ? false : undefined
        }
    }

    handleChange(event) {
        if(event.target.value === "") {
            this.setState({noEmail: true})
        } else {
            this.setState({noEmail: false})
        }
        this.props.setEmail(event.target.value);
    }

    nextDisabled() {
        return this.state.noEmail !== false;
    }

    render() {
        return(
            <div>
                <div style={{width: '50vw', marginLeft: '25vw', paddingTop: 20}}>
                    <h3> Please provide a contact email </h3>
                    <TextField label="Contact Email" 
                        fullWidth 
                        onChange={(event) => this.handleChange(event)} 
                        required 
                        error={this.state.noEmail}
                        defaultValue={this.props.email}
                    >
                    </TextField>
                    <div style={{display: 'flex', justifyContent: 'flex-end', width: '50vw', marginTop: 30}}>
                        <Button style={{marginRight: 20}} onClick={this.props.handleBack}> back </Button>
                        <Button variant="contained" style={{backgroundColor: this.nextDisabled() ? 'lightgrey' : '#4f79a7', color: 'white'}} disabled={this.nextDisabled()} onClick={() => this.props.handleNext()}> next </Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default Step2