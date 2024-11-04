import React from 'react';
import { AlertVariant, Content, ContentVariants, Flex, FlexItem } from '@patternfly/react-core';
import { AlertIcon } from '@patternfly/react-core/dist/js/components/Alert/AlertIcon';
import { useTranslation } from 'react-i18next';
import { t_global_text_color_disabled, t_global_text_color_status_info_default } from '@patternfly/react-tokens';

const TracingEnabled = (props: { enabled: boolean }) => {
  const { t } = useTranslation();

  return (
    <Flex data-cy="tracingEnabled">
      <FlexItem spacer={{ default: 'spacerXs' }}>
        <AlertIcon
          variant={AlertVariant.info}
          style={{
            color: props.enabled ? t_global_text_color_status_info_default.value : t_global_text_color_disabled.value,
            display: 'inline'
          }}
        />
      </FlexItem>
      <FlexItem>
        <Content component={ContentVariants.p}>
          {props.enabled ? t('common.tracing.enabled') : t('common.tracing.disabled')}
        </Content>
      </FlexItem>
    </Flex>
  );
};
export { TracingEnabled };
