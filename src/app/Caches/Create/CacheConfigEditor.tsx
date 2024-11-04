import React, { useContext, useEffect, useState } from 'react';

import {
  Alert,
  AlertActionLink,
  AlertVariant,
  ExpandableSection,
  Form,
  FormGroup,
  FormHelperText,
  FormSection,
  HelperText,
  HelperTextItem,
  Spinner
} from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@app/utils/useApiAlert';
import { DARK, ThemeContext } from '@app/providers/ThemeProvider';
import { SelectSingleTypehead } from '@app/Common/SelectSingleTypehead';
import { selectOptionPropsFromArray } from '@utils/selectOptionPropsCreator';

const CacheConfigEditor = (props: {
  cacheEditor: CacheEditorStep;
  cacheEditorModifier: (CacheEditorStep) => void;
  setReviewConfig: (string) => void;
}) => {
  const { theme } = useContext(ThemeContext);
  const sampleConfig =
    '{\n' +
    '  "distributed-cache": {\n' +
    '    "mode": "SYNC",\n' +
    '    "encoding": {\n' +
    '      "media-type": "application/x-protostream"\n' +
    '    },\n' +
    '    "statistics": true\n' +
    '  }\n' +
    '}';

  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const configurationDocs = t('brandname.configuration-docs-link');
  const [selectedConfigDisabled, setSelectedConfigDisabled] = useState(false);

  const [editorConfig, setEditorConfig] = useState(props.cacheEditor.editorConfig || sampleConfig);
  const [configs, setConfigs] = useState(props.cacheEditor.configs);
  const [validConfig, setValidConfig] = useState(props.cacheEditor.validConfig);
  const [errorConfig, setErrorConfig] = useState(props.cacheEditor.errorConfig);
  const [selectedConfig, setSelectedConfig] = useState(props.cacheEditor.selectedConfig);
  const [configExpanded, setConfigExpanded] = useState(props.cacheEditor.configExpanded);
  const [editorExpanded, setEditorExpanded] = useState(props.cacheEditor.editorExpanded);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      ConsoleServices.dataContainer()
        .getCacheConfigurationTemplates()
        .then((eitherTemplates) => {
          if (eitherTemplates.isRight()) {
            const options: TemplateOptionSelect[] = [];
            eitherTemplates.value.forEach((template) => {
              options.push({ value: template.name });
            });
            setConfigs(options);
          } else {
            addAlert(eitherTemplates.value);
          }
        })
        .finally(() => setLoading(false));
    }
    props.cacheEditorModifier({
      editorConfig: editorConfig,
      configs: configs,
      validConfig: validConfig,
      errorConfig: errorConfig,
      selectedConfig: selectedConfig,
      configExpanded: configExpanded,
      editorExpanded: editorExpanded
    });
    props.setReviewConfig(editorConfig);
  }, [editorConfig, configs, validConfig, errorConfig, selectedConfig, configExpanded, editorExpanded, loading]);

  const handleChangeConfig = (editorConfig) => {
    props.setReviewConfig(editorConfig);
    setEditorConfig(editorConfig);
    setValidConfig('success');
  };

  const onSelectTemplate = (selection) => {
    setSelectedConfig(selection);
    setValidConfig('success');
  };

  const clearSelection = () => {
    setSelectedConfig('');
    setValidConfig('default');
  };

  const onToggleConfigPanel = () => {
    const expanded = !editorExpanded;
    setEditorExpanded(expanded);
    setSelectedConfigDisabled(expanded);
    setSelectedConfig('');
    expanded ? setValidConfig('success') : setValidConfig('default');
  };

  const displayCacheConfigEditor = () => {
    return (
      <FormGroup
        label={t('caches.create.edit-config.cache-config')}
        fieldId="cache-config"
        isRequired={configs.length == 0}
      >
        <CodeEditor
          isLineNumbersVisible
          language={Language.plaintext}
          code={editorConfig}
          onChange={handleChangeConfig}
          id="cache-config"
          height="200px"
          isDarkTheme={theme === DARK}
        />
        <Alert
          isInline
          title={t('caches.create.edit-config.demo-cache')}
          variant={AlertVariant.info}
          actionLinks={
            <AlertActionLink onClick={() => window.open(configurationDocs, '_blank')}>
              {t('caches.create.cache-configuration-docs')}
            </AlertActionLink>
          }
        />
      </FormGroup>
    );
  };

  const templates = () => {
    return selectOptionPropsFromArray(configs.map((c) => c.value));
  };

  const handleTemplates = () => {
    if (loading) {
      return <Spinner size={'xl'} />;
    }

    if (configs.length == 0) {
      return displayCacheConfigEditor();
    }

    return (
      <Form>
        <FormSection title={t('caches.create.edit-config.page-title')} titleElement="h2">
          <FormGroup fieldId="cache-config-name" label={t('caches.create.templates')}>
            <SelectSingleTypehead
              id="templates"
              onSelect={onSelectTemplate}
              selected={selectedConfig}
              isDisabled={selectedConfigDisabled}
              placeholder={t('caches.create.templates-placeholder')}
              onClear={clearSelection}
              options={templates()}
              style={{ width: '400px' }}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant={validConfig}>{t('caches.create.templates-help')}</HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
          <ExpandableSection
            data-cy="provideConfigArea"
            toggleText={t('caches.create.configuration-provide')}
            isExpanded={editorExpanded}
            onToggle={onToggleConfigPanel}
            role={'display-editor'}
          >
            {displayCacheConfigEditor()}
          </ExpandableSection>
        </FormSection>
      </Form>
    );
  };

  return <React.Fragment>{handleTemplates()}</React.Fragment>;
};

export default CacheConfigEditor;
