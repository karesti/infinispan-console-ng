import React from 'react';
import { Button, Modal, Content, ModalHeader, ModalFooter, ModalBody } from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';

/**
 * Reindex modal
 */
const Reindex = (props: { cacheName: string; isModalOpen: boolean; closeModal: () => void }) => {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const onClickReindex = () => {
    ConsoleServices.search()
      .reindex(props.cacheName)
      .then((actionResponse) => {
        props.closeModal();
        addAlert(actionResponse);
      });
  };

  return (
    <Modal variant={'small'} isOpen={props.isModalOpen} onClose={props.closeModal} aria-label="Reindex modal">
      <ModalHeader titleIconVariant={'info'} title={t('caches.index.reindex.title')} />
      <ModalBody>
        <Content component={'p'}>{t('caches.index.reindex.description1')}</Content>
        <Content component={'p'}>{t('caches.index.reindex.description2')}</Content>
      </ModalBody>
      <ModalFooter>
        <Button key="reindex" onClick={onClickReindex} data-cy="reindexButton">
          {t('caches.index.reindex.button-rebuild-index')}
        </Button>
        <Button key="cancel" variant="link" onClick={props.closeModal} data-cy="cancelReindexButton">
          {t('common.actions.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { Reindex };
