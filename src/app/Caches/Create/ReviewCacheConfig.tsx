import React, { useContext, useEffect, useState } from 'react';
import { Alert, AlertVariant, Content, ContentVariants, Flex, Form, FormGroup } from '@patternfly/react-core';
import { CodeEditor } from '@patternfly/react-code-editor';
import { useTranslation } from 'react-i18next';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { useCreateCache } from '@app/services/createCacheHook';
import { DARK, ThemeContext } from '@app/providers/ThemeProvider';
import LanguageToggleRadios from './LanguageToggleRadios';
import { ConfigDownloadType } from '@services/infinispanRefData';
import { ConsoleServices } from '@services/ConsoleServices';
import { toCodeEditorLanguage } from '@utils/getLanguage';

const ReviewCacheConfig = (props: { setReviewConfig: (string) => void; setContentType: (string) => void }) => {
  const { configuration } = useCreateCache();
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  const [language, setLanguage] = useState(ConfigDownloadType.JSON);
  const [jsonConfig, setJsonConfig] = useState(CacheConfigUtils.createCacheConfigFromData(configuration));
  const [yamlConfig, setYamlConfig] = useState('');
  const [xmlConfig, setXmlConfig] = useState('');
  const [error, setError] = useState('');
  const [validate, setValidate] = useState(true);

  useEffect(() => {
    if (validate) {
      // Convert the config to all formats
      // Also to check if the config is valid
      ConsoleServices.caches()
        .convertToAllFormat(configuration.start.cacheName, jsonConfig, 'json')
        .then((r) => {
          if (r.isRight()) {
            setYamlConfig(r.value.yaml);
            setJsonConfig(r.value.json);
            setXmlConfig(r.value.xml);
            setError('');
            props.setReviewConfig(r.value.json);
          } else {
            setError(r.value.message);
          }
        })
        .then(() => setValidate(false));
    }
  }, [validate]);

  useEffect(() => {
    props.setContentType(language.toLowerCase());
  }, [language]);

  const onChangeConfig = (editedConfig) => {
    props.setReviewConfig(editedConfig);
    if (language == ConfigDownloadType.JSON) {
      setJsonConfig(editedConfig);
    } else if (language == ConfigDownloadType.YAML) {
      setYamlConfig(editedConfig);
    } else {
      setXmlConfig(editedConfig);
    }
  };

  const config = () => {
    if (language == ConfigDownloadType.JSON) {
      return jsonConfig;
    }
    if (language == ConfigDownloadType.YAML) {
      return yamlConfig;
    }
    return xmlConfig;
  };

  const displayCacheConfigEditor = () => {
    return (
      <FormGroup fieldId="cache-config">
        {error !== '' && (
          <Alert style={{ marginBottom: '1rem' }} title="Invalid configuration" variant={AlertVariant.danger}>
            {error}
          </Alert>
        )}
        <CodeEditor
          onChange={onChangeConfig}
          language={toCodeEditorLanguage(language)}
          isLineNumbersVisible
          isLanguageLabelVisible
          code={config()}
          height={'400px'}
          isCopyEnabled
          isDarkTheme={theme === DARK}
          copyButtonSuccessTooltipText={t('caches.create.review.copied-tooltip')}
          copyButtonToolTipText={t('caches.create.review.copy-tooltip')}
        />
      </FormGroup>
    );
  };

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Content component={ContentVariants.h1}>{t('caches.create.review.review-title')}</Content>
      <Content component={ContentVariants.p}>{t('caches.create.review.review-subtitle')}</Content>
      <Flex>
        <Content component={ContentVariants.p}>{t('caches.create.review.review-cache-name')}</Content>
        <Content component={ContentVariants.h4}>{configuration.start.cacheName}</Content>
      </Flex>

      <LanguageToggleRadios language={language} setLanguage={setLanguage} />
      {displayCacheConfigEditor()}
    </Form>
  );
};

export default ReviewCacheConfig;
