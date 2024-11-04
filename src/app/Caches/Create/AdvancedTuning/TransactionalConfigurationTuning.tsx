import React, { useEffect, useState } from 'react';
import {
  FormGroup,
  FormSection,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  Radio,
  TextInput
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { CacheFeature, IsolationLevel } from '@services/infinispanRefData';
import { useCreateCache } from '@app/services/createCacheHook';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import TimeQuantityInputGroup from '@app/Caches/Create/TimeQuantityInputGroup';

const TransactionalConfigurationTuning = () => {
  const { t } = useTranslation();
  const { configuration, setConfiguration } = useCreateCache();
  const brandname = t('brandname.brandname');

  const [stopTimeout, setStopTimeout] = useState(configuration.advanced.transactionalAdvance?.stopTimeout);
  const [stopTimeoutUnit, setStopTimeoutUnit] = useState(configuration.advanced.transactionalAdvance?.stopTimeoutUnit);
  const [completeTimeout, setCompleteTimeout] = useState(configuration.advanced.transactionalAdvance?.completeTimeout);
  const [completeTimeoutUnit, setCompleteTimeoutUnit] = useState(
    configuration.advanced.transactionalAdvance?.completeTimeoutUnit
  );
  const [reaperInterval, setReaperInterval] = useState(configuration.advanced.transactionalAdvance?.reaperInterval);
  const [reaperIntervalUnit, setReaperIntervalUnit] = useState(
    configuration.advanced.transactionalAdvance?.reaperIntervalUnit
  );
  const [isolationLevel, setIsolationLevel] = useState<IsolationLevel | undefined>(
    configuration.advanced.transactionalAdvance?.isolationLevel as IsolationLevel
  );

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        advanced: {
          ...prevState.advanced,
          transactionalAdvance: {
            stopTimeout: stopTimeout,
            stopTimeoutUnit: stopTimeoutUnit,
            completeTimeout: completeTimeout,
            completeTimeoutUnit: completeTimeoutUnit,
            reaperInterval: reaperInterval,
            reaperIntervalUnit: reaperIntervalUnit,
            isolationLevel: isolationLevel
          }
        }
      };
    });
  }, [
    stopTimeout,
    stopTimeoutUnit,
    completeTimeout,
    completeTimeoutUnit,
    reaperInterval,
    reaperIntervalUnit,
    isolationLevel
  ]);

  if (!configuration.feature.cacheFeatureSelected.includes(CacheFeature.TRANSACTIONAL)) {
    return <div />;
  }

  return (
    <FormSection title={t('caches.create.configurations.advanced-options.transactional-tuning')}>
      <HelperText>
        <HelperTextItem>
          {t('caches.create.configurations.advanced-options.transactional-tuning-tooltip')}
        </HelperTextItem>
      </HelperText>
      <Grid md={4} hasGutter>
        <GridItem span={12}>
          <FormGroup
            isInline
            fieldId="field-isolation-level"
            label={t('caches.create.configurations.advanced-options.isolation-level-title')}
            labelHelp={
              <PopoverHelp
                name="field-isolation-level"
                label={t('caches.create.configurations.advanced-options.isolation-level-title')}
                content={t('caches.create.configurations.advanced-options.isolation-level-tooltip')}
              />
            }
          >
            <Radio
              name="radio-isolation-level"
              id="repeatable-read"
              onChange={() => setIsolationLevel(IsolationLevel.REPEATABLE_READ)}
              isChecked={(isolationLevel as IsolationLevel) == IsolationLevel.REPEATABLE_READ}
              label={
                <PopoverHelp
                  name={'full-xa'}
                  text={t('caches.create.configurations.advanced-options.isolation-level-repeatable-read')}
                  label={t('caches.create.configurations.advanced-options.isolation-level-repeatable-read')}
                  content={t('caches.create.configurations.advanced-options.isolation-level-repeatable-read-tooltip', {
                    brandname: brandname
                  })}
                />
              }
            />
            <Radio
              name="radio-isolation-level"
              id="read-committed"
              onChange={() => setIsolationLevel(IsolationLevel.READ_COMMITTED)}
              isChecked={(isolationLevel as IsolationLevel) == IsolationLevel.READ_COMMITTED}
              label={
                <PopoverHelp
                  name={'full-xa'}
                  text={t('caches.create.configurations.advanced-options.isolation-level-read-committed')}
                  label={t('caches.create.configurations.advanced-options.isolation-level-read-committed')}
                  content={t('caches.create.configurations.advanced-options.isolation-level-read-committed-tooltip', {
                    brandname: brandname
                  })}
                />
              }
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            fieldId="stopTimeout"
            label={t('caches.create.configurations.advanced-options.stop-timeout')}
            labelHelp={
              <PopoverHelp
                name="stopTimeout"
                label={t('caches.create.configurations.advanced-options.stop-timeout')}
                content={t('caches.create.configurations.advanced-options.stop-timeout-tooltip', {
                  brandname: brandname
                })}
              />
            }
          >
            <TimeQuantityInputGroup
              name={'stopTimeout'}
              defaultValue={'30000'}
              value={stopTimeout}
              valueModifier={setStopTimeout}
              unit={stopTimeoutUnit}
              unitModifier={setStopTimeoutUnit}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            fieldId="completeTimeout"
            label={t('caches.create.configurations.advanced-options.complete-timeout')}
            labelHelp={
              <PopoverHelp
                name="completeTimeout"
                label={t('caches.create.configurations.advanced-options.complete-timeout')}
                content={t('caches.create.configurations.advanced-options.complete-timeout-tooltip', {
                  brandname: brandname
                })}
              />
            }
          >
            <TimeQuantityInputGroup
              name={'completeTimeout'}
              defaultValue={'60000'}
              value={completeTimeout}
              valueModifier={setCompleteTimeout}
              unit={completeTimeoutUnit}
              unitModifier={setCompleteTimeoutUnit}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            fieldId="reaperInterval"
            label={t('caches.create.configurations.advanced-options.reaper-interval')}
            labelHelp={
              <PopoverHelp
                name="reaperInterval"
                label={t('caches.create.configurations.advanced-options.reaper-interval')}
                content={t('caches.create.configurations.advanced-options.reaper-interval-tooltip', {
                  brandname: brandname
                })}
              />
            }
          >
            <TimeQuantityInputGroup
              name={'reaperInterval'}
              defaultValue={'30000'}
              value={reaperInterval}
              valueModifier={setReaperInterval}
              unit={reaperIntervalUnit}
              unitModifier={setReaperIntervalUnit}
            />
          </FormGroup>
        </GridItem>
      </Grid>
    </FormSection>
  );
};

export default TransactionalConfigurationTuning;
