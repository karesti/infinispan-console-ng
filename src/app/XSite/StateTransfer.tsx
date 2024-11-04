import React from 'react';
import { Button, ButtonVariant, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';

/**
 * State transfer modal
 */
const StateTransfer = (props: {
  cacheName: string;
  siteName: string;
  isModalOpen: boolean;
  action: 'start' | 'cancel' | '';
  closeModal: (boolean) => void;
}) => {
  const buildContent = () => {
    if (props.action == 'cancel') {
      return (
        <Content>
          This action will cancel the ongoing state transfer operation from cache <strong>{props.cacheName}</strong> to
          the site <strong>{props.siteName}</strong>.
          <br />
          Are you sure you want to cancel the state transfer?
        </Content>
      );
    }

    return (
      <Content>
        The state transfer operation implies transferring the data from cache <strong>{props.cacheName}</strong> to its
        backup cache in the site <strong>{props.siteName}</strong>. This operation can take long.
        <br />
        Are you sure you want to start a state transfer?
      </Content>
    );
  };

  return (
    <Modal
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={() => props.closeModal(false)}
      className="pf-m-redhat-font"
      aria-label="State transfer modal"
    >
      <ModalHeader
        titleIconVariant={props.action == 'start' ? 'info' : 'warning'}
        title={props.action == 'start' ? 'State transfer?' : 'Cancel state transfer?'}
      />
      <ModalBody>
        <Content>{buildContent()}</Content>
      </ModalBody>
      <ModalFooter>
        <Button
          key="state-transfer-button"
          onClick={() => props.closeModal(true)}
          variant={props.action == 'start' ? ButtonVariant.primary : ButtonVariant.danger}
          data-cy={props.action == 'start' ? 'startTransferButton' : 'cancelStateTransferButton'}
        >
          {props.action == 'start' ? 'Start transfer' : 'Cancel transfer'}
        </Button>
        ,
        <Button data-cy="closeModalButton" key="cancel" variant="link" onClick={() => props.closeModal(false)}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { StateTransfer };
