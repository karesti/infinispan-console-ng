describe('Cache Detail Overview', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/people');
  });

  it('successfully loads cache detail', () => {
    cy.contains('people');
    cy.contains('Transactional');
    cy.contains('Distributed');
    cy.contains('Rebalancing is on');

    //Checking that 3 tabs are shown
    cy.contains('Entries');
    cy.contains('Configuration');
    cy.contains('Metrics (Enabled)');
  });

  it('successfully CRUD an entry', () => {
    const key = "stringKey";
    const value = 'v1_stringValue';
    const valueChange = 'v2_stringValue';

    // create
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#key-entry').click().type(key);
    cy.get('#value-entry').click().type(value);
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    closePopup();

    // read
    cy.get('button[aria-label="Show Filters"]').click()
    cy.get('#textSearchByKey').click().type(key);
    cy.get('button[aria-label="Search"]').click()
    cy.contains('true').should('not.exist');
    cy.contains(key);
    cy.contains(value);
    cy.contains('1 - 1 of 1');

    // update
    cy.get('[data-cy=actions-' + key + ']').click();
    cy.get('[aria-label=editEntryAction]').click();
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-string').click();
    cy.get('#value-entry').click().clear().type(valueChange);
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry updated in cache people.');
    closePopup();
    cy.contains(valueChange);
    cy.contains(value).should('not.exist');
    cy.contains(valueChange);

    // delete
    cy.get('[data-cy=actions-' + key + ']').click();
    cy.get('[aria-label=deleteEntryAction]').click();
    // cancel now
    cy.get('[data-cy=cancelDeleteEntry]').click();
    cy.contains(valueChange);
    // do now
    cy.get('[data-cy=actions-' + key + ']').click();
    cy.get('[aria-label=deleteEntryAction]').click();
    cy.get('[data-cy=deleteEntryButton]').click();
    cy.contains('Entry ' + key + ' deleted.');
    closePopup();
    cy.contains(key).should('not.exist');
    cy.contains(valueChange).should('not.exist');
  });

  it('successfully create and get all types of entries', () => {
    cy.get('[data-cy=clearAllButton]').should('not.exist');
    //Adding string key/value
    const stringKey = 'kStr';
    const stringValue = 'vStr';
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#key-entry').click().type(stringKey);
    cy.get('#value-entry').click().type(stringValue);
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    closePopup();
    cy.contains(stringKey);
    cy.contains(stringValue);
    verifyGet('#option-string', stringKey, stringValue);

    //Adding Custom key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#toggle-keyContentType').click();
    cy.get('#option-custom_type').click();
    const keyPerson = `{"_type": "org.infinispan.Person","name": "Elaia_Key","age" : 12}`;
    const valuePerson = '{"_type": "org.infinispan.Person","name": "Elaia_Value","age" : 12}';
    cy.get('#key-entry')
      .click()
      .type(keyPerson, { parseSpecialCharSequences: false });
    cy.get('#value-entry')
      .click()
      .type(valuePerson, { parseSpecialCharSequences: false });
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    closePopup();
    cy.contains('org.infinispan.Person');
    verifyGet('#option-custom_type', keyPerson, 'Elaia_Value');

    //Adding double key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#toggle-keyContentType').click();
    cy.get('#option-double').click();
    cy.get('#key-entry').click().type(1.7976931348623157e308);
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-double').click();
    cy.get('#value-entry').click().type(1.7976931348623157e308);
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    closePopup();
    verifyGet('#option-double', '1.7976931348623157e+308', '1.7976931348623157e+308');

    //Adding float key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#toggle-keyContentType').click();
    cy.get('#option-float').click();
    cy.get('#key-entry').click().type(3.402823466e38);
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-float').click();
    cy.get('#value-entry').click().type(3.402823466e-38);
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    closePopup();
    verifyGet('#option-float', '3.4028235e+38', '3.4028235e+38');

    //Adding boolean key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#toggle-keyContentType').click();
    cy.get('#option-bool').click();
    cy.get('#key-entry').click().type('true');
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-bool').click();
    cy.get('#value-entry').click().type('ahoj');
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    closePopup();
    verifyGet('#option-bool', 'true', 'false');

    //Adding bytes key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#toggle-keyContentType').click();
    cy.get('#option-bytes').click();
    cy.get('#key-entry').click().type('00110010101001011001101110010101');
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-bytes').click();
    cy.get('#value-entry').click().type('10110010101001011001101110010100');
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    closePopup();
    verifyGet('#option-bytes', '00110010101001011001101110010101', '10110010101001011001101110010100');

    //Adding int32 key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#toggle-keyContentType').click();
    cy.get('#option-int32').click();
    cy.get('#key-entry').click().type(2147483648); //Adding greater value than int32 max
    cy.get('#value-entry').click().type('test');
    cy.get('[data-cy=addButton]').click();
    cy.contains('Unexpected error');
    //Changing to valid number
    cy.get('#key-entry').click().clear().type(2147483647);
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-int32').click();
    cy.get('#value-entry').click().clear().type(-2147483647);
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    closePopup();
    verifyGet('#option-int32', '2147483647', '-2147483647');

    //Adding int64 key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#toggle-keyContentType').click();
    cy.get('#option-int64').click();
    cy.get('#key-entry').click().clear().type('545337203685407');
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-int64').click();
    cy.get('#value-entry').click().clear().type('-545337203685403');
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    closePopup();
    verifyGet('#option-int64', '545337203685407', '-545337203685403');

    //Adding sint32 key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#toggle-keyContentType').click();
    cy.get('#option-sint32').click();
    cy.get('#key-entry').click().clear().type(2147483646);
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-sint32').click();
    cy.get('#value-entry').click().clear().type(-2147483646);
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    closePopup();
    verifyGet('#option-sint32', '2147483646', '-2147483646');

    //Adding sint64 key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#toggle-keyContentType').click();
    cy.get('#option-sint64').click();
    cy.get('#key-entry').click().clear().type('6223372036854775807');
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-sint64').click();
    cy.get('#value-entry').click().clear().type('-7223372036854776000');
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    closePopup();
    verifyGet('#option-sint64', '6223372036854775807', '-7223372036854776000');

    //Adding uint32 key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#toggle-keyContentType').click();
    cy.get('#option-uint32').click();
    cy.get('#key-entry').click().type('129496');
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-uint32').click();
    cy.get('#value-entry').click().type('229496');
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    closePopup();
    verifyGet('#option-uint32', '129496', '229496');

    //Adding uint64 key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#toggle-keyContentType').click();
    cy.get('#option-uint64').click();
    cy.get('#key-entry').click().type('6223372036854776000');
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-uint64').click();
    cy.get('#value-entry').click().type('7223372036854776000');
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    verifyGet('#option-uint64', '6223372036854776000', '7223372036854776000');

    clearCache();
  });

  it('successfully adds new entry with expiration and waits till entry is expired', () => {
    //Adding sint32 key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#toggle-keyContentType').click();
    cy.get('#option-sint32').click();
    cy.get('#key-entry').click().clear().type(2147483647);
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-sint32').click();
    cy.get('#value-entry').click().clear().type(-2147483647);
    cy.get('#timeToLive').click().type(2);
    cy.get('[data-cy=addButton]').click();
    checkEntryAddedPopupToCache();
    closePopup();
    cy.contains('2147483647');
    cy.contains('-2147483647');

    cy.wait(2000);
    cy.reload();
    cy.contains('2147483647').should('not.exist');
    cy.contains('-2147483647').should('not.exist');
  });

  it('successfully switches on/off rebalancing of the cache', () => {
    cy.get('#rebalancing-switch').click({force: true});
    cy.contains('Disable rebalancing on this cache?');
    //Testing cancel button
    cy.get('[data-cy=rebalanceChangeCancelButton]').click();
    cy.contains('Disable rebalancing on this cache?').should('not.exist');
    //Testing switching off functionality
    cy.get('#rebalancing-switch').click({force: true});
    cy.contains('Disable rebalancing on this cache?');
    cy.get('[data-cy=rebalanceChangeButton]').click();
    cy.contains('Rebalancing is off');
    //Testing switching on again
    cy.get('#rebalancing-switch').click({force: true});
    cy.contains('Enable rebalancing on this cache?');
    cy.get('[data-cy=rebalanceChangeButton]').click();
    cy.contains('Rebalancing is on');
  });

  function verifyGet(keyType, key, value) {
    // Going back to cache entries page
    cy.get('[data-cy=cacheEntriesTab]').click();
    cy.get('button[aria-label="Show Filters"]').click();
    cy.get('#textSearchByKey').click().clear();
    cy.get('#toggle-contentTypeFilter').click();
    cy.get(keyType).click();
    cy.get('#textSearchByKey').click().type(key, { parseSpecialCharSequences: false });
    cy.get('button[aria-label="Search"]').click();
    if (keyType !== '#option-custom_type') {
      cy.contains(key).should('exist');
    }
    cy.contains(value).should('exist');
    cy.contains('1 - 1 of 1');
  }

  function clearCache() {
    cy.get('[data-cy=cacheEntriesTab]').click();
    cy.get('[data-cy=clearAllButton]').click();
    cy.get('[data-cy=deleteButton]').click();
    cy.contains('The cache is empty');
  }

  function checkEntryAddedPopupToCache() {
    cy.contains('Entry added to cache people.');
  }

  function closePopup() {
    cy.get('[name=close-alert-button]').click(); //Closing alert popup.
  }
});
