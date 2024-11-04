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
  SelectOptionProps
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { IField } from '@services/formUtils';
import { AddCircleOIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { useUpdateRole } from '@app/services/rolesHook';
import { ROLES_MAP } from '@services/infinispanRefData';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';

const AddPermissions = (props: {
  name: string;
  permissions: string[];
  isModalOpen: boolean;
  submitModal: () => void;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const initPermissions = () => {
    const array: SelectOptionProps[] = [];
    ROLES_MAP.forEach((value, key, map) => {
      if (!props.permissions.includes(key)) {
        const desc = t(value);
        array.push({
          id: key,
          value: key,
          children: key,
          description: desc
        });
      }
    });
    return array;
  };
  const initialSelectOptions: SelectOptionProps[] = initPermissions();

  const rolePermissionsInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const [rolePermissionsField, setRolePermissionsField] = useState<IField>(rolePermissionsInitialState);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(props.permissions);
  const textInputRef = React.useRef<HTMLInputElement>();
  const { onUpdateRole } = useUpdateRole(props.name, '', selectedPermissions, props.submitModal);

  const handleSubmit = () => {
    if (selectedPermissions.length == 0) {
      setRolePermissionsField({
        ...rolePermissionsField,
        isValid: true,
        invalidText: t('access-management.roles.modal-permissions-is-required'),
        validated: 'error'
      });
    } else {
      onUpdateRole();
    }
  };

  const onCloseModal = () => {
    props.closeModal();
    setSelectedPermissions([]);
  };

  const onSelectPermission = (value: string) => {
    if (value && !props.permissions.includes(value)) {
      setSelectedPermissions(
        selectedPermissions.includes(value)
          ? selectedPermissions.filter((selection) => selection !== value)
          : [...selectedPermissions, value]
      );
    }
    textInputRef.current?.focus();
  };

  return (
    <Modal
      id={'add-permission-modal'}
      variant="small"
      isOpen={props.isModalOpen}
      onClose={onCloseModal}
      disableFocusTrap={true}
    >
      <ModalHeader
        titleIconVariant={AddCircleOIcon}
        title={t('access-management.role.modal-add-permission-title')}
        labelId={'roles-modal-add-permission-title'}
      />
      <ModalBody>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FormGroup fieldId="permissions" isRequired label={t('access-management.roles.modal-permissions')}>
            <SelectMultiWithChips
              id="permissions"
              placeholder={t('access-management.roles.modal-permissions-list-placeholder')}
              options={initialSelectOptions}
              selection={selectedPermissions}
              onSelect={onSelectPermission}
              onClear={() => setSelectedPermissions([])}
              readonly={props.permissions}
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
        <Button
          key={'Save'}
          aria-label={'Save'}
          isDisabled={selectedPermissions.length == props.permissions.length}
          variant={ButtonVariant.primary}
          onClick={handleSubmit}
        >
          {t('common.actions.save')}
        </Button>
        ,
        <Button key={'Cancel'} aria-label={'Cancel'} variant={ButtonVariant.link} onClick={onCloseModal}>
          {t('common.actions.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { AddPermissions };
