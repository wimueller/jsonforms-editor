/**
 * ---------------------------------------------------------------------
 * Copyright (c) 2021 EclipseSource Munich
 * Licensed under MIT
 * https://github.com/eclipsesource/jsonforms-editor/blob/master/LICENSE
 * ---------------------------------------------------------------------
 */
// @ts-nocheck
import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CheckBox from '@material-ui/core/Checkbox';
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
import React, { useCallback, useEffect, useState } from 'react';

import { EditorContextInstance } from '../context/context';
import { Actions } from '../model';
import { EditorAction } from '../model/actions';
import { FormattedJson } from './Formatted';

// TODO callback function sends the form to the hardcoded backend
async function handleFormSendButtonClick(
  user: any,
  formName: string,
  uiSchema: any,
  formSchema: any,
  publish: boolean,
  usersThatCanFillOut: [string],
  usersThatCanViewFilledOut: [string],
  onClose: any
) {
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

  console.error('Publish bool im jsonforms editor:', publish);

  // check response for created property
  if (result.hasOwnProperty('created')) {
    // check if the form should be published now
    if (publish) {
      // save the uuid created by the backend
      const createdFormUUID = result.formID;
      // mark the form as published
      const publishFormRequest: any = await fetch(
        'http://localhost:1234/publishForm',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            userID: user.user_id,
            formName: formName,
            jwt: user.token,
            formTemplateUUID: createdFormUUID,
            usersThatCanFillOut: usersThatCanFillOut,
            usersThatCanViewFilledOut: usersThatCanViewFilledOut,
          }),
        }
      ).catch((e) => {
        console.error('ERROR while publishing form: ' + e);
      });
      const publishFormResult = await publishFormRequest.json();
      // check response for created property
      if (publishFormResult.hasOwnProperty('created')) {
        // close the panel
        onClose();
        return { success: true };
      }
    }
  } else {
    return { error: true };
  }
}

async function handleLoadFormButtonClick(
  user: any,
  selectObject: any,
  dispatch: any,
  onclose: any
) {
  const loadFormRequest: any = await fetch('http://localhost:1234/loadForm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      jwt: user.token,
      uuid: selectObject,
    }),
  }).catch((e) => {
    console.error('ERROR while loading form: ' + e);
  });
  var loadedForm = null;
  try {
    loadedForm = await loadFormRequest.json();
  } catch (error) {
    console.error('Loading form failed: ', error);
  }
  console.error('handleLoadFormButtonClick loadedForm: ', loadedForm);
  // set the schema in the editor context
  dispatch(Actions.setSchemas(loadedForm.dataSchema, loadedForm.uiSchema));
  // close the panel
  onclose();
}

// load all forms accessible by the logged in user
async function loadSelectFormElements(user: any) {
  const receivedFormsRequest: any = await fetch(
    'http://localhost:1234/getFormIDs',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        userID: user.user_id,
      }),
    }
  ).catch((e) => {
    console.error('ERROR while saving form: ' + e);
  });
  const receivedFormObjects: [any] = await receivedFormsRequest.json();

  return receivedFormObjects;
}

// load all users(id and name), that are registered at the workflow-generator
async function loadUserSelectComponents(user: any) {
  const receivedUsersRequest: any = await fetch(
    'http://localhost:1234/loadUsers',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        jwt: user.token,
      }),
    }
  );
  const receivedUserObjects: [any] = await receivedUsersRequest.json();

  return receivedUserObjects;
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
  const [userPickerCanViewSelectItem, setUserPickerCanViewSelectItem] =
    useState([]);
  const [userPickerFillOutSelectItem, setuserPickerFillOutSelectItem] =
    useState([]);
  const [publishChecked, setPublishChecked] = useState(false);
  const [saveButtonText, setSaveButtonText] = useState(
    'Formular in meinem Account abspeichern'
  );
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };
  // stores the list of available forms
  const [selectComponents, setSelectComponents] = useState(null);
  // stores the list of users with IDs
  const [userSelectComponents, setUserSelectComponents] = useState([]);

  async function fetchSelectFormElements() {
    let formObject = await loadSelectFormElements(user);
    setSelectComponents(formObject);
  }

  async function fetchSelectUserElements() {
    var users = await loadUserSelectComponents(user);
    setUserSelectComponents(users);
  }

  function renderSelectMenuItems() {
    let output = [];
    if (selectComponents == null) {
      return <MenuItem value='loading'>Lädt</MenuItem>;
    }
    let keys = Object.keys(selectComponents);
    for (let key of keys) {
      const selectComponent = selectComponents[key];
      output.push(
        <MenuItem key={key} value={selectComponent.uuid}>
          {selectComponent.name}
        </MenuItem>
      );
    }
    return output;
  }

  function renderUserSelectMenuItems() {
    let output = [];
    if (userSelectComponents == null) {
      return <MenuItem value='loading'>Lädt</MenuItem>;
    }
    userSelectComponents.forEach((user) => {
      var userid = Object.keys(user)[0];
      output.push(
        <MenuItem key={userid} value={userid}>
          {user[userid]}
        </MenuItem>
      );
    });
    return output;
  }

  function renderSelectForm() {
    return (
      <Select
        key={JSON.stringify(selectComponents)}
        labelId='form-picker-select-label'
        id='form-picker-select'
        value={formPickerSelectItem}
        label='Formular auswählen'
        onChange={handleFormPickerSelectItemChange}
      >
        {renderSelectMenuItems()}
      </Select>
    );
  }

  function renderUsersCanViewSelect() {
    return (
      <Select
        key={JSON.stringify(userSelectComponents) + 'canView'}
        labelId='user-picker-canview-select-label'
        id='user-picker-canview-select'
        value={userPickerCanViewSelectItem}
        label='Nutzer auswählen, die Ergebnisse einsehen können'
        multiple={true}
        onChange={handleUserPickerCanViewSelectItemChange}
      >
        {renderUserSelectMenuItems()}
      </Select>
    );
  }

  function renderUsersCanFillOutSelect() {
    return (
      <Select
        key={JSON.stringify(userSelectComponents) + 'canFillOut'}
        labelId='user-picker-fillout-select-label'
        id='user-picker-fillout-select'
        value={userPickerFillOutSelectItem}
        label='Nutzer auswählen, die Ergebnisse einsehen können'
        multiple={true}
        onChange={handleUserPickerFillOutSelectItemChange}
      >
        {renderUserSelectMenuItems()}
      </Select>
    );
  }

  // useEffect to load the users forms
  useEffect(() => {
    fetchSelectFormElements();
    fetchSelectUserElements();
  }, []);

  // callback for formname textfield change
  function handleTextFieldChange(event: any) {
    setFormNameField(event.target.value);
  }

  // callback for publish Checkbox state
  function handlePublishCheckBoxChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setPublishChecked(event.target.checked);
    if (event.target.checked) {
      setSaveButtonText(
        'Formular in meinem Account abspeichern & veröffentlichen'
      );
    } else {
      setSaveButtonText('Formular in meinem Account abspeichern');
    }
  }

  // callback for formPickerSelectItem change
  function handleFormPickerSelectItemChange(event: any) {
    setFormPickerSelectItem(event.target.value);
  }

  // callback for userPickerSelectItem change
  function handleUserPickerCanViewSelectItemChange(event: any) {
    console.error('Event target value handle User: ', event.target.value);
    setUserPickerCanViewSelectItem(event.target.value);
  }

  // callback for userPickerFillOutSelectItemChange change
  function handleUserPickerFillOutSelectItemChange(event: any) {
    setuserPickerFillOutSelectItem(event.target.value);
  }

  return (
    <EditorContextInstance.Consumer>
      {({ dispatch }) => (
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
              <Tab label='Formular abspeichern' />
              <Tab label='Formular zur Bearbeitung laden' />
            </Tabs>
            <Hidden xsUp={selectedTab !== 0}>
              <TextField
                id='form-name-input'
                label='Name des Formulars: '
                variant='standard'
                value={formNameField}
                onChange={handleTextFieldChange}
              />
              <br />
              <label>Formular sofort veröffentlichen?</label>
              <CheckBox
                id='publishFormCheckBox'
                checked={publishChecked}
                onChange={handlePublishCheckBoxChange}
              />
              <br />
              <Hidden xsUp={!publishChecked}>
                <label>
                  Welche Nutzer sollen das Formular ausfüllen dürfen?
                </label>
                <br />
                {renderUsersCanFillOutSelect()}
                <br />
                <label>
                  Welche Nutzer sollen die Ergebnisse einsehen dürfen?
                </label>
                <br />
                {renderUsersCanViewSelect()}
                <br />
              </Hidden>
              <Button
                aria-label={'Save form'}
                variant='contained'
                color='primary'
                className={classes.button}
                startIcon={<DoneIcon />}
                onClick={() => {
                  handleFormSendButtonClick(
                    user,
                    formNameField,
                    uiSchema,
                    schema,
                    publishChecked,
                    userPickerCanViewSelectItem,
                    userPickerCanViewSelectItem,
                    onClose
                  );
                }}
              >
                {saveButtonText}
              </Button>
            </Hidden>
            <Hidden xsUp={selectedTab !== 1}>
              <InputLabel id='form-picker-select-label'>
                Formular auswählen
              </InputLabel>
              {renderSelectForm()}
              <Button
                aria-label={'Load form'}
                variant='contained'
                color='primary'
                className={classes.button}
                startIcon={<DoneIcon />}
                onClick={() => {
                  handleLoadFormButtonClick(
                    user,
                    formPickerSelectItem,
                    dispatch,
                    onClose
                  );
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
      )}
    </EditorContextInstance.Consumer>
  );
};
