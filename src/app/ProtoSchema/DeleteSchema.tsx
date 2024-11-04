import React from 'react';
import { Button, ButtonVariant, Modal, Content, ModalFooter, ModalHeader, ModalBody } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useDeleteProtobufSchema } from '@app/services/protobufHooks';

const DeleteSchema = (props: { schemaName: string; isModalOpen: boolean; closeModal: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { onDeleteSchema } = useDeleteProtobufSchema(props.schemaName);

  const onClickDeleteButton = () => {
    onDeleteSchema();
    props.closeModal();
  };

  return (
    <Modal
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      variant={'small'}
      className="pf-m-redhat-font"
      aria-label="Delete schema modal"
    >
      <ModalHeader titleIconVariant={'danger'} title={t('schemas.delete.heading')} />
      <ModalBody>
        <Content component={'p'}>
          <strong>{props.schemaName}</strong> {t('schemas.delete.modal-description-1', { brandname: brandname })}
        </Content>
        <Content component={'p'}>{t('schemas.delete.modal-description-2')}</Content>
      </ModalBody>
      <ModalFooter>
        <Button
          id="confirm-delete-schema-button"
          name="confirm-delete-schema-button"
          aria-label="confirm-delete-schema-button"
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={onClickDeleteButton}
        >
          {t('schemas.delete-button')}
        </Button>
        <Button
          id="cancel-delete-schema-button"
          name="cancel-delete-schema-button"
          aria-label="cancel-delete-schema-button"
          key="cancel"
          variant="link"
          onClick={props.closeModal}
        >
          {t('schemas.cancel-button')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { DeleteSchema };
