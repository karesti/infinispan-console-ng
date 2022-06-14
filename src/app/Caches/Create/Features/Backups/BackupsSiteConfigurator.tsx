import React, { useEffect, useState } from 'react';
import {
    Divider,
    Flex,
    FlexItem,
    Form,
    FormGroup,
    Radio,
    Select,
    SelectOption,
    SelectVariant,
    Switch,
    Text,
    TextContent,
    TextInput,
    TextVariants,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';
import { BackupSiteStrategy, BackupSiteFailurePolicy, BackupSiteStateTransferMode } from "@services/infinispanRefData";

const BackupSiteConfigurator = (props: {
    backupSiteOptions: BackupSite[],
    backupSiteOptionsModifier: (BackupSite) => void,
    index: number,
    siteBasic: BackupSiteBasic,
}) => {

    const { t } = useTranslation();
    const brandname = t('brandname.brandname');

    const [failurePolicy, setFailurePolicy] = useState(props.backupSiteOptions[props.index]?.failurePolicy!);
    const [timeout, setTimeout] = useState(props.backupSiteOptions[props.index]?.timeout!);
    const [twoPhaseCommit, setTwoPhaseCommit] = useState(props.backupSiteOptions[props.index]?.twoPhaseCommit!);
    const [failurePolicyClass, setFailurePolicyClass] = useState(props.backupSiteOptions[props.index]?.failurePolicyClass!);

    const [afterFailures, setAfterFailures] = useState(props.backupSiteOptions![props.index]?.takeOffline?.afterFailures!);
    const [minWait, setMinWait] = useState(props.backupSiteOptions[props.index]?.takeOffline?.minWait!);

    const [chunckSize, setChunckSize] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.chunckSize!);
    const [timeoutStateTransfer, setTimeoutStateTransfer] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.timeout!);
    const [maxRetries, setMaxRetries] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.maxRetries!);
    const [waitTime, setWaitTime] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.waitTime!);
    const [mode, setMode] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.mode!);

    const [isOpenFailurePolicy, setIsOpenFailurePolicy] = useState(false);

    useEffect(() => {
        const data = {
            failurePolicy: failurePolicy,
            timeout: timeout,
            twoPhaseCommit: twoPhaseCommit,
            failurePolicyClass: failurePolicyClass,
            takeOffline: {
                afterFailures: afterFailures,
                minWait: minWait,
            },
            stateTransfer: {
                chunckSize: chunckSize,
                timeout: timeoutStateTransfer,
                maxRetries: maxRetries,
                waitTime: waitTime,
                mode: mode,
            },
        }
        props.backupSiteOptionsModifier([
            ...props.backupSiteOptions.slice(0, props.index),
            data,
            ...props.backupSiteOptions.slice(props.index + 1)]);

    }, [failurePolicy, timeout, twoPhaseCommit, failurePolicyClass, afterFailures, minWait, chunckSize, timeoutStateTransfer, maxRetries, waitTime, mode]);

    const onSelectFailurePolicy = (event, selection, isPlaceholder) => {
        setFailurePolicy(selection);
        setIsOpenFailurePolicy(false);
    };


    const formTakeOffline = () => {
        return (
            <React.Fragment>
                <MoreInfoTooltip label={t('caches.create.configurations.feature.take-offline')} toolTip={t('caches.create.configurations.feature.take-offline-tooltip', { brandname: brandname })} textComponent={TextVariants.h2} />
                <Flex>
                    <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                        <FormGroup fieldId='afterfailures'>
                            <MoreInfoTooltip label={t('caches.create.configurations.feature.after-failure')} toolTip={t('caches.create.configurations.feature.after-failure-tooltip')} textComponent={TextVariants.h3} />
                            <TextInput placeholder='0' type='number' id='timeout' value={afterFailures} onChange={(e) => { isNaN(parseInt(e)) ? setAfterFailures(undefined!) : setAfterFailures(parseInt(e)) }} />
                        </FormGroup>
                    </FlexItem>
                    <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                        <FormGroup fieldId='minwait'>
                            <MoreInfoTooltip label={t('caches.create.configurations.feature.min-wait')} toolTip={t('caches.create.configurations.feature.min-wait-tooltip')} textComponent={TextVariants.h3} />
                            <TextInput placeholder='0' type='number' id='minwait' value={minWait} onChange={(e) => { isNaN(parseInt(e)) ? setMinWait(undefined!) : setMinWait(parseInt(e)) }} />
                        </FormGroup>
                    </FlexItem>
                </Flex>
            </React.Fragment>
        )
    }

    const formStateTransfer = () => {
        return (
            <React.Fragment>
                <MoreInfoTooltip label={t('caches.create.configurations.feature.state-transfer')} toolTip={t('caches.create.configurations.feature.state-transfer-tooltip')} textComponent={TextVariants.h2} />
                <Flex>
                    <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                        <FormGroup isInline fieldId='chuncksize'>
                            <MoreInfoTooltip label={t('caches.create.configurations.feature.chunk-size')} toolTip={t('caches.create.configurations.feature.chunk-size-tooltip')} textComponent={TextVariants.h3} />
                            <TextInput placeholder='512' type='number' id='chuncksize' value={chunckSize} onChange={(e) => { isNaN(parseInt(e)) ? setChunckSize(undefined!) : setChunckSize(parseInt(e)) }} />
                        </FormGroup>
                    </FlexItem>
                    <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                        <FormGroup isInline fieldId='timeout-state-transfer'>
                            <MoreInfoTooltip label={t('caches.create.configurations.feature.timeout-state-transfer')} toolTip={t('caches.create.configurations.feature.timeout-state-transfer-tooltip')} textComponent={TextVariants.h3} />
                            <TextInput placeholder='1200000' type='number' id='timeout' value={timeoutStateTransfer} onChange={(e) => { isNaN(parseInt(e)) ? setTimeoutStateTransfer(undefined!) : setTimeoutStateTransfer(parseInt(e)) }} />
                        </FormGroup>
                    </FlexItem>
                    <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                        <FormGroup isInline fieldId='maxretries'>
                            <MoreInfoTooltip label={t('caches.create.configurations.feature.max-retries')} toolTip={t('caches.create.configurations.feature.max-retries-tooltip')} textComponent={TextVariants.h3} />
                            <TextInput placeholder='30' type='number' id='maxretries' value={maxRetries} onChange={(e) => { isNaN(parseInt(e)) ? setMaxRetries(undefined!) : setMaxRetries(parseInt(e)) }} />
                        </FormGroup>
                    </FlexItem>
                    <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                        <FormGroup isInline fieldId='wait-time'>
                            <MoreInfoTooltip label={t('caches.create.configurations.feature.wait-time')} toolTip={t('caches.create.configurations.feature.wait-time-tooltip')} textComponent={TextVariants.h3} />
                            <TextInput placeholder='2000' type='number' id='waittime' value={waitTime} onChange={(e) => { isNaN(parseInt(e)) ? setWaitTime(undefined!) : setWaitTime(parseInt(e)) }} />
                        </FormGroup>
                    </FlexItem>
                </Flex>

                <FormGroup isInline fieldId='mode'>
                    <MoreInfoTooltip label={t('caches.create.configurations.feature.mode')} toolTip={t('caches.create.configurations.feature.mode-tooltip', { brandname: brandname })} textComponent={TextVariants.h3} />
                    <Radio
                        name="mood-radio"
                        id="manual"
                        onChange={() => setMode(BackupSiteStateTransferMode.MANUAL)}
                        isChecked={mode as BackupSiteStateTransferMode == BackupSiteStateTransferMode.MANUAL}
                        label={
                            <TextContent>
                                <Text component={TextVariants.h4}>
                                    {t('caches.create.configurations.feature.mode-manual')}
                                </Text>
                            </TextContent>
                        }
                    />
                    <Radio
                        name="mood-radio"
                        id="auto"
                        onChange={() => setMode(BackupSiteStateTransferMode.AUTO)}
                        isChecked={mode as BackupSiteStateTransferMode == BackupSiteStateTransferMode.AUTO}
                        label={
                            <TextContent>
                                <Text component={TextVariants.h4}>
                                    {t('caches.create.configurations.feature.mode-auto')}
                                </Text>
                            </TextContent>
                        }
                    />
                </FormGroup >
            </React.Fragment >
        )
    }


    // Options for Failure Policy
    const failurePolicyOptions = () => {
        return Object.keys(BackupSiteFailurePolicy).map((key) => (
            <SelectOption key={key} value={BackupSiteFailurePolicy[key]} />
        ));
    };

    return (
        <Form>
            <Flex>
                {props.siteBasic.siteStrategy === BackupSiteStrategy.SYNC &&
                    <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                        <FormGroup
                            fieldId='twoPhaseCommit'
                            isInline
                        >
                            <MoreInfoTooltip label={t('caches.create.configurations.feature.two-phase-commit')} toolTip={t('caches.create.configurations.feature.two-phase-commit-tooltip')} textComponent={TextVariants.h2} />
                            <Switch
                                aria-label="twoPhaseCommit"
                                id="twoPhaseCommit"
                                isChecked={twoPhaseCommit === undefined ? false : twoPhaseCommit}
                                onChange={() => setTwoPhaseCommit(!twoPhaseCommit)}
                                isReversed
                            />
                        </FormGroup>
                    </FlexItem>
                }
            </Flex>


            <Flex>
                <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>

                    <FormGroup
                        fieldId='failurePolicy'
                        isInline
                    >
                        <MoreInfoTooltip label={t('caches.create.configurations.feature.failure-policy')} toolTip={t('caches.create.configurations.feature.failure-policy-tooltip')} textComponent={TextVariants.h2} />
                        <Select
                            id="failurePolicy"
                            variant={SelectVariant.single}
                            onToggle={() => setIsOpenFailurePolicy(!isOpenFailurePolicy)}
                            onSelect={onSelectFailurePolicy}
                            isOpen={isOpenFailurePolicy}
                            selections={failurePolicy}
                            value={failurePolicy}
                            aria-label="Failure Policy"
                            aria-describedby="failurePolicy-helper"
                        >
                            {failurePolicyOptions()}
                        </Select>
                    </FormGroup>
                </FlexItem>
                <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                    <FormGroup
                        fieldId='timeout'
                        isInline
                    >
                        <MoreInfoTooltip label={t('caches.create.configurations.feature.timeout')} toolTip={t('caches.create.configurations.feature.timeout-tooltip')} textComponent={TextVariants.h3} />
                        <TextInput placeholder='15000' type='number' id='timeout' value={timeout} onChange={(e) => { isNaN(parseInt(e)) ? setTimeout(undefined!) : setTimeout(parseInt(e)) }} />
                    </FormGroup>
                </FlexItem>
                <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                    <FormGroup
                        fieldId='failurePolicyClass'
                        isInline
                    >
                        <MoreInfoTooltip label={t('caches.create.configurations.feature.failure-policy-class')} toolTip={t('caches.create.configurations.feature.failure-policy-class-tooltip')} textComponent={TextVariants.h3} />
                        <TextInput type='text' id='failurePolicyClass' value={failurePolicyClass} onChange={(e) => { e === "" ? setFailurePolicyClass(undefined!) : setFailurePolicyClass(e) }} />
                    </FormGroup>
                </FlexItem>
            </Flex>

            <Divider />
            {formTakeOffline()}
            <Divider />
            {formStateTransfer()}
        </Form >
    );
};

export default BackupSiteConfigurator;
