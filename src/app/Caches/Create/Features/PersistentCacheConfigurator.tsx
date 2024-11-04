import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Content,
  ContentVariants,
  FormGroup,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  Hint,
  HintBody,
  HintFooter,
  Switch,
  TextInput
} from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { useTranslation } from 'react-i18next';
import { PersistentCacheStorage, PersistentStorageConfig } from '@services/infinispanRefData';
import { kebabCase } from '@app/utils/convertStringCase';
import { useCreateCache } from '@app/services/createCacheHook';
import { FeatureCard } from '@app/Caches/Create/Features/FeatureCard';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { t_global_spacer_md } from '@patternfly/react-tokens';
import { DARK, ThemeContext } from '@app/providers/ThemeProvider';
import { SelectSingle } from '@app/Common/SelectSingle';
import { selectOptionProps } from '@utils/selectOptionPropsCreator';
import TimeQuantityInputGroup from '@app/Caches/Create/TimeQuantityInputGroup';

const PersistentCacheConfigurator = () => {
  const { theme } = useContext(ThemeContext);
  const { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const [passivation, setPassivation] = useState(configuration.feature.persistentCache.passivation);
  const [connectionAttempts, setConnectionAttempts] = useState(
    configuration.feature.persistentCache.connectionAttempts
  );
  const [connectionInterval, setConnectionInterval] = useState(
    configuration.feature.persistentCache.connectionInterval
  );
  const [connectionIntervalUnit, setConnectionIntervalUnit] = useState(
    configuration.feature.persistentCache.connectionIntervalUnit
  );
  const [availabilityInterval, setAvailabilityInterval] = useState(
    configuration.feature.persistentCache.availabilityInterval
  );
  const [availabilityIntervalUnit, setAvailabilityIntervalUnit] = useState(
    configuration.feature.persistentCache.availabilityIntervalUnit
  );

  const [storage, setStorage] = useState(configuration.feature.persistentCache.storage as PersistentCacheStorage);
  const [config, setConfig] = useState(configuration.feature.persistentCache.config);
  const [valid, setValid] = useState(configuration.feature.persistentCache.valid);

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        feature: {
          ...prevState.feature,
          persistentCache: {
            passivation: passivation,
            connectionAttempts: connectionAttempts as number,
            connectionInterval: connectionInterval as number,
            connectionIntervalUnit: connectionIntervalUnit,
            availabilityInterval: availabilityInterval as number,
            availabilityIntervalUnit: availabilityIntervalUnit,
            storage: storage,
            config: config,
            valid: valid
          }
        }
      };
    });
  }, [
    passivation,
    connectionAttempts,
    connectionInterval,
    connectionIntervalUnit,
    availabilityInterval,
    availabilityIntervalUnit,
    storage,
    config,
    valid
  ]);

  const onSelectStorage = (selection) => {
    setStorage(selection);
    changeAndValidate(PersistentStorageConfig.get(selection) as string);
  };

  const changeAndValidate = (value: string) => {
    setConfig(value);
    try {
      JSON.parse(value);
      setValid(true);
    } catch (e) {
      setValid(false);
    }
  };

  const displayValidationError = () => {
    if (valid) {
      return '';
    }

    return (
      <HelperText>
        <HelperTextItem variant="warning">
          {t('caches.create.configurations.feature.persistent-error', {
            brandname: brandname
          })}
        </HelperTextItem>
      </HelperText>
    );
  };

  const displayEditor = () => {
    if (!storage) {
      return '';
    }

    const storageJARS = [PersistentCacheStorage.JDBCStore, PersistentCacheStorage.Custom];

    return (
      <React.Fragment>
        <Hint>
          <HintBody>{t('caches.create.configurations.feature.persistent-hint')}</HintBody>
          <HintFooter>
            <Button variant="link" isInline onClick={() => window.open(t('brandname.persistence-docs-link'), '_blank')}>
              {t('caches.create.configurations.feature.persistent-hint-link')}
            </Button>
          </HintFooter>
        </Hint>

        <Content component={ContentVariants.h3}>{PersistentCacheStorage[storage]}</Content>
        <Content component={ContentVariants.p}>
          {t('caches.create.configurations.feature.' + kebabCase(storage) + '-description', {
            brandname: brandname
          })}
        </Content>

        {storageJARS.includes(PersistentCacheStorage[storage]) && (
          <Alert
            style={{ margin: t_global_spacer_md.value + ' 0' }}
            variant="warning"
            title={t('caches.create.configurations.feature.persistent-storage-jar-warning', {
              persistentStorage: PersistentCacheStorage[storage]
            })}
          />
        )}

        <CodeEditor
          isLineNumbersVisible
          isLanguageLabelVisible
          code={config}
          onChange={changeAndValidate}
          language={Language.json}
          height={'sizeToFit'}
          isDarkTheme={theme === DARK}
        />
        {displayValidationError()}
      </React.Fragment>
    );
  };

  return (
    <FeatureCard
      title="caches.create.configurations.feature.persistent"
      description="caches.create.configurations.feature.persistent-description"
    >
      <Grid hasGutter>
        <GridItem>
          <FormGroup fieldId="passivation">
            <Switch
              aria-label="passivation"
              data-cy="passivationSwitch"
              id="passivation"
              isChecked={passivation}
              onChange={() => setPassivation(!passivation)}
              hasCheckIcon
              label={t('caches.create.configurations.feature.passivation')}
            />
            <PopoverHelp
              name={'passivation'}
              label={t('caches.create.configurations.feature.passivation')}
              content={t('caches.create.configurations.feature.passivation-tooltip', { brandname: brandname })}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={4}>
          <FormGroup
            isInline
            fieldId="connection-attempts"
            label={t('caches.create.configurations.feature.connection-attempts')}
            labelHelp={
              <PopoverHelp
                name={'connection-attempts'}
                label={t('caches.create.configurations.feature.connection-attempts')}
                content={t('caches.create.configurations.feature.connection-attempts-tooltip', {
                  brandname: brandname
                })}
              />
            }
          >
            <TextInput
              data-cy="connectionAttempts"
              placeholder="10"
              value={connectionAttempts}
              type="number"
              onChange={(_event, val) => {
                const parsedVal = parseInt(val);
                setConnectionAttempts(isNaN(parsedVal) ? undefined! : parsedVal);
              }}
              aria-label="connection-attempts"
            />
          </FormGroup>
        </GridItem>
        <GridItem span={4}>
          <FormGroup
            isInline
            fieldId="connection-interval"
            label={t('caches.create.configurations.feature.connection-interval')}
            labelHelp={
              <PopoverHelp
                name={'connection-interval'}
                label={t('caches.create.configurations.feature.connection-interval')}
                content={t('caches.create.configurations.feature.connection-interval-tooltip', {
                  brandname: brandname
                })}
              />
            }
          >
            <TimeQuantityInputGroup
              name={'connectionInterval'}
              defaultValue={'50'}
              value={connectionInterval}
              valueModifier={setConnectionInterval}
              unit={connectionIntervalUnit}
              unitModifier={setConnectionIntervalUnit}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={4}>
          <FormGroup
            isInline
            fieldId="availability-interval"
            label={t('caches.create.configurations.feature.availability-interval')}
            labelHelp={
              <PopoverHelp
                name={'availability-interval'}
                label={t('caches.create.configurations.feature.availability-interval')}
                content={t('caches.create.configurations.feature.availability-interval-tooltip', {
                  brandname: brandname
                })}
              />
            }
          >
            <TimeQuantityInputGroup
              name={'availabilityInterval'}
              defaultValue={'1000'}
              value={availabilityInterval}
              valueModifier={setAvailabilityInterval}
              unit={availabilityIntervalUnit}
              unitModifier={setAvailabilityIntervalUnit}
            />
          </FormGroup>
        </GridItem>
        <GridItem>
          <FormGroup
            fieldId="storages"
            isRequired
            label={t('caches.create.configurations.feature.storages')}
            labelHelp={
              <PopoverHelp
                name={'storages'}
                label={t('caches.create.configurations.feature.storages')}
                content={t('caches.create.configurations.feature.storages-tooltip', { brandname: brandname })}
              />
            }
          >
            <SelectSingle
              id={'persistentStorage'}
              placeholder={t('caches.create.configurations.feature.storage-placeholder')}
              selected={storage}
              options={selectOptionProps(PersistentCacheStorage)}
              onSelect={onSelectStorage}
            />
          </FormGroup>
        </GridItem>
      </Grid>
      {displayEditor()}
    </FeatureCard>
  );
};

export default PersistentCacheConfigurator;
