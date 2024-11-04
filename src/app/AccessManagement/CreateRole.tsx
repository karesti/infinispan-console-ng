import React, { useState } from 'react';
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
import { useCreateRole, useFetchAvailableRoles } from '@app/services/rolesHook';
import { ROLES_MAP } from '@services/infinispanRefData';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';

const CreateRole = (props: { isModalOpen: boolean; submitModal: () => void; closeModal: () => void }) => {
  const { t } = useTranslation();
  const { roles } = useFetchAvailableRoles();
  const initPermissions = () => {
    const array: SelectOptionProps[] = [];
    ROLES_MAP.forEach((value, key, map) => {
      const desc = t(value);
      array.push({
        id: key,
        value: key,
        children: key,
        description: desc
      });
    });
    return array;
  };
  const initialSelectOptions: SelectOptionProps[] = initPermissions();

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

  const rolePermissionsInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const [roleName, setRoleName] = useState<IField>(roleNameInitialState);
  const [roleDescription, setRoleDescription] = useState<IField>(roleDescriptionInitialState);
  const [rolePermissionsField, setRolePermissionsField] = useState<IField>(rolePermissionsInitialState);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { onCreateRole } = useCreateRole(roleName.value, roleDescription.value, selectedPermissions, props.submitModal);

  const handleSubmit = () => {
    let isValid = true;
    // validates role name
    const trimmedRoleName = roleName.value.trim();
    if (trimmedRoleName.length == 0) {
      isValid = false;
      setRoleName({
        ...roleName,
        isValid: isValid,
        invalidText: t('access-management.roles.modal-role-name-is-required'),
        validated: 'error'
      });
    } else if (roles.filter((r) => r.name == trimmedRoleName).length > 0) {
      isValid = false;
      setRoleName({
        ...roleName,
        isValid: isValid,
        invalidText: t('access-management.roles.modal-role-exists', { name: trimmedRoleName }),
        validated: 'error'
      });
    }
    // validates permissions
    if (selectedPermissions.length == 0) {
      isValid = false;
      setRolePermissionsField({
        ...rolePermissionsField,
        isValid: isValid,
        invalidText: t('access-management.roles.modal-permissions-is-required'),
        validated: 'error'
      });
    }

    if (isValid) {
      onCreateRole();
      onCloseModal();
    }
  };

  const onCloseModal = () => {
    props.closeModal();
    setRoleName(roleNameInitialState);
    setRoleDescription(roleDescriptionInitialState);
    setSelectedPermissions([]);
  };

  const onSelectPermission = (value: string) => {
    if (value && value !== 'no results') {
      setSelectedPermissions(
        selectedPermissions.includes(value)
          ? selectedPermissions.filter((selection) => selection !== value)
          : [...selectedPermissions, value]
      );
    }
  };

  return (
    <Modal
      position={'top'}
      tabIndex={0}
      variant={ModalVariant.small}
      id={'create-role-modal'}
      isOpen={props.isModalOpen}
      onClose={onCloseModal}
      aria-label={'roles-modal-create-title'}
      disableFocusTrap={true}
    >
      <ModalHeader titleIconVariant={AddCircleOIcon} title={t('access-management.roles.modal-create-title')} />
      <ModalBody>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FormGroup isRequired isInline label={t('access-management.roles.modal-role-name')}>
            <TextInput
              validated={roleName.validated}
              value={roleName.value}
              type="text"
              onChange={(_event, value) =>
                formUtils.validateRequiredField(value, t('access-management.roles.modal-role-name'), setRoleName)
              }
              aria-label="role-name-input"
            />
            {roleName.validated === 'error' && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {roleName.invalidText}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
          <FormGroup isInline label={t('access-management.roles.modal-role-description')}>
            <TextInput
              validated={roleDescription.validated}
              value={roleDescription.value}
              type="text"
              onChange={(_event, value) =>
                formUtils.validateRequiredField(
                  value,
                  t('access-management.roles.modal-role-description'),
                  setRoleDescription
                )
              }
              aria-label="role-description-input"
            />
            {roleDescription.validated === 'error' && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {roleDescription.invalidText}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
          <FormGroup fieldId="permissions" isRequired isInline label={t('access-management.roles.modal-permissions')}>
            <SelectMultiWithChips
              id="permissions"
              placeholder={t('access-management.roles.modal-permissions-list-placeholder')}
              options={initialSelectOptions}
              selection={selectedPermissions}
              onSelect={onSelectPermission}
              onClear={() => setSelectedPermissions([])}
            />
            {rolePermissionsField.validated === 'error' && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                    {rolePermissionsField.invalidText}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button key={'Create'} aria-label={'Create'} variant={ButtonVariant.primary} onClick={handleSubmit}>
          {t('common.actions.save')}
        </Button>
        <Button key={'Cancel'} aria-label={'Cancel'} variant={ButtonVariant.link} onClick={onCloseModal}>
          {t('common.actions.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { CreateRole };
