import React, { useEffect, useState } from 'react';
import {
  Alert,
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
  Spinner,
  TextInput
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { IField } from '@services/formUtils';
import { AddCircleOIcon, EditIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { useFetchAvailableRoles } from '@app/services/rolesHook';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';
import { useDescribePrincipal, useGrantOrDenyRoles } from '@app/services/principalsHook';

const ManageRolesForPrincipal = (props: {
  principalName: string;
  isModalOpen: boolean;
  submitModal: () => void;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { roles } = useFetchAvailableRoles();
  const { principal, loading, error, setLoading } = useDescribePrincipal(props.principalName);
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

  const principalRolesInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const [principalRolesField, setPrincipalRolesField] = useState<IField>(principalRolesInitialState);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { onGrantOrDenyRoles } = useGrantOrDenyRoles(props.principalName, props.submitModal);

  useEffect(() => {
    if (props.isModalOpen) {
      setLoading(true);
    }
  }, [props.isModalOpen]);

  useEffect(() => {
    if (principal && !loading) {
      setSelectedRoles(principal.roles);
    }
  }, [loading, principal]);

  useEffect(() => {
    if (selectedRoles.length > 0) {
      setPrincipalRolesField(principalRolesInitialState);
    }
  }, [selectedRoles]);

  const handleSubmit = () => {
    let isValid = true;
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
      if (principal) {
        onGrantOrDenyRoles(
          'grant',
          selectedRoles.filter((r) => !principal.roles.includes(r))
        );
        onGrantOrDenyRoles(
          'deny',
          principal.roles.filter((r) => !selectedRoles.includes(r))
        );
      }
      onCloseModal();
    }
  };

  const onCloseModal = () => {
    props.closeModal();
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

  const displayContent = () => {
    if (loading) {
      return <Spinner size={'lg'} />;
    }

    if (error) {
      return <Alert variant="danger" isInline isPlain title={error} />;
    }

    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <FormGroup isRequired isInline label={t('access-management.principals.modal-principal-name')}>
          <TextInput value={props.principalName} type="text" aria-label="principal-name-input" isDisabled={true} />
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
    );
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
        titleIconVariant={EditIcon}
        title={t('access-management.principals.modal-manage-roles-title')}
        description={t('access-management.principals.modal-manage-roles-description', { brandname: brandname })}
      />
      <ModalBody>{displayContent()}</ModalBody>
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

export { ManageRolesForPrincipal };
