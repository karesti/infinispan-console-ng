import React, { useEffect, useState } from 'react';
import {
  Form,
  FormGroup,
  FormHelperText,
  FormSection,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  NumberInput,
  Radio,
  SelectOptionProps,
  Switch
} from '@patternfly/react-core';
import { CacheMode, CacheType, EncodingType } from '@services/infinispanRefData';
import { useTranslation } from 'react-i18next';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { useCreateCache } from '@app/services/createCacheHook';
import { validateIndexedFeature, validateTransactionalFeature } from '@app/utils/featuresValidation';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { SelectSingle } from '@app/Common/SelectSingle';
import { selectOptionProps } from '@utils/selectOptionPropsCreator';
import TimeQuantityInputGroup from '@app/Caches/Create/TimeQuantityInputGroup';

const BasicCacheConfigConfigurator = () => {
  const { t } = useTranslation();
  const { configuration, setConfiguration } = useCreateCache();

  // State for the form
  // Passed to the parent component
  const [topology, setTopology] = useState<string>(configuration.basic.topology);
  const [mode, setMode] = useState<CacheMode>(configuration.basic.mode as CacheMode);
  const [selectedNumberOwners, setSelectedNumberOwners] = useState(configuration.basic.numberOfOwners);
  const [selectedEncodingCache, setSelectedEncodingCache] = useState(configuration.basic.encoding);
  const [isStatistics, setIsStatistics] = useState(configuration.basic.statistics);
  const [isExpiration, setIsExpiration] = useState(configuration.basic.expiration);
  const [lifeSpanNumber, setLifeSpanNumber] = useState(configuration.basic.lifeSpanNumber);
  const [lifeSpanUnit, setLifeSpanUnit] = useState(configuration.basic.lifeSpanUnit);
  const [maxIdleNumber, setMaxIdleNumber] = useState(configuration.basic.maxIdleNumber);
  const [maxIdleUnit, setMaxIdleUnit] = useState(configuration.basic.maxIdleUnit);

  useEffect(() => {
    // Update the form when the state changes
    setConfiguration((prevState) => {
      return {
        ...prevState,
        basic: {
          topology: topology,
          mode: mode,
          numberOfOwners: topology == CacheType.Distributed ? selectedNumberOwners : undefined,
          encoding: selectedEncodingCache,
          statistics: isStatistics,
          expiration: isExpiration,
          lifeSpanNumber: lifeSpanNumber,
          lifeSpanUnit: lifeSpanUnit,
          maxIdleNumber: maxIdleNumber,
          maxIdleUnit: maxIdleUnit,
          valid: lifeSpanNumber >= -1 && maxIdleNumber >= -1
        },
        feature: {
          ...prevState.feature,
          indexedCache: {
            ...prevState.feature.indexedCache,
            valid: validateIndexedFeature(configuration, selectedEncodingCache)
          },
          transactionalCache: {
            ...prevState.feature.transactionalCache,
            valid: validateTransactionalFeature(configuration, mode)
          }
        }
      };
    });
  }, [
    topology,
    mode,
    selectedNumberOwners,
    selectedEncodingCache,
    isStatistics,
    isExpiration,
    lifeSpanNumber,
    lifeSpanUnit,
    maxIdleNumber,
    maxIdleUnit
  ]);

  // Helper function for Number Owners Selection
  const minValue = 1;
  const maxValue = 10;

  const onMinus = () => {
    if (selectedNumberOwners) {
      setSelectedNumberOwners(selectedNumberOwners - 1);
    }
  };

  const onPlus = () => {
    if (selectedNumberOwners) {
      setSelectedNumberOwners(selectedNumberOwners + 1);
    }
  };

  const onChange = (event) => {
    const newValue = isNaN(event.target.value) ? 0 : Number(event.target.value);
    setSelectedNumberOwners(newValue > maxValue ? maxValue : newValue < minValue ? minValue : newValue);
  };

  const formMode = () => {
    return (
      <FormGroup
        isRequired
        isInline
        label={t('caches.create.configurations.basic.mode-title')}
        fieldId="topology"
        labelHelp={
          <PopoverHelp
            name={'Cache mode'}
            label={t('caches.create.configurations.basic.mode-title')}
            content={t('caches.create.configurations.basic.mode-tooltip')}
          />
        }
      >
        <Radio
          name="topology-radio"
          id="distributed"
          onChange={() => {
            setTopology(CacheType.Distributed);
            setSelectedNumberOwners(1);
          }}
          isChecked={(topology as CacheType) == CacheType.Distributed}
          label={t('caches.create.configurations.basic.mode-distributed')}
        />
        <Radio
          name="topology-radio"
          id="replicated"
          onChange={() => setTopology(CacheType.Replicated)}
          isChecked={(topology as CacheType) == CacheType.Replicated}
          label={t('caches.create.configurations.basic.mode-replicated')}
        />
      </FormGroup>
    );
  };

  const formTopology = () => {
    return (
      <FormGroup
        isRequired
        isInline
        fieldId="mode"
        label={t('caches.create.configurations.basic.cluster-repl-title')}
        labelHelp={
          <PopoverHelp
            name={'mode'}
            label={t('caches.create.configurations.basic.cluster-repl-title')}
            content={t('caches.create.configurations.basic.cluster-repl-tooltip')}
          />
        }
      >
        <Radio
          name="mode-radio"
          id="sync"
          onChange={() => setMode(() => CacheMode.SYNC)}
          isChecked={(mode as CacheMode) == CacheMode.SYNC}
          label={t('caches.create.configurations.basic.cluster-repl-sync')}
        />
        <Radio
          name="mode-radio"
          id="async"
          onChange={() => setMode(() => CacheMode.ASYNC)}
          isChecked={(mode as CacheMode) == CacheMode.ASYNC}
          label={t('caches.create.configurations.basic.cluster-repl-async')}
        />
      </FormGroup>
    );
  };

  const formNumberOwners = () => {
    return (
      <FormGroup
        label={t('caches.create.configurations.basic.number-owners')}
        labelHelp={
          <PopoverHelp
            name={'number-of-owners'}
            label={t('caches.create.configurations.basic.number-owners')}
            content={t('caches.create.configurations.basic.number-owners-tooltip')}
          />
        }
        fieldId="field-number-owners"
        isRequired={(topology as CacheType) == CacheType.Distributed}
      >
        <NumberInput
          value={(topology as CacheType) == CacheType.Distributed ? selectedNumberOwners : 1}
          min={minValue}
          max={maxValue}
          onMinus={onMinus}
          onChange={onChange}
          onPlus={onPlus}
          inputName="input"
          inputAriaLabel="number input"
          minusBtnAriaLabel="minus"
          plusBtnAriaLabel="plus"
          widthChars={2}
          isDisabled={(topology as CacheType) != CacheType.Distributed}
        />
      </FormGroup>
    );
  };

  const encodingTypeOptions = (): SelectOptionProps[] => {
    return selectOptionProps(EncodingType, [EncodingType.Empty, EncodingType.Unknown]);
  };

  const formStatistics = () => {
    return (
      <FormGroup fieldId="field-statistics">
        <Switch
          aria-label="statistics"
          id="statistics"
          isChecked={isStatistics}
          onChange={() => setIsStatistics(!isStatistics)}
          hasCheckIcon
          label={
            isStatistics
              ? t('caches.create.configurations.basic.statistics-disable')
              : t('caches.create.configurations.basic.statistics-enable')
          }
        />
      </FormGroup>
    );
  };

  const formEncodingCache = () => {
    return (
      <FormGroup
        label={t('caches.create.configurations.basic.encoding-cache-title')}
        isInline
        isRequired
        fieldId="field-encoding-cache"
        labelHelp={
          <PopoverHelp
            name={'encoding'}
            label={t('caches.create.configurations.basic.encoding-cache-title')}
            content={t('caches.create.configurations.basic.encoding-cache-tooltip')}
          />
        }
      >
        <SelectSingle
          id={'encoding'}
          placeholder={''}
          selected={selectedEncodingCache}
          options={encodingTypeOptions()}
          onSelect={(value) => setSelectedEncodingCache(value)}
        />
      </FormGroup>
    );
  };

  const formExpiration = () => {
    return (
      <FormGroup fieldId="form-expiration">
        <Switch
          aria-label="expiration"
          data-cy="expirationSwitch"
          id="expiration"
          isChecked={isExpiration}
          onChange={() => setIsExpiration(!isExpiration)}
          hasCheckIcon
          label={
            isExpiration
              ? t('caches.create.configurations.basic.expiration-enable')
              : t('caches.create.configurations.basic.expiration-disable')
          }
        />
        <PopoverHelp
          name={'expiration'}
          label={t('caches.create.configurations.basic.expiration-title')}
          content={t('caches.create.configurations.basic.expiration-tooltip')}
        />
      </FormGroup>
    );
  };

  const validateLifeSpan = (): 'default' | 'error' => {
    return lifeSpanNumber >= -1 ? 'default' : 'error';
  };

  const validateMaxIdle = (): 'default' | 'error' => {
    return maxIdleNumber >= -1 ? 'default' : 'error';
  };

  const formExpirationSettings = () => {
    return (
      <Grid hasGutter>
        <GridItem span={6}>
          <FormGroup
            fieldId="form-life-span"
            label={t('caches.create.configurations.basic.lifespan')}
            labelHelp={
              <PopoverHelp
                name={'lifespan'}
                label={t('caches.create.configurations.basic.lifespan')}
                content={t('caches.create.configurations.basic.lifespan-tooltip')}
              />
            }
          >
            <TimeQuantityInputGroup
              name={'lifespan'}
              validate={validateLifeSpan}
              minValue={-1}
              value={lifeSpanNumber}
              valueModifier={setLifeSpanNumber}
              unit={lifeSpanUnit}
              unitModifier={setLifeSpanUnit}
            />
            {validateLifeSpan() === 'error' && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {t('caches.create.configurations.basic.lifespan-helper-invalid')}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            fieldId="form-max-idle"
            label={t('caches.create.configurations.basic.max-idle')}
            labelHelp={
              <PopoverHelp
                name={'maxidle'}
                label={t('caches.create.configurations.basic.max-idle')}
                content={t('caches.create.configurations.basic.max-idle-tooltip')}
              />
            }
          >
            <TimeQuantityInputGroup
              name={'maxidle'}
              validate={validateMaxIdle}
              minValue={-1}
              value={maxIdleNumber}
              valueModifier={setMaxIdleNumber}
              unit={maxIdleUnit}
              unitModifier={setMaxIdleUnit}
            />
            {validateMaxIdle() === 'error' && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {t('caches.create.configurations.basic.max-idle-helper-invalid')}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
        </GridItem>
      </Grid>
    );
  };

  return (
    <Form
      isWidthLimited
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <FormSection title={t('caches.create.configurations.basic.title')}>
        {formMode()}
        {/* Display the number of owners of the cache when the topology is distributed. */}
        {(topology as CacheType) == CacheType.Distributed && formNumberOwners()}
        {formTopology()}
        {formEncodingCache()}
        {formStatistics()}
      </FormSection>
      <FormSection title={t('caches.create.configurations.basic.expiration-title')}>
        {formExpiration()}
        {isExpiration && formExpirationSettings()}
      </FormSection>
    </Form>
  );
};

export default BasicCacheConfigConfigurator;
