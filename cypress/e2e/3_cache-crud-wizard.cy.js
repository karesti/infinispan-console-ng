describe('Cache Creation Wizard', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
  });

  it('successfully creates cache with all building options', () => {
    cy.on("uncaught:exception", (err, runnable) => {
      cy.log(err.message);
      return false;
    });
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('asuper-cache');
    cy.get('#configure').click();
    cy.get('[data-cy=wizardNextButton]').click();
    cy.get('#sync').click();
    cy.get('[data-cy=wizardNextButton]').click();

    //Filling bounded  cache properties
    cy.get('[data-cy=menu-toogle-featuresSelect]').click();
    cy.get('[data-cy=option-typeahead-BOUNDED]').click();

    cy.get('#size').click();
    cy.get('[data-cy=memorySizeInput]').clear().type('1');
    cy.get('[data-cy=toggle-memorySizeUnit]').click();
    cy.get('#option-KB').click();
    cy.get('[data-cy=toggle-evictionStrategy]').click();
    cy.get('#option-REMOVE').click();

    //Filling indexed cache properties
    cy.get('[data-cy=menu-toogle-featuresSelect]').click();
    cy.get('[data-cy=option-typeahead-INDEXED').click();
    cy.get('#persistent').click();
    cy.get('#auto').click();
    cy.get('#volatile').click();
    cy.get('[data-cy=toggle-startupModeSelector]').click();
    cy.get('#option-reindex').click();
    cy.get('[data-cy=toggle-startupModeSelector]').click();
    cy.get('[data-cy=indexSharding]').type(10);
    cy.get('[data-cy=wizardNextButton]').should('be.disabled');
    cy.get('[data-cy=menu-toogle-entitiesSelector]').click().type('org.infinispan.Car').type('{enter}');
    cy.get('[data-cy=menu-toogle-entitiesSelector]').click()

    //Filling auth cache properties
    cy.get('[data-cy=menu-toogle-featuresSelect]').click();
    cy.get('[data-cy=option-typeahead-SECURED]').click();
    cy.get('[data-cy=menu-toogle-roleSelector]').click();
    cy.get('[data-cy=option-typeahead-admin]').click();
    cy.get('[data-cy=option-typeahead-application]').click();
    cy.get('[data-cy=option-typeahead-deployer]').click();
    cy.get('[data-cy=menu-toogle-roleSelector]').click();

    //Filling persistant cache properties
    cy.get('[data-cy=menu-toogle-featuresSelect]').click();
    cy.get('[data-cy=option-typeahead-PERSISTENCE]').click();
    cy.get('[data-cy=passivationSwitch]').next().click();
    cy.get('[data-cy=connectionAttempts]').type(5);
    cy.get('[data-cy=connectionInterval]').type(60);
    cy.get('[data-cy=availabilityInterval]').type(5000);
    cy.get('#toggle-persistentStorage').click();
    cy.get('#option-FileStore').click();

    //Filling transactional cache properties
    cy.get('[data-cy=menu-toogle-featuresSelect]').click();
    cy.get('[data-cy=option-typeahead-TRANSACTIONAL]').click();
    cy.get('#non_xa').click();

    cy.get('#pessimistic').click();
    cy.get('[data-cy=wizardNextButton]').click();

    cy.get('[data-cy=toggle-storage]').click();
    cy.get('#option-HEAP').click();
    cy.get('[data-cy=concurencyLevel]').clear().type(40);
    cy.get('[data-cy=lockTimeout]').clear().type(15);
    cy.get('#striping').next().click();
    //Indexing tuning
    cy.get('[data-cy=indexReaderExpand] button').click();
    cy.get('[data-cy=refreshInterval]').type(10);
    cy.get('[data-cy=indexWriterExpand] button').click();
    cy.get('#low-level-trace').next().click();
    cy.get('[data-cy=commitInterval]').type(1001);
    cy.get('[data-cy=ramBufferSize]').type(33);
    cy.get('[data-cy=maxBufferedEntries]').type(33);
    cy.get('[data-cy=threadPoolSize]').type(10);
    cy.get('[data-cy=queueCount]').type(10);
    cy.get('[data-cy=queueSize]').type(1050);
    cy.get('[data-cy=indexMerge] button').click();
    cy.get('#calibrate-by-deletes').next().click();
    cy.get('[data-cy=factor]').type(10);
    cy.get('[data-cy=maxEntries]').type(1000);
    cy.get('[data-cy=minSize]').type(1000);
    cy.get('[data-cy=maxSize]').type(10000);
    cy.get('[data-cy=maxForcedSize]').type(10000);
    //Transaction tuning
    cy.get('#read-committed').click();
    cy.get('[data-cy=stopTimeout]').type(10000);
    cy.get('[data-cy=completeTimeout]').type(50000);
    cy.get('[data-cy=reaperInterval]').type(20000);

    //Filling tracing properties
    cy.get('[data-cy=menu-toogle-categorySelector]').click();
    cy.get('[data-cy=option-typeahead-cluster]').click();
    cy.get('[data-cy=option-typeahead-x-site]').click();
    cy.get('[data-cy=option-typeahead-persistence]').click();
    cy.get('[data-cy=menu-toogle-categorySelector]').click();

    //Filling alias
    cy.get('[data-cy=menu-toogle-aliasesSelector]').click().type('securedAlias').type('{enter}');

    // Next
    cy.get('[data-cy=wizardNextButton]').click();

    //Verify before submitting and downloading file
    cy.contains('asuper-cache');
    cy.get('[data-cy=downloadModal]').click();
    cy.get('[data-cy=downloadButton]').click();
    cy.wait(2000);
    let downloadedFile = cy.readFile('./cypress/downloads/asuper-cache.json');
    downloadedFile.should('exist');
    downloadedFile.its('distributed-cache.mode').should('eq', 'SYNC');

    cy.get('[data-cy=downloadModal]').click();
    cy.get('#modal-XML').click();
    cy.get('[data-cy=downloadButton]').click();
    downloadedFile = cy.readFile('./cypress/downloads/asuper-cache.xml');
    downloadedFile.should('exist');

    cy.get('[data-cy=downloadModal]').click();
    cy.get('#modal-YAML').click();
    cy.get('[data-cy=downloadButton]').click();
    downloadedFile = cy.readFile('./cypress/downloads/asuper-cache.yaml');
    downloadedFile.should('exist');

    cy.get('[data-cy=wizardNextButton]').click();

    // Once the cache created, redirection to main page is done and the cache should be visible
    cy.get('[data-ouia-component-id=cluster-manager-header-title]').should('exist');
    cy.get('[data-cy="statusInfo-clusterManager"]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains('asuper-cache');
    cy.contains('securedAlias');
    cy.get('[data-cy=feature-asuper-cache]').contains('Bounded');
    cy.get('[data-cy=feature-asuper-cache]').contains('Indexed');
    cy.get('[data-cy=feature-asuper-cache]').contains('Secured');
    cy.get('[data-cy=feature-asuper-cache]').contains('Persistent');
    cy.get('[data-cy=feature-asuper-cache]').contains('Transactional');
    deleteCache('asuper-cache');
  });

  it('successfully creates with a template', () => {
    const cacheName = 'aCache';
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#edit').click();
    //Checking that the Next button is disabled until the cache name is entered
    cy.get('[data-cy=wizardNextButton]').should('be.disabled');

    cy.get('#cache-name').click();
    cy.get('#cache-name').type(cacheName);

    cy.get('[data-cy=wizardNextButton]').click();

    cy.get('[data-cy=toggle-templates]').click();
    cy.get('[data-cy=option-typeahead-e2e-test-template]').click();
    cy.get('[data-cy=wizardNextButton]').click();
    cy.contains('Cache ' + cacheName + ' successfully created with e2e-test-template.');
    // Once the cache created, redirection to main page is done and the cache should be visible
    //Is redirected to Data Container page
    cy.get('[data-ouia-component-id=cluster-manager-header-title]').should('exist');
    cy.get('[data-cy="statusInfo-clusterManager"]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains(cacheName);
    deleteCache(cacheName);
  });

  it('successfully creates without a template a JSON config', () => {
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('aSimpleCache');
    cy.get('#edit').click();
    cy.get('[data-cy=wizardNextButton]').click();
    cy.get('[data-cy=provideConfigArea] > button').click();

    if (Cypress.browser.name === "firefox") {
      //At the moment do nothing as the proper command for editing the config is not found yet
    } else {
      cy.get('.pf-v5-c-code-editor__code textarea:first').click({force: true}).focused().type( '{downArrow}' )
        .type("{shift}{end}").type("{del}{del}").type("{shift}{end}").type("{del}{del}").type("{shift}{end}").type("{del}{del}")
        .type("{shift}{end}").type("{del}{del}").type("{shift}{end}").type("{del}{del}").type("{shift}{end}").type("{del}{del}")
        .type("{shift}{end}").type("{del}{del}").type("{enter}{upArrow}").type('"distributed-cache": {{}"mode": "ASYNC", "statistics": true }{del}');
    }

    cy.get('[data-cy=wizardNextButton]').click();
    cy.contains('Cache aSimpleCache created with the provided configuration.');
    // Once the cache created, redirection to main page is done and the cache should be visible
    cy.get('[data-ouia-component-id=cluster-manager-header-title]').should('exist');
    cy.get('[data-cy="statusInfo-clusterManager"]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains('aSimpleCache');
    deleteCache('aSimpleCache');
  });

  it('successfully creates without a template a XML config', () => {
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('aSimpleXmlCache');
    cy.get('#edit').click();
    cy.get('[data-cy=wizardNextButton]').click();
    cy.get('[data-cy=provideConfigArea] > button').click();

    if (Cypress.browser.name === "firefox") {
      //At the moment do nothing as the proper command for editing the config is not found yet
    } else {
      cy.get('.pf-v5-c-code-editor__code textarea:first').click({force: true}).focused().type( '{downArrow}' )
        .type("{shift}{end}").type("{del}{del}").type("{shift}{end}").type("{del}{del}").type("{shift}{end}").type("{del}{del}")
        .type("{shift}{end}").type("{del}{del}").type("{shift}{end}").type("{del}{del}").type("{shift}{end}").type("{del}{del}")
        .type("{shift}{end}").type("{del}{del}").type("{enter}{upArrow}")
        .type(
          '<local-cache name="local">\
          <expiration interval="500" lifespan="60000" max-idle="1000" touch="ASYNC"/>\
          <memory storage="OFF_HEAP" max-size="200 MB" when-full="MANUAL" />\
      </local-cache>',
          { parseSpecialCharSequences: false }
        ).type("{del}{del}").type("{upArrow}{backspace}");
    }
    cy.get('[data-cy=wizardNextButton]').click();
    cy.contains('Cache aSimpleXmlCache created with the provided configuration.');
    // Once the cache created, redirection to main page is done and the cache should be visible
    cy.get('[data-ouia-component-id=cluster-manager-header-title]').should('exist');
    cy.get('[data-cy="statusInfo-clusterManager"]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains('aSimpleXmlCache');
    deleteCache('aSimpleXmlCache');
  });

  function deleteCache(cacheName) {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    cy.get(`[data-cy=actions-${cacheName}]`).click();
    cy.get('[aria-label=deleteCacheAction]').click();
    cy.get('#deleteCacheModal').should('exist');
    cy.contains('Permanently delete cache?');
    cy.get('#deleteCacheModal [aria-label=Close]').click(); //Closing modal with close button
    cy.contains('Permanently delete cache?').should('not.exist');

    cy.get(`[data-cy=actions-${cacheName}]`).click();
    cy.get('[aria-label=deleteCacheAction]').click();
    cy.contains('Permanently delete cache?');
    cy.get('[data-cy=cancelCacheDeleteButton]').click(); //Closing modal with Cancel button
    cy.contains('Permanently delete cache?').should('not.exist');

    cy.get(`[data-cy=actions-${cacheName}]`).click();
    cy.get('[aria-label=deleteCacheAction]').click();
    cy.get('#cache-to-delete').click();
    cy.get('#cache-to-delete').type(cacheName);
    cy.get('[data-cy=deleteCacheButton]').click(); //Deleting cache aCache

    cy.contains(`Cache ${cacheName} deleted.`);
    cy.get('[name=close-alert-button]').click(); //Closing alert popup.
    cy.get(cacheName).should('not.exist'); //Checking that deleted cache is not visible
  }
});
