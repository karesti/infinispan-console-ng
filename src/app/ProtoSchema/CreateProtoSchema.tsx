import React, { useState } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  FileUpload,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput
} from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import formUtils, { IField } from '../../services/formUtils';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { PopoverHelp } from '@app/Common/PopoverHelp';

const schemaNameInitialState: IField = {
  value: '',
  isValid: true,
  invalidText: 'Schema name is required',
  helperText: 'The schema name must not exist',
  validated: 'default'
};

const schemaInitialState: IField = {
  value: '',
  isValid: true,
  invalidText: 'Schema is required',
  helperText: 'Protobuf schema',
  validated: 'default'
};

const CreateProtoSchema = (props: { isModalOpen: boolean; closeModal: (boolean) => void }) => {
  const { t } = useTranslation();
  const { addAlert } = useApiAlert();
  const [error, setError] = useState<string | undefined>(undefined);
  const [schemaName, setSchemaName] = useState<IField>(schemaNameInitialState);
  const [schema, setSchema] = useState<IField>(schemaInitialState);

  const [filename, setFilename] = React.useState('');

  const handleFileInputChange = (_, file: File) => {
    setFilename(file.name);
  };

  const handleClear = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setFilename('');
    setError(undefined);
    setSchema(schemaInitialState);
  };

  const handleSchemaContentChange = (_event, v) => {
    setSchema((prevState) => {
      return { ...prevState, value: v };
    });
  };

  const fileUploadDropZoneProps = {
    accept: { 'application/x-protobuf': ['.proto', '.pb'] },
    onDropRejected: () => setError('Invalid File Type! Please upload a protbuf file.'),
    onDropAccepted: () => setError('')
  };

  const clearCreateProtoSchema = (createDone: boolean) => {
    setSchemaName(schemaNameInitialState);
    setSchema(schemaInitialState);
    setError('');
    props.closeModal(createDone);
  };

  const handleCreateButton = () => {
    let isValid = true;
    setError(undefined);
    isValid = formUtils.validateRequiredField(schemaName.value, 'Schema name', setSchemaName) && isValid;
    isValid = formUtils.validateRequiredField(schema.value, 'Schema', setSchema) && isValid;

    if (!isValid) {
      setError('There are form errors');
      return;
    }

    ConsoleServices.protobuf()
      .createOrUpdateSchema(schemaName.value, schema.value, true)
      .then((actionResponse) => {
        if (actionResponse.success) {
          addAlert(actionResponse);
          clearCreateProtoSchema(true);
        } else {
          setError(actionResponse.message);
        }
      });
  };

  const buildContent = () => {
    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        {error && <Alert variant={AlertVariant.danger} isInline title={error} />}

        <FormGroup label={t('schemas.create.name')} isRequired fieldId="schema-name">
          <TextInput
            value={schemaName.value}
            id="schema-name"
            name="schema-name"
            aria-label="schema-name"
            aria-describedby="schema-name-helper"
            onChange={(_event, v) =>
              setSchemaName((prevState) => {
                return { ...prevState, value: v.trim() };
              })
            }
            validated={schemaName.validated}
          />
        </FormGroup>
        <FormGroup
          label={t('schemas.create.schema')}
          labelHelp={
            <PopoverHelp
              name="schema-content"
              label={t('schemas.create.schema')}
              content={t('schemas.create.schema-tooltip')}
            />
          }
          isRequired
          fieldId="schema-content"
        >
          <FileUpload
            id="schema"
            type="text"
            name="schema"
            aria-describedby="schema-content-helper"
            value={schema.value}
            filename={filename}
            filenamePlaceholder="Drag and drop Protobuf Schema file or upload one"
            onFileInputChange={handleFileInputChange}
            onDataChange={handleSchemaContentChange}
            onTextChange={handleSchemaContentChange}
            dropzoneProps={fileUploadDropZoneProps}
            onClearClick={handleClear}
            allowEditingUploadedText={true}
            browseButtonText="Upload"
            validated={schema.validated}
          />
        </FormGroup>
      </Form>
    );
  };

  return (
    <Modal
      isOpen={props.isModalOpen}
      className="pf-m-redhat-font"
      onClose={() => clearCreateProtoSchema(false)}
      aria-label="Add Protobuf schema"
    >
      <ModalHeader titleIconVariant={AddCircleOIcon} title={t('schemas.create.modal-title')} />
      <ModalBody>{buildContent()}</ModalBody>
      <ModalFooter>
        <Button
          data-cy="addSchemaButton"
          aria-label="add-schema-button"
          key="add-schema-button"
          onClick={handleCreateButton}
        >
          {t('schemas.add-button')}
        </Button>
        <Button
          data-cy="cancelAddSchemaButton"
          aria-label="cancel-add-schema-button"
          key="cancel-add-schema-button"
          variant="link"
          onClick={() => clearCreateProtoSchema(false)}
        >
          {t('schemas.cancel-button')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { CreateProtoSchema };
