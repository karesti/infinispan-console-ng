import displayUtils from '@services/displayUtils';
import {
  t_global_font_size_md,
  t_global_font_size_sm,
  t_global_spacer_sm,
  t_global_spacer_xs
} from '@patternfly/react-tokens';
import { Label } from '@patternfly/react-core';
import React from 'react';
import { CacheType } from '@services/infinispanRefData';

const CacheTypeBadge = (props: { cacheType: string; small: boolean; cacheName: string }) => {
  const cacheTypeEnum = CacheType[props.cacheType];

  return (
    <Label
      data-cy={`type-${props.cacheName}`}
      color={displayUtils.cacheTypeColor(cacheTypeEnum)}
      style={{
        fontSize: props.small ? t_global_font_size_sm.value : t_global_font_size_md.value,
        fontWeight: 'lighter',
        padding: t_global_spacer_xs.value,
        paddingRight: t_global_spacer_sm.value,
        paddingLeft: t_global_spacer_sm.value
      }}
    >
      {props.cacheType}
    </Label>
  );
};
export { CacheTypeBadge };
