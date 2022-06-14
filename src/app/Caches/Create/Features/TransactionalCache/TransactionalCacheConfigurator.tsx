import React, {useEffect, useState} from 'react';
import {
  Alert, AlertVariant,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FlexItem,
  FormGroup,
  Radio,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import {Locking, TransactionalMode} from "@services/infinispanRefData";
import {useTranslation} from 'react-i18next';
import {MoreInfoTooltip} from '@app/Common/MoreInfoTooltip';
import {global_spacer_2xl, global_spacer_sm} from '@patternfly/react-tokens';

const TransactionalCacheConfigurator = (props: {
    transactionalOptions: TransactionalCache,
    transactionalOptionsModifier: (TransactionalCache) => void,
    isEnabled: boolean
}) => {

    const { t } = useTranslation();
    const brandname = t('brandname.brandname');

    const [mode, setMode] = useState(props.transactionalOptions.mode);
    const [locking, setLocking] = useState(props.transactionalOptions.locking);

    useEffect(() => {
        props.transactionalOptionsModifier({
            mode: mode,
            locking: locking,
        });
    }, [mode, locking]);

    if (!props.isEnabled) {
      return (
          <Alert variant={AlertVariant.info}
                 isInline
                 isPlain
                 title={t('caches.create.configurations.feature.transactional-disabled')} />
        )
    }

    return (
            <Card>
                <CardHeader>
                    <TextContent>
                        <Text component={TextVariants.h2}>{t('caches.create.configurations.feature.transactional')}</Text>
                        <Text component={TextVariants.p}>{t('caches.create.configurations.feature.transactional-description', { brandname: brandname })}</Text>
                    </TextContent>
                </CardHeader>

                <CardBody>
                    <TextContent style={{ marginBottom: global_spacer_sm.value, width: '100%' }}>
                        <MoreInfoTooltip label={t('caches.create.configurations.feature.transactional-mode')} toolTip={t('caches.create.configurations.feature.transactional-mode-tooltip')} textComponent={TextVariants.h3} />
                    </TextContent>
                    <FormGroup isInline fieldId='form-transaction-mode'>
                        <Flex>
                            <FlexItem style={{ marginRight: global_spacer_2xl.value }}>
                                <Radio
                                    name="radio-transactional-mode"
                                    id="non_xa"
                                    onChange={() => setMode(TransactionalMode.NON_XA)}
                                    isChecked={mode as TransactionalMode == TransactionalMode.NON_XA}
                                    label={
                                        <TextContent>
                                            <MoreInfoTooltip label={t('caches.create.configurations.feature.non-xa')} toolTip={t('caches.create.configurations.feature.non-xa-tooltip')} textComponent={TextVariants.h4} />
                                        </TextContent>
                                    }
                                />
                            </FlexItem>
                            <FlexItem style={{ marginRight: global_spacer_2xl.value }}>
                                <Radio
                                    name="radio-transactional-mode"
                                    id="non_durable_xa"
                                    onChange={() => setMode(TransactionalMode.NON_DURABLE_XA)}
                                    isChecked={mode as TransactionalMode == TransactionalMode.NON_DURABLE_XA}
                                    label={
                                        <TextContent>
                                            <MoreInfoTooltip label={t('caches.create.configurations.feature.non-durable-xa')} toolTip={t('caches.create.configurations.feature.non-durable-xa-tooltip')} textComponent={TextVariants.h4} />
                                        </TextContent>
                                    }
                                />
                            </FlexItem>
                            <FlexItem style={{ marginRight: global_spacer_2xl.value }}>
                                <Radio
                                    name="radio-transactional-mode"
                                    id="full_xa"
                                    onChange={() => setMode(TransactionalMode.FULL_XA)}
                                    isChecked={mode as TransactionalMode == TransactionalMode.FULL_XA}
                                    label={
                                        <TextContent>
                                            <MoreInfoTooltip label={t('caches.create.configurations.feature.full-xa')} toolTip={t('caches.create.configurations.feature.full-xa-tooltip')} textComponent={TextVariants.h4} />
                                        </TextContent>
                                    }
                                />
                            </FlexItem>
                        </Flex>
                    </FormGroup>
                </CardBody>

                <CardBody>
                    <TextContent style={{ marginBottom: global_spacer_sm.value, width: '100%' }}>
                        <MoreInfoTooltip label={t('caches.create.configurations.feature.locking-mode')} toolTip={t('caches.create.configurations.feature.locking-mode-tooltip')} textComponent={TextVariants.h3} />
                    </TextContent>

                    <FormGroup isInline fieldId='locking'>
                        <Radio
                            name="radio-locking"
                            id="optimistic"
                            onChange={() => setLocking(Locking.OPTIMISTIC)}
                            isChecked={locking as Locking == Locking.OPTIMISTIC}
                            label={
                                <TextContent>
                                    <Text component={TextVariants.h4}>
                                        {t('caches.create.configurations.feature.locking-mode-optimistic')}
                                    </Text>
                                </TextContent>
                            }
                        />
                        <Radio
                            name="radio-locking"
                            id="pessimistic"
                            onChange={() => setLocking(Locking.PESSIMISTIC)}
                            isChecked={locking as Locking == Locking.PESSIMISTIC}
                            label={
                                <TextContent>
                                    <Text component={TextVariants.h4}>
                                        {t('caches.create.configurations.feature.locking-mode-pessimistic')}
                                    </Text>
                                </TextContent>
                            }
                        />
                    </FormGroup>
                </CardBody>
            </Card>
    );
};

export default TransactionalCacheConfigurator;
