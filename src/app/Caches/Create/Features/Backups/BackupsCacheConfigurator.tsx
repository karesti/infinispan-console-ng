import React, { useEffect, useState } from 'react';
import {

  Card,
  CardBody,
  CardHeader,
  Select,
  SelectOption,
  SelectVariant,
  Flex,
  FlexItem,
  FormGroup,
  Label,
  Switch,
  Radio,
  Text,
  TextContent,
  TextInput,
  TextVariants, Alert, AlertVariant,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';
import { BackupSiteStrategy } from "@services/infinispanRefData";
import { global_spacer_sm, global_spacer_2xl } from '@patternfly/react-tokens';
import { ConsoleServices } from '@services/ConsoleServices';

const BackupsCacheConfigurator = (props: {
    backupsOptions: BackupsCache,
    backupsOptionsModifier: (BackupsCache) => void,
    isEnabled: boolean
}) => {

    const { t } = useTranslation();
    const brandname = t('brandname.brandname');

    const [enableBackupFor, setEnableBackupFor] = useState(props.backupsOptions.enableBackupFor);
    const [remoteCache, setRemoteCache] = useState(props.backupsOptions.backupFor?.remoteCache!);
    const [remoteSite, setRemoteSite] = useState(props.backupsOptions.backupFor?.remoteSite!);

    const [availableSites, setAvailableSites] = useState<string[]>([]);
    const [sites, setSites] = useState<BackupSiteBasic[]>(props.backupsOptions.sites!);
    const [localSite, setLocalSite] = useState('');

    const [loadingBackups, setLoadingBackups] = useState<boolean>(true);
    const [isOpenSites, setIsOpenSites] = useState(false);

    const [isOpenRemoteSite, setIsOpenRemoteSite] = useState(false);
    const [isRemoteSiteValid, setIsRemoteSiteValid] = useState<'success' | 'error' | 'default'>(props.backupsOptions.isRemoteSiteValid ? 'success' : 'default');
    const [isRemoteCacheValid, setIsRemoteCacheValid] = useState<'success' | 'error' | 'default'>(props.backupsOptions.isRemoteCacheValid ? 'success' : 'default');

    useEffect(() => {
        props.backupsOptionsModifier({
            sites: sites,
            backupFor: {
                remoteCache: remoteCache,
                remoteSite: remoteSite,
            },
            enableBackupFor: enableBackupFor,
            isRemoteSiteValid: isRemoteSiteValid === 'success',
            isRemoteCacheValid: isRemoteCacheValid === 'success',
        });
    }, [sites, remoteCache, remoteSite, enableBackupFor, isRemoteSiteValid, isRemoteCacheValid]);

    useEffect(() => {
        if (loadingBackups) {
            // Fetch available sites
            ConsoleServices.dataContainer().getDefaultCacheManager()
                .then((r) => {
                    if (r.isRight()) {
                        const cm = r.value;
                        setAvailableSites(cm.sites_view);
                        setLocalSite(cm.local_site? cm.local_site : '');
                    }
                }).then(() => setLoadingBackups(false));
        }
        // Remove local site from available sites
        if (localSite) {
            setAvailableSites(availableSites.filter(s => s !== localSite));
        }
    }, [loadingBackups]);

    useEffect(() => {
        if (remoteCache) {
            const trimmedName = remoteCache.trim();
            if (trimmedName.length > 0) {
                setIsRemoteCacheValid('success');
            }
            else {
                setIsRemoteCacheValid('error');
            }
        }
        else {
            setIsRemoteCacheValid('default');
        }
    }, [remoteCache])

    useEffect(() => {
        if (remoteSite) {
            setIsRemoteSiteValid('success');
        }
        else {
            setIsRemoteSiteValid('default');
        }
    }, [remoteSite])

    const helperAddSite = (event, selection) => {
        if (!sites.some(s => s.siteName === selection)) {
            setSites([...sites, { siteName: selection }]);
        } else {
            setSites(sites.filter(item => item.siteName !== selection));
        }
    }

    const deleteChip = (chipToDelete) => {
        const newChips = sites.filter(chip => !Object.is(chip, chipToDelete));
        setSites(newChips);
    };

    const sitesOptions = () => {
        const options = availableSites.map((role) => (
            <SelectOption key={role} value={role} />
        ))
        return options
    };

    const clearSelection = () => {
        setSites([]);
        setIsOpenSites(false);
    };

    const onSelectRemoteSite = (event, selection, isPlaceholder) => {
        setRemoteSite(selection);
        setIsOpenRemoteSite(false);
    };

    const formBackupSites = () => {
        return (
            <FormGroup
                fieldId='backup-sites'
                isRequired
                isInline
            >
                <MoreInfoTooltip label={t('caches.create.configurations.feature.backups-site')} toolTip={t('caches.create.configurations.feature.backups-site-tooltip', { brandname: brandname })} textComponent={TextVariants.h3} />

                <Select
                    variant={SelectVariant.checkbox}
                    aria-label="Select sites"
                    onToggle={() => setIsOpenSites(!isOpenSites)}
                    onSelect={helperAddSite}
                    onClear={clearSelection}
                    selections={sites.some(s => s.siteName !== undefined) ? sites.map(s => s.siteName) : []}
                    isOpen={isOpenSites}
                    placeholderText={t('caches.create.configurations.feature.select-sites')}
                >
                    {sitesOptions()}
                </Select>
            </FormGroup>
        )
    }

    const formBackupFor = () => {
        return (
            <React.Fragment>
                <CardBody>
                    <FormGroup fieldId='remote-cache' isInline isRequired>
                        <MoreInfoTooltip label={t('caches.create.configurations.feature.remote-cache')} toolTip={t('caches.create.configurations.feature.remote-cache-tooltip', { brandname: brandname })} textComponent={TextVariants.h3} />
                        <TextInput validated={isRemoteCacheValid} value={remoteCache} onChange={(val) => { val === "" ? setRemoteCache(undefined!) : setRemoteCache(val) }} aria-label="remote-cache-input" />
                    </FormGroup>
                </CardBody>
                <CardBody>
                    <FormGroup fieldId='remote-site' isInline isRequired>
                        <MoreInfoTooltip label={t('caches.create.configurations.feature.remote-site')} toolTip={t('caches.create.configurations.feature.remote-site-tooltip')} textComponent={TextVariants.h3} />
                        <Select
                            validated={isRemoteSiteValid}
                            variant={SelectVariant.single}
                            aria-label="remote-site-select"
                            onToggle={() => setIsOpenRemoteSite(!isOpenRemoteSite)}
                            onSelect={onSelectRemoteSite}
                            selections={remoteSite}
                            isOpen={isOpenRemoteSite}
                            aria-labelledby="toggle-id-remote-site"
                            placeholderText='Select remote site'
                        >
                            {sitesOptions()}
                        </Select>
                    </FormGroup>
                </CardBody>
            </React.Fragment>
        )
    }

  if (!props.isEnabled) {
    return (
      <Alert variant={AlertVariant.info}
             isInline
             isPlain
             title={t('caches.create.configurations.feature.backups-disabled')} />
    )
  }

    return (
        <Card>
            <CardHeader>
                <TextContent>
                  <Text component={TextVariants.h2}>{t('caches.create.configurations.feature.backups', { 'local_site_name': localSite })}</Text>
                </TextContent>
            </CardHeader>
            <CardBody>
                {formBackupSites()}
            </CardBody>
            <CardBody>
                {sites.map(currentChip => (
                    <Label
                        color="blue"
                        closeBtnAriaLabel="Remove sites"
                        style={{ marginRight: global_spacer_sm.value }}
                        key={currentChip.siteName}
                        onClose={() => deleteChip(currentChip)}>
                        {currentChip.siteName}
                    </Label>
                ))}
            </CardBody>
            <CardBody>
                {typeof sites !== undefined && sites.length > 0 &&
                    <MoreInfoTooltip label={t('caches.create.configurations.feature.strategy')} toolTip={t('caches.create.configurations.feature.strategy-tooltip', { brandname: brandname })} textComponent={TextVariants.h3} />}
                {sites.map((currentChip, index) => {
                    currentChip.siteStrategy = currentChip.siteStrategy || 'ASYNC';
                    return (
                        <FormGroup key={index}
                            fieldId='strategy'
                            isInline
                            style={{ paddingTop: global_spacer_sm.value }}
                        >
                            <Flex>
                                <FlexItem grow={{ default: 'grow' }} style={{ width: '25rem' }}>
                                    <TextContent style={{ paddingRight: global_spacer_2xl.value, width: '100%' }}>
                                        <Text component={TextVariants.h4}>{currentChip.siteName}</Text>
                                    </TextContent>
                                </FlexItem>
                                <Radio
                                    name={index.toString()}
                                    id={`async-${index}`}
                                    onChange={() => { currentChip.siteStrategy = BackupSiteStrategy.ASYNC, setSites(sites.map(chip => chip.siteName === currentChip.siteName ? currentChip : chip)) }}
                                    isChecked={currentChip.siteStrategy === 'ASYNC'}
                                    label={
                                        <TextContent>
                                            <Text component={TextVariants.h4}>
                                                {t('caches.create.configurations.feature.strategy-async')}
                                            </Text>
                                        </TextContent>
                                    }
                                />
                                <Radio
                                    name={index.toString()}
                                    id={`sync-${index}`}
                                    onChange={() => { currentChip.siteStrategy = BackupSiteStrategy.SYNC, setSites(sites.map(chip => chip.siteName === currentChip.siteName ? currentChip : chip)) }}
                                    isChecked={currentChip.siteStrategy === 'SYNC'}
                                    label={
                                        <TextContent>
                                            <Text component={TextVariants.h4}>
                                                {t('caches.create.configurations.feature.strategy-sync')}
                                            </Text>
                                        </TextContent>
                                    }
                                />
                            </Flex>
                        </FormGroup>
                    )
                })}
            </CardBody>
            <CardBody>
                <FormGroup isInline fieldId='enable-backupfor'>
                    <Switch
                        aria-label="backupfor"
                        id="backupfor"
                        isChecked={enableBackupFor}
                        onChange={() => setEnableBackupFor(!enableBackupFor)}
                        isReversed
                    />
                    <MoreInfoTooltip label={t('caches.create.configurations.feature.backup-for')} toolTip={t('caches.create.configurations.feature.backup-for-tooltip', { brandname: brandname })} textComponent={TextVariants.h3} />
                </FormGroup>
            </CardBody>
            {enableBackupFor && formBackupFor()}
        </Card>
    );
};

export default BackupsCacheConfigurator;
