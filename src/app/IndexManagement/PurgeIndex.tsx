import React from 'react';
import { Button, ButtonVariant, Modal, Content, ModalHeader, ModalFooter, ModalBody } from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';

/**
 * Purge index modal
 */
const PurgeIndex = (props: { cacheName: string; isModalOpen: boolean; closeModal: () => void }) => {
  const { t } = useTranslation();
  const { addAlert } = useApiAlert();

  const onClickPurgeButton = () => {
    ConsoleServices.search()
      .purgeIndexes(props.cacheName)
      .then((actionResponse) => {
        props.closeModal();
        addAlert(actionResponse);
      });
  };

  return (
    <Modal variant={'small'} isOpen={props.isModalOpen} onClose={props.closeModal} aria-label="Clear index modal">
      <ModalHeader titleIconVariant={'warning'} title={t('caches.index.purge.title')} />
      <ModalBody>
        <Content>
          {t('caches.index.purge.description1')} <strong>{props.cacheName}</strong>{' '}
          {t('caches.index.purge.description2')}
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button data-cy="clearIndex" key="purge" variant={ButtonVariant.danger} onClick={onClickPurgeButton}>
          {t('common.actions.clear')}
        </Button>
        <Button data-cy="cancelButton" key="cancel" variant="link" onClick={props.closeModal}>
          {t('common.actions.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { PurgeIndex };
