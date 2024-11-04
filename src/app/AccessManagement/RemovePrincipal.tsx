import React from 'react';
import { Button, ButtonVariant, Modal, Content, ModalFooter, ModalBody, ModalHeader } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useDeleteRole } from '@app/services/rolesHook';
import { useGrantAccess, useRemovePrincipal } from '@app/services/principalsHook';

const RemovePrincipal = (props: {
  name: string;
  isModalOpen: boolean;
  submitModal: () => void;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { onRemove } = useRemovePrincipal(props.name, props.submitModal);
  const brandname = t('brandname.brandname');

  return (
    <Modal
      id={'remove-principal-modal'}
      className="pf-m-redhat-font"
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label="modal-principal-delete"
      disableFocusTrap={true}
    >
      <ModalHeader
        titleIconVariant={'warning'}
        title={t('access-management.principals.modal-remove-title', { principalName: props.name })}
      />
      <ModalBody>
        <Content>{t('access-management.principals.modal-remove-description-1', { brandname: brandname })}</Content>
        <Content>{t('access-management.principals.modal-remove-description-2')}</Content>
      </ModalBody>
      <ModalFooter>
        <Button
          key={'Remove'}
          aria-label={'Remove'}
          data-cy="removePrincipalButton"
          variant={ButtonVariant.warning}
          onClick={() => {
            onRemove();
          }}
        >
          {t('common.actions.remove')}
        </Button>
        <Button
          key={'Cancel'}
          aria-label={'Cancel'}
          variant={ButtonVariant.link}
          onClick={props.closeModal}
          data-cy="cancelPrincipalRemoveButton"
        >
          {t('common.actions.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { RemovePrincipal };
