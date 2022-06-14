import React, { useState, useEffect } from 'react';
import {
    Form,
    FormGroup,
    TextVariants,
    Select,
    SelectOption,
    SelectVariant,
} from '@patternfly/react-core';
import {CacheFeature, CacheMode, EvictionType} from "@services/infinispanRefData";
import { useTranslation } from 'react-i18next';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';
import { ConsoleServices } from '@services/ConsoleServices';
import BoundedCacheConfigurator from '@app/Caches/Create/Features/BoundedCacheConfigurator';
import IndexedCacheConfigurator from '@app/Caches/Create/Features/IndexedCacheConfigurator';
import SecuredCacheConfigurator from '@app/Caches/Create/Features/SecuredCacheConfigurator';
import BackupsCacheConfigurator from '@app/Caches/Create/Features/Backups/BackupsCacheConfigurator';
import TransactionalCacheConfigurator from '@app/Caches/Create/Features/TransactionalCache/TransactionalCacheConfigurator';

const FeaturesSelector = (props: {
    cacheFeature: CacheFeatureStep,
    cacheFeatureModifier: (CacheFeatureStep) => void,
    handleIsFormValid: (isFormValid: boolean) => void,
    basicConfiguration: BasicCacheConfig
}) => {

    const { t } = useTranslation();
    const brandname = t('brandname.brandname');

    const [cacheFeatureSelected, setCacheFeatureSelected] = useState(props.cacheFeature.cacheFeatureSelected);

    //Bounded Cache
    const [boundedCache, setBoundedCache] = useState<BoundedCache>(props.cacheFeature.boundedCache);

    //Indexed Cache
    const [indexedCache, setIndexedCache] = useState<IndexedCache>(props.cacheFeature.indexedCache);

    //Secured Cache
    const [securedCache, setSecuredCache] = useState<SecuredCache>(props.cacheFeature.securedCache);
    const [isSecure, setIsSecure] = useState(false);
    const [isTransactional, setIsTransactional] = useState(props.basicConfiguration.mode === CacheMode.SYNC);
    const [loadingSecurityRoles, setLoadingSecurityRoles] = useState(true);

    //Backups Cache
    const [backupsCache, setBackupsCache] = useState<BackupsCache>(props.cacheFeature.backupsCache);
    const [loadingBackups, setLoadingBackups] = useState(true);
    const [isBackups, setIsBackups] = useState(false);
    //Transactional Cache
    const [transactionalCache, setTransactionalCache] = useState<TransactionalCache>(props.cacheFeature.transactionalCache);

    const [loading, setLoading] = useState(true);

    const [isOpenCacheFeature, setIsOpenCacheFeature] = useState(false);

    useEffect(() => {
        props.cacheFeatureModifier({
            cacheFeatureSelected: cacheFeatureSelected,
            boundedCache: boundedCache,
            indexedCache: indexedCache,
            securedCache: securedCache,
            backupsCache: backupsCache,
            transactionalCache: transactionalCache
        });

        let validForm = true;
        if (cacheFeatureSelected.length > 0) {
            validForm = boundedFeatureValidation(validForm)
            validForm = indexingFeatureValidation(validForm);
            validForm = securedFeatureValidation(validForm);
            validForm = backupsFeatureValidation(validForm);
            validForm = transactionalFeatureValidation(validForm);
        }
        props.handleIsFormValid(validForm);

    }, [cacheFeatureSelected, boundedCache, indexedCache, securedCache, backupsCache, transactionalCache]);

    const boundedFeatureValidation = (validForm: boolean) => {
        if (cacheFeatureSelected.includes(CacheFeature.BOUNDED)) {
            if (boundedCache.evictionType === EvictionType.size) {
                validForm = validForm && boundedCache.maxSize > 0;
            } else if (boundedCache.evictionType === EvictionType.count) {
                validForm = validForm && boundedCache.maxCount > 0;
            }
        }
        return validForm;
    }

    function indexingFeatureValidation(validForm: boolean) {
        if (cacheFeatureSelected.includes(CacheFeature.INDEXED)) {
            validForm = validForm && indexedCache.indexedEntities.length > 0;
        }
        return validForm;
    }

    function securedFeatureValidation(validForm: boolean) {
        if (cacheFeatureSelected.includes(CacheFeature.SECURED)) {
            if (!isSecure) {
              return false;
            }

            validForm = validForm && securedCache.roles.length > 0;
        }
        return validForm;
    }

    function backupsFeatureValidation(validForm: boolean) {
        if (cacheFeatureSelected.includes(CacheFeature.BACKUPS)) {
            if (!isBackups) {
              return false;
            }
            if (backupsCache.enableBackupFor) {
                validForm = validForm && backupsCache.isRemoteCacheValid;
                validForm = validForm && backupsCache.isRemoteSiteValid;
                validForm = validForm && backupsCache.isRemoteCacheValid;
            } else {
                validForm = validForm && backupsCache.sites.length > 0;
            }
        }
        return validForm;
    }

    function transactionalFeatureValidation(validForm: boolean) {
        if (cacheFeatureSelected.includes(CacheFeature.TRANSACTIONAL) && !isTransactional) {
            return false;
        }
        return validForm;
    }

    useEffect(() => {
        if (loadingSecurityRoles) {
            // Check if secured cache is enabled
            ConsoleServices.security()
                .getSecurityRoles()
                .then((r) => {
                    if (r.isRight()) {
                        r.value === [] ? setIsSecure(false) : setIsSecure(true);
                    }
                }).then(() => setLoadingSecurityRoles(false));
        }
    }, [loadingSecurityRoles]);


    useEffect(() => {
        if (loadingBackups) {
            // Check if backups cache is enabled
            ConsoleServices.dataContainer().getDefaultCacheManager()
                .then((r) => {
                    if (r.isRight()) {
                        setIsBackups(r.value.backups_enabled);
                    }
                }).then(() => setLoadingBackups(false));
        }
    }, [loadingBackups]);

    const onSelectFeature = (event, selection) => {
        if (cacheFeatureSelected.includes(selection)) {
            setCacheFeatureSelected(cacheFeatureSelected.filter(item => item !== selection));
        } else {
            setCacheFeatureSelected([...cacheFeatureSelected, selection]);
        }
        setIsOpenCacheFeature(false);
    };

    const onClearFeatureSelection = () => {
        setCacheFeatureSelected([]);
        setIsOpenCacheFeature(false);
    };

    const cacheFeatureOptions = () => {
        const availableOptions = ['BOUNDED', 'INDEXED', 'SECURED', 'BACKUPS', 'TRANSACTIONAL'];
        return Object.keys(CacheFeature).map((key) => (
            <SelectOption key={key} value={CacheFeature[key]} isDisabled={!availableOptions.includes(key)} />
        ));
    };

    return (
        <Form onSubmit={(e) => {
            e.preventDefault();
        }}>
            <FormGroup fieldId='cache-feature'>
                <MoreInfoTooltip label={t('caches.create.configurations.feature.cache-feature-list', { brandname: brandname })} toolTip={t('caches.create.configurations.feature.cache-feature-list-tooltip')} textComponent={TextVariants.h2} />
                <Select
                    variant={SelectVariant.typeaheadMulti}
                    typeAheadAriaLabel={t('caches.create.configurations.feature.cache-feature-list-typeahead')}
                    onToggle={() => setIsOpenCacheFeature(!isOpenCacheFeature)}
                    onSelect={onSelectFeature}
                    onClear={onClearFeatureSelection}
                    selections={cacheFeatureSelected}
                    isOpen={isOpenCacheFeature}
                    aria-labelledby="cache-feature"
                    placeholderText={t('caches.create.configurations.feature.cache-feature-list-placeholder')}
                >
                    {cacheFeatureOptions()}
                </Select>
            </FormGroup>

            {cacheFeatureSelected.includes(CacheFeature.BOUNDED) && <BoundedCacheConfigurator boundedOptions={boundedCache} boundedOptionsModifier={setBoundedCache} />}
            {cacheFeatureSelected.includes(CacheFeature.INDEXED) && <IndexedCacheConfigurator indexedOptions={indexedCache} indexedOptionsModifier={setIndexedCache} />}
            {cacheFeatureSelected.includes(CacheFeature.SECURED) && <SecuredCacheConfigurator securedOptions={securedCache} securedOptionsModifier={setSecuredCache} isEnabled={isSecure} />}
            {cacheFeatureSelected.includes(CacheFeature.BACKUPS) && <BackupsCacheConfigurator backupsOptions={backupsCache} backupsOptionsModifier={setBackupsCache} isEnabled={isBackups}/>}
            {cacheFeatureSelected.includes(CacheFeature.TRANSACTIONAL) && <TransactionalCacheConfigurator transactionalOptions={transactionalCache}
                                                                                                          transactionalOptionsModifier={setTransactionalCache}
                                                                                                          isEnabled={isTransactional}/>}
        </Form >
    );
};

export default FeaturesSelector;
