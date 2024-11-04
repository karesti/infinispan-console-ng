import React, { useEffect } from 'react';
import { Alert, Button, Form, FormGroup, Modal, Spinner, Content } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useCacheAliases } from '@app/services/configHook';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';

/**
 * Update Alias Cache modal
 */
const UpdateAliasCache = (props: { cacheName: string; isModalOpen: boolean; closeModal: (boolean) => void }) => {
  const { loading, setLoading, error, aliases, setAliases, update } = useCacheAliases(props.cacheName);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(props.isModalOpen);
  }, [props.isModalOpen]);

  const clearUpdateAliasesModal = (updateDone: boolean) => {
    props.closeModal(updateDone);
  };

  const helperAddAlias = (selection) => {
    if (!aliases.some((alias) => alias === selection)) {
      setAliases([...aliases, selection]);
    } else {
      setAliases(aliases.filter((alias) => alias !== selection));
    }
  };

  const displayError = () => {
    if (error.length == 0) {
      return <></>;
    }

    return <Alert variant="danger" isInline title={error} />;
  };
  const buildContent = () => {
    if (loading) {
      return <Spinner size={'md'} />;
    }

    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        {displayError()}

        <Content>{t('caches.aliases.body1', { cacheName: props.cacheName })}</Content>
        <Content>{t('caches.aliases.body2', { cacheName: props.cacheName })}</Content>

        <FormGroup isInline fieldId="field-aliases" label={t('caches.aliases.values')}>
          <SelectMultiWithChips
            id="aliasesSelector"
            placeholder={t('caches.aliases.values')}
            options={[]}
            onSelect={helperAddAlias}
            onClear={() => setAliases([])}
            create={true}
            selection={aliases}
          />
        </FormGroup>
      </Form>
    );
  };

  return (
    <Modal
      data-cy={`updateAliasesCacheModal`}
      id="updateAliasesCacheModal"
      titleIconVariant={'warning'}
      width={'70%'}
      isOpen={props.isModalOpen}
      title={t('caches.aliases.title', { cacheName: props.cacheName })}
      onClose={() => clearUpdateAliasesModal(false)}
      aria-label={'Update aliases modal'}
      actions={[
        <Button
          aria-label={'Update'}
          variant={'danger'}
          key={'update-aliases-modal-button'}
          onClick={() => update(props.cacheName)}
          data-cy={'updateAliasesButton'}
        >
          {t('common.actions.update')}
        </Button>,
        <Button
          aria-label="CloseAction"
          key="close"
          variant="link"
          onClick={() => clearUpdateAliasesModal(false)}
          data-cy="closeAction"
        >
          {t('common.actions.close')}
        </Button>
      ]}
    >
      {buildContent()}
    </Modal>
  );
};

export { UpdateAliasCache };
