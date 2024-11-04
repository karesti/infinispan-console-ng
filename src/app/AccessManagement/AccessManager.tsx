import * as React from 'react';
import { useState } from 'react';
import {
  Card,
  CardBody,
  Content,
  ContentVariants,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Nav,
  NavItem,
  NavList,
  PageSection,
  PageSectionVariants,
  Tab,
  Tabs,
  TabTitleText,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { RoleTableDisplay } from '@app/AccessManagement/RoleTableDisplay';
import { FlushRoleCacheModal } from '@app/AccessManagement/FlushRoleCacheModal';
import { PrincipalTableDisplay } from '@app/AccessManagement/PrincipalTableDisplay';
import { UsersTableDisplay } from '@app/AccessManagement/UsersTableDisplay';
import { PageHeader } from '@patternfly/react-component-groups';

const AccessManager = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const [activeTabKey, setActiveTabKey] = useState<number>(0);
  const [showRoles, setShowRoles] = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const [showAccessControl, setShowAccessControl] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFlushCache, setIsFlushCache] = useState(false);

  interface AccessTab {
    key: string;
    name: string;
    eventKey: number;
  }

  const handleTabClick = (index: number) => {
    setActiveTabKey(index);
    setShowRoles(index == 0);
    setShowAccessControl(index == 1);
    setShowUsers(index == 2);
  };

  const buildTabs = () => {
    const tabs: AccessTab[] = [
      { name: t('access-management.tab-roles'), key: 'roles', eventKey: 0 },
      { name: t('access-management.tab-users'), key: 'users', eventKey: 1 },
      { name: t('access-management.tab-access-control'), key: 'principals', eventKey: 2 }
    ];

    return (
      <Tabs data-cy="navigationTabs" activeKey={activeTabKey} onSelect={(_event, tab) => handleTabClick(tab as number)}>
        {tabs.map((tab) => (
          <Tab
            data-cy={'nav-item-' + tab.name}
            aria-label={'nav-item-' + tab.key}
            key={'nav-item-' + tab.key}
            eventKey={tab.eventKey}
            title={<TabTitleText>{tab.name}</TabTitleText>}
          />
        ))}
      </Tabs>
    );
  };

  const buildSelectedContent = (
    <Card isFullHeight isPlain>
      <CardBody>
        {showRoles && <RoleTableDisplay />}
        {showAccessControl && <PrincipalTableDisplay />}
        {showUsers && <UsersTableDisplay />}
      </CardBody>
    </Card>
  );

  const displayActions = (
    <ToolbarGroup align={{ default: 'alignStart' }}>
      <ToolbarItem>
        <Dropdown
          isOpen={isOpen}
          onSelect={() => setIsOpen(false)}
          onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle ref={toggleRef} data-cy="aclActions" onClick={() => setIsOpen(!isOpen)} isExpanded={isOpen}>
              {t('common.actions.actions')}
            </MenuToggle>
          )}
          ouiaId="accessManagementDropdown"
          shouldFocusToggleOnSelect
        >
          <DropdownList>
            <DropdownItem
              value={0}
              key="flushCacheAction"
              data-cy="flushCacheAction"
              onClick={() => setIsFlushCache(true)}
            >
              {t('access-management.flush-cache-action')}
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </ToolbarItem>
    </ToolbarGroup>
  );

  return (
    <React.Fragment>
      <PageHeader
        title={t('access-management.title')}
        subtitle={t('access-management.description', { brandname: brandname })}
        actionMenu={displayActions}
      />
      <PageSection variant={PageSectionVariants.default}>
        {buildTabs()}
        {buildSelectedContent}
        <FlushRoleCacheModal
          isModalOpen={isFlushCache}
          closeModal={() => setIsFlushCache(false)}
          submitModal={() => {
            setIsFlushCache(false);
          }}
        />
      </PageSection>
    </React.Fragment>
  );
};

export { AccessManager };
