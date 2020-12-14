import React from 'react';
import StarIcon from '@material-ui/icons/Star';
import Button from '@material-ui/core/Button';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    stepDiv: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        paddingTop: 80,
    }
  }));

export default function Step4() {
    const classes = useStyles(); 
    return(
        <div className={classes.stepDiv}>
            <StarIcon color="secondary"/>
            <p style={{fontSize: 20, fontWeight: 'bold'}}> Your information has been submitted! </p>
            <p style={{marginBottom: 20}}> Thank you for updating your group's club page. Our admin will review and approve updates soon. </p>
            <Button href='explore' color="secondary"> keep exploring </Button>
        </div>
    )
}