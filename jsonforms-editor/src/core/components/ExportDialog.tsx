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
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };
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
          />
          <br />
          <Button
            aria-label={'Save form'}
            variant='contained'
            color='primary'
            className={classes.button}
            startIcon={<DoneIcon />}
            onClick={onClose}
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
