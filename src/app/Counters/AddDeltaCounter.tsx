import React from 'react';
import {
  Button,
  ButtonVariant,
  Content,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput
} from '@patternfly/react-core';
import { useAddDeltaCounter } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

const AddDeltaCounter = (props: {
  name: string;
  deltaValue: number;
  setDeltaValue;
  isDeltaValid: boolean;
  submitModal: () => void;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { onAddDelta } = useAddDeltaCounter(props.name, props.deltaValue);

  const handleSubmit = () => {
    if (props.isDeltaValid) {
      onAddDelta();
      props.submitModal();
    }
  };

  const validateForm = (): 'default' | 'error' => {
    return props.isDeltaValid ? 'default' : 'error';
  };

  return (
    <Modal
      id={'add-delta-counter-modal'}
      className="pf-m-redhat-font"
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label={t('cache-managers.counters.modal-delta-title')}
      disableFocusTrap={true}
    >
      <ModalHeader title={t('cache-managers.counters.modal-delta-title')} />
      <ModalBody>
        <Content component={'p'} isEditorial>
          {t('cache-managers.counters.modal-delta-content', {
            counter: props.name
          })}
        </Content>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FormGroup>
            <TextInput
              validated={validateForm()}
              value={props.deltaValue}
              type="number"
              onChange={(_event, value) => props.setDeltaValue(value)}
              aria-label={'delta-text-input'}
              data-cy="counterDeltaNum"
            />
            {validateForm() && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {t('cache-managers.counters.modal-delta-helper-invalid')}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key={'Confirm'}
          aria-label={'Confirm'}
          variant={ButtonVariant.danger}
          onClick={handleSubmit}
          data-cy="confirmAddDeltaButton"
        >
          {t('cache-managers.counters.modal-confirm-button')}
        </Button>
        <Button
          key={'Cancel'}
          aria-label={'Cancel'}
          variant={ButtonVariant.link}
          onClick={props.closeModal}
          data-cy="cancelAddDeltaButton"
        >
          {t('cache-managers.counters.modal-cancel-button')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { AddDeltaCounter };
