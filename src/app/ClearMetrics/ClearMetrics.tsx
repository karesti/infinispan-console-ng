import React from 'react';
import { Button, ButtonVariant, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useClearStats } from '@app/services/statsHook';
import { useCacheDetail } from '@app/services/cachesHook';

/**
 * ClearMetrics entry modal
 */
const ClearMetrics = (props: {
  name: string;
  type: 'query' | 'cache-metrics' | 'global-stats';
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { loadCache } = useCacheDetail();
  const { onClearStats } = useClearStats(props.name, props.type, () => {
    loadCache(props.name);
    props.closeModal();
  });
  const label = props.type == 'global-stats' ? props.type : 'caches.' + props.type;

  return (
    <Modal
      className="pf-m-redhat-font"
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label={t(label + '.modal-clear-stats-label')}
    >
      <ModalHeader titleIconVariant={'warning'} title={t(label + '.modal-clear-stats')} />
      <ModalBody>
        <Content component={'p'}>{t(label + '.modal-button-clear-stats-body')}</Content>
      </ModalBody>
      <ModalFooter>
        <Button data-cy="confirmButton" key="confirm" variant={ButtonVariant.danger} onClick={onClearStats}>
          {t(label + '.modal-button-clear-stats')}
        </Button>
        <Button data-cy="cancelButton" key="cancel" variant="link" onClick={props.closeModal}>
          {t('common.actions.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { ClearMetrics };
