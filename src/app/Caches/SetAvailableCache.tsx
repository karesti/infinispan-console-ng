import React from 'react';
import { Button, Modal, Content, ModalHeader, ModalBody, ModalFooter } from '@patternfly/react-core';
import { useCaches } from '@app/services/dataContainerHooks';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { useSetAvailableCache } from '@app/services/cachesHook';

/**
 * Set Available cache modal
 */
const SetAvailableCache = (props: { cacheName: string; isModalOpen: boolean; closeModal: (boolean) => void }) => {
  const { reloadCaches } = useCaches();
  const { onSetAvailable } = useSetAvailableCache(props.cacheName);
  const { t } = useTranslation();

  const clearSetAvailableCacheModal = (setAvailableDone: boolean) => {
    props.closeModal(setAvailableDone);
  };

  const handleAvailableButton = () => {
    if (props.cacheName) {
      onSetAvailable();
      clearSetAvailableCacheModal(true);
      reloadCaches();
    }
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={() => clearSetAvailableCacheModal(false)}
      aria-label="make-cache-available"
    >
      <ModalHeader titleIconVariant={CheckCircleIcon} title={t('caches.availability.modal-available-title')} />
      <ModalBody>
        <Content>
          <strong>{`'${props.cacheName}'`}</strong> {t('caches.availability.modal-available-description')}
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button aria-label="Confirm" key="available" onClick={handleAvailableButton}>
          {t('caches.availability.modal-available-button-done')}
        </Button>
        <Button aria-label="Cancel" key="cancel" variant="link" onClick={() => clearSetAvailableCacheModal(false)}>
          {t('caches.availability.modal-available-button-cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { SetAvailableCache };
