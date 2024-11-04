import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonVariant,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextArea
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useEditProtobufSchema, useFetchProtobufSchemaContent } from '@app/services/protobufHooks';
import { t_global_font_size_sm } from '@patternfly/react-tokens';

const EditSchema = (props: {
  schemaName: string;
  isModalOpen: boolean;
  submitModal: () => void;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const [editSchemaContent, setEditSchemaContent] = useState<string>('');
  const { onEditSchema } = useEditProtobufSchema(props.schemaName, editSchemaContent);
  const [formValidate, setFormValidate] = useState<'success' | 'error' | 'default'>('default');
  const { schemaContent, setLoading } = useFetchProtobufSchemaContent(props.schemaName);

  useEffect(() => {
    if (props.schemaName !== '') {
      setLoading(true);
    }
  }, [props.schemaName]);

  useEffect(() => {
    if (schemaContent) setEditSchemaContent(schemaContent);
  }, [schemaContent]);

  useEffect(() => {
    if (editSchemaContent.length > 0) {
      setFormValidate('success');
    } else {
      setFormValidate('error');
    }
  }, [editSchemaContent]);

  const onClickEditButton = () => {
    onEditSchema();
    props.submitModal();
  };

  return (
    <Modal
      isOpen={props.isModalOpen}
      className="pf-m-redhat-font"
      onClose={props.closeModal}
      aria-label="Edit schema modal"
      variant={'small'}
    >
      <ModalHeader titleIconVariant={'warning'} title={t('schemas.edit.heading')} />
      <ModalBody>
        <Content style={{ paddingBottom: '1rem' }}>
          {t('schemas.edit.modal-description-1')}
          <strong>{props.schemaName}</strong>
          {t('schemas.edit.modal-description-2')}
        </Content>

        <TextArea
          id="schema-edit-area"
          data-cy="schemaEditArea"
          aria-label={'edit-schema-content'}
          value={editSchemaContent}
          onChange={(_event, val) => setEditSchemaContent(val)}
          isRequired
          validated={formValidate}
          style={{ fontSize: t_global_font_size_sm.value }}
          rows={15}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          id="confirm-edit-schema-button"
          name="confirm-edit-schema-button"
          aria-label="confirm-edit-schema-button"
          key="confirm"
          variant={ButtonVariant.primary}
          onClick={onClickEditButton}
          isDisabled={formValidate === 'error'}
        >
          {t('schemas.save-button')}
        </Button>
        <Button
          id="cancel-edit-schema-button"
          name="cancel-edit-schema-button"
          aria-label="cancel-edit-schema-button"
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

export { EditSchema };
