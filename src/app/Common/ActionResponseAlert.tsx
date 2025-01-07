import React from 'react';
import { useApiAlert } from '@app/utils/useApiAlert';
import { Alert, AlertActionCloseButton, AlertGroup, AlertVariant } from '@patternfly/react-core';

const ActionResponseAlert = () => {
  const { alertMap, removeAlert } = useApiAlert();

  if (alertMap.size == 0) {
    return <span />;
  }

  return (
    <AlertGroup isToast>
      {Array.from(alertMap.keys())
        .sort()
        .map((key) => (
          <Alert
            key={key}
            isLiveRegion
            title={alertMap.get(key).message}
            variant={alertMap.get(key).success ? AlertVariant.success : AlertVariant.danger}
            actionClose={<AlertActionCloseButton name={'close-alert-button'} key={key} onClose={() => removeAlert(key)} />}
          />
        ))}
    </AlertGroup>
  );
};
export { ActionResponseAlert };
