import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  Content,
  TextInput,
  ModalFooter,
  ModalHeader,
  ModalBody
} from '@patternfly/react-core';
import { useCaches } from '@app/services/dataContainerHooks';
import { useDeleteCache } from '@app/services/cachesHook';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

/**
 * Delete cache modal
 */
const DeleteCache = (props: { cacheName: string; isModalOpen: boolean; closeModal: (boolean) => void }) => {
  const { t } = useTranslation();

  const { reloadCaches } = useCaches();
  const { onDelete } = useDeleteCache(props.cacheName);
  const nameInputRef = React.useRef(null);

  useEffect(() => {
    if (props.isModalOpen && nameInputRef && nameInputRef.current) {
      (nameInputRef.current as unknown as HTMLInputElement).focus();
    }
  }, [props.isModalOpen]);

  const [isValidCacheNameValue, setIsValidCacheNameValue] = useState<'success' | 'error' | 'default'>('default');
  const [cacheNameFormValue, setCacheNameFormValue] = useState('');

  const clearDeleteCacheModal = (deleteDone: boolean) => {
    setIsValidCacheNameValue('default');
    setCacheNameFormValue('');
    props.closeModal(deleteDone);
  };

  const handleDeleteButton = () => {
    const trim = cacheNameFormValue.trim();
    setCacheNameFormValue(trim);
    if (trim.length == 0) {
      setIsValidCacheNameValue('error');
      return;
    }

    const validCacheName = trim === props.cacheName;
    setIsValidCacheNameValue(validCacheName ? 'success' : 'error');
    if (validCacheName) {
      onDelete();
      clearDeleteCacheModal(true);
      reloadCaches();
    }
  };

  return (
    <Modal
      variant={'small'}
      className="pf-m-redhat-font"
      isOpen={props.isModalOpen}
      onClose={() => clearDeleteCacheModal(false)}
      aria-label="Delete cache modal"
      disableFocusTrap={true}
      id="deleteCacheModal"
    >
      <ModalHeader
        titleIconVariant={'warning'}
        title={t('caches.delete.title')}
        description={
          <Content>
            <strong>&quot;{props.cacheName}&quot; </strong> {t('caches.delete.body')}
          </Content>
        }
      />

      <ModalBody>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FormGroup label={t('caches.delete.cache-name')} fieldId="cache-to-delete">
            <TextInput
              isRequired
              validated={isValidCacheNameValue}
              value={cacheNameFormValue}
              id="cache-to-delete"
              aria-describedby="cache-to-delete-helper"
              onChange={(_event, val) => setCacheNameFormValue(val)}
              ref={nameInputRef}
            />
            {isValidCacheNameValue === 'error' && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={isValidCacheNameValue} icon={<ExclamationCircleIcon />}>
                    {t('caches.delete.cache-name-invalid')}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={handleDeleteButton}
          aria-label="Confirm"
          data-cy="deleteCacheButton"
        >
          {t('cache-managers.delete')}
        </Button>
        <Button
          key="cancel"
          variant="link"
          aria-label="Cancel"
          onClick={() => clearDeleteCacheModal(false)}
          data-cy="cancelCacheDeleteButton"
        >
          {t('caches.delete.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { DeleteCache };
