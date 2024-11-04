import React, { useContext } from 'react';
import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardBody,
  ClipboardCopy,
  ClipboardCopyVariant,
  Spinner,
  Tab,
  TabContent,
  TabContentBody,
  Tabs,
  TabTitleText
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useFetchConfigurationXML, useFetchConfigurationYAML } from '@app/services/configHook';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { DARK, ThemeContext } from '@app/providers/ThemeProvider';
import { t_global_background_color_100 } from '@patternfly/react-tokens';

const CacheConfiguration = (props: { cacheName: string; editable: boolean; config: string }) => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const encodingDocs = t('brandname.encoding-docs-link');
  const { syntaxHighLighterTheme } = useContext(ThemeContext);
  const yamlConfig = useFetchConfigurationYAML(props.cacheName);
  const xmlConfig = useFetchConfigurationXML(props.cacheName);

  const contentRef1 = React.createRef<HTMLElement>();
  const contentRef2 = React.createRef<HTMLElement>();
  const contentRef3 = React.createRef<HTMLElement>();

  if (!props.config) {
    return <Spinner size={'md'} />;
  }

  const displayHeaderAlert = () => {
    if (props.editable) {
      return '';
    }

    return (
      <Alert
        isInline
        title={t('caches.configuration.no-encoding-warning')}
        variant={AlertVariant.warning}
        actionLinks={
          <AlertActionLink onClick={() => window.open(encodingDocs, '_blank')}>
            {t('caches.configuration.encoding-docs-message')}
          </AlertActionLink>
        }
      />
    );
  };

  const displayConfig = (config: string) => {
    if (!config) {
      return <Spinner size={'sm'} />;
    }

    return (
      <Card isPlain isFullHeight>
        <CardBody>
          {displayHeaderAlert()}
          <ClipboardCopy isReadOnly isCode variant={ClipboardCopyVariant.inline}>
            {config}
          </ClipboardCopy>
          <SyntaxHighlighter
            wrapLines={false}
            style={syntaxHighLighterTheme}
            useInlineStyles={true}
            showLineNumbers={true}
          >
            {config}
          </SyntaxHighlighter>
        </CardBody>
      </Card>
    );
  };

  return (
    <>
      <Tabs defaultActiveKey={0} style={theme === DARK ? {} : { backgroundColor: t_global_background_color_100.value }}>
        <Tab eventKey={0} title={<TabTitleText>JSON</TabTitleText>} tabContentId="tab1" tabContentRef={contentRef1} />
        <Tab eventKey={1} title={<TabTitleText>XML</TabTitleText>} tabContentId="tab2" tabContentRef={contentRef2} />
        <Tab eventKey={2} title={<TabTitleText>YAML</TabTitleText>} tabContentId="tab3" tabContentRef={contentRef3} />
      </Tabs>
      <TabContent eventKey={0} id="tab1" ref={contentRef1}>
        <TabContentBody> {displayConfig(props.config)} </TabContentBody>
      </TabContent>
      <TabContent eventKey={1} id="tab2" ref={contentRef2} hidden>
        <TabContentBody> {xmlConfig && displayConfig(xmlConfig.configuration)} </TabContentBody>
      </TabContent>
      <TabContent eventKey={2} id="tab3" ref={contentRef3} hidden>
        <TabContentBody> {yamlConfig && displayConfig(yamlConfig.configuration)} </TabContentBody>
      </TabContent>
    </>
  );
};

export { CacheConfiguration };
