import React, {useEffect, useState} from 'react';
import {
  Alert, AlertVariant,
  Card,
  CardBody,
  CardHeader,
  FormGroup,
  Label,
  Select,
  SelectOption,
  SelectVariant,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import {useTranslation} from 'react-i18next';
import {ConsoleServices} from '@services/ConsoleServices';
import {global_spacer_sm} from '@patternfly/react-tokens';

const SecuredCacheConfigurator = (props: {
    securedOptions: SecuredCache,
    securedOptionsModifier: (SecuredCache) => void,
    isEnabled: boolean
}) => {

    const { t } = useTranslation();
    const brandname = t('brandname.brandname');

    const [roles, setRoles] = useState<string[]>(props.securedOptions.roles);

    const [loading, setLoading] = useState(true);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [error, setError] = useState<'success' | 'error' | 'default'>('default');

    const [isOpenRoles, setIsOpenRoles] = useState(false);

    useEffect(() => {
        if (loading) {
            ConsoleServices.security()
                .getSecurityRoles()
                .then((r) => {
                    if (r.isRight()) {
                        setAvailableRoles(r.value);
                        setError('success')
                    }
                    else {
                        setError('error');
                    }
                }).then(() => setLoading(false));
        }
    }, [loading]);

    useEffect(() => {
        props.securedOptionsModifier({
            roles: roles,
        });
    }, [roles]);

    const rolesOptions = () => {
        const options = availableRoles.map((role) => (
            <SelectOption key={role} value={role} />
        ))
        return options
    };

    const onSelectRoles = (event, selection) => {
        if (roles.includes(selection))
            setRoles(roles.filter(role => role !== selection));
        else
            setRoles([...roles, selection]);
    }

    const deleteRole = (roleToDelete: string) => {
        const newRoles = roles.filter(role => !Object.is(role, roleToDelete));
        setRoles(newRoles);
    }

    if (!props.isEnabled) {
      return (
        <Alert variant={AlertVariant.info}
               isInline
               isPlain
               title={t('caches.create.configurations.feature.secured-disabled')} />
      )
    }

    return (
            <Card>
                <CardHeader>
                    <TextContent>
                        <Text component={TextVariants.h2}>{t('caches.create.configurations.feature.secured')}</Text>
                        <Text component={TextVariants.p}>{t('caches.create.configurations.feature.secured-description', { brandname: brandname })}</Text>
                    </TextContent>
                </CardHeader>
                <CardBody>
                    <FormGroup fieldId='select-roles'>
                        <Select
                            variant={SelectVariant.checkbox}
                            aria-label="Select Roles"
                            onToggle={() => setIsOpenRoles(!isOpenRoles)}
                            onSelect={onSelectRoles}
                            selections={roles}
                            isOpen={isOpenRoles}
                            placeholderText={t('caches.create.configurations.feature.select-roles')}
                        >
                            {rolesOptions()}
                        </Select>
                    </FormGroup>
                </CardBody>
                <CardBody>
                    {roles.map(role => (
                        <Label
                            color="blue"
                            closeBtnAriaLabel="Remove entity"
                            style={{ marginRight: global_spacer_sm.value }}
                            key={role}
                            onClose={() => deleteRole(role)}
                        >
                            {role}
                        </Label>
                    ))}
                </CardBody>
            </Card>
    );
};

export default SecuredCacheConfigurator;
