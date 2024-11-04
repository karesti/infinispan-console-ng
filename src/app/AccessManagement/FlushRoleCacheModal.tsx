import React from 'react';
import { Button, ButtonVariant, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useFlushCache } from '@app/services/rolesHook';

const FlushRoleCacheModal = (props: { isModalOpen: boolean; submitModal: () => void; closeModal: () => void }) => {
  const { t } = useTranslation();
  const { onFlushCache } = useFlushCache(props.submitModal);

  return (
    <Modal
      id={'flush-cache-modal'}
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label="modal-flush-cache"
      disableFocusTrap={true}
    >
      <ModalHeader titleIconVariant={'warning'} title={t('access-management.modal-flush-cache-title')} />
      <ModalBody></ModalBody>
      <ModalFooter>
        <Button
          key={'Flush'}
          aria-label={'Flush'}
          variant={ButtonVariant.warning}
          onClick={() => {
            onFlushCache();
          }}
        >
          {t('access-management.flush-cache-action')}
        </Button>
        <Button key={'Cancel'} aria-label={'Cancel'} variant={ButtonVariant.link} onClick={props.closeModal}>
          {t('common.actions.cancel')}
        </Button>
      </ModalFooter>
      <Content component={'p'}>{t('access-management.modal-flush-cache-description')}</Content>
    </Modal>
  );
};

export { FlushRoleCacheModal };
