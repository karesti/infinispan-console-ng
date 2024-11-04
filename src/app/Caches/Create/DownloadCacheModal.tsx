import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  Content,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Radio,
  Spinner
} from '@patternfly/react-core';
import { ConfigDownloadType } from '@services/infinispanRefData';
import { useTranslation } from 'react-i18next';
import { DownloadIcon } from '@patternfly/react-icons';
import { ConsoleServices } from '@services/ConsoleServices';

const DownloadCacheModal = (props: {
  cacheName: string;
  configuration: string;
  isModalOpen: boolean;
  closeModal: () => void;
  contentType: 'json' | 'yaml' | 'xml';
}) => {
  const { t } = useTranslation();

  const [downloadLanguage, setDownloadLanguage] = useState(ConfigDownloadType.JSON);
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState('');
  const [jsonConfig, setJsonConfig] = useState(props.configuration);
  const [yamlConfig, setYamlConfig] = useState('');
  const [xmlConfig, setXmlConfig] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadURL, setDownloadURL] = useState(
    'data:text/json;charset=utf-8,' + encodeURIComponent(props.configuration)
  );

  useEffect(() => {
    downloadLanguage === ConfigDownloadType.JSON
      ? setCode(jsonConfig)
      : downloadLanguage === ConfigDownloadType.YAML
        ? setCode(yamlConfig)
        : setCode(xmlConfig);
  }, [jsonConfig, yamlConfig, xmlConfig, downloadLanguage]);

  useEffect(() => {
    if (props.configuration && props.isModalOpen) {
      // Convert the config to all formats
      // Also to check if the config is valid
      ConsoleServices.caches()
        .convertToAllFormat(props.cacheName, props.configuration, props.contentType)
        .then((r) => {
          if (r.isRight()) {
            setYamlConfig(r.value.yaml);
            setJsonConfig(r.value.json);
            setXmlConfig(r.value.xml);
            setError('');
          } else {
            setError(r.value.message);
          }
        })
        .finally(() => setLoading(false));
      setDownloadURL('data:text/json;charset=utf-8,' + encodeURIComponent(props.configuration));
    }
  }, [props.configuration, props.isModalOpen]);

  useEffect(() => {
    if (downloadLanguage === ConfigDownloadType.JSON) {
      setDownloadURL('data:text/json;charset=utf-8,' + encodeURIComponent(jsonConfig));
    } else if (downloadLanguage === ConfigDownloadType.YAML) {
      setDownloadURL('data:text/yaml;charset=utf-8,' + encodeURIComponent(yamlConfig));
    } else if (downloadLanguage === ConfigDownloadType.XML) {
      setDownloadURL('data:text/yaml;charset=utf-8,' + encodeURIComponent(xmlConfig));
    }
  }, [downloadLanguage, jsonConfig, props.configuration, xmlConfig, yamlConfig]);

  const clipboardCopyFunc = (event, text) => {
    navigator.clipboard.writeText(text.toString());
  };

  const onClick = (event, text) => {
    clipboardCopyFunc(event, text);
    setCopied(true);
  };

  const actions = (
    <CodeBlockAction>
      <ClipboardCopyButton
        id="expandable-copy-button"
        textId="code-content"
        aria-label="Copy to clipboard"
        onClick={(e) => onClick(e, jsonConfig)}
        exitDelay={copied ? 1500 : 600}
        maxWidth="110px"
        variant="plain"
        onTooltipHidden={() => setCopied(false)}
      >
        {copied ? t('caches.create.review.copied-tooltip') : t('caches.create.review.copy-tooltip')}
      </ClipboardCopyButton>
    </CodeBlockAction>
  );

  const codeBlock = (
    <React.Fragment>
      {error !== '' ? (
        <Alert style={{ marginBottom: '1rem' }} title="Invalid configuration" variant={AlertVariant.danger}>
          {error}
        </Alert>
      ) : (
        <CodeBlock actions={actions}>
          <CodeBlockCode>{code}</CodeBlockCode>
        </CodeBlock>
      )}
    </React.Fragment>
  );

  return (
    <Modal variant={ModalVariant.medium} isOpen={props.isModalOpen} onClose={props.closeModal}>
      <ModalHeader
        title={t('caches.create.review.download-title')}
        description={t('caches.create.review.download-description')}
      />
      <ModalBody>
        {loading && (
          <Content>
            {t('caches.create.review.formatting-loading')} <Spinner isInline aria-label="formattting..." />
          </Content>
        )}
        {!loading && (
          <Form isHorizontal id="download-modal-form">
            <FormGroup hasNoPaddingTop isInline label="Code language" fieldId="code-language-radio-field">
              <Radio
                name="language-radio"
                id="modal-JSON"
                onChange={() => {
                  setDownloadLanguage(ConfigDownloadType.JSON);
                }}
                isChecked={(downloadLanguage as ConfigDownloadType) == ConfigDownloadType.JSON}
                label={t('caches.create.review.json')}
              />
              <Radio
                name="language-radio"
                id="modal-XML"
                onChange={() => setDownloadLanguage(ConfigDownloadType.XML)}
                isChecked={(downloadLanguage as ConfigDownloadType) == ConfigDownloadType.XML}
                label={t('caches.create.review.xml')}
              />
              <Radio
                name="language-radio"
                id="modal-YAML"
                onChange={() => setDownloadLanguage(ConfigDownloadType.YAML)}
                isChecked={(downloadLanguage as ConfigDownloadType) == ConfigDownloadType.YAML}
                label={t('caches.create.review.yaml')}
              />
            </FormGroup>
            {codeBlock}
          </Form>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          component="a"
          key="download"
          data-cy="downloadButton"
          variant={ButtonVariant.tertiary}
          icon={<DownloadIcon />}
          onClick={props.closeModal}
          isDisabled={error !== '' || loading}
          href={downloadURL}
          download={props.cacheName + `.` + downloadLanguage.toLocaleLowerCase()}
        >
          {t('caches.create.review.download-button')}
        </Button>
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          {t('caches.create.review.cancel-button')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
export default DownloadCacheModal;
