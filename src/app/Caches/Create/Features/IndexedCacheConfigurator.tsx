import React, {useEffect, useState} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  FormGroup,
  InputGroup,
  Label,
  Radio,
  Text,
  TextContent,
  TextInput,
  TextVariants,
} from '@patternfly/react-core';
import {global_spacer_sm} from '@patternfly/react-tokens';
import {IndexedStorage} from "@services/infinispanRefData";
import {useTranslation} from 'react-i18next';
import {MoreInfoTooltip} from '@app/Common/MoreInfoTooltip';

const IndexedCacheConfigurator = (props: {
  indexedOptions: IndexedCache,
  indexedOptionsModifier: (IndexedCache) => void,
}) => {

  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  //Indexed Cache
  const [indexedStorage, setIndexedStorage] = useState<'filesystem' | 'local_heap'>(props.indexedOptions.indexedStorage);
  const [indexedEntities, setIndexedEntities] = useState<string[]>(props.indexedOptions.indexedEntities);


  const [entityInput, setEntityInput] = useState<string>('');
  const [validEntity, setValidEntity] = useState<'success' | 'error' | 'default'>('default');

  useEffect(() => {
    props.indexedOptionsModifier({
      indexedStorage: indexedStorage,
      indexedEntities: indexedEntities,

    });
  }, [indexedStorage, indexedEntities]);

  const deleteChip = (chipToDelete: string) => {
    const newChips = indexedEntities.filter(chip => !Object.is(chip, chipToDelete));
    setIndexedEntities(newChips);
  };

  const addChip = (newChipText: string) => {
    setIndexedEntities([...indexedEntities, `${newChipText}`]);
    setEntityInput('');
  };

  const helperAddEntity = () => {
    if (entityInput.length) {
      if (!indexedEntities.includes(entityInput)) {
        addChip(entityInput);
        setValidEntity('success')
      } else {
        setValidEntity('error');
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <TextContent>
          <Text component={TextVariants.h2}>{t('caches.create.configurations.feature.indexed')}</Text>
          <Text component={TextVariants.p}>{t('caches.create.configurations.feature.indexed-tooltip')}</Text>
        </TextContent>
      </CardHeader>
      <CardBody>
        <FormGroup
          fieldId='indexed-storage'
          isRequired
          isInline
        >
          <TextContent style={{ marginBottom: global_spacer_sm.value, width: '100%' }}>
            <MoreInfoTooltip label={t('caches.create.configurations.feature.index-storage')}
              toolTip={t('caches.create.configurations.feature.index-storage-tooltip', { brandname: brandname })}
              textComponent={TextVariants.h3} />
          </TextContent>

          <Radio
            name="radio-storage"
            id="persistent"
            onChange={() => setIndexedStorage(IndexedStorage.persistent)}
            isChecked={indexedStorage === IndexedStorage.persistent}
            label={
              <TextContent>
                <Text
                  component={TextVariants.h4}>{t('caches.create.configurations.feature.index-storage-persistent')}</Text>
              </TextContent>
            }
          />
          <Radio
            name="radio-storage"
            id="volatile"
            onChange={() => setIndexedStorage(IndexedStorage.volatile)}
            isChecked={indexedStorage === IndexedStorage.volatile}
            label={
              <TextContent>
                <Text
                  component={TextVariants.h4}>{t('caches.create.configurations.feature.index-storage-volatile')}</Text>
              </TextContent>
            }
          />
        </FormGroup>
      </CardBody>
      <CardBody>
        <FormGroup isInline fieldId='indexed-entities' validated={validEntity}
          helperTextInvalid={t('caches.create.configurations.feature.index-storage-entity-helper')}>
          <MoreInfoTooltip label={t('caches.create.configurations.feature.index-storage-entity')}
            toolTip={t('caches.create.configurations.feature.index-storage-entity-tooltip', { brandname: brandname })}
            textComponent={TextVariants.h3} />
          <InputGroup style={{ marginTop: global_spacer_sm.value }}>
            <TextInput value={entityInput} type="text" onChange={setEntityInput} />
            <Button id="add-entity" variant="control" onClick={helperAddEntity}>
              {t('caches.create.configurations.feature.index-storage-add-btn')}
            </Button>
          </InputGroup>
        </FormGroup>
      </CardBody>
      <CardBody>
        {indexedEntities.map(currentChip => (
          <Label
            color="blue"
            closeBtnAriaLabel="Remove entity"
            onEditComplete={(text) => {
              setIndexedEntities(indexedEntities.map(chip => chip === currentChip ? text : chip));
            }}
            isEditable
            style={{ marginRight: global_spacer_sm.value }}
            key={currentChip} onClose={() => deleteChip(currentChip)}>
            {currentChip}
          </Label>
        ))}
      </CardBody>
    </Card>
  );
};

export default IndexedCacheConfigurator;
