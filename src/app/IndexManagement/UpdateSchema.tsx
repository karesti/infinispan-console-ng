import React from 'react';
import { Button, ButtonVariant, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';

/**
 * Update schema modal
 */
const UpdateSchema = (props: { cacheName: string; isModalOpen: boolean; closeModal: () => void }) => {
  const { t } = useTranslation();
  const { addAlert } = useApiAlert();

  const onClickPurgeButton = () => {
    ConsoleServices.search()
      .updateSchema(props.cacheName)
      .then((actionResponse) => {
        props.closeModal();
        addAlert(actionResponse);
      });
  };

  return (
    <Modal variant={'small'} isOpen={props.isModalOpen} onClose={props.closeModal} aria-label="update schema modal">
      <ModalHeader titleIconVariant={'info'} title={t('caches.index.update-schema.title')} />
      <ModalBody>
        <Content component={'p'}>{t('caches.index.update-schema.description1')}</Content>
        <Content component={'p'}>{t('caches.index.update-schema.description2')}</Content>
      </ModalBody>
      <ModalFooter>
        <Button data-cy="updateCacheSchema" key="purge" variant={ButtonVariant.primary} onClick={onClickPurgeButton}>
          {t('common.actions.update')}
        </Button>
        <Button data-cy="cancelButton" key="cancel" variant="link" onClick={props.closeModal}>
          {t('common.actions.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { UpdateSchema };
