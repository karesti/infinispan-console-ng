import React, {useEffect, useState} from 'react';
import {Flex, FlexItem, FormGroup, Radio, Text, TextContent, TextInput, TextVariants,} from '@patternfly/react-core';
import {useTranslation} from 'react-i18next';
import {MoreInfoTooltip} from '@app/Common/MoreInfoTooltip';
import {IsolationLevel, TransactionalMode} from "@services/infinispanRefData";

const AdvancedTransactionalCacheConfigurator = (props: {
    transactionalOptions: TransactionalCacheAdvance,
    transactionalOptionsModifier: (TransactionalCacheAdvance) => void,
    transactionalMode?: string
}) => {

    const { t } = useTranslation();
    const brandname = t('brandname.brandname');

    const [stopTimeout, setStopTimeout] = useState(props.transactionalOptions.stopTimeout);
    const [transactionManagerLookup, setTransactionManagerLookup] = useState(props.transactionalOptions.transactionManagerLookup);
    const [completeTimeout, setCompleteTimeout] = useState(props.transactionalOptions.completeTimeout);
    const [reaperInterval, setReaperInterval] = useState(props.transactionalOptions.reaperInterval);
    const [recoveryCache, setRecoveryCache] = useState(props.transactionalOptions.recoveryCache);
    const [isolationLevel, setIsolationLevel] = useState<IsolationLevel | undefined>(props.transactionalOptions.isolationLevel as IsolationLevel);

    useEffect(() => {
        props.transactionalOptionsModifier({
            stopTimeout: stopTimeout,
            transactionManagerLookup: transactionManagerLookup,
            completeTimeout: completeTimeout,
            reaperInterval: reaperInterval,
            recoveryCache: recoveryCache,
            isolationLevel: isolationLevel,
        });
    }, [stopTimeout, transactionManagerLookup, completeTimeout, reaperInterval, recoveryCache, isolationLevel]);

    return (
        <React.Fragment>
            <FormGroup
                isInline
                isRequired
                fieldId="field-isolation-level"
            >
                <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.isolation-level-title')} toolTip={t('caches.create.configurations.advanced-options.isolation-level-tooltip')} textComponent={TextVariants.h3} />
                <Radio
                    name="radio-isolation-level"
                    id="repeatable-read"
                    onChange={() => setIsolationLevel(IsolationLevel.REPEATABLE_READ)}
                    isChecked={isolationLevel as IsolationLevel == IsolationLevel.REPEATABLE_READ}
                    label={
                        <TextContent>
                            <Text component={TextVariants.h4}>
                                {t('caches.create.configurations.advanced-options.isolation-level-repeatable-read')}
                            </Text>
                        </TextContent>
                    }
                />
                <Radio
                    name="radio-isolation-level"
                    id="read-committed"
                    onChange={() => setIsolationLevel(IsolationLevel.READ_COMMITTED)}
                    isChecked={isolationLevel as IsolationLevel == IsolationLevel.READ_COMMITTED}
                    label={
                        <TextContent>
                            <Text component={TextVariants.h4}>
                                {t('caches.create.configurations.advanced-options.isolation-level-read-committed')}
                            </Text>
                        </TextContent>
                    }
                />
            </FormGroup>
            <Flex>
                <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                    <FormGroup fieldId='stopTimeout' isInline>
                        <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.stop-timeout')} toolTip={t('caches.create.configurations.advanced-options.stop-timeout-tooltip', { brandname: brandname })} textComponent={TextVariants.h3} />
                        <TextInput placeholder='30000' value={stopTimeout} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setStopTimeout(undefined!) : setStopTimeout(parseInt(val)) }} aria-label="stop-timeout" />
                    </FormGroup>
                </FlexItem>
                <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                    <FormGroup fieldId='transactionManagerLookup' isInline>
                        <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.transaction-manager-lookup')} toolTip={t('caches.create.configurations.advanced-options.transaction-manager-lookup-tooltip')} textComponent={TextVariants.h3} />
                        <TextInput placeholder='org.infinispan.transaction.lookup.GenericTransactionManagerLookup' value={transactionManagerLookup} onChange={(val) => { val === '' ? setTransactionManagerLookup(undefined) : setTransactionManagerLookup(val) }} aria-label="transaction-manager-lookup" />
                    </FormGroup>
                </FlexItem>

                <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                    <FormGroup fieldId='completeTimeout' isInline>
                        <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.complete-timeout')} toolTip={t('caches.create.configurations.advanced-options.complete-timeout-tooltip', { brandname: brandname })} textComponent={TextVariants.h3} />
                        <TextInput placeholder='60000' value={completeTimeout} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setCompleteTimeout(undefined!) : setCompleteTimeout(parseInt(val)) }} aria-label="complete-timeout" />
                    </FormGroup>
                </FlexItem>
            </Flex>

            <Flex>
                <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                    <FormGroup fieldId='reaperInterval' isInline>
                        <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.reaper-interval')} toolTip={t('caches.create.configurations.advanced-options.reaper-interval-tooltip')} textComponent={TextVariants.h3} />
                        <TextInput placeholder='30000' value={reaperInterval} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setReaperInterval(undefined!) : setReaperInterval(parseInt(val)) }} aria-label="reaper-interval" />
                    </FormGroup>
                </FlexItem>
                <FlexItem hidden={props.transactionalMode !== TransactionalMode.FULL_XA} grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                    <FormGroup fieldId='recoveryCache' isInline>
                        <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.recovery-cache')} toolTip={t('caches.create.configurations.advanced-options.recovery-cache-tooltip')} textComponent={TextVariants.h3} />
                        <TextInput placeholder='__recoveryInfoCacheName__' value={recoveryCache} type="text" onChange={(val) => { val === '' ? setRecoveryCache(undefined) : setRecoveryCache(val) }} aria-label="recovery-cache" />
                    </FormGroup>
                </FlexItem>
            </Flex>
        </React.Fragment>
    );
};

export default AdvancedTransactionalCacheConfigurator;
