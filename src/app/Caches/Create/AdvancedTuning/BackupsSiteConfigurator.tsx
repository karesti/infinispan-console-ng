import React, { useEffect, useState } from 'react';
import { FormGroup, Grid, GridItem, Radio, Switch, Content, TextInput, ContentVariants } from '@patternfly/react-core';
import { SelectSingle } from '@app/Common/SelectSingle';
import { useTranslation } from 'react-i18next';
import { BackupSiteFailurePolicy, BackupSiteStateTransferMode, BackupSiteStrategy } from '@services/infinispanRefData';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { selectOptionProps } from '@utils/selectOptionPropsCreator';
import TimeQuantityInputGroup from '@app/Caches/Create/TimeQuantityInputGroup';

const BackupSiteConfigurator = (props: {
  backupSiteOptions: BackupSite[];
  backupSiteOptionsModifier: (BackupSite) => void;
  index: number;
  siteBasic: BackupSiteBasic;
}) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const [failurePolicy, setFailurePolicy] = useState(props.backupSiteOptions[props.index]?.failurePolicy);
  const [timeout, setTimeout] = useState(props.backupSiteOptions[props.index]?.timeout);
  const [timeoutUnit, setTimeoutUnit] = useState(props.backupSiteOptions[props.index]?.timeoutUnit);
  const [twoPhaseCommit, setTwoPhaseCommit] = useState(props.backupSiteOptions[props.index]?.twoPhaseCommit);
  const [failurePolicyClass, setFailurePolicyClass] = useState(
    props.backupSiteOptions[props.index]?.failurePolicyClass
  );

  const [afterFailures, setAfterFailures] = useState(props.backupSiteOptions![props.index]?.takeOffline?.afterFailures);
  const [minWait, setMinWait] = useState(props.backupSiteOptions[props.index]?.takeOffline?.minWait);
  const [minWaitUnit, setMinWaitUnit] = useState(props.backupSiteOptions[props.index]?.takeOffline?.minWaitUnit);

  const [chunckSize, setChunckSize] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.chunckSize);
  const [timeoutStateTransfer, setTimeoutStateTransfer] = useState(
    props.backupSiteOptions[props.index]?.stateTransfer?.timeout
  );
  const [timeoutStateTransferUnit, setTimeoutStateTransferUnit] = useState(
    props.backupSiteOptions[props.index]?.stateTransfer?.timeoutUnit
  );
  const [maxRetries, setMaxRetries] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.maxRetries);
  const [waitTime, setWaitTime] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.waitTime);
  const [waitTimeUnit, setWaitTimeUnit] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.waitTimeUnit);
  const [mode, setMode] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.mode);

  useEffect(() => {
    const data = {
      failurePolicy: failurePolicy,
      timeout: timeout,
      timeoutUnit: timeoutUnit,
      twoPhaseCommit: twoPhaseCommit,
      failurePolicyClass: failurePolicyClass,
      takeOffline: {
        afterFailures: afterFailures,
        minWait: minWait,
        minWaitUnit: minWaitUnit
      },
      stateTransfer: {
        chunckSize: chunckSize,
        timeout: timeoutStateTransfer,
        timeoutUnit: timeoutStateTransferUnit,
        maxRetries: maxRetries,
        waitTime: waitTime,
        waitTimeUnit: waitTimeUnit,
        mode: mode
      }
    };
    props.backupSiteOptionsModifier([
      ...props.backupSiteOptions.slice(0, props.index),
      data,
      ...props.backupSiteOptions.slice(props.index + 1)
    ]);
  }, [
    failurePolicy,
    timeout,
    timeoutUnit,
    twoPhaseCommit,
    failurePolicyClass,
    afterFailures,
    minWait,
    minWaitUnit,
    chunckSize,
    timeoutStateTransfer,
    timeoutStateTransferUnit,
    maxRetries,
    waitTime,
    waitTimeUnit,
    mode
  ]);

  const formTakeOffline = () => {
    return (
      <React.Fragment>
        <GridItem span={12}>
          <Content component={ContentVariants.p}>{t('caches.create.configurations.feature.take-offline')}</Content>
          <Content component={ContentVariants.small}>
            {t('caches.create.configurations.feature.take-offline-tooltip', { brandname: brandname })}
          </Content>
        </GridItem>
        <FormGroup
          fieldId="afterFailures"
          label={t('caches.create.configurations.feature.after-failure')}
          labelHelp={
            <PopoverHelp
              name="afterFailures"
              label={t('caches.create.configurations.feature.after-failure')}
              content={t('caches.create.configurations.feature.after-failure-tooltip')}
            />
          }
        >
          <TextInput
            placeholder="0"
            type="number"
            id="afterFailures"
            data-cy="afterFailuresInput"
            value={afterFailures}
            onChange={(e, val) => {
              const value = parseInt(val);
              setAfterFailures(isNaN(value) ? undefined! : value);
            }}
          />
        </FormGroup>
        <FormGroup
          fieldId="minwait"
          label={t('caches.create.configurations.feature.min-wait')}
          labelHelp={
            <PopoverHelp
              name="minwait"
              label={t('caches.create.configurations.feature.min-wait')}
              content={t('caches.create.configurations.feature.min-wait-tooltip')}
            />
          }
        >
          <TimeQuantityInputGroup
            name={'minwait'}
            defaultValue={'0'}
            value={minWait}
            valueModifier={setMinWait}
            unit={minWaitUnit}
            unitModifier={setMinWaitUnit}
          />
        </FormGroup>
      </React.Fragment>
    );
  };

  const formStateTransfer = () => {
    return (
      <React.Fragment>
        <GridItem span={12}>
          <Content component={ContentVariants.p}>{t('caches.create.configurations.feature.state-transfer')}</Content>
          <Content component={ContentVariants.small}>
            {t('caches.create.configurations.feature.state-transfer-tooltip', { brandname: brandname })}
          </Content>
        </GridItem>
        <GridItem span={12}>
          <FormGroup
            isInline
            fieldId="mode"
            label={t('caches.create.configurations.feature.mode')}
            labelHelp={
              <PopoverHelp
                name="mode"
                label={t('caches.create.configurations.feature.mode')}
                content={t('caches.create.configurations.feature.mode-tooltip', { brandname: brandname })}
              />
            }
          >
            <Radio
              name="mood-radio"
              id="manual"
              data-cy="manual-radio"
              onChange={() => setMode(BackupSiteStateTransferMode.MANUAL)}
              isChecked={(mode as BackupSiteStateTransferMode) == BackupSiteStateTransferMode.MANUAL}
              label={t('caches.create.configurations.feature.mode-manual')}
            />
            <Radio
              name="mood-radio"
              id="auto"
              data-cy="auto-radio"
              onChange={() => setMode(BackupSiteStateTransferMode.AUTO)}
              isChecked={(mode as BackupSiteStateTransferMode) == BackupSiteStateTransferMode.AUTO}
              label={t('caches.create.configurations.feature.mode-auto')}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            fieldId="chuncksize"
            label={t('caches.create.configurations.feature.chunk-size')}
            labelHelp={
              <PopoverHelp
                name="chuncksize"
                label={t('caches.create.configurations.feature.chunk-size')}
                content={t('caches.create.configurations.feature.chunk-size-tooltip')}
              />
            }
          >
            <TextInput
              placeholder="512"
              type="number"
              id="chuncksize"
              data-cy="chunckSizeInput"
              value={chunckSize}
              onChange={(e, val) => {
                const value = parseInt(val);
                setChunckSize(isNaN(value) ? undefined! : value);
              }}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            fieldId="timeout-state-transfer"
            label={t('caches.create.configurations.feature.timeout-state-transfer')}
            labelHelp={
              <PopoverHelp
                name="timeout-state-transfer"
                label={t('caches.create.configurations.feature.timeout-state-transfer')}
                content={t('caches.create.configurations.feature.timeout-state-transfer-tooltip')}
              />
            }
          >
            <TimeQuantityInputGroup
              name={'timeoutStateTransfer'}
              defaultValue={'1200000'}
              value={timeoutStateTransfer}
              valueModifier={setTimeoutStateTransfer}
              unit={timeoutStateTransferUnit}
              unitModifier={setTimeoutStateTransferUnit}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            fieldId="maxretries"
            label={t('caches.create.configurations.feature.max-retries')}
            labelHelp={
              <PopoverHelp
                name="maxretries"
                label={t('caches.create.configurations.feature.max-retries')}
                content={t('caches.create.configurations.feature.max-retries-tooltip')}
              />
            }
          >
            <TextInput
              placeholder="30"
              type="number"
              id="maxretries"
              data-cy="maxRetriesInput"
              value={maxRetries}
              onChange={(e, val) => {
                const value = parseInt(val);
                setMaxRetries(isNaN(value) ? undefined! : value);
              }}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            fieldId="wait-time"
            label={t('caches.create.configurations.feature.wait-time')}
            labelHelp={
              <PopoverHelp
                name="wait-time"
                label={t('caches.create.configurations.feature.wait-time')}
                content={t('caches.create.configurations.feature.wait-time-tooltip')}
              />
            }
          >
            <TimeQuantityInputGroup
              name={'waitTime'}
              defaultValue={'2000'}
              value={waitTime}
              valueModifier={setWaitTime}
              unit={waitTimeUnit}
              unitModifier={setWaitTimeUnit}
            />
          </FormGroup>
        </GridItem>
      </React.Fragment>
    );
  };

  const displayTwoPhaseCommit = () => {
    if (props.siteBasic.siteStrategy !== BackupSiteStrategy.SYNC) {
      return;
    }

    return (
      <GridItem span={12}>
        <FormGroup fieldId="twoPhaseCommit">
          <Switch
            aria-label="twoPhaseCommit"
            id="twoPhaseCommit"
            isChecked={twoPhaseCommit === undefined ? false : twoPhaseCommit}
            hasCheckIcon
            onChange={() => setTwoPhaseCommit(!twoPhaseCommit)}
            label={t('caches.create.configurations.feature.two-phase-commit')}
          />
          <PopoverHelp
            name={'two-phase-commit'}
            label={t('caches.create.configurations.feature.two-phase-commit')}
            content={t('caches.create.configurations.feature.two-phase-commit-tooltip')}
          />
        </FormGroup>
      </GridItem>
    );
  };

  return (
    <Grid hasGutter md={4}>
      {displayTwoPhaseCommit()}
      <FormGroup
        fieldId="failurePolicy"
        label={t('caches.create.configurations.feature.failure-policy')}
        labelHelp={
          <PopoverHelp
            name="failure-policy"
            label={t('caches.create.configurations.feature.failure-policy')}
            content={t('caches.create.configurations.feature.failure-policy-tooltip')}
          />
        }
      >
        <SelectSingle
          id={'failurePolicy'}
          placeholder={BackupSiteFailurePolicy.IGNORE}
          selected={failurePolicy!}
          options={selectOptionProps(BackupSiteFailurePolicy)}
          onSelect={(value) => setFailurePolicy(value)}
        />
      </FormGroup>
      <FormGroup
        fieldId="timeout"
        label={t('caches.create.configurations.feature.timeout')}
        labelHelp={
          <PopoverHelp
            name="timeout"
            label={t('caches.create.configurations.feature.timeout')}
            content={t('caches.create.configurations.feature.timeout-tooltip')}
          />
        }
      >
        <TimeQuantityInputGroup
          name={'timeout'}
          defaultValue={'15000'}
          value={timeout}
          valueModifier={setTimeout}
          unit={timeoutUnit}
          unitModifier={setTimeoutUnit}
        />
      </FormGroup>
      <FormGroup
        fieldId="failurePolicyClass"
        label={t('caches.create.configurations.feature.failure-policy-class')}
        labelHelp={
          <PopoverHelp
            name="failurePolicyClass"
            label={t('caches.create.configurations.feature.failure-policy-class')}
            content={t('caches.create.configurations.feature.failure-policy-class-tooltip')}
          />
        }
      >
        <TextInput
          type="text"
          id="failurePolicyClass"
          value={failurePolicyClass}
          onChange={(e, val) => setFailurePolicyClass(val === '' ? undefined! : val)}
        />
      </FormGroup>
      {formTakeOffline()}
      {formStateTransfer()}
    </Grid>
  );
};

export default BackupSiteConfigurator;
