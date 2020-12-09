import React from 'react';
import Button from '@material-ui/core/Button';

import "./Home.css";

class Home extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false
        }
    }

    render() {
        return (
            <div className="background"> 
                <div className="center">
                    <p className="title"> What are you doing outside of class? </p>
                    <Button color="secondary"> login with CAS </Button>
                </div>
                
            </div>
        )
    }
}

export default Home;