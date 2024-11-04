import React from 'react';
import { Button, ButtonVariant, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { useResetCounter } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';

/**
 * Reset counter modal
 */
const ResetCounter = (props: {
  name: string;
  isModalOpen: boolean;
  initialValue;
  submitModal: () => void;
  closeModal: () => void;
}) => {
  const { onResetCounter } = useResetCounter(props.name);
  const { t } = useTranslation();

  return (
    <Modal
      id={'reset-counter-modal'}
      className="pf-m-redhat-font"
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label={t('cache-managers.counters.modal-reset-title')}
      disableFocusTrap={true}
    >
      <ModalHeader titleIconVariant={'warning'} title={t('cache-managers.counters.modal-reset-title')} />
      <ModalBody>
        <Content component={'p'} isEditorial>
          {t('cache-managers.counters.modal-reset-content', { counter: props.name, initialValue: props.initialValue })}
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button
          data-cy="resetCounterButton"
          key={'Reset'}
          aria-label={'Reset'}
          variant={ButtonVariant.danger}
          onClick={() => {
            props.submitModal();
            onResetCounter();
          }}
        >
          {t('cache-managers.counters.reset-action')}
        </Button>
        <Button
          key={'Cancel'}
          aria-label={'Cancel'}
          variant={ButtonVariant.link}
          onClick={props.closeModal}
          data-cy="cancelCounterResetButton"
        >
          {t('cache-managers.counters.modal-cancel-button')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { ResetCounter };
