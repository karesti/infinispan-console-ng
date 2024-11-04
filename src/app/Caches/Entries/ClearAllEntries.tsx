import React from 'react';
import { Button, ButtonVariant, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useCacheDetail } from '@app/services/cachesHook';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';

/**
 * Clear all entries modal
 */
const ClearAllEntries = (props: { cacheName: string; isModalOpen: boolean; closeModal: () => void }) => {
  const { addAlert } = useApiAlert();
  const { reload } = useCacheDetail();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const onClickClearAllEntriesButton = () => {
    ConsoleServices.caches()
      .clear(props.cacheName)
      .then((actionResponse) => {
        addAlert(actionResponse);
        reload();
      });
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label={t('caches.entries.modal-clear-label')}
    >
      <ModalHeader titleIconVariant={'warning'} title={t('caches.entries.modal-clear-title')} />
      <ModalBody>
        <Content component={'p'}>
          {t('caches.entries.modal-clear-body-line-one')} <strong>{props.cacheName}</strong>.
        </Content>
        <Content component={'p'}>{t('caches.entries.modal-clear-body-line-two')}</Content>
      </ModalBody>
      <ModalFooter>
        <Button
          data-cy="deleteButton"
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={onClickClearAllEntriesButton}
        >
          {t('caches.entries.modal-clear-button-click')}
        </Button>
        <Button data-cy="cancelButton" key="cancel" variant="link" onClick={props.closeModal}>
          {t('caches.entries.modal-button-cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { ClearAllEntries };
