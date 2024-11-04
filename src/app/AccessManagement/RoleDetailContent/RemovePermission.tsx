import React from 'react';
import { Button, ButtonVariant, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useRemovePermission } from '@app/services/rolesHook';

const RemovePermission = (props: {
  name: string;
  remove: string;
  permissions: string[];
  isModalOpen: boolean;
  submitModal: () => void;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { onRemovePermission } = useRemovePermission(props.name, props.remove, props.permissions, props.submitModal);

  return (
    <Modal
      id={'delete-permission-modal'}
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label="modal-role-delete"
      disableFocusTrap={true}
    >
      <ModalHeader
        titleIconVariant={'warning'}
        title={t('access-management.role.modal-remove-permission-title', {
          name: props.remove
        })}
      />
      <ModalBody>
        <Content>
          {t('access-management.role.modal-remove-permission-description-1', {
            roleName: props.name
          })}
        </Content>
        <Content>{t('access-management.role.modal-remove-permission-description-2')}</Content>
      </ModalBody>
      <ModalFooter>
        <Button
          key={'Remove'}
          aria-label={'Remove'}
          variant={ButtonVariant.warning}
          onClick={() => {
            onRemovePermission();
          }}
        >
          {t('common.actions.remove')}
        </Button>
        <Button
          key={'Cancel'}
          aria-label={'Cancel'}
          variant={ButtonVariant.link}
          onClick={props.closeModal}
          data-cy="cancelRemovePermissionButton"
        >
          {t('common.actions.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { RemovePermission };
