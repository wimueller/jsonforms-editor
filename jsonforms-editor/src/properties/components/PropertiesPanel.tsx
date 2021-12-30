/**
 * ---------------------------------------------------------------------
 * Copyright (c) 2021 EclipseSource Munich
 * Licensed under MIT
 * https://github.com/eclipsesource/jsonforms-editor/blob/master/LICENSE
 * ---------------------------------------------------------------------
 */
import { JsonFormsRendererRegistryEntry } from '@jsonforms/core';
import { Typography } from '@material-ui/core';
import React from 'react';

import { Properties } from './Properties';

export interface PropertiesPanelProps {
  propertyRenderers: JsonFormsRendererRegistryEntry[];
}
export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  propertyRenderers,
}) => {
  return (
    <>
      <Typography variant='h6' color='inherit' noWrap>
        Baustein-Eigenschaften
      </Typography>
      <Properties propertyRenderers={propertyRenderers} />
    </>
  );
};
