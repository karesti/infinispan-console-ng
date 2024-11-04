import * as React from 'react';
import {
  Button,
  Content,
  ContentVariants,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem
} from '@patternfly/react-core';
import {
  chart_global_warning_Color_100,
  t_global_font_size_4xl,
  t_global_spacer_md,
  t_global_spacer_sm
} from '@patternfly/react-tokens';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

/**
 * Support pop up when the user has run the server and there is no user/password to log in
 */
const Support = (props: { isModalOpen: boolean; closeModal: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const header = (
    <Stack hasGutter={true}>
      <StackItem>
        <Content component={ContentVariants.h1}>
          <ExclamationTriangleIcon
            style={{
              color: chart_global_warning_Color_100.value,
              fontSize: t_global_font_size_4xl.value,
              verticalAlign: 'middle',
              marginRight: t_global_spacer_md.value,
              marginBottom: t_global_spacer_sm.value
            }}
          />
          {t('support.no-user')}
        </Content>
      </StackItem>
      <StackItem>
        <Content>{t('support.no-user-text')}</Content>
      </StackItem>
    </Stack>
  );

  return (
    <Modal
      isOpen={props.isModalOpen}
      className="pf-m-redhat-font"
      onClose={props.closeModal}
      width={'80%'}
      disableFocusTrap={true}
    >
      <ModalHeader titleIconVariant={'info'} aria-label={t('support.no-user-label')}>
        {header}
      </ModalHeader>
      <ModalBody>
        <Content component={ContentVariants.h6}>{t('support.text-create-user')}</Content>
        <Content component={ContentVariants.pre}>{t('support.text-command')}</Content>
      </ModalBody>
      <ModalFooter>
        <Button aria-label={'Reload'} key="reload" onClick={props.closeModal}>
          {t('support.reload-button')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { Support };
