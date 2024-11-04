import React, { useEffect, useState } from 'react';
import {
  FormFieldGroupExpandable,
  FormFieldGroupHeader,
  FormGroup,
  FormSection,
  Grid,
  HelperText,
  HelperTextItem,
  TextInput
} from '@patternfly/react-core';
import { CacheFeature } from '@services/infinispanRefData';
import { useTranslation } from 'react-i18next';
import { useCreateCache } from '@app/services/createCacheHook';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import BackupSiteConfigurator from '@app/Caches/Create/AdvancedTuning/BackupsSiteConfigurator';
import TimeQuantityInputGroup from '@app/Caches/Create/TimeQuantityInputGroup';

const BackupsConfigurationTuning = () => {
  const { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const [backupSiteData, setBackupSiteData] = useState<BackupSite[]>(
    configuration.advanced.backupSiteData || Array(configuration.feature.backupsCache?.sites.length).fill({})
  );
  const [mergePolicy, setMergePolicy] = useState(configuration.advanced.backupSetting?.mergePolicy);
  const [maxCleanupDelay, setMaxCleanupDelay] = useState(configuration.advanced.backupSetting?.maxCleanupDelay);
  const [maxCleanupDelayUnit, setMaxCleanupDelayUnit] = useState(
    configuration.advanced.backupSetting?.maxCleanupDelayUnit
  );
  const [tombstoneMapSize, setTombstoneMapSize] = useState(configuration.advanced.backupSetting?.tombstoneMapSize);

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        advanced: {
          ...prevState.advanced,
          backupSetting: {
            mergePolicy: mergePolicy,
            maxCleanupDelay: maxCleanupDelay,
            maxCleanupDelayUnit: maxCleanupDelayUnit,
            tombstoneMapSize: tombstoneMapSize
          },
          backupSiteData: backupSiteData,
          valid: true
        }
      };
    });
  }, [backupSiteData, mergePolicy, maxCleanupDelay, maxCleanupDelayUnit, tombstoneMapSize]);

  if (!configuration.feature.cacheFeatureSelected.includes(CacheFeature.BACKUPS)) {
    return <div />;
  }

  const formBackupsSetting = () => {
    return (
      <Grid hasGutter md={4}>
        <FormGroup
          fieldId="merge-policy"
          label={t('caches.create.configurations.feature.merge-policy')}
          labelHelp={
            <PopoverHelp
              name="merge-policy"
              label={t('caches.create.configurations.feature.merge-policy')}
              content={t('caches.create.configurations.feature.merge-policy-tooltip', { brandname: brandname })}
            />
          }
        >
          <TextInput
            placeholder="DEFAULT"
            value={mergePolicy}
            onChange={(_event, val) => setMergePolicy(val === '' ? undefined! : val)}
            aria-label="merge-policy-input"
            data-cy="merge-policy-input"
          />
        </FormGroup>

        <FormGroup
          fieldId="max-cleanup-delay"
          label={t('caches.create.configurations.feature.max-cleanup-delay')}
          labelHelp={
            <PopoverHelp
              name="cleanup-delay"
              label={t('caches.create.configurations.feature.max-cleanup-delay')}
              content={t('caches.create.configurations.feature.max-cleanup-delay-tooltip')}
            />
          }
        >
          <TimeQuantityInputGroup
            name={'maxCleanupDelay'}
            defaultValue={'30000'}
            value={maxCleanupDelay}
            valueModifier={setMaxCleanupDelay}
            unit={maxCleanupDelayUnit}
            unitModifier={setMaxCleanupDelayUnit}
          />
        </FormGroup>

        <FormGroup
          fieldId="tombstone-map-size"
          label={t('caches.create.configurations.feature.tombstone-map-site')}
          labelHelp={
            <PopoverHelp
              name="tombstone-map-size"
              label={t('caches.create.configurations.feature.tombstone-map-site')}
              content={t('caches.create.configurations.feature.tombstone-map-site-tooltip', { brandname: brandname })}
            />
          }
        >
          <TextInput
            placeholder="512000"
            type="number"
            value={tombstoneMapSize}
            onChange={(_event, val) => {
              const parsedVal = parseInt(val);
              setTombstoneMapSize(isNaN(parsedVal) ? undefined! : parsedVal);
            }}
            aria-label="tombstone-map-size-input"
            data-cy="tombstone-map-size-input"
          />
        </FormGroup>
      </Grid>
    );
  };

  return (
    <FormSection title={t('caches.create.configurations.advanced-options.backups-tuning')}>
      <HelperText>
        <HelperTextItem>
          {t('caches.create.configurations.advanced-options.backups-tuning-tooltip', { brandname: brandname })}
        </HelperTextItem>
      </HelperText>
      {formBackupsSetting()}
      {configuration.feature.backupsCache &&
        configuration.feature.backupsCache.sites.map((site, index) => {
          return (
            <FormFieldGroupExpandable
              id={site.siteName + '-expand-button'}
              key={site.siteName + '-expand'}
              header={<FormFieldGroupHeader titleText={{ text: site.siteName, id: site.siteName + '-titleText-id' }} />}
            >
              <BackupSiteConfigurator
                backupSiteOptions={backupSiteData}
                backupSiteOptionsModifier={setBackupSiteData}
                index={index}
                siteBasic={site}
              />
            </FormFieldGroupExpandable>
          );
        })}
    </FormSection>
  );
};

export default BackupsConfigurationTuning;
