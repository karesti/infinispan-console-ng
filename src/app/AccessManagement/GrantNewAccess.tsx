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
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  SelectOptionProps,
  TextInput
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import formUtils, { IField } from '@services/formUtils';
import { AddCircleOIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { useFetchAvailableRoles } from '@app/services/rolesHook';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';
import { useFetchAvailablePrincipals, useGrantAccess } from '@app/services/principalsHook';
import { useFetchAvailableUsers } from '@app/services/userManagementHook';

const GrantNewAccess = (props: { isModalOpen: boolean; submitModal: () => void; closeModal: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { roles } = useFetchAvailableRoles();
  const { principals } = useFetchAvailablePrincipals();
  const { realms } = useFetchAvailableUsers();
  const rolesOptions = () => {
    const array: SelectOptionProps[] = [];
    roles.forEach((role) => {
      array.push({
        id: role.name,
        value: role.name,
        children: role.name,
        description: role.description
      });
    });
    return array;
  };

  const principalNameInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const principalRolesInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const [principalName, setPrincipalName] = useState<IField>(principalNameInitialState);
  const [principalRolesField, setPrincipalRolesField] = useState<IField>(principalRolesInitialState);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { onGrantAccess } = useGrantAccess(principalName.value, selectedRoles, props.submitModal);

  useEffect(() => {
    if (selectedRoles.length > 0) {
      setPrincipalRolesField(principalRolesInitialState);
    }
  }, [selectedRoles]);

  const userNameExist = (principalName: string): boolean => {
    let found = false;
    realms.forEach((value) => {
      if (found) {
        return;
      }
      if (value.includes(principalName)) {
        found = true;
      }
    });
    return found;
  };

  const handleSubmit = () => {
    let isValid = true;
    const trimmedPrincipalName = principalName.value.trim();
    if (trimmedPrincipalName.length == 0) {
      isValid = false;
      setPrincipalName({
        ...principalName,
        isValid: isValid,
        invalidText: t('access-management.principals.modal-principal-name-is-required'),
        validated: 'error'
      });
    } else if (principals.filter((p) => p.name == trimmedPrincipalName).length > 0) {
      isValid = false;
      setPrincipalName({
        ...principalName,
        isValid: isValid,
        invalidText: t('access-management.principals.modal-principal-exists', { name: trimmedPrincipalName }),
        validated: 'error'
      });
    } else if (userNameExist(trimmedPrincipalName)) {
      isValid = false;
      setPrincipalName({
        ...principalName,
        isValid: isValid,
        invalidText: t('access-management.principals.modal-user-exists', { name: trimmedPrincipalName }),
        validated: 'error'
      });
    }

    // validates permissions
    if (selectedRoles.length == 0) {
      isValid = false;
      setPrincipalRolesField({
        ...principalRolesField,
        isValid: isValid,
        invalidText: t('access-management.principals.modal-roles-is-required'),
        validated: 'error'
      });
    }

    if (isValid) {
      onGrantAccess();
      onCloseModal();
    }
  };

  const onCloseModal = () => {
    props.closeModal();
    setPrincipalName(principalNameInitialState);
    setPrincipalRolesField(principalRolesInitialState);
    setSelectedRoles([]);
  };

  const onSelectRoles = (value: string) => {
    if (value && value !== 'no results') {
      setSelectedRoles(
        selectedRoles.includes(value)
          ? selectedRoles.filter((selection) => selection !== value)
          : [...selectedRoles, value]
      );
    }
  };

  return (
    <Modal
      position={'top'}
      tabIndex={0}
      variant={ModalVariant.small}
      id={'grant-new-access-modal'}
      className="pf-m-redhat-font"
      isOpen={props.isModalOpen}
      onClose={onCloseModal}
      aria-label={'principals-modal-grant-title'}
      disableFocusTrap={true}
    >
      <ModalHeader
        titleIconVariant={AddCircleOIcon}
        title={t('access-management.principals.modal-grant-title')}
        description={t('access-management.principals.modal-grant-description', { brandname: brandname })}
      />
      <ModalBody>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FormGroup isRequired isInline label={t('access-management.principals.modal-principal-name')}>
            <TextInput
              validated={principalName.validated}
              value={principalName.value}
              type="text"
              onChange={(_event, value) =>
                formUtils.validateRequiredField(
                  value,
                  t('access-management.principals.modal-principal-name'),
                  setPrincipalName
                )
              }
              aria-label="principal-name-input"
            />
            {principalName.validated === 'error' && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {principalName.invalidText}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
          <FormGroup fieldId="roles" isRequired isInline label={t('access-management.principals.modal-roles')}>
            <SelectMultiWithChips
              id="roles"
              placeholder={t('access-management.principals.modal-roles-list-placeholder')}
              options={rolesOptions()}
              selection={selectedRoles}
              onSelect={onSelectRoles}
              onClear={() => setSelectedRoles([])}
            />
            {principalRolesField.validated === 'error' && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {principalRolesField.invalidText}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button key={'Save'} aria-label={'Save'} variant={ButtonVariant.primary} onClick={handleSubmit}>
          {t('common.actions.save')}
        </Button>
        <Button key={'Cancel'} aria-label={'Cancel'} variant={ButtonVariant.link} onClick={onCloseModal}>
          {t('common.actions.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { GrantNewAccess };
