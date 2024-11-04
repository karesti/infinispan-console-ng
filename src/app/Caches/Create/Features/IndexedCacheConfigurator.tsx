import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Radio,
  Spinner,
  TextInput
} from '@patternfly/react-core';
import {
  CacheFeature,
  EncodingType,
  IndexedStartupMode,
  IndexedStorage,
  IndexingMode
} from '@services/infinispanRefData';
import { useTranslation } from 'react-i18next';
import { useCreateCache } from '@app/services/createCacheHook';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { FeatureCard } from '@app/Caches/Create/Features/FeatureCard';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useFetchProtobufTypes } from '@app/services/protobufHook';
import { FeatureAlert } from '@app/Caches/Create/Features/FeatureAlert';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { SelectSingle } from '@app/Common/SelectSingle';
import { selectOptionProps, selectOptionPropsFromArray } from '@utils/selectOptionPropsCreator';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';

const IndexedCacheConfigurator = (props: { isEnabled: boolean }) => {
  const { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const { protobufTypes, loading, error } = useFetchProtobufTypes();

  const [indexingMode, setIndexingMode] = useState(configuration.feature.indexedCache.indexingMode);

  const [indexedStorage, setIndexedStorage] = useState<'filesystem' | 'local-heap'>(
    configuration.feature.indexedCache.indexedStorage
  );
  const [indexedEntities, setIndexedEntities] = useState<string[]>(configuration.feature.indexedCache.indexedEntities);
  const [validEntity, setValidEntity] = useState<'success' | 'error' | 'default'>('default');
  const [indexedStartupMode, setIndexedStartupMode] = useState<string>(
    configuration.feature.indexedCache.indexedStartupMode!
  );

  const [indexedSharding, setIndexedSharding] = useState(configuration.feature.indexedCache.indexedSharding);

  useEffect(() => {
    setValidEntity(indexedEntities.length > 0 ? 'success' : 'error');

    setConfiguration((prevState) => {
      return {
        ...prevState,
        feature: {
          ...prevState.feature,
          indexedCache: {
            indexingMode: indexingMode,
            indexedStorage: indexedStorage,
            indexedStartupMode: indexedStartupMode,
            indexedEntities: indexedEntities,
            indexedSharding: indexedSharding,
            valid: indexingFeatureValidation()
          }
        }
      };
    });
  }, [indexingMode, indexedStorage, indexedEntities, indexedStartupMode, indexedSharding]);

  const indexingFeatureValidation = (): boolean => {
    return indexedEntities.length > 0 && configuration.basic.encoding === EncodingType.Protobuf;
  };

  const onSelectSchemas = (selection) => {
    if (indexedEntities.includes(selection)) setIndexedEntities(indexedEntities.filter((role) => role !== selection));
    else setIndexedEntities([...indexedEntities, selection]);
  };

  const formSelectEntities = () => {
    if (loading) {
      return (
        <Card>
          <CardBody>
            <Spinner size="lg" />
          </CardBody>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardBody>
            <TableErrorState error={error} />
          </CardBody>
        </Card>
      );
    }

    return (
      <FormGroup
        isRequired
        label={t('caches.create.configurations.feature.index-storage-entity')}
        labelHelp={
          <PopoverHelp
            name={'index-storage-entity'}
            label={t('caches.create.configurations.feature.index-storage-entity')}
            content={t('caches.create.configurations.feature.index-storage-entity-tooltip', { brandname: brandname })}
          />
        }
        fieldId="indexed-entities"
      >
        <SelectMultiWithChips
          id="entitiesSelector"
          placeholder={'Select an entity'}
          options={selectOptionPropsFromArray(protobufTypes)}
          onSelect={onSelectSchemas}
          onClear={() => setIndexedEntities([])}
          selection={indexedEntities}
        />

        {validEntity === 'error' && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant={validEntity} icon={<ExclamationCircleIcon />}>
                {t('caches.create.configurations.feature.index-storage-entity-helper')}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
    );
  };

  if (!props.isEnabled) {
    return (
      <FeatureAlert
        feature={CacheFeature.INDEXED}
        error={t('caches.create.configurations.feature.indexed-types-disabled-description')}
      />
    );
  }

  if (configuration.basic.encoding !== EncodingType.Protobuf) {
    return (
      <FeatureAlert
        feature={CacheFeature.INDEXED}
        error={t('caches.create.configurations.feature.indexed-encoding-disabled-description', {
          encoding: configuration.basic.encoding
        })}
      />
    );
  }

  return (
    <FeatureCard
      title="caches.create.configurations.feature.indexed"
      description="caches.create.configurations.feature.indexed-tooltip"
    >
      <FormGroup
        label={t('caches.create.configurations.feature.indexing-mode')}
        labelHelp={
          <PopoverHelp
            name={'indexing-mode'}
            label={t('caches.create.configurations.feature.indexing-mode')}
            content={t('caches.create.configurations.feature.indexing-mode-tooltip', { brandname: brandname })}
          />
        }
        fieldId="indexing-mode"
        isInline
      >
        <Radio
          name="radio-indexing-mode"
          id="auto"
          onChange={() => setIndexingMode(IndexingMode.auto)}
          isChecked={indexingMode === IndexingMode.auto}
          label={t('caches.create.configurations.feature.indexing-mode-auto')}
        />
        <Radio
          name="radio-indexing-mode"
          id="manual"
          onChange={() => setIndexingMode(IndexingMode.manual)}
          isChecked={indexingMode === IndexingMode.manual}
          label={t('caches.create.configurations.feature.indexing-mode-manual')}
        />
      </FormGroup>
      <FormGroup
        label={t('caches.create.configurations.feature.index-storage')}
        labelHelp={
          <PopoverHelp
            name={'indexed-storage'}
            label={t('caches.create.configurations.feature.index-storage')}
            content={t('caches.create.configurations.feature.index-storage-tooltip', { brandname: brandname })}
          />
        }
        fieldId="indexed-storage"
        isInline
      >
        <Radio
          name="radio-storage"
          id="persistent"
          onChange={() => setIndexedStorage(IndexedStorage.persistent)}
          isChecked={indexedStorage === IndexedStorage.persistent}
          label={t('caches.create.configurations.feature.index-storage-persistent')}
        />
        <Radio
          name="radio-storage"
          id="volatile"
          onChange={() => setIndexedStorage(IndexedStorage.volatile)}
          isChecked={indexedStorage === IndexedStorage.volatile}
          label={t('caches.create.configurations.feature.index-storage-volatile')}
        />
      </FormGroup>
      <FormGroup
        label={t('caches.create.configurations.feature.index-startup-mode')}
        labelHelp={
          <PopoverHelp
            name={'indexed-startup-mode'}
            label={t('caches.create.configurations.feature.index-startup-mode')}
            content={t('caches.create.configurations.feature.index-startup-mode-tooltip', { brandname: brandname })}
          />
        }
        fieldId="indexed-startup-mode"
        isInline
      >
        <SelectSingle
          id={'startupModeSelector'}
          placeholder={t('caches.create.configurations.feature.index-startup-mode-placeholder')}
          selected={indexedStartupMode}
          options={selectOptionProps(IndexedStartupMode)}
          onSelect={(value) => setIndexedStartupMode(value)}
        />
      </FormGroup>
      {formSelectEntities()}
      <FormGroup
        label={t('caches.create.configurations.feature.index-sharding')}
        labelHelp={
          <PopoverHelp
            name={'indexed-sharding'}
            label={t('caches.create.configurations.feature.index-sharding')}
            content={t('caches.create.configurations.feature.index-sharding-tooltip', { brandname: brandname })}
          />
        }
        fieldId="indexed-sharding"
        isInline
      >
        <TextInput
          value={indexedSharding}
          data-cy="indexSharding"
          type="number"
          onChange={(_event, value) => setIndexedSharding(parseInt(value))}
          aria-label="indexed-sharding-input"
        />
      </FormGroup>
    </FeatureCard>
  );
};

export default IndexedCacheConfigurator;
