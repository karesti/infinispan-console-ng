import React from 'react';
import {Flex, Form, FormGroup, Text, TextContent, TextVariants} from '@patternfly/react-core';
import {CodeEditor, Language} from '@patternfly/react-code-editor';
import {useTranslation} from 'react-i18next';
import {CacheConfigUtils} from "@services/cacheConfigUtils";

const ReviewCacheConfig = (props:
    {
        cacheName: string,
        cacheConfiguration: CacheConfiguration,
        setReviewConfig: (string) => void
    }) => {

    const { t } = useTranslation();

    const displayCacheConfigEditor = () => {
        return (
            <FormGroup
                fieldId="cache-config"
            >
                <CodeEditor
                    onChange={props.setReviewConfig}
                    isLineNumbersVisible
                    isMinimapVisible
                    isLanguageLabelVisible
                    code={CacheConfigUtils.createCacheConfigFromData(props.cacheConfiguration)}
                    language={Language.json}
                    height='400px'
                />
            </FormGroup>
        );
    };

    return (
        <Form onSubmit={(e) => {
          e.preventDefault();
        }}>
            <TextContent>
                <Text component={TextVariants.h1}>{t('caches.create.review.review-title')}</Text>
                <TextContent>
                    <Text component={TextVariants.p}>{t('caches.create.review.review-subtitle')}</Text>
                </TextContent>
                <Flex>
                    <Text component={TextVariants.p}>{t('caches.create.review.review-cache-name')}</Text>
                    <Text component={TextVariants.h4}>{props.cacheName}</Text>
                </Flex>
            </TextContent>

            {displayCacheConfigEditor()}
        </Form>
    );
};

export default ReviewCacheConfig;
