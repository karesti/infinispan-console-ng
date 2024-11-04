import { useTranslation } from 'react-i18next';
import { useDescribeRole, useUpdateRole } from '@app/services/rolesHook';
import {
  ActionGroup,
  Alert,
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Form,
  FormGroup,
  Spinner,
  TextInput
} from '@patternfly/react-core';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { IField } from '@services/formUtils';

const RoleGeneral = (props: { name: string }) => {
  const roleNameInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const roleDescriptionInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const { t } = useTranslation();
  const { role, loading, error, setLoading } = useDescribeRole(props.name);
  const [roleName, setRoleName] = useState<IField>(roleNameInitialState);
  const [roleDescription, setRoleDescription] = useState<IField>(roleDescriptionInitialState);
  const { onUpdateRole } = useUpdateRole(props.name, roleDescription.value, [], () => setLoading(true));

  useEffect(() => {
    if (role) {
      setRoleName({
        ...roleName,
        value: role.name
      });
      setRoleDescription({
        ...roleDescription,
        value: role.description
      });
    }
  }, [role]);

  const buildDetailContent = () => {
    if (loading && !role) {
      return <Spinner size="xl" />;
    }

    if (error !== '') {
      return (
        <EmptyState
          variant={EmptyStateVariant.sm}
          titleText={t('access-management.role.error', {
            roleName: props.name
          })}
          icon={ExclamationCircleIcon}
          headingLevel={'h2'}
          status={'danger'}
        >
          <EmptyStateBody>{error}</EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Link
                to={{
                  pathname: '/access-management',
                  search: location.search
                }}
              >
                <Button variant={ButtonVariant.secondary}>{t('common.actions.back')}</Button>
              </Link>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      );
    }

    const displayImplicitRoleMessage = () => {
      return (
        role?.implicit && (
          <Alert isInline isPlain variant={'warning'} title={t('access-management.role.implicit-warning')} />
        )
      );
    };
    return (
      <Form
        isHorizontal
        isWidthLimited
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        {displayImplicitRoleMessage()}
        <FormGroup isRequired isInline disabled={true} label={t('access-management.roles.modal-role-name')}>
          <TextInput
            isDisabled={true}
            validated={roleName.validated}
            value={roleName.value}
            type="text"
            aria-label="role-name-input"
          />
        </FormGroup>
        <FormGroup isInline disabled={role?.implicit} label={t('access-management.roles.modal-role-description')}>
          <TextInput
            isDisabled={role?.implicit}
            validated={roleDescription.validated}
            value={roleDescription.value}
            type="text"
            onChange={(_event, value) =>
              setRoleDescription({
                ...roleDescription,
                value: value
              })
            }
            aria-label="role-description-input"
          />
        </FormGroup>
        <ActionGroup>
          <Button
            isDisabled={role?.implicit}
            key={'Save'}
            aria-label={'Save'}
            onClick={() => onUpdateRole()}
            variant={ButtonVariant.primary}
          >
            {t('common.actions.save')}
          </Button>
          <Button
            isDisabled={role?.implicit}
            key={'Cancel'}
            aria-label={'Cancel'}
            variant={ButtonVariant.link}
            onClick={() => setLoading(true)}
          >
            {t('common.actions.cancel')}
          </Button>
        </ActionGroup>
      </Form>
    );
  };

  return buildDetailContent();
};

export { RoleGeneral };
