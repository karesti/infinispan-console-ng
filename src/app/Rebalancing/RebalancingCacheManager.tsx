import React, { useState } from 'react';
import { Flex, FlexItem, Spinner, Switch } from '@patternfly/react-core';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useTranslation } from 'react-i18next';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useDataContainer } from '@app/services/dataContainerHooks';
import { RebalancingConfirmationModal } from '@app/Rebalancing/RebalancingConfirmationModal';

const RebalancingCacheManager = () => {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const { cm, loading, reload } = useDataContainer();
  const [confirmationModalOpened, setConfirmationModalOpened] = useState(false);

  if (loading || !cm) {
    return (
      <FlexItem>
        <Spinner size={'md'} />
      </FlexItem>
    );
  }

  if (
    ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser) &&
    cm.rebalancing_enabled != undefined
  ) {
    return (
      <>
        <Flex>
          <FlexItem>
            <Switch
              data-cy="rebalancingSwitch"
              label={
                cm.rebalancing_enabled
                  ? t('cache-managers.rebalancing.enabled')
                  : t('cache-managers.rebalancing.disabled')
              }
              isChecked={cm.rebalancing_enabled}
              hasCheckIcon
              onChange={() => setConfirmationModalOpened(true)}
            />
            <RebalancingConfirmationModal
              type={'cache-managers'}
              isModalOpen={confirmationModalOpened}
              confirmAction={() =>
                ConsoleServices.dataContainer()
                  .rebalancing(!cm.rebalancing_enabled)
                  .then((r) => {
                    addAlert(r);
                    reload();
                  })
                  .finally(() => setConfirmationModalOpened(false))
              }
              closeModal={() => setConfirmationModalOpened(false)}
              enabled={cm.rebalancing_enabled}
            />
          </FlexItem>
        </Flex>
      </>
    );
  }

  // Return nothing if the connected user is not ADMIN
  return <></>;
};

export { RebalancingCacheManager };
