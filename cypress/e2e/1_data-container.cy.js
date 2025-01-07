describe('Data Container Overview', () => {
  const numberOfCaches = 16;

  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
  });

  //Data Container Overview
  it('successfully loads Data Container Overview', () => {
    cy.contains('Data container');
    cy.contains('Running'); // cluster status
    cy.contains('Tracing is enabled');
    cy.contains('Cluster rebalancing on'); // rebalancing status
    cy.get('[data-cy="statusInfo-clusterManager"]').should('exist');
    cy.get('[data-ouia-component-id=cluster-manager-header-title]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.get('[data-cy=navigationTabs]').should('exist');
    cy.get('#cache-table-toolbar').should('exist');
    cy.get('[data-cy=paginationArea]').should('exist');
    cy.get('[data-cy=cacheFilterSelect]').should('exist');
    cy.get('[data-cy=createCacheButton]').should('exist');
    cy.get('[data-cy=showTemplatesButton]').should('exist');
    cy.get('[data-cy=cachesTable]').should('exist');
    cy.contains('default'); // cache default
    cy.contains('octet-stream-cache').should('not.exist'); // cache octet-stream-cache is already on the next page

    //make sure there are total 4 tabs (0,1,2,3)
    cy.get('[data-cy="tab-Caches"]').click({multiple: true, force: true});
    cy.get('[data-cy="tab-Tasks"]').click({multiple: true, force: true});
    cy.get('[data-cy="tab-Counters"]').click({multiple: true, force: true});
    cy.get('[data-cy="tab-Schemas"]').click({multiple: true, force: true});
  });

  //Testing pagination and navigation
  it('successfully navigates through the caches as well as changes number of viewed caches on the page', () => {
    cy.contains(numberOfCaches + ' Caches');
    cy.contains('10 Counters');
    // cy.contains('1 Tasks');
    cy.contains('13 Schemas');

    cy.contains('1 - 10 of ' + numberOfCaches);
    cy.get('[data-cy=cachesTable] tr').should('have.length', 11); //11 including header row
    cy.contains('invalidationCache');
    cy.get('[data-action=previous]').first().should('be.disabled');
    cy.get('[data-action=next]').first().click();

    //Verify that the other caches are visible
    var numOfCachesOnNextPage = numberOfCaches - 10;
    cy.get('[data-cy=cachesTable] tr').should('have.length', numOfCachesOnNextPage + 1); //including header row
    cy.contains('people');
    cy.contains('xml-cache');

    cy.get('[data-action=next]').first().should('be.disabled');

    //Going back to the first page
    cy.get('[data-action=previous]').first().click();
    cy.get('[data-action=previous]').first().should('be.disabled');
    cy.get('[data-cy=cachesTable] tr').should('have.length', 11); //11 including header row
    cy.contains('invalidationCache');
    cy.contains('people').should('not.exist');
    cy.contains('xml-cache').should('not.exist');

    //Changing the number of items on the page
    cy.contains('1 - 10 of 16');
    cy.get('[id^="pagination-caches-top-toggle"]').first().click();
    cy.get('[data-action=per-page-10]').should('exist');
    cy.get('[data-action=per-page-20]').should('exist');
    cy.get('[data-action=per-page-50]').should('exist');
    cy.get('[data-action=per-page-100]').should('exist');
    cy.get('[data-action=per-page-20]').click();
    //Verifying that all caches are shown and navigation buttons are disabled
    cy.contains('1 - 16 of 16');
    cy.get('[data-cy=cachesTable] tr').should('have.length', numberOfCaches + 1); // including header row
    cy.get('[data-action=next]').first().should('be.disabled');
    cy.get('[data-action=previous]').first().should('be.disabled');
    cy.contains('java-serialized-cache');
    cy.contains('people');
    cy.contains('xml-cache');
  });

  //Testing the filters
  it('sucessfully filters caches by type and features', () => {
    cy.get('[data-cy=cacheFilterSelect]').should('exist');
    cy.get('[data-cy=filter-faceted-cache-menu]').should('not.exist');

    //Filtering by Local caches
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="localType"]').find('input:checkbox').click(); //Filtering local caches
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click(); //Closing filter selectbox

    //Verifying that only local caches are shown
    cy.contains('default');
    cy.get('[data-cy=cachesTable] tr').should('have.length', 2); //2 including header row
    //Verifying that all entries are local caches
    cy.get('[data-cy^=type-]').each((badge) => {
      cy.wrap(badge).contains('Local');
    });

    //Clears all filters
    cy.get('button:contains("Clear all filters"):visible').click();
    cy.get('[data-cy=cachesTable] tr').should('have.length', 11); //11 including header row
    cy.contains('default');
    cy.contains('invalidationCache');
    cy.contains('people').should('not.exist');

    //Filtering by Replicated caches
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="replicatedType"]').find('input:checkbox').click(); //Filtering replicated caches
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click(); //Closing filter selectbox

    //Verifying that only replicated caches are shown
    cy.contains('jboss-cache');
    cy.get('[data-cy=cachesTable] tr').should('have.length', 2); //2 including header row
    //Verifying that all entries are replicated caches
    cy.get('[data-cy^=type-]').each((badge) => {
      cy.wrap(badge).contains('Replicated');
    });

    //Adding filter by Invalidation cache
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="invalidatedType"]').find('input:checkbox').click(); //Filtering invalidated caches
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click(); //Closing filter selectbox

    //Verifying that only replicated,invalidated caches are shown
    cy.contains('jboss-cache');
    cy.contains('invalidationCache');
    cy.get('[data-cy=cachesTable] tr').should('have.length', 3); //3 including header row

    //Clears all filters
    cy.get('button:contains("Clear all filters"):visible').click();
    cy.get('[data-cy=cachesTable] tr').should('have.length', 11); //11 including header row
    cy.contains('default');
    cy.contains('invalidationCache');
    cy.contains('octet-stream-cache').should('not.exist');

    //Filtering by Distributed caches
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="distributedType"]').find('input:checkbox').click(); //Filtering distributed caches
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click(); //Closing filter selectbox
    cy.get('[data-cy=cacheFilterSelect]').click();

    //Verifying that only distributed caches are shown
    cy.contains('1 - 10 of 13');
    cy.contains('java-serialized-cache');
    cy.get('[data-cy=cachesTable] tr').should('have.length', 11); //11 including header row
    //Navigating to the next page to see the rest of the caches
    cy.get('[data-action=next]').first().click();
    cy.get('[data-cy=cachesTable] tr').should('have.length', 4); //3 including header row
    cy.contains('xml-cache');
    cy.contains('java-serialized-cache').should('not.exist');

    //Changing the number of caches on the page to view them all
    cy.get('[id^="pagination-caches-top-pagination"]').first().click();
    cy.get('[data-action=per-page-20]').click();
    cy.contains('not-encoded');
    cy.contains('xml-cache');
    cy.contains('1 - 13 of 13');
    cy.get('[data-cy=cachesTable] tr').should('have.length', 14); //13 including header row

    //Verifying that all entries are distributed caches
    cy.get('[data-cy^=type-]').each((badge) => {
      cy.wrap(badge).contains('Distributed');
    });

    //Adding Transactional feature to filter
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="transactionalFeature"]').find('input:checkbox').click(); //Filtering transactional caches (already on filtered distributed caches)
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 4); //4 including header row
    // //Verifying that all entries are distributed and transactional caches
    cy.get('[data-cy^=type-]').each((badge) => {
      cy.wrap(badge).contains('Distributed');
    });
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains('Transactional');
    });
    cy.contains('heap-test');
    cy.contains('off-heap-test');
    cy.contains('people');

    // //Adding Replicated type filter
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="replicatedType"]').find('input:checkbox').click(); //Filtering transactional caches (already on filtered distributed caches)+replicated
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 4); //4 including header row - nothing is changed
    //Verifying that all entries are distributed and transactional caches
    cy.get('[data-cy^=type-]').each((badge) => {
      cy.wrap(badge).contains('Distributed');
    });
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains('Transactional');
    });
    cy.contains('heap-test');
    cy.contains('off-heap-test');
    cy.contains('people');

    //Removing Distributed filter
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="distributedType"]').find('input:checkbox').click(); //Filtering transactional caches & replicated ones
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click( {force: true}); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 2); //2 including header row - nothing is changed
    cy.contains('No result found');

    //Removing Replicated filter
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="replicatedType"]').find('input:checkbox').click(); //Filtering transactional caches & replicated ones
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 4); //4 including header row - nothing is changed
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains('Transactional');
    });

    //Adding Indexed filter
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="indexedFeature"]').find('input:checkbox').click(); //Filtering transactional caches & replicated ones
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click( {force: true}); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 7); //5 including header row - nothing is changed
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains(/Transactional|Indexed/);
    });

    //Clearing all filters
    cy.get('button:contains("Clear all filters"):visible').click();
    cy.get('[data-cy=cachesTable] tr').should('have.length', numberOfCaches + 1); //18 including header row because upper the items per page is changed
    cy.contains('default');
    cy.contains('java-serialized-cache');
    cy.contains('people');

    //Adding Secured filter
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="authorizationFeature"]').find('input:checkbox').click(); //Filtering secured caches
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 3); //3 including header row - nothing is changed
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains(/Secured/);
    });
    cy.contains('indexed-cache');

    //Clearing all filters and setting Persistence
    cy.get('button:contains("Clear all filters"):visible').click();
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="persistenceFeature"]').find('input:checkbox').click(); //Filtering secured caches
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 2); //2 including header row - nothing is changed
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains(/Persistent/);
    });

    //Adding Bounded filter
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="boundedFeature"]').find('input:checkbox').click(); //Filtering bounded caches
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 3); //3 including header row - nothing is changed
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains(/Bounded/);
    });
    cy.contains('heap-test');

     //Clearing all filters and setting Backups
    cy.get('button:contains("Clear all filters"):visible').click();
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="backupsFeature"]').find('input:checkbox').click(); //Filtering secured caches
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 2); //2 including header row - nothing is changed
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains(/Backups/);
    });
    cy.contains('xsiteCache');
  });

  // Displays templates page
  it('Displays cache configuration templates page', () => {
    cy.get('[data-cy=showTemplatesButton]').click();
    cy.contains('Cache templates');

    //Going back with breadcrumb link;
    cy.get('[data-cy=dataContainerLink]').click(); //Clicking on breadcrumb link.

    //Is redirected to Data Container page
    cy.get('[data-ouia-component-id=cluster-manager-header-title]').should('exist');
    cy.get('[data-cy="statusInfo-clusterManager"]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');

    //Go to Config page again
    cy.get('[data-cy=showTemplatesButton]').click();
    cy.get('[data-cy=e2e-test-templateConfig] > button').should('be.visible');
    cy.get('[data-cy=e2e-test-templateConfigExpanded]').should('not.be.visible');
    //Clicking on the config name - config should appear
    cy.get('[data-cy=e2e-test-templateConfig] > button').click();
    cy.get('[data-cy=e2e-test-templateConfigExpanded]').should('be.visible');
    cy.contains('distributed-cache-configuration');
    //Clicking on the config name - config should disappear
    cy.get('[data-cy=e2e-test-templateConfig] > button').click();
    cy.get('[data-cy=e2e-test-templateConfigExpanded]').should('not.be.visible');
    cy.contains('distributed-cache-configuration').should('not.be.visible');
  });
});
