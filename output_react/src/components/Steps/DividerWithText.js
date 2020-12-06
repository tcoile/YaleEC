/*
a divider with text in between from user DiaMaBo 
at https://stackoverflow.com/questions/61730527/react-create-a-horizontal-divider-with-text-in-between
*/

import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    alignItems: "center",
    marginTop: 15
  },
  border: {
    borderBottom: "1px solid lightgrey",
    width: "100%"
  },
  content: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    fontWeight: 400,
    fontSize: 16,
    color: 'grey'
  }
}));

const DividerWithText = ({ children }) => {
 const classes = useStyles();
 return (
  <div className={classes.container}>
    <div className={classes.border} />
    <span className={classes.content}>{children}</span>
    <div className={classes.border} />
  </div>
 );
};
export default DividerWithText;