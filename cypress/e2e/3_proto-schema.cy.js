describe('Proto Schema CRUD', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
  });

  it('successfully navigates through schemas', () => {
    cy.get('[data-cy="tab-Schemas"]').click();
    cy.contains('people');
    cy.contains('test-6.proto');
    cy.contains('test-10.proto');
    cy.contains('test-7.proto').should('not.exist');
    //Going to the next page
    cy.get('[data-cy=paginationArea]').should('exist');
    cy.get('[data-action=previous]').should('be.disabled');
    cy.get('[data-action=next]').first().click();
    cy.contains('test-7.proto');
    cy.contains('test-6.proto').should('not.exist');
    cy.contains('test-10.proto').should('not.exist');

    //Going to the previous page
    cy.get('[data-cy=paginationArea]').should('exist');
    cy.get('[data-action=next]').should('be.disabled');
    cy.get('[data-action=previous]').first().click();
    cy.contains('test-9.proto').should('not.exist');
    cy.contains('test-6.proto');
    cy.contains('test-10.proto');

    //Changing the number of items on the page
    cy.get('[id^="pagination-schemas-top-toggle"]').first().click();
    cy.get('[data-action=per-page-20]').click();
    cy.get('#primary-app-container').scrollTo('bottom');
    cy.contains('test-8.proto');
    cy.contains('test-7.proto');
    cy.contains('test-10.proto');
    cy.get('[data-action=next]').should('be.disabled');

    //Changing the number of items on the page back to 10
    cy.get('#primary-app-container').scrollTo('bottom');
    cy.get('[id^="pagination-schemas-top-toggle"]').first().click();
    cy.get('[data-action=per-page-10]').click();
    cy.contains('test-7.proto').should('not.exist');
    cy.contains('test-6.proto');
    cy.contains('test-10.proto');
    cy.get('[data-action=next]').first().click();
    cy.contains('test-9.proto');
  });

  it('successfully creates, edits and deletes a proto schema', () => {
    cy.get('[data-cy="tab-Schemas"]').click();

    //Creating new schema
    cy.get('button[aria-label="create-schema-button"]').click();
    const schemaName = 'aTestSchema';
    cy.get('#schema-name').click().type(schemaName);
    cy.get('#schema').click().type('schemaValue');
    cy.get('[data-cy="addSchemaButton"]').click();
    cy.contains('Schema ' + schemaName + ' created.');
    cy.get('[name=close-alert-button]').click(); //Closing alert popup.
    cy.contains(schemaName + '.proto');
    cy.contains('Schema ' + schemaName + '.proto has errors');

    // Update
    cy.get('[data-cy="actions-' + schemaName + '.proto"]>button').click();
    cy.get('[aria-label="editSchemaAction"]').click();
    cy.contains('schemaValue');
    cy.contains('Save');
    //Artificially adding here some delays between actions so that the proto schema is updated properly and normally shown on the page.
    cy.wait(3000);
    cy.get('[data-cy=schemaEditArea]').type('{selectall}', { timeout: 10000 });
    cy.wait(3000);
    cy.get('[data-cy=schemaEditArea]').type(
      'package org.infinispan; message ExampleProto { optional int32 other_id = 1; }',
      { parseSpecialCharSequences: false }
    );
    cy.wait(3000);
    cy.get('button[aria-label="confirm-edit-schema-button"]').click();
    cy.wait(3000);
    cy.contains('Schema ' + schemaName +'.proto updated.');
    cy.wait(3000);
    cy.get('[name=close-alert-button]').click(); //Closing alert popup.
    //Waiting 5 seconds so that the proto schema is managed to be updated on the page.
    cy.wait(3000);
    cy.get('[data-cy="' + schemaName + '.protoConfig"]').click();
    cy.wait(3000);
    cy.contains('schemaValue').should('not.exist');
    cy.contains('ExampleProto');
    cy.contains('Schema ' + schemaName + '.proto has errors').should('not.exist');

    //Deleting schema
    cy.get('[data-cy="actions-' + schemaName + '.proto"]>button').click();
    cy.get('[aria-label="deleteSchemaAction"]').click();
    cy.contains('Delete schema?');
    cy.get('button[aria-label="confirm-delete-schema-button"]').click();
    cy.contains('Schema ' + schemaName + '.proto has been deleted.');
    cy.get('[name=close-alert-button]').click(); //Closing alert popup.
    cy.contains('people.proto');
    cy.get('button[aria-label="create-schema-button"]').scrollIntoView();
    cy.contains(schemaName + '.proto').should('not.exist');
  });

  it('gives error if duplicate name is used while creating new schema', () => {
    cy.get('[data-cy="tab-Schemas"]').click();
    cy.get('button[aria-label="create-schema-button"]').click();
    cy.get('#schema-name').click().type('people');
    cy.get('#schema').click().type('schemaValue');
    cy.get('[data-cy="addSchemaButton"]').click();
    cy.contains('Unexpected error creating schema people');
    cy.get('[data-cy="cancelAddSchemaButton"]').click();
  });

  it('gives error if special symbols are used in the name field', () => {
    cy.get('[data-cy="tab-Schemas"]').click();
    cy.get('button[aria-label="create-schema-button"]').click();
    cy.get('#schema-name').click().type('1234567890+-*/name!@#$with%^&*special()_+symbols{}|":isnot?><saved>');
    cy.get('#schema').click().type('1234567890+-*/value!@#$with%^&*special()_+symbols{}|":is?><saved>');
    cy.get('[data-cy="addSchemaButton"]').click();
    cy.contains('1234567890+-');
    cy.contains('*/name!@#$with%^&*special()_+symbols{}|":isnot?');
    cy.contains('><saved>.proto')
    //Deleting schema
    cy.get('[data-cy^="actions-1234567890+-"]>button').click();
    cy.get('[aria-label="deleteSchemaAction"]').click();
    cy.contains('Delete schema?');
    cy.get('button[aria-label="confirm-delete-schema-button"]').click();
    cy.contains('has been deleted.');
  });
});
