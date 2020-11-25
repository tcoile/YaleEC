import React from 'react';
import { Redirect } from 'react-router-dom';
import {auth, provider} from "../firebase";
import Button from '@material-ui/core/Button';

class Login extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false
        }
    }

    signIn() {
        auth.signInWithPopup(provider)
            .then((result) => {
                var user = result.user;
                console.log(user.displayName);
                this.setState({loggedIn: true});
            })
            .catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode, errorMessage);
            });
    };

    signOut() {
        auth.signOut()
            .then(() => {
                this.setState({loggedIn: false});
            })
            .catch(function(error) {
                console.log(error.code, error.message);
            })
    };

    render() {
        let button; 
        if(this.state.loggedIn) {
            button = <div> 
                <Button style={{color: "white"}} onClick={() => this.signOut()}> 
                    sign out 
                </Button> 
                <Redirect to="/data" /> 
                </div>
        } else {
            button = <div> 
                <Button style={{color: "white"}} onClick={() => this.signIn()}> Sign in with Google </Button>
                <Redirect to="/" /> 
            </div>
        }
        return(
            button
        )
    }
}

export default Login;