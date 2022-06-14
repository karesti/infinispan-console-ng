import React, {useEffect, useState} from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  FormGroup,
  InputGroup,
  Radio,
  Select,
  SelectOption,
  SelectVariant,
  Text,
  TextContent,
  TextInput,
  TextVariants,
} from '@patternfly/react-core';
import {EvictionStrategy, EvictionType, MaxSizeUnit} from "@services/infinispanRefData";
import {useTranslation} from 'react-i18next';
import {MoreInfoTooltip} from '@app/Common/MoreInfoTooltip';

const BoundedCacheConfigurator = (props: {
    boundedOptions: BoundedCache,
    boundedOptionsModifier: (modifier: BoundedCache) => void,
}) => {

    const { t } = useTranslation();
    const brandname = t('brandname.brandname');

    //Bounded Cache
    const [evictionType, setEvictionType] = useState<'size' | 'count'>(props.boundedOptions.evictionType);
    const [maxSize, setMaxSize] = useState<number>(props.boundedOptions.maxSize);
    const [maxCount, setMaxCount] = useState<number>(props.boundedOptions.maxCount);
    const [evictionStrategy, setEvictionStrategy] = useState<string>(props.boundedOptions.evictionStrategy);

    const [isOpenEvictionStrategy, setIsOpenEvictionStrategy] = useState(false);
    const [isOpenMaxSizeUnit, setIsOpenMaxSizeUnit] = useState(false);

    // Helper states for the maxSize input
    const [maxSizeUnit, setMaxSizeUnit] = useState<MaxSizeUnit>(MaxSizeUnit.MB);


    useEffect(() => {
        props.boundedOptionsModifier({
            evictionType: evictionType,
            maxSize: maxSize,
            maxCount: maxCount,
            evictionStrategy: evictionStrategy,
            maxSizeUnit: maxSizeUnit.toString()
        });
    }, [evictionType, maxSize, maxCount, evictionStrategy, maxSizeUnit])

    const onSelectEvictionStrategy = (event, selection, isPlaceholder) => {
        setEvictionStrategy(selection);
        setIsOpenEvictionStrategy(false);
    };

    const onSelectMaxCountUnit = (event, selection, isPlaceholder) => {
        setMaxSizeUnit(selection);
        setIsOpenMaxSizeUnit(false);
    };

    // Options for Eviction Strategy
    const evictionStrategyOptions = () => {
        return Object.keys(EvictionStrategy).map((key) => (
            <SelectOption key={key} value={EvictionStrategy[key]} />
        ));
    };

    // Options for Max Size Unit
    const unitOptions = () => {
        return Object.keys(MaxSizeUnit).map((key) => (
            <SelectOption key={key} value={MaxSizeUnit[key]} />
        ));
    }

    return (
        <Card>
          <CardHeader>
            <TextContent>
              <Text component={TextVariants.h2}>{t('caches.create.configurations.feature.bounded')}</Text>
              <Text component={TextVariants.p}>{t('caches.create.configurations.feature.bounded-tooltip', { brandname: brandname })}</Text>
            </TextContent>
          </CardHeader>
          <CardBody>
            <FormGroup
              isInline
              isRequired
              fieldId="radio-size-count"
            >
              <Radio
                name="radio-size-count"
                id="size"
                onChange={() => setEvictionType(EvictionType.size)}
                isChecked={evictionType === EvictionType.size}
                label={
                  <TextContent>
                    <Text component={TextVariants.h4}>{t('caches.create.configurations.feature.radio-max-size')}</Text>
                  </TextContent>
                }
              />
              <Radio
                name="radio-size-count"
                id="count"
                onChange={() => setEvictionType(EvictionType.count)}
                isChecked={evictionType === EvictionType.count}
                label={
                  <TextContent>
                    <Text component={TextVariants.h4}>{t('caches.create.configurations.feature.radio-max-count')}</Text>
                  </TextContent>
                }
              />
            </FormGroup>
          </CardBody>
          <CardBody>
            {evictionType === 'size' &&
              <FormGroup
                isRequired
                fieldId="max-size"
                validated={evictionType === 'size' && maxSize >= 0? 'default' : 'error'}
                helperTextInvalid={t('caches.create.configurations.feature.max-size-helper-invalid')}
              >
                <MoreInfoTooltip label={t('caches.create.configurations.feature.max-size')} toolTip={t('caches.create.configurations.feature.max-size-tooltip', { brandname: brandname })} textComponent={TextVariants.h3} />
                <InputGroup>
                      <TextInput min={0} value={maxSize} type="number" onChange={(v)  => setMaxSize(parseInt(v))} aria-label="max-size-number-input"/>
                      <Select
                        variant={SelectVariant.single}
                        aria-label="max-size-unit-input"
                        onToggle={() => setIsOpenMaxSizeUnit(!isOpenMaxSizeUnit)}
                        onSelect={onSelectMaxCountUnit}
                        selections={maxSizeUnit}
                        isOpen={isOpenMaxSizeUnit}
                        aria-labelledby="toggle-id-max-size-unit"
                        width={'20%'}
                      >
                        {unitOptions()}
                      </Select>
                </InputGroup>
              </FormGroup>
            }

            {evictionType === 'count' &&
              <FormGroup
                isRequired
                fieldId="max-count"
                validated={evictionType === 'count' && maxCount >= 0? 'default' : 'error'}
                helperTextInvalid={t('caches.create.configurations.feature.max-count-helper-invalid')}
              >
                <MoreInfoTooltip label={t('caches.create.configurations.feature.max-count')} toolTip={t('caches.create.configurations.feature.max-count-tooltip', { brandname: brandname })} textComponent={TextVariants.h3} />
                <TextInput min={0} value={maxCount} type="number" onChange={(v) => setMaxCount(parseInt(v))} aria-label="max-count-input" />
              </FormGroup>
            }
          </CardBody>
          <CardBody>
            <FormGroup fieldId='form-eviction-strategy'>
              <MoreInfoTooltip label={t('caches.create.configurations.feature.eviction-strategy')} toolTip={t('caches.create.configurations.feature.eviction-strategy-tooltip', { brandname: brandname })} textComponent={TextVariants.h3} />
              <Select
                variant={SelectVariant.single}
                aria-label="eviction-strategy-select"
                onToggle={() => setIsOpenEvictionStrategy(!isOpenEvictionStrategy)}
                onSelect={onSelectEvictionStrategy}
                selections={evictionStrategy}
                isOpen={isOpenEvictionStrategy}
                aria-labelledby="toggle-id-eviction-strategy"
              >
                {evictionStrategyOptions()}
              </Select>
            </FormGroup>
          </CardBody>
        </Card>
    );
};

export default BoundedCacheConfigurator;
