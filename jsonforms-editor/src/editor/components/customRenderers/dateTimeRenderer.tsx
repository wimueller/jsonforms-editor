import {
  JsonSchema,
  ControlProps,
  isDateTimeControl,
  RankedTester,
  rankWith,
  schemaMatches,
  and,
  scopeEndsWith,
} from '@jsonforms/core';
import {
  withJsonFormsControlProps,
  withJsonFormsOneOfProps,
} from '@jsonforms/react';
import {
  MaterialDateTimeControl,
  Unwrapped,
} from '@jsonforms/material-renderers';
import { Grid, Typography } from '@material-ui/core';
import React from 'react';

interface calendarDateTimeProps {
  disabledDates: [Date];
}

export const calendarDateTime = (props: ControlProps) => {
  return (
    <div>
      <MaterialDateTimeControl {...props} />
    </div>
  );
};
export const calendarDateTimeTester = rankWith(
  3,
  scopeEndsWith('Datum & Uhrzeit')
);
export default withJsonFormsControlProps(calendarDateTime);
