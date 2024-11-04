import React from 'react';
import { Button, ButtonVariant, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useDeleteRole } from '@app/services/rolesHook';

const DeleteRole = (props: { name: string; isModalOpen: boolean; submitModal: () => void; closeModal: () => void }) => {
  const { t } = useTranslation();
  const { onDeleteRole } = useDeleteRole(props.name, props.submitModal);
  const brandname = t('brandname.brandname');

  return (
    <Modal
      id={'delete-role-modal'}
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label="modal-role-delete"
      disableFocusTrap={true}
    >
      <ModalHeader
        titleIconVariant={'danger'}
        title={t('access-management.roles.modal-delete-title', { name: props.name })}
      />
      <ModalBody>
        <Content>
          {t('access-management.roles.modal-delete-description-1', { name: props.name, brandname: brandname })}
        </Content>
        <Content>{t('access-management.roles.modal-delete-description-2')}</Content>
      </ModalBody>
      <ModalFooter>
        <Button
          key={'Delete'}
          aria-label={'Delete'}
          variant={ButtonVariant.danger}
          onClick={() => {
            onDeleteRole();
          }}
        >
          {t('common.actions.delete')}
        </Button>
        <Button
          key={'Cancel'}
          aria-label={'Cancel'}
          variant={ButtonVariant.link}
          onClick={props.closeModal}
          data-cy="cancelRoleDeleteButton"
        >
          {t('common.actions.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { DeleteRole };
