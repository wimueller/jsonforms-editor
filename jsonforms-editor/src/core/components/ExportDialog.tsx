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
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Cancel from '@material-ui/icons/Cancel';
import DoneIcon from '@material-ui/icons/Done';
import React, { useState } from 'react';

import { FormattedJson } from './Formatted';

// TODO callback function sends the form to the hardcoded backend
async function handleFormSendButtonClick(
  user: any,
  formName: string,
  uiSchema: any,
  formSchema: any
) {
  // // DEBUG
  // console.log(
  //   'Parameter vor saveFormRequest: User: ' +
  //     JSON.stringify(user) +
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
      userID: user.user_id,
      formName: formName,
      uiSchema: uiSchema,
      formSchema: formSchema,
      jwt: user.token,
    }),
  }).catch((e) => {
    console.error('ERROR while saving form: ' + e);
  });
  const result = await saveFormRequest.json();
  console.log('Result nach saveFromRequest: ' + JSON.stringify(result));

  if (result.hasOwnProperty('created')) {
    return { success: true };
  } else {
    return { error: true };
  }
}

async function handleLoadFormButtonClick(user: any, uuid: string) {
  const loadFormRequest: any = await fetch('http://localhost:1234/saveForm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      userID: user.user_id,
      uuid: uuid,
    }),
  }).catch((e) => {
    console.error('ERROR while saving form: ' + e);
  });
  // TODO: save form in backend
  const result = await loadFormRequest.json();
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
  user?: any;
  schema: any;
  uiSchema: any;
}
export const ExportDialog = ({
  open,
  onClose,
  user,
  schema,
  uiSchema,
}: ExportDialogProps) => {
  // state for the formNameField
  const [formNameField, setFormNameField] = useState('');
  const [formPickerSelectItem, setFormPickerSelectItem] = useState('');
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  // callback for formname textfield change
  function handleTextFieldChange(event: any) {
    setFormNameField(event.target.value);
  }

  // callback for formPickerSelectItem change
  function handleFormPickerSelectItemChange(event: any) {
    setFormPickerSelectItem(event.target.value);
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
          <Tab label='Formular an Workflow-Generator senden' />
          <Tab label='Formular aus Workflow-Generator bearbeiten' />
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
              handleFormSendButtonClick(user, formNameField, uiSchema, schema);
            }}
          >
            Formular in meinem Account abspeichern
          </Button>
        </Hidden>
        <Hidden xsUp={selectedTab !== 3}>
          <InputLabel id='form-picker-select-label'>
            Formular auswählen
          </InputLabel>
          <Select
            labelId='form-picker-select-label'
            id='form-picker-select'
            value={formPickerSelectItem}
            label='Formular auswählen'
            onChange={handleFormPickerSelectItemChange}
          >
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
          <Button
            aria-label={'Load form'}
            variant='contained'
            color='primary'
            className={classes.button}
            startIcon={<DoneIcon />}
            onClick={() => {
              handleLoadFormButtonClick(user, formNameField);
            }}
          >
            Ausgewähltes Formular in den Editor laden
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
