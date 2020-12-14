import { makeStyles } from '@material-ui/core/styles';
import React from 'react'
import {withRouter} from 'react-router-dom'

import Step1 from './Steps/Step1';
import Step2 from './Steps/Step2';
import Step3 from './Steps/Step3';

const {GoogleSpreadsheet} = require('google-spreadsheet');

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
            email: "",
            clubName: this.props.location.state.clubName ? this.props.location.state.clubName : "",
            activeClubIndex: this.props.location.state.clubName ? 0 : -1,
            activeClubInfo: {},
            allClubs: []
        }
    }

    async componentDidMount() {
        const data = await this.getData();
        /*
        sorting algorithm from Mozilla 
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        */
        data.sort(function(a, b) {
            var nameA = a.name.toUpperCase(); // ignore upper and lowercase
            var nameB = b.name.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
          
            // names must be equal
            return 0;
        });

        this.setState({allClubs: data});
        if(this.state.clubName !== "") {
            const index = this.state.allClubs.findIndex((element) => (element.name === this.state.clubName));
            console.log(index);
            this.setState({activeClubIndex: index});
        }
    }

    async getData() {
        let response = await fetch('/get_organizations', {
            mode: 'cors'
        }).catch(() => console.log("could not fetch organizations"));
        let jsonRes = await response.json().catch(() => console.log("not a valid json thing"));
        return jsonRes;
    }

    setEmail = (value) => {
        this.setState({email: value});
    }

    setClubName = (value) => {
        this.setState({clubName: value});
    }

    setParentState = (key, value) => {
        this.setState({[`${key}`]: value});
    }

    handleNext = () => {
        this.setState({activeStep: this.state.activeStep + 1})
    }

    handleBack = () => {
        this.setState({activeStep: this.state.activeStep - 1})
    }

    handleSubmit = async (value) => {
        // want to put it into a google sheets
        const doc = new GoogleSpreadsheet('1JZ5_sB8tDqOuKX4qw2abxgHDOXQMHNd03DP_7486UP0');
        await doc.useServiceAccountAuth(require('../sheetsKey.json'));
        await doc.loadInfo();
        const tagsAsString = value.tags.join(': ');
        const sheet = doc.sheetsById[179215537];
        const newObj = {
            Time: this.getCurrentDate(),
            Updater: this.state.email,
            New: (this.state.activeClubIndex < 0),
            Name: value.name,
            Mission: value.mission,
            Tags: tagsAsString,
            Youtube: value.youtube,
            Website: value.website,
            Contact: value.contact
        }
        await sheet.addRow(newObj);
    }

    // from https://phoenixnap.com/kb/how-to-get-the-current-date-and-time-javascript
    getCurrentDate() {
        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return date+' '+time;
    }

    switchSteps() {
        switch (this.state.activeStep) {
            case 0:
                return <Step1 handleNext={this.handleNext}
                            setParentState={this.setParentState}
                            clubName={this.state.clubName}
                            activeClub={this.state.activeClubIndex}
                            allClubNames={this.state.allClubs.map(club => club.name)}/>
            case 1:
                return <Step2 handleNext={this.handleNext} 
                            handleBack={this.handleBack}
                            setEmail={this.setEmail}
                            email={this.state.email}/>
            case 2:
                return <Step3 clubName={this.state.clubName}
                            clubInfo={this.state.activeClubIndex === -1 ? undefined : this.state.allClubs[this.state.activeClubIndex]}
                            handleBack={this.handleBack}
                            handleSubmit={this.handleSubmit}
                            />
            default:
                return <Step1/>
        }
    }

    render() {
        return (
            <div>
                {this.switchSteps()}
                {/* <Step2 setEmail={this.setEmail} handleNext={this.handleNext} /> */}
                {/* <Step3 clubName="Yale Ramona"/> */}
            </div>
        )
    }
}

export default withRouter(ClubForm);