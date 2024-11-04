import { Button, ButtonVariant, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Rebalancing confirmation modal
 */
const RebalancingConfirmationModal = (props: {
  isModalOpen: boolean;
  confirmAction: () => void;
  closeModal: () => void;
  enabled: boolean;
  type: 'caches' | 'cache-managers';
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      data-cy="rebalancingModal"
      variant={'small'}
      className="pf-m-redhat-font"
      isOpen={props.isModalOpen}
      onClose={() => props.closeModal()}
      aria-label={props.enabled ? 'Disable' : 'Enable'}
    >
      <ModalHeader
        titleIconVariant={props.enabled ? 'warning' : 'info'}
        title={
          props.enabled
            ? t(props.type + '.rebalancing.modal-disable-title')
            : t(props.type + '.rebalancing.modal-enable-title')
        }
      />
      <ModalBody>
        <Content>{t(props.type + '.rebalancing.modal-description')}</Content>
      </ModalBody>

      <ModalFooter>
        <Button
          variant={props.enabled ? ButtonVariant.danger : ButtonVariant.primary}
          key={props.enabled ? 'disable-rebalancing' : 'enable-rebalancing'}
          data-cy="rebalanceChangeButton"
          onClick={props.confirmAction}
        >
          {props.enabled
            ? t(props.type + '.rebalancing.modal-disable-button')
            : t(props.type + '.rebalancing.modal-enable-button')}
        </Button>
        <Button data-cy="rebalanceChangeCancelButton" key="cancel" variant="link" onClick={props.closeModal}>
          {t(props.type + '.rebalancing.modal-cancel-button')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { RebalancingConfirmationModal };
