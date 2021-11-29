/**
 * ---------------------------------------------------------------------
 * Copyright (c) 2021 EclipseSource Munich
 * Licensed under MIT
 * https://github.com/eclipsesource/jsonforms-editor/blob/master/LICENSE
 * ---------------------------------------------------------------------
 */
import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Hidden from '@material-ui/core/Hidden';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Cancel from '@material-ui/icons/Cancel';
import DoneIcon from '@material-ui/icons/Done';
import React, { useState } from 'react';

import { FormattedJson } from './Formatted';

// TODO callback function sends the form to the hardcoded backend
async function handleFormSendButtonClick(
  userID: string,
  formName: string,
  uiSchema: any,
  formSchema: any
) {
  // // DEBUG
  // console.log(
  //   'Parameter vor saveFormRequest: UserID: ' +
  //     JSON.stringify(userID) +
  //     ' formName: ' +
  //     JSON.stringify(formName) +
  //     ' uischema: ' +
  //     JSON.stringify(uiSchema) +
  //     ' formSchema: ' +
  //     JSON.stringify(formSchema)
  // );

  const saveFormRequest: any = await fetch('http://localhost:1234/saveForm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      userID: userID,
      formName: formName,
      uiSchema: uiSchema,
      formSchema: formSchema,
    }),
  }).catch((e) => {
    console.error('ERROR while saving form: ' + e);
  });
  // TODO: save form in backend
  const result = await saveFormRequest.json();
  console.log('Result nach saveFromRequest: ' + JSON.stringify(result));

  if (result.hasOwnProperty('created')) {
    return { success: true };
  } else {
    return { error: true };
  }
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1),
    },
    title: {
      textAlign: 'center',
    },
    content: {
      maxHeight: '90vh',
      height: '90vh',
    },
  })
);

export interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  userID?: string;
  schema: any;
  uiSchema: any;
}
export const ExportDialog = ({
  open,
  onClose,
  userID,
  schema,
  uiSchema,
}: ExportDialogProps) => {
  // state for the formNameField
  const [formNameField, setFormNameField] = useState('');
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  // callback for formname textfield change
  function handleTextFieldChange(event: any) {
    setFormNameField(event.target.value);
  }

  return (
    <Dialog
      open={open}
      keepMounted
      onClose={onClose}
      aria-labelledby='export-dialog-title'
      aria-describedby='export-dialog-description'
      maxWidth='md'
      fullWidth
    >
      <DialogTitle className={classes.title} id='export-dialog-title'>
        {'Export'}
      </DialogTitle>
      <DialogContent className={classes.content}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label='Schema' />
          <Tab label='UI Schema' />
          <Tab label='Workflow Generator Anbindung' />
        </Tabs>
        <Hidden xsUp={selectedTab !== 0}>
          <FormattedJson object={schema} />
        </Hidden>
        <Hidden xsUp={selectedTab !== 1}>
          <FormattedJson object={uiSchema} />
        </Hidden>
        <Hidden xsUp={selectedTab !== 2}>
          <TextField
            id='form-name-input'
            label='Name des Formulars: '
            variant='standard'
            value={formNameField}
            onChange={handleTextFieldChange}
          />
          <br />
          <Button
            aria-label={'Save form'}
            variant='contained'
            color='primary'
            className={classes.button}
            startIcon={<DoneIcon />}
            onClick={() => {
              // TODO: HANDLE TYPEGUARD ERROR
              if (typeof userID === 'string') {
                handleFormSendButtonClick(
                  userID,
                  formNameField,
                  uiSchema,
                  schema
                );
              }
            }}
          >
            Formular in meinem Account abspeichern
          </Button>
        </Hidden>
      </DialogContent>
      <DialogActions>
        <Button
          aria-label={'Close'}
          variant='contained'
          color='primary'
          className={classes.button}
          startIcon={<Cancel />}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
