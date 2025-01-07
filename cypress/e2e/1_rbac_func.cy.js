describe('RBAC Functionality Tests', () => {
  const monitorUserName = 'monitor';
  const observerUserName = 'observer';
  const applicationUserName = 'application';
  const deployerUserName = 'deployer';

  it('successfully logins and performs actions with monitor user', () => {
    cy.login(monitorUserName, Cypress.env('password'));
    checkDataContainerView(true, false, false, false);
    checkSecuredCacheDetailsView(true, false, false, 'monitor', 'indexed-cache');
    checkNotOwnSecuredCache('a-rbac-test-cache');
    checkNonSecuredCacheDetailView(true, false);
    checkMenu(false);
    cy.login(monitorUserName, Cypress.env('password'), '/cache/indexed-cache');
    checkNoEntriesTabView(false);
    cy.login(monitorUserName, Cypress.env('password'), '/global-stats');
    checkGlobalStatsView(false)
  });

  it('successfully logins and performs actions with observer user', () => {
    cy.login(observerUserName, Cypress.env('password'));
    checkMenu(false);
    checkDataContainerView(false, false, false, false);
    checkSecuredCacheDetailsView(false, false, false, 'observer', 'indexed-cache');
    cy.contains('Elaia');
    cy.get('[data-cy=actions-elaia]').should('not.exist');
    //Running query on secured page
    cy.get('[data-cy=queriesTab]').click();
    cy.get('#textSearchByQuery').click().type('from org.infinispan.Person where age>2');
    cy.get('button[aria-label=searchButton]').click();
    cy.contains('1 - 1 of 1');
    cy.contains('Elaia');
``
    checkNotOwnSecuredCache('a-rbac-test-cache');
    checkNonSecuredCacheDetailView(false, false);
    //Go to tasks (@TODO at the moment for observer no tasks are shown, add after fix)
    checkSchemasPageView(false);
    checkCountersPageView(false);
    cy.login(observerUserName, Cypress.env('password'), '/cache/not-encoded');
    checkNoEntriesTabView(false);
    cy.login(observerUserName, Cypress.env('password'), '/global-stats');
    checkGlobalStatsView(false)
  });

  it('successfully logins and performs actions with application user', () => {
    cy.login(applicationUserName, Cypress.env('password'));

    checkMenu(false);
    checkDataContainerView(false, false, false, false);
    checkSecuredCacheDetailsView(false, true, false, 'application', 'a-rbac-test-cache');
    checkActionsOnSuperCache();

    checkNotOwnSecuredCache('indexed-cache');
    checkNonSecuredCacheDetailView(false, false);
    //Go to tasks (@TODO at the moment for observer no tasks are shown, add after fix)
    checkSchemasPageView(false);
    checkCountersPageView(false);
    cy.login(applicationUserName, Cypress.env('password'), '/cache/not-encoded');
    checkNoEntriesTabView(false);
    cy.login(applicationUserName, Cypress.env('password'), '/global-stats');
    checkGlobalStatsView(false)
  });

  it('successfully logins and performs actions with deployer user', () => {
    cy.login(deployerUserName, Cypress.env('password'));

    checkMenu(false);
    checkDataContainerView(false, true, true, false);
    checkSecuredCacheDetailsView(false, true, false, 'deployer', 'a-rbac-test-cache');
    checkActionsOnSuperCache();

    checkNotOwnSecuredCache('indexed-cache');
    checkNonSecuredCacheDetailView(false, false);
    //Go to tasks (@TODO at the moment for observer no tasks are shown, add after fix)
    checkSchemasPageView(true);
    checkCountersPageView(false);
    cy.login(deployerUserName, Cypress.env('password'), '/cache/not-encoded');
    checkNoEntriesTabView(false);
    cy.login(deployerUserName, Cypress.env('password'), '/global-stats');
    checkGlobalStatsView(false)
  });

  it('successfully logins and performs actions with admin user', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));

    checkMenu(true);
    checkDataContainerView(false, true, true, true);
    checkSecuredCacheDetailsView(false, true, true, 'admin', 'a-rbac-test-cache');
    checkActionsOnSuperCache();

    checkNotOwnSecuredCache('text-cache');
    checkNonSecuredCacheDetailView(false, true);
    //Go to tasks (@TODO at the moment for observer no tasks are shown, add after fix)
    checkSchemasPageView(true);
    checkCountersPageView(true);
    checkTasksPage();
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/not-encoded');
    checkNoEntriesTabView(true);
  });

  function checkMenu(isSuperAdmin) {
    cy.contains('Data Container').should('exist');
    cy.contains('Global Statistics').should('exist');
    cy.contains('Cluster Membership').should('exist');
    if (isSuperAdmin) {
      cy.contains('Connected Clients').should('exist');
      cy.contains('Access Management').should('exist');
    } else {
      cy.contains('Connected Clients').should('not.exist');
      cy.contains('Access Management').should('not.exist');
    }
  }

  function checkDataContainerView(isMonitor, isDeployer, isAdmin, isSuperAdmin) {
    //Checking Data Container view
    cy.contains('Data container'); // cluster name
    cy.contains('Tracing is enabled'); // Tracing enabled
    if (isSuperAdmin) {
      cy.get('[data-cy=rebalancingSwitch]').should('exist'); // rebalancing status
    } else {
      cy.get('[data-cy=rebalancingSwitch]').should('not.exist'); // rebalancing status
    }

    cy.get('[data-ouia-component-id=cluster-manager-header-title]').should('exist');
    cy.get('[data-cy="statusInfo-clusterManager"]').should('exist');
    cy.get('[data-cy=navigationTabs]').should('exist');
    cy.contains(/^\d+ Caches$/);
    cy.contains('Counters');
    if (isMonitor) {
      cy.contains('Tasks').should('not.exist');
      cy.contains('Schemas').should('not.exist');
    } else {
      //cy.contains('1 Tasks'); //Should be uncommented after feature is implemented
      cy.contains('Schemas');
    }
    cy.get('#cache-table-toolbar').should('exist');
    cy.get('[data-cy=paginationArea]').should('exist');
    cy.get('[data-cy=cacheFilterSelect]').should('exist');
    if (isDeployer || isAdmin) {
      cy.get('[data-cy=createCacheButton]').should('exist');
    } else {
      cy.get('[data-cy=createCacheButton]').should('not.exist');
      cy.get('[data-cy=createCacheConfigButton]').should('exist');
    }
    cy.get('[data-cy=showTemplatesButton]').should('exist');
    cy.get('[data-cy=cachesTable]').should('exist');
    cy.contains('default'); // cache default
    if (isAdmin) {
      cy.get('[data-cy=actions-default]').should('exist');
      cy.get('[data-cy=actions-default]').click();
      if (isSuperAdmin) {
        cy.get('[aria-label=ignoreCacheAction]').should('exist');
      } else {
        cy.get('[aria-label=ignoreCacheAction]').should('not.exist');
      }
      cy.get('[aria-label=deleteCacheAction]').should('exist');

    } else {
      cy.get('[data-cy=actions-default]').should('not.exist');
    }

  }

  function checkSecuredCacheDetailsView(isMonitor, isAdmin, isSuperAdmin, roleName, cacheName) {
    cy.get('[id^="pagination-caches-top-pagination"]').first().click();
    cy.get('[data-action=per-page-100]').click();
    //Going to secured cache details page
    cy.get('[data-cy=detailButton-' + cacheName + ']').click();
    if (isAdmin) {
      cy.get('[data-cy=addEntryButton]').should('exist');
    } else {
      cy.get('[data-cy=addEntryButton]').should('not.exist');
      cy.get('[data-cy=clearAllButton]').should('not.exist');
    }

    if (isSuperAdmin) {
      cy.get('#rebalancing-switch').should('exist');
      cy.get('[data-cy=cacheConfigurationTab]').should('exist');
    } else {
      cy.get('#rebalancing-switch').should('not.exist');
      cy.get('[data-cy=cacheConfigurationTab]').should('not.exist');
    }

    if (isMonitor) {
      cy.get('[data-cy=cacheEntriesTab]').should('not.exist');
      cy.get('[data-cy=queriesTab]').should('not.exist');
    } else {
      cy.get('[data-cy=cacheEntriesTab]').should('exist');
      cy.get('[data-cy=queriesTab]').should('exist');
    }

    cy.get('[data-cy=detailCacheActions]').click();
    if(isSuperAdmin) {
      cy.get('[data-cy=manageTracingLink]').should('exist');
    } else {
      //@TODO uncomment when ISPN-16622 is fixed.
      //cy.get('[data-cy=manageTracingLink]').should('not.exist');
    }

    cy.get('[data-cy=manageIndexesLink]').click();
    if (isSuperAdmin) {
      cy.get('[data-cy=clearIndexButton]').should('exist');
    } else {
      cy.get('[data-cy=clearIndexButton]').should('not.exist');
    }

    cy.get('[data-cy=backButton]').click();
    //Going to metrics page
    cy.get('[data-cy=cacheMetricsTab]').click();
    if (isSuperAdmin) {
      cy.get('[data-cy=data-distribution-chart]').should('exist');
      cy.get('[data-cy=clearQueryMetricsButton]').should('exist');
    } else {
      cy.get('[data-cy=clearQueryMetricsButton]').should('not.exist');
      cy.get('[data-cy=data-distribution-chart]').should('not.exist');
    }

    if (!isMonitor)
      //Going back to cache entries tab
      cy.get('[data-cy=cacheEntriesTab]').click();
  }

  function checkNotOwnSecuredCache(cacheName) {
    //Checking not owned cache to be invisible for the current user.
    cy.contains('Data container').click();
    cy.get('[id^="pagination-caches-top-toggle"]').first().click();
    cy.get('[data-action=per-page-100]').click();
    cy.contains('/' + cacheName +'$/').should('not.exist');
  }

  function checkNonSecuredCacheDetailView(isMonitor, isSuperAdmin) {
    //Checking actions on non-secured cache
    cy.get('[data-cy=detailButton-indexed-cache-no-auth]').click();
    if (isSuperAdmin) {
      cy.get('#rebalancing-switch').should('exist');
    } else {
      cy.get('#rebalancing-switch').should('not.exist');
    }

    cy.get('[data-cy=addEntryButton]').click();
    //Waiting till at least one popup dissappears so that it is possible to type
    cy.wait(1500);
    cy.get('#key-entry').click().type('stringKey');
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-custom_type').click();
    cy.get('#value-entry')
      .click()
      .type('{"_type": "org.infinispan.Child","name": "Baby","age": 1,"city": "Miami"}', {
        parseSpecialCharSequences: false
      });
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache indexed-cache-no-auth.');
    cy.contains('stringKey');
    cy.contains('Baby');
    //Adding more entry
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#key-entry').click().type('stringKey1');
    cy.get('#value-entry').click().type('stringValue1');
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache indexed-cache-no-auth.');
    cy.contains('stringKey1');
    cy.contains('stringValue1');
    //Editing entry
    cy.get('[data-cy=actions-stringKey1] > button').click();
    cy.get('[aria-label=editEntryAction]').click();
    cy.get('#value-entry').click().type('changedValue');
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry updated in cache indexed-cache-no-auth.');
    cy.contains('changedValue');
    //Deleting entry
    cy.get('[data-cy=actions-stringKey1]').click();
    cy.get('[aria-label=deleteEntryAction]').click();
    cy.get('[data-cy=deleteEntryButton]').click();
    cy.contains('Entry stringKey1 deleted.');
    cy.contains('stringValue1').should('not.exist');
    //Running query
    cy.get('[data-cy=queriesTab]').click();
    cy.get('#textSearchByQuery').click().type('from org.infinispan.Child where age<2');
    cy.get('button[aria-label=searchButton]').click();
    if (!isMonitor) {
      //@TODO remove when the bug is fixed
      cy.contains('1 - 1 of 1');
      cy.contains('Baby');
    }
    //Deleting all entries
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=clearAllButton]').click();
    cy.get('[data-cy=deleteButton]').click();
    cy.wait(1500); //Waiting till the whole page is loaded
    if (isSuperAdmin) {
      //Checking cache configuration page
      cy.get('[data-cy=cacheConfigurationTab]').click();
      cy.contains('authorization').should('not.exist');
    }
    cy.get('[data-cy=detailCacheActions]').click();
    cy.get('[data-cy=manageIndexesLink]').click();
    if (isSuperAdmin) {
      cy.get('[data-cy=clearIndexButton]').should('exist');
    } else {
      cy.get('[data-cy=clearIndexButton]').should('not.exist');
    }

    cy.get('[data-cy=backButton]').click();
    //Going to metrics page
    cy.get('[data-cy=cacheMetricsTab]').click();
    if (isSuperAdmin) {
      cy.get('[data-cy=data-distribution-chart]').should('exist');
      cy.get('[data-cy=clearQueryMetricsButton]').should('exist');
    } else {
      cy.get('[data-cy=data-distribution-chart]').should('not.exist');
      cy.get('[data-cy=clearQueryMetricsButton]').should('not.exist');
    }

  }

  function checkSchemasPageView(isAdmin) {
    //Go to schemas and check that no create/edit/delete buttons available
    cy.contains('Data container').click();
    cy.get('[data-cy="tab-Schemas"]').click();
    cy.contains('people');
    cy.contains('test-6.proto');
    cy.get('[data-cy="people.protoConfig"]').click();
    cy.contains('message Person');
    if (isAdmin) {
      cy.get('button[aria-label="create-schema-button"]').should('exist');
      cy.get('[data-cy="actions-people.proto"]>button').click();
      cy.get('[aria-label="editSchemaAction"]').should('exist');
      cy.get('[aria-label="deleteSchemaAction"]').should('exist');
    } else {
      cy.get('button[aria-label="create-schema-button"]').should('not.exist');
      cy.get('[data-cy="actions-people.proto"]>button').click();
      cy.get('[aria-label="editSchemaAction"]').should('exist');
      cy.get('[aria-label="deleteSchemaAction"]').should('exist');
    }
  }

  function checkCountersPageView(isSuperAdmin) {
    //Checking counters page
    cy.get('[data-cy="tab-Counters"]').click();
    cy.contains('strong-1');
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label="Show Filters"]').length) {
        cy.get('button[aria-label="Show Filters"]').click();
      }
    })

    cy.get('[data-cy=counterFilterSelectExpanded]').should('exist');
    //Checking delete counter functionality
    cy.contains('td', 'strong-1').parent()
      .within($tr => {
        cy.get('td button').should('exist');
        cy.get('td button').click();
        cy.get('[aria-label="deleteCounter"]').should('exist');
        cy.get('[aria-label="deleteCounter"]').click();
    });
    cy.get('[data-cy="deleteCounterButton"]').should('exist');
    if (isSuperAdmin) {
      cy.get('[data-cy="deleteCounterButton"]').should('not.be.disabled');
    } else {
      cy.get('[data-cy="deleteCounterButton"]').should('be.disabled');
    }
    cy.get('[data-cy="cancelCounterDeleteButton"]').click();
    //Checking edit for counter functionality
    cy.contains('td', 'strong-1').parent()
    .within($tr => {
      cy.get('td button').should('exist');
      cy.get('td button').click();
      cy.get('[aria-label="setCounterAction"]').should('exist');
      cy.get('[aria-label="setCounterAction"]').click();
    });
    cy.get('[data-cy="confirmSetbutton"]').should('exist');
    cy.get('[data-cy="confirmSetbutton"]').should('not.be.disabled');
    cy.get('[data-cy="cancelSetButton"]').click();
    if (isSuperAdmin) {
      cy.get('[data-cy="createCounterButton"]').should('exist');
    }
  }

  function checkActionsOnSuperCache() {
    //Checking that user may create/edit/delete entries
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#key-entry').click().type('fordCar');
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-custom_type').click();
    cy.get('#value-entry')
      .click()
      .type('{"_type": "org.infinispan.Car","name": "Ford","year": 2012,"number": "1BC1898"}', {
        parseSpecialCharSequences: false
      });
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache a-rbac-test-cache.');
    cy.get('[data-cy=actions-fordCar]').should('exist');
    //Adding one more entry
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#key-entry').click().type('kiaCar');
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-custom_type').click();
    cy.get('#value-entry')
      .click()
      .type('{"_type": "org.infinispan.Car","name": "Kia","year": 2017,"number": "2AC1898"}', {
        parseSpecialCharSequences: false
      });
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache a-rbac-test-cache.');
    cy.get('[data-cy=actions-kiaCar]').should('exist');
    //Editing entry
    cy.get('[data-cy=actions-kiaCar] > button').click();
    cy.get('[aria-label=editEntryAction]').click();
    cy.get('#value-entry')
      .click()
      .clear()
      .type('{"_type": "org.infinispan.Car","name": "Kia","year": 2016,"number": "2AC1898"}', {
        parseSpecialCharSequences: false
      });
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry updated in cache a-rbac-test-cache.');
    cy.contains('2016');
    //Deleting entry
    cy.get('[data-cy=actions-kiaCar] > button').click();
    cy.get('[aria-label=deleteEntryAction]').click();
    cy.get('[data-cy=deleteEntryButton]').click();
    cy.contains('Entry kiaCar deleted.');
    cy.contains('2AC1898').should('not.exist');
    //Running query
    cy.get('[data-cy=queriesTab]').click();
    cy.get('#textSearchByQuery').click().type('from org.infinispan.Car where year>2010');
    cy.get('button[aria-label=searchButton]').click();
    cy.contains('1 - 1 of 1');
    cy.contains('Ford');
    //Reseting cache state for next test
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=clearAllButton]').click();
    cy.get('[data-cy=deleteButton]').click();
  }

  function checkTasksPage() {
    //Checking Tasks page
    cy.get('[data-cy="tab-Tasks"]').click();
    cy.contains('hello');
  }

  function checkNoEntriesTabView(isSuperAdmin) {
    // nobody sees manage metrics tab for default cache
    cy.get('[data-cy=manageEntriesTab]').should('not.exist');
    cy.get('[data-cy=cacheMetricsTab]').should('exist');
    if (isSuperAdmin) {
      cy.get('[data-cy=cacheConfigurationTab]').should('exist');
      // config tab is visible
      cy.contains('JSON').should('exist');
      cy.get('[data-cy=cacheMetricsTab]').click();
      cy.contains('Data access').should('exist');
    } else {
      // no config tab
      cy.get('[data-cy=cacheConfigurationTab]').should('not.exist');
      // metrics tab is visible
      cy.contains('Data access').should('exist');
    }
  }

  function checkGlobalStatsView() {
    cy.get('[data-cy="globalStatsActions"]').click();
    cy.contains('[data-cy="clearAccessMetricsButton"]').should('not.exist');
  }
});
