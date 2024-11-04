import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Radio,
  TextInput
} from '@patternfly/react-core';
import { useCreateCounter } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';
import { CounterStorage, CounterType } from '@services/infinispanRefData';
import { createCounterConfig } from '@utils/counterUtils';
import formUtils, { IField } from '@services/formUtils';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

const CreateCounter = (props: { isModalOpen: boolean; submitModal: () => void; closeModal: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const counterNameInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const counterStorageInitialState: IField = {
    value: 'PERSISTENT',
    isValid: false,
    validated: 'default'
  };

  const counterTypeInitialState: IField = {
    value: CounterType.STRONG_COUNTER,
    isValid: false,
    validated: 'default'
  };

  const initialValueInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const lowerBoundInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const [counterType, setCounterType] = useState<IField>(counterTypeInitialState);
  const [counterName, setCounterName] = useState<IField>(counterNameInitialState);
  const [counterStorage, setCounterStorage] = useState<IField>(counterStorageInitialState);
  const [initialValue, setInitialValue] = useState<IField>(initialValueInitialState);
  const [lowerBound, setLowerBound] = useState<IField>(lowerBoundInitialState);
  const [upperBound, setUpperBound] = useState<number>();
  const [concurrencyLevel, setConcurrencyLevel] = useState<number>();
  const [counterData, setCounterData] = useState();

  useEffect(() => {
    const counterConfig = {
      name: counterName.value,
      type: counterType.value,
      storage: counterStorage.value,
      initialValue: initialValue.value === '' ? undefined : initialValue.value,
      lowerBound: lowerBound.value === '' ? undefined : lowerBound.value,
      upperBound: upperBound,
      concurrencyLevel: concurrencyLevel
    };

    setCounterData(createCounterConfig(counterConfig));
  }, [counterName, counterType, counterStorage, initialValue, lowerBound, upperBound, concurrencyLevel]);

  const { onCreateCounter } = useCreateCounter(counterName.value, counterData);

  const formStrongCounter = () => {
    return (
      <React.Fragment>
        <FormGroup label={t('cache-managers.counters.modal-lower-bound')}>
          <TextInput
            validated={lowerBound.validated}
            value={lowerBound.value}
            type="number"
            onChange={(_event, value) =>
              formUtils.validateRequiredField(
                value,
                t('cache-managers.counters.modal-lower-bound'),
                setLowerBound,
                validateLowerBound(value),
                t('cache-managers.counters.modal-lower-bound-invalid')
              )
            }
            aria-label="lower-bound-input"
          />
          {lowerBound.validated === 'error' && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                  {lowerBound.invalidText}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
        <FormGroup label={t('cache-managers.counters.modal-upper-bound')}>
          <TextInput
            value={upperBound}
            type="number"
            onChange={(_event, val) => (isNaN(parseInt(val)) ? setUpperBound(undefined) : setUpperBound(parseInt(val)))}
            aria-label="upper-bound-input"
          />
        </FormGroup>
      </React.Fragment>
    );
  };

  const formWeakCounter = () => {
    return (
      <FormGroup label={t('cache-managers.counters.modal-concurrency-level')}>
        <TextInput
          value={concurrencyLevel}
          type="number"
          onChange={(_event, val) =>
            isNaN(parseInt(val)) ? setConcurrencyLevel(undefined) : setConcurrencyLevel(parseInt(val))
          }
          aria-label="concurrency-level-input"
        />
      </FormGroup>
    );
  };

  const validateInitialValue = (value: string): boolean => {
    let isValid = true;
    if (counterType.value === CounterType.WEAK_COUNTER) return isValid;

    //Check validation with lowerbound
    if (lowerBound.value !== '') isValid = parseInt(value) > parseInt(lowerBound.value) && isValid;

    // Check validation with upperbound
    if (upperBound !== undefined && value !== '') isValid = parseInt(value) <= upperBound && isValid;

    return isValid;
  };

  const validateLowerBound = (value: string): boolean => {
    if (value !== '' && upperBound !== undefined) return parseInt(value) < upperBound;
    return true;
  };

  const handleSubmit = () => {
    let isValid = true;
    isValid =
      formUtils.validateRequiredField(
        counterName.value.trim(),
        t('cache-managers.counters.modal-counter-name'),
        setCounterName
      ) && isValid;
    isValid =
      formUtils.validateRequiredField(
        counterStorage.value.trim(),
        t('cache-managers.counters.storage'),
        setCounterStorage
      ) && isValid;
    isValid =
      formUtils.validateRequiredField(
        counterType.value.trim(),
        t('cache-managers.counters.counter-type'),
        setCounterType
      ) && isValid;
    isValid =
      formUtils.validateRequiredField(
        initialValue.value,
        t('cache-managers.counters.initial-value'),
        setInitialValue,
        validateInitialValue(initialValue.value),
        t('cache-managers.counters.modal-initial-value-invalid')
      ) && isValid;
    isValid =
      formUtils.validateRequiredField(
        lowerBound.value,
        t('cache-managers.counters.modal-lower-bound'),
        setLowerBound,
        validateLowerBound(lowerBound.value),
        t('cache-managers.counters.modal-lower-bound-invalid')
      ) && isValid;

    if (isValid) {
      onCreateCounter();
      props.submitModal();
      onCloseModal();
      ``;
    }
  };

  const onCloseModal = () => {
    props.closeModal();
    setCounterName(counterNameInitialState);
    setCounterType(counterTypeInitialState);
    setCounterStorage(counterStorageInitialState);
    setInitialValue(initialValueInitialState);
    setLowerBound(lowerBoundInitialState);
    setUpperBound(undefined);
    setConcurrencyLevel(undefined);
  };

  return (
    <Modal
      variant={ModalVariant.small}
      id={'create-counter-modal'}
      className="pf-m-redhat-font"
      isOpen={props.isModalOpen}
      onClose={onCloseModal}
      aria-label={'counters-modal-create-title'}
      disableFocusTrap={true}
    >
      <ModalHeader title={t('cache-managers.counters.modal-create-title')} />
      <ModalBody>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FormGroup isRequired isInline label={t('cache-managers.counters.modal-counter-name')}>
            <TextInput
              validated={counterName.validated}
              value={counterName.value}
              type="text"
              onChange={(_event, value) =>
                formUtils.validateRequiredField(value, t('cache-managers.counters.modal-counter-name'), setCounterName)
              }
              aria-label="counter-name-input"
            />
            {counterName.validated === 'error' && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {counterName.invalidText}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
          <FormGroup
            isRequired
            isInline
            label={t('cache-managers.counters.modal-storage')}
            labelHelp={
              <PopoverHelp
                name="storage"
                label={t('cache-managers.counters.modal-storage')}
                content={t('cache-managers.counters.modal-storage-tooltip', {
                  brandname: brandname
                })}
              />
            }
          >
            <Radio
              name="counter-storage-radio"
              id="persistent"
              onChange={() =>
                formUtils.validateRequiredField('PERSISTENT', t('cache-managers.counters.storage'), setCounterStorage)
              }
              isChecked={counterStorage.value === 'PERSISTENT'}
              label={CounterStorage.PERSISTENT}
            />
            <Radio
              name="counter-storage-radio"
              id="volatile"
              onChange={() =>
                formUtils.validateRequiredField('VOLATILE', t('cache-managers.counters.storage'), setCounterStorage)
              }
              isChecked={counterStorage.value === 'VOLATILE'}
              label={CounterStorage.VOLATILE}
            />
            {counterStorage.validated === 'error' && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {counterStorage.invalidText}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
          <FormGroup
            isRequired
            isInline
            label={t('cache-managers.counters.counter-type')}
            labelHelp={
              <PopoverHelp
                name="type"
                label={t('cache-managers.counters.counter-type')}
                content={t('cache-managers.counters.modal-counter-type-tooltip')}
              />
            }
          >
            <Radio
              name="counter-type-radio"
              id="strong"
              onChange={() =>
                formUtils.validateRequiredField(
                  CounterType.STRONG_COUNTER,
                  t('cache-managers.counters.counter-type'),
                  setCounterType
                )
              }
              isChecked={counterType.value === CounterType.STRONG_COUNTER}
              label={t('cache-managers.counters.modal-strong-counter')}
            />
            <Radio
              name="counter-type-radio"
              id="weak"
              onChange={() =>
                formUtils.validateRequiredField(
                  CounterType.WEAK_COUNTER,
                  t('cache-managers.counters.counter-type'),
                  setCounterType
                )
              }
              isChecked={counterType.value === CounterType.WEAK_COUNTER}
              label={t('cache-managers.counters.modal-weak-counter')}
            />
            {counterType.validated === 'error' && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {counterType.invalidText}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
          <FormGroup isInline label={t('cache-managers.counters.initial-value')}>
            <TextInput
              validated={initialValue.validated}
              value={initialValue.value}
              type="number"
              onChange={(_event, value) =>
                formUtils.validateRequiredField(
                  value,
                  t('cache-managers.counters.initial-value'),
                  setInitialValue,
                  validateInitialValue(value),
                  t('cache-managers.counters.modal-initial-value-invalid')
                )
              }
              aria-label="initial-value-input"
            />
            {initialValue.validated === 'error' && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {initialValue.invalidText}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
          {counterType.value === CounterType.STRONG_COUNTER && formStrongCounter()}
          {counterType.value === CounterType.WEAK_COUNTER && formWeakCounter()}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button key={'Create'} aria-label={'Create'} variant={ButtonVariant.primary} onClick={handleSubmit}>
          {t('cache-managers.counters.create-action')}
        </Button>
        <Button key={'Cancel'} aria-label={'Cancel'} variant={ButtonVariant.link} onClick={onCloseModal}>
          {t('cache-managers.counters.modal-cancel-button')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { CreateCounter };
