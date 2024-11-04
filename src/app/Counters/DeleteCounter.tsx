import React from 'react';
import { Button, ButtonVariant, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { useDeleteCounter } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';

/**
 * Delete counter modal
 */
const DeleteCounter = (props: {
  name: string;
  isModalOpen: boolean;
  submitModal: () => void;
  closeModal: () => void;
  isDisabled: boolean;
}) => {
  const { t } = useTranslation();

  const { onDelete } = useDeleteCounter(props.name);

  return (
    <Modal
      id={'delete-counter-modal'}
      className="pf-m-redhat-font"
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label={t('cache-managers.counters.modal-delete-title')}
      disableFocusTrap={true}
    >
      <ModalHeader titleIconVariant={'warning'} title={t('cache-managers.counters.modal-delete-title')} />
      <ModalBody>
        <Content component={'p'}>{t('cache-managers.counters.modal-delete-content')}</Content>
      </ModalBody>

      <ModalFooter>
        <Button
          data-cy="deleteCounterButton"
          key={t('cache-managers.counters.modal-confirm-button')}
          aria-label={'Confirm'}
          variant={ButtonVariant.danger}
          onClick={() => {
            onDelete();
            props.submitModal();
          }}
          isDisabled={props.isDisabled}
        >
          {t('cache-managers.counters.delete-action')}
        </Button>
        <Button
          key={'Cancel'}
          aria-label={'Cancel'}
          variant={ButtonVariant.link}
          onClick={props.closeModal}
          data-cy="cancelCounterDeleteButton"
        >
          {t('cache-managers.counters.modal-cancel-button')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { DeleteCounter };
