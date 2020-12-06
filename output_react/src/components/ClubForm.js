import { Stepper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react'

import Step1 from './Steps/Step1';
import Step2 from './Steps/Step2';
import Step3 from './Steps/Step3';

// make styles for the steps
const useStyles = makeStyles((theme) => ({
    clubRoot: {
      width: '100%',
      height: '91vh'
    },
    button: {
      marginRight: theme.spacing(1),
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
}));


function getSteps() {
    return ['Choose a Club', 'Contact Information', 'Add Information']
}

// function getStepContent(step) {
//     switch (step) {
//       case 0:
//         return getSteps();
//       case 1:
//         return <Step2/>;
//       case 2:
//         return <Step3/>;;
//       default:
//         return 'Unknown step';
//     }
//   }


// then put it all together into a form
class ClubForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: 0,
            email: ""
        }
    }

    setEmail = (value) => {
        this.setState({email: value});
    }

    handleNext = () => {
        this.setState({activeStep: this.state.activeStep + 1})
    }

    handleBack = () => {
        this.setState({activeStep: this.state.activeStep - 1})
    }

    render() {
        return (
            <div>
                <Step1 />
                {/* <Step2 setEmail={this.setEmail} handleNext={this.handleNext} /> */}
                {/* <Step3 clubName="Yale Ramona"/> */}
            </div>
        )
    }
}

export default ClubForm;