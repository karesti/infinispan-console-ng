import React, {useEffect, useState} from 'react';

import {
  Alert,
  AlertActionLink,
  AlertVariant,
  ExpandableSection,
  Form,
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import {CodeEditor, Language} from '@patternfly/react-code-editor';
import {CubeIcon} from '@patternfly/react-icons';
import {useTranslation} from 'react-i18next';
import {ConsoleServices} from '@services/ConsoleServices';
import {useApiAlert} from '@app/utils/useApiAlert';

const CacheConfigEditor = (props: {
    cmName: string,
    cacheEditor: CacheEditorStep,
    cacheEditorModifier: (CacheEditorStep) => void,
}) => {
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
    const cmName = props.cmName;
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
                .getCacheConfigurationTemplates(cmName)
                .then((eitherTemplates) => {
                    if (eitherTemplates.isRight()) {
                        let options: TemplateOptionSelect[] = [];
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
            editorExpanded: editorExpanded,
        });
    }, [editorConfig, configs, validConfig, errorConfig, selectedConfig, configExpanded, editorExpanded, loading]);

    const handleChangeConfig = (editorConfig) => {
        setEditorConfig(editorConfig);
        setValidConfig('success')
    };

    const onToggleTemplateName = (isExpanded) => {
        setConfigExpanded(isExpanded);
    };

    const onSelectTemplate = (event, selection, isPlaceholder) => {
        setSelectedConfig(selection);
        setConfigExpanded(false);
        setValidConfig('success');
    };

    const clearSelection = () => {
        setSelectedConfig('');
        setConfigExpanded(false);
        setValidConfig('default');
    };

    const onToggleConfigPanel = () => {
        const expanded = !editorExpanded;
        setEditorExpanded(expanded)
        setSelectedConfigDisabled(expanded);
        setSelectedConfig('')
        expanded ? setValidConfig('success') : setValidConfig('default');
    };

    const displayCacheConfigEditor = () => {
        return (
            <FormGroup
                label={t('caches.create.edit-config.cache-config')}
                fieldId="cache-config"
                validated={validConfig}
                helperTextInvalid={t('caches.create.edit-config.cache-config-invalid')}
                isRequired={configs.length == 0}
            >
                <CodeEditor
                    isLineNumbersVisible
                    isMinimapVisible
                    isLanguageLabelVisible
                    code={editorConfig}
                    onChange={handleChangeConfig}
                    id="cache-config"
                    language={Language.json}
                    height='400px'
                />
                <Alert
                    isInline
                    title={t('caches.create.edit-config.demo-cache')}
                    variant={AlertVariant.info}
                    actionLinks={
                        <AlertActionLink
                            onClick={() => window.open(configurationDocs, '_blank')}
                        >
                            {t('caches.create.cache-configuration-docs')}
                        </AlertActionLink>
                    }
                />
            </FormGroup>
        );
    };

    const titleId = 'plain-typeahead-select-id';

    const handleTemplates = () => {
        if (configs.length == 0) {
            return displayCacheConfigEditor();
        }

        return (
            <React.Fragment>
                <FormGroup
                    fieldId="cache-config-name"
                    label={t('caches.create.templates')}
                    helperText={t('caches.create.templates-help')}
                    validated={validConfig}
                    helperTextInvalid={t('caches.create.template-help-invalid')}
                >
                    <Select
                        data-testid="template-selector"
                        toggleIcon={<CubeIcon />}
                        variant={SelectVariant.typeahead}
                        aria-label={t('caches.create.templates')}
                        onToggle={onToggleTemplateName}
                        onSelect={onSelectTemplate}
                        // @ts-ignore
                        selections={selectedConfig}
                        isOpen={configExpanded}
                        isDisabled={selectedConfigDisabled}
                        aria-labelledby={titleId}
                        placeholderText={t('caches.create.templates-placeholder')}
                        onClear={clearSelection}
                        validated={validConfig}
                    >
                        {configs.map((option, index) => (
                            <SelectOption
                                key={index}
                                value={option.value}
                            />
                        ))}
                    </Select>
                </FormGroup>
                <ExpandableSection
                    toggleText={t('caches.create.configuration-provide')}
                    isExpanded={editorExpanded}
                    onToggle={onToggleConfigPanel}
                    role={'display-editor'}
                >
                    {displayCacheConfigEditor()}
                </ExpandableSection>
            </React.Fragment>
        );
    };

    return (
        <React.Fragment>
            <TextContent>
                <Text component={TextVariants.h2}>{t('caches.create.edit-config.page-title')}</Text>
            </TextContent>
            <Form
            >
                {handleTemplates()}
            </Form>
        </React.Fragment>
    );
};

export default CacheConfigEditor;
