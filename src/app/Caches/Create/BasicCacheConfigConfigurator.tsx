import React, { useState, useEffect } from 'react';
import {
    Divider,
    Form,
    FormGroup,
    NumberInput,
    InputGroup,
    Grid,
    GridItem,
    Radio,
    Stack,
    Select,
    SelectOption,
    SelectVariant,
    Switch,
    Text,
    TextContent,
    TextInput,
    TextVariants,
} from '@patternfly/react-core';
import { CacheType, EncodingType, CacheMode, TimeUnits } from "@services/infinispanRefData";
import { useTranslation } from 'react-i18next';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';

const BasicCacheConfigConfigurator = (props:
    {
        basicConfiguration: BasicCacheConfig,
        basicConfigurationModifier: (BasicConfigurationStep) => void,
        handleIsFormValid: (isFormValid: boolean) => void,
    }) => {

    const { t } = useTranslation();

    // State for the form
    // Passed to the parent component
    const [topology, setTopology] = useState<string>(props.basicConfiguration.topology);
    const [mode, setMode] = useState<CacheMode>(props.basicConfiguration.mode as CacheMode);
    const [selectedNumberOwners, setSelectedNumberOwners] = useState(props.basicConfiguration.numberOfOwners);
    const [selectedEncodingCache, setSelectedEncodingCache] = useState(props.basicConfiguration.encoding);
    const [isStatistics, setIsStatistics] = useState(props.basicConfiguration.statistics);
    const [isExpiration, setIsExpiration] = useState(props.basicConfiguration.expiration);
    const [lifeSpanNumber, setLifeSpanNumber] = useState(props.basicConfiguration.lifeSpanNumber);
    const [lifeSpanUnit, setLifeSpanUnit] = useState(props.basicConfiguration.lifeSpanUnit);
    const [maxIdleNumber, setMaxIdleNumber] = useState(props.basicConfiguration.maxIdleNumber);
    const [maxIdleUnit, setMaxIdleUnit] = useState(props.basicConfiguration.maxIdleUnit);

    // Helper State
    const [isOpenEncodingCache, setIsOpenEncodingCache] = useState(false);
    const [isOpenLifeSpanUnit, setIsOpenLifeSpanUnit] = useState(false);
    const [isOpenMaxIdleUnit, setIsOpenMaxIdleUnit] = useState(false);

    useEffect(() => {
        topology === 'Replicated' ? setSelectedNumberOwners(undefined) : setSelectedNumberOwners(1);
    }, [topology])

    useEffect(() => {
        // Update the form when the state changes
        props.basicConfigurationModifier({
            topology: topology,
            mode: mode,
            numberOfOwners: selectedNumberOwners,
            encoding: selectedEncodingCache,
            statistics: isStatistics,
            expiration: isExpiration,
            lifeSpanNumber: lifeSpanNumber,
            lifeSpanUnit: lifeSpanUnit,
            maxIdleNumber: maxIdleNumber,
            maxIdleUnit: maxIdleUnit
        });
        props.handleIsFormValid(lifeSpanNumber >= -1 && maxIdleNumber >= -1);
    }, [topology, mode, selectedNumberOwners, selectedEncodingCache, isStatistics, isExpiration, lifeSpanNumber, lifeSpanUnit, maxIdleNumber, maxIdleUnit]);


    // Helper function for Number Owners Selection
    const minValue = 1;
    const maxValue = 10;

    const onMinus = () => {
       if (selectedNumberOwners) {
         setSelectedNumberOwners(selectedNumberOwners - 1);
       }
    };

    const onPlus = () => {
      if (selectedNumberOwners) {
        setSelectedNumberOwners(selectedNumberOwners + 1);
      }
    };

    const onChange = event => {
        const newValue = isNaN(event.target.value) ? 0 : Number(event.target.value);
        setSelectedNumberOwners(newValue > maxValue ? maxValue : newValue < minValue ? minValue : newValue);
    };

    // Helper function for Encoding Cache Selection
    const onToggleEncodingCache = () => {
        setIsOpenEncodingCache(!isOpenEncodingCache);
    };

    const onSelectEncodingCache = (event, selection, isPlaceholder) => {
        setSelectedEncodingCache(selection);
        setIsOpenEncodingCache(false);
    };

    const onSelectLifeSpanUnit = (event, selection, isPlaceholder) => {
        setLifeSpanUnit(selection);
        setIsOpenLifeSpanUnit(false);
    };

    const onSelectMaxIdleUnit = (event, selection, isPlaceholder) => {
        setMaxIdleUnit(selection);
        setIsOpenMaxIdleUnit(false);
    };

    // Form Topology
    const formTopology = () => {
        return (
            <React.Fragment>
                <Stack hasGutter>
                    <MoreInfoTooltip label={t('caches.create.configurations.basic.mode-title')} toolTip={t('caches.create.configurations.basic.mode-tooltip')} textComponent={TextVariants.h2} />
                    <FormGroup
                        isInline
                        isRequired
                        fieldId="topology"
                    >
                        <Radio
                            name="topology-radio"
                            id="distributed"
                            onChange={() => setTopology(CacheType.Distributed)}
                            isChecked={topology as CacheType == CacheType.Distributed}
                            label={
                                <TextContent>
                                    <Text component={TextVariants.h3}>
                                        {t('caches.create.configurations.basic.mode-distributed')}
                                    </Text>
                                </TextContent>
                            }
                        />
                        <Radio
                            name="topology-radio"
                            id="replicated"
                            onChange={() => setTopology(CacheType.Replicated)}
                            isChecked={topology as CacheType == CacheType.Replicated}
                            label={
                                <TextContent>
                                    <Text component={TextVariants.h3}>{t('caches.create.configurations.basic.mode-replicated')}</Text>
                                </TextContent>
                            }
                        />
                    </FormGroup>
                </Stack>

                <Stack hasGutter>
                    <MoreInfoTooltip label={t('caches.create.configurations.basic.cluster-repl-title')}
                                     toolTip={t('caches.create.configurations.basic.cluster-repl-tooltip')}
                                     textComponent={TextVariants.h2} />
                    <FormGroup
                        isInline
                        isRequired
                        fieldId="mode"
                    >
                        <Radio
                            name="mode-radio"
                            id="sync"
                            onChange={() => setMode(() => CacheMode.SYNC)}
                            isChecked={mode as CacheMode == CacheMode.SYNC}
                            label={
                                <TextContent>
                                    <Text component={TextVariants.h3}>{t('caches.create.configurations.basic.cluster-repl-sync')}</Text>
                                </TextContent>
                            }
                        />
                        <Radio
                          name="mode-radio"
                          id="async"
                          onChange={() => setMode(() => CacheMode.ASYNC)}
                          isChecked={mode as CacheMode == CacheMode.ASYNC}
                          label={
                            <TextContent>
                              <Text component={TextVariants.h3}>{t('caches.create.configurations.basic.cluster-repl-async')}</Text>
                            </TextContent>
                          }
                        />
                    </FormGroup>
                </Stack>
            </React.Fragment>
        );
    };

    // Form Number of Owners
    const formNumberOwners = () => {
        return (
            <FormGroup
                fieldId='field-number-owners'
                isRequired={topology as CacheType == CacheType.Distributed}> {/*Required when topology is distributed */}
                <MoreInfoTooltip label={t('caches.create.configurations.basic.number-owners')} toolTip={t('caches.create.configurations.basic.number-owners-tooltip')} textComponent={TextVariants.h2} />
                <NumberInput
                    value={selectedNumberOwners}
                    min={minValue}
                    max={maxValue}
                    onMinus={onMinus}
                    onChange={onChange}
                    onPlus={onPlus}
                    inputName="input"
                    inputAriaLabel="number input"
                    minusBtnAriaLabel="minus"
                    plusBtnAriaLabel="plus"
                    widthChars={2}
                />
            </FormGroup>
        )
    }

    // Options for Encoding Cache
    const encodingTypeOptions = () => {
        const a = Object.keys(EncodingType).map((key) => (
            <SelectOption key={key} value={EncodingType[key]} />
        ));
        a.pop(); // Removing 'Empty' option
        return a;

    };

    // Form Encoding Cache
    const formEncodingCache = () => {
        return (
            <React.Fragment>
                <FormGroup
                    isInline
                    isRequired
                    fieldId="field-statistics"
                >
                    <Switch
                        aria-label="statistics"
                        id="statistics"
                        isChecked={isStatistics}
                        onChange={() => setIsStatistics(!isStatistics)}
                        isReversed
                    />
                    <MoreInfoTooltip label={t('caches.create.configurations.basic.statistics-title')} toolTip={t('caches.create.configurations.basic.statistics-tooltip')} textComponent={TextVariants.h2} />
                </FormGroup>
                <FormGroup
                    isInline
                    isRequired
                    fieldId="field-encoding-cache"
                >
                    <MoreInfoTooltip label={t('caches.create.configurations.basic.encoding-cache-title')} toolTip={t('caches.create.configurations.basic.encoding-cache-tooltip')} textComponent={TextVariants.h2} />
                    <Select
                        variant={SelectVariant.single}
                        aria-label={t('caches.create.configurations.basic.encoding-select-label')}
                        onToggle={onToggleEncodingCache}
                        onSelect={onSelectEncodingCache}
                        selections={selectedEncodingCache}
                        isOpen={isOpenEncodingCache}
                        aria-labelledby="toggle-id-number-owners"
                    >
                        {encodingTypeOptions()}
                    </Select>
                </FormGroup>
            </React.Fragment>
        )
    }

    // Form expiration
    const formExpiration = () => {
        return (
            <FormGroup
                isInline
                isRequired
                fieldId="form-expiration"
            >
                <Switch
                    aria-label="expiration"
                    id="expiration"
                    isChecked={isExpiration}
                    onChange={() => setIsExpiration(!isExpiration)}
                    isReversed
                />
                <MoreInfoTooltip label={t('caches.create.configurations.basic.expiration-title')} toolTip={t('caches.create.configurations.basic.expiration-tooltip')} textComponent={TextVariants.h2} />
            </FormGroup>
        )
    }

    // Options for Time Units
    const unitOptions = () => {
        return Object.keys(TimeUnits).map((key) => (
            <SelectOption key={key} value={TimeUnits[key]} />
        ));
    }

    // Form expiration settings
    const formExpirationSettings = () => {
        return (
            <React.Fragment>
                <FormGroup
                    fieldId='form-life-span'
                    validated={lifeSpanNumber >= -1 ? 'default' : 'error'}
                    helperTextInvalid={t('caches.create.configurations.basic.lifespan-helper-invalid')}
                >
                    <MoreInfoTooltip label={t('caches.create.configurations.basic.lifespan')} toolTip={t('caches.create.configurations.basic.lifespan-tooltip')} textComponent={TextVariants.h3} />
                    <InputGroup>
                        <Grid>
                            <GridItem span={8}>
                                <TextInput min={-1} value={lifeSpanNumber} type="number" onChange={(value) => setLifeSpanNumber(parseInt(value))} aria-label="life-span-input" />
                            </GridItem>
                            <GridItem span={4}>
                                <Select
                                    variant={SelectVariant.single}
                                    aria-label="max-size-unit-input"
                                    onToggle={() => setIsOpenLifeSpanUnit(!isOpenLifeSpanUnit)}
                                    onSelect={onSelectLifeSpanUnit}
                                    selections={lifeSpanUnit}
                                    isOpen={isOpenLifeSpanUnit}
                                    aria-labelledby="toggle-id-max-size-unit"
                                >
                                    {unitOptions()}
                                </Select>
                            </GridItem>
                        </Grid>
                    </InputGroup>
                </FormGroup>

                <FormGroup
                    fieldId='form-max-idle'
                    validated={maxIdleNumber >= -1 ? 'default' : 'error'}
                    helperTextInvalid={t('caches.create.configurations.basic.max-idle-helper-invalid')}
                >
                    <MoreInfoTooltip label={t('caches.create.configurations.basic.max-idle')} toolTip={t('caches.create.configurations.basic.max-idle-tooltip')} textComponent={TextVariants.h3} />
                    <InputGroup>
                        <Grid>
                            <GridItem span={8}>
                                <TextInput min={-1} value={maxIdleNumber} type="number" onChange={(value) => setMaxIdleNumber(parseInt(value))} aria-label="life-span-input" />
                            </GridItem>
                            <GridItem span={4}>
                                <Select
                                    variant={SelectVariant.single}
                                    aria-label="max-size-unit-input"
                                    onToggle={() => setIsOpenMaxIdleUnit(!isOpenMaxIdleUnit)}
                                    onSelect={onSelectMaxIdleUnit}
                                    selections={maxIdleUnit}
                                    isOpen={isOpenMaxIdleUnit}
                                    aria-labelledby="toggle-id-max-size-unit"
                                >
                                    {unitOptions()}
                                </Select>
                            </GridItem>
                        </Grid>
                    </InputGroup>
                </FormGroup>
            </React.Fragment>
        )
    }

    return (
        <Form onSubmit={(e) => {
          e.preventDefault();
        }}>

            {formTopology()}

            {/* Display the number of owners of the cache when the topology is distributed. */}
            {topology as CacheType == CacheType.Distributed && formNumberOwners()}

            <Divider />
            {formEncodingCache()}

            <Divider />
            {formExpiration()}
            {isExpiration && formExpirationSettings()}

        </Form>
    );
};

export default BasicCacheConfigConfigurator;
