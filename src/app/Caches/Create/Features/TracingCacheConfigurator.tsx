import React, { useEffect, useState } from 'react';
import { FormGroup, FormHelperText, FormSection, HelperText, HelperTextItem, Switch } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useCreateCache } from '@app/services/createCacheHook';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';
import { selectOptionPropsFromArray } from '@utils/selectOptionPropsCreator';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { TracingCategories } from '@services/infinispanRefData';

const TracingCacheConfigurator = (props: { tracingEnabled: boolean }) => {
  const { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const [tracingConf, setTracingConf] = useState(configuration.advanced.tracing);

  useEffect(() => {
    setTracingConf((prevState) => {
      return {
        ...prevState,
        globalEnabled: props.tracingEnabled
      };
    });
  }, [props.tracingEnabled]);

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        advanced: {
          ...prevState.advanced,
          tracing: tracingConf,
          valid: tracingFeatureValidation()
        }
      };
    });
  }, [tracingConf]);

  const validateForm = (): 'success' | 'default' | 'error' => {
    return tracingConf.enabled && tracingConf.categories.length == 0 ? 'error' : 'success';
  };

  const tracingFeatureValidation = (): boolean => {
    return (
      !tracingConf.globalEnabled || !tracingConf.enabled || (tracingConf.enabled && tracingConf.categories.length > 0)
    );
  };

  const onSelectCategories = (selection) => {
    if (tracingConf.categories.includes(selection)) {
      setTracingConf((prevState) => {
        return {
          ...prevState,
          categories: tracingConf.categories.filter((category) => category !== selection)
        };
      });
    } else {
      setTracingConf((prevState) => {
        return {
          ...prevState,
          categories: [...tracingConf.categories, selection]
        };
      });
    }
  };

  const enableTracing = () => {
    return (
      <FormGroup fieldId="form-tracing">
        <Switch
          aria-label="tracing"
          data-cy="tracingSwitch"
          id="tracing"
          isChecked={tracingConf.enabled}
          onChange={() => {
            setTracingConf((prevState) => {
              return {
                ...prevState,
                enabled: !tracingConf.enabled
              };
            });
          }}
          hasCheckIcon
          label={
            tracingConf.enabled
              ? t('caches.create.configurations.advanced-options.tracing-disable')
              : t('caches.create.configurations.advanced-options.tracing-enable')
          }
        />
        <PopoverHelp
          name={'tracing'}
          label={t('caches.create.configurations.advanced-options.tracing')}
          content={t('caches.create.configurations.advanced-options.tracing-tooltip')}
        />
      </FormGroup>
    );
  };

  const buildContent = () => {
    if (!props.tracingEnabled) {
      return <></>;
    }

    return (
      <FormSection title={t('caches.create.configurations.advanced-options.tracing-title')}>
        {enableTracing()}
        <FormGroup fieldId="select-categories" isRequired label={'Categories'}>
          <SelectMultiWithChips
            id="categorySelector"
            placeholder={t('caches.create.configurations.advanced-options.select-tracing-categories')}
            options={selectOptionPropsFromArray(TracingCategories)}
            selection={tracingConf.categories}
            onSelect={onSelectCategories}
            onClear={() => {
              setTracingConf((prevState) => {
                return {
                  ...prevState,
                  categories: []
                };
              });
            }}
          />
          {validateForm() === 'error' && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                  {t('caches.create.configurations.advanced-options.select-tracing-categories-helper')}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
      </FormSection>
    );
  };

  return buildContent();
};

export default TracingCacheConfigurator;
