import React, { useEffect, useState } from 'react';
import {
  Bullseye,
  Content,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Spinner
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useCreateCache } from '@app/services/createCacheHook';
import { FeatureCard } from '@app/Caches/Create/Features/FeatureCard';
import { CacheFeature } from '@services/infinispanRefData';
import { FeatureAlert } from '@app/Caches/Create/Features/FeatureAlert';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';
import { useFetchAvailableRolesNames } from '@app/services/rolesHook';
import { selectOptionPropsFromArray } from '@utils/selectOptionPropsCreator';

const SecuredCacheConfigurator = (props: { isEnabled: boolean }) => {
  const { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const [roles, setRoles] = useState<string[]>(configuration.feature.securedCache.roles);
  const { availableRoleNames, loading, error } = useFetchAvailableRolesNames();

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        feature: {
          ...prevState.feature,
          securedCache: {
            roles: roles,
            valid: securedFeatureValidation()
          }
        }
      };
    });
  }, [roles]);

  const validateForm = (): 'success' | 'default' | 'error' => {
    return roles.length == 0 ? 'error' : 'success';
  };

  const securedFeatureValidation = (): boolean => {
    if (!props.isEnabled) {
      return false;
    }
    return roles.length > 0;
  };

  const onSelectRoles = (selection) => {
    if (roles.includes(selection)) setRoles(roles.filter((role) => role !== selection));
    else setRoles([...roles, selection]);
  };

  if (!props.isEnabled || error != '') {
    return <FeatureAlert feature={CacheFeature.SECURED} />;
  }

  const buildContent = () => {
    if (loading) {
      return (
        <Bullseye>
          <Spinner size={'md'} isInline />
          <Content>{t('caches.create.configurations.feature.roles-loading')}</Content>
        </Bullseye>
      );
    }

    return (
      <FormGroup fieldId="select-roles" isRequired label={'Roles'}>
        <SelectMultiWithChips
          id="roleSelector"
          placeholder={t('caches.create.configurations.feature.select-roles')}
          options={selectOptionPropsFromArray(availableRoleNames)}
          selection={roles}
          onSelect={onSelectRoles}
          onClear={() => setRoles([])}
        />
        {validateForm() === 'error' && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                {t('caches.create.configurations.feature.select-roles-helper')}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
    );
  };
  return (
    <FeatureCard
      title="caches.create.configurations.feature.secured"
      description="caches.create.configurations.feature.secured-description"
    >
      {buildContent()}
    </FeatureCard>
  );
};

export default SecuredCacheConfigurator;
