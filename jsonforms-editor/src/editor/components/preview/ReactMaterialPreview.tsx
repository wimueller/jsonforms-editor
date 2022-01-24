/**
 * ---------------------------------------------------------------------
 * Copyright (c) 2021 EclipseSource Munich
 * Licensed under MIT
 * https://github.com/eclipsesource/jsonforms-editor/blob/master/LICENSE
 * ---------------------------------------------------------------------
 */
import { createAjv } from '@jsonforms/core';
import {
  materialCells,
  materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import React, { useMemo } from 'react';

import { useSchema } from '../../../core/context';
import { generateEmptyData } from '../../../core/model';
import { useExportSchema, useExportUiSchema } from '../../../core/util/hooks';
import {
  calendarDateTime,
  calendarDateTimeTester,
} from '../customRenderers/dateTimeRenderer';
import { previewOptions } from './options';

export const ReactMaterialPreview: React.FC = () => {
  const schema = useExportSchema();
  const uischema = useExportUiSchema();
  const editorSchema = useSchema();
  const previewData = useMemo(
    () => (editorSchema ? generateEmptyData(editorSchema) : {}),
    [editorSchema]
  );
  const ajv = createAjv(previewOptions);

  // added custom renderer TODO
  const renderers = [
    ...materialRenderers,
    { tester: calendarDateTimeTester, renderer: calendarDateTime },
  ];

  return (
    <JsonForms
      ajv={ajv}
      data={previewData}
      schema={schema}
      uischema={uischema}
      renderers={renderers}
      cells={materialCells}
    />
  );
};
