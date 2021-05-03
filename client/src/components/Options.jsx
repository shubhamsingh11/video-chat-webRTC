import React from 'react';
import { Button , TextField , Grid , Typography , Container , Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

const Options = ({children}) => {
    return(
        <div>
            Options 
            {children}       
        </div>
    )
}

export default Options;