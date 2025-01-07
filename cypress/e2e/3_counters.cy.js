describe('Counters CRUD', () => {
    beforeEach(() => {
      cy.login(Cypress.env('username'), Cypress.env('password'));
    });

    it('successfully creates weak & volatile counter', () => {
      cy.get('[data-cy="tab-Counters"]').click();
      //Creating new weak counter
      cy.get('button[data-cy="createCounterButton"]').click();
      cy.get("[aria-label=counter-name-input]").type("TestWeakVolatileCounter");
      cy.get("#volatile").click();
      cy.get("#weak").click();
      cy.get("[aria-label=initial-value-input]").focus().type(1);
      cy.get("[aria-label=concurrency-level-input]").focus().type(3);
      cy.get("[aria-label=Create]").click();
      cy.contains("Counter TestWeakVolatileCounter has been created");
    });

    it('successfully shows error while creating counter with duplicate name', () => {
        cy.get('[data-cy="tab-Counters"]').click();
        //Creating new weak counter
        cy.get('button[data-cy="createCounterButton"]').click();
        cy.get("[aria-label=counter-name-input]").type("TestWeakVolatileCounter");
        cy.get("#volatile").click();
        cy.get("#weak").click();
        cy.get("[aria-label=initial-value-input]").focus().type(1);
        cy.get("[aria-label=concurrency-level-input]").focus().type(3);
        cy.get("[aria-label=Create]").click();
        cy.contains("Unexpected error creating counter TestWeakVolatileCounter");
      });

    it('successfully creates weak & persistent counter', () => {
        cy.get('[data-cy="tab-Counters"]').click();
        //Creating new weak counter
        cy.get('button[data-cy="createCounterButton"]').click();
        cy.get("[aria-label=counter-name-input]").type("TestWeakPersistentCounter");
        cy.get("#persistent").click();
        cy.get("#weak").click();
        cy.get("[aria-label=initial-value-input]").focus().type(1);
        cy.get("[aria-label=concurrency-level-input]").focus().type(3);
        cy.get("[aria-label=Create]").click();
        cy.contains("Counter TestWeakPersistentCounter has been created");
      });

    it ('successfully creates strong & persistent counter', () => {
      cy.get('[data-cy="tab-Counters"]').click();
      //Creating new strong counter
      cy.get('button[data-cy="createCounterButton"]').click();
      cy.get("[aria-label=counter-name-input]").type("TestStrongPersistentCounter");
      cy.get("#persistent").click();
      cy.get("#strong").click();
      cy.get("[aria-label=initial-value-input]").focus().type(16);
      cy.get("[aria-label=lower-bound-input]").focus().type(0);
      cy.get("[aria-label=upper-bound-input]").focus().type(100);
      cy.get("[aria-label=Create]").click();
      cy.contains("Counter TestStrongPersistentCounter has been created");
    });

    it ('successfully creates strong & volatile counter', () => {
        cy.get('[data-cy="tab-Counters"]').click();
        //Creating new strong counter
        cy.get('button[data-cy="createCounterButton"]').click();
        cy.get("[aria-label=counter-name-input]").type("TestStrongVolatileCounter");
        cy.get("#volatile").click();
        cy.get("#strong").click();
        cy.get("[aria-label=initial-value-input]").focus().type(16);
        cy.get("[aria-label=lower-bound-input]").focus().type(0);
        cy.get("[aria-label=upper-bound-input]").focus().type(100);
        cy.get("[aria-label=Create]").click();
        cy.contains("Counter TestStrongVolatileCounter has been created");
      });

      it ('successfully adds delta to strong counter', () => {
        cy.get('[data-cy="tab-Counters"]').click();
        cy.contains('strong-5');
        cy.contains('td', 'strong-5').parent()
        .within($tr => {
            cy.get('td button').should('exist');
            cy.get('td button').click();
            cy.get('[aria-label=addDeltaAction]').click();
        });
        cy.get("#add-delta-counter-modal").should('exist');

        //Writing normal delta value
        cy.get("[data-cy=counterDeltaNum]").clear().type(1);
        cy.get("[data-cy=confirmAddDeltaButton]").click();
        cy.contains("Delta value for counter strong-5 has been set.")
        cy.get("#add-delta-counter-modal").should('not.exist');
        cy.contains('td', 'strong-5').parent()
        .within($tr => {
            cy.get('[data-label="Current value"]').contains('4');
        });
      });

      it ('successfully resets strong counter', () => {
        cy.get('[data-cy="tab-Counters"]').click();
        cy.contains('td', 'strong-5').parent()
        .within($tr => {
            cy.get('[data-label="Current value"]').contains('4');
        });
        cy.contains('td', 'strong-5').parent()
        .within($tr => {
            cy.get('td button').should('exist');
            cy.get('td button').click();
            cy.get('[aria-label=resetCounter]').click();
        });

        cy.get("[data-cy=resetCounterButton]").click();
        cy.contains('td', 'strong-5').parent()
        .within($tr => {
            cy.get('[data-label="Current value"]').contains('3');
        });
        cy.get("#reset-counter-modal").should('not.exist');
        cy.contains("Counter strong-5 has been reset.")
      });

      it ('successfully deletes weak counter', () => {
        cy.get('[data-cy="tab-Counters"]').click();
        cy.contains('weak-5');
        cy.contains('td', 'weak-5').parent()
        .within($tr => {
            cy.get('td button').should('exist');
            cy.get('td button').click();
            cy.get('[aria-label=resetCounter]').should('not.exist');
            cy.get('[aria-label=addDeltaAction]').should('not.exist');
            cy.get('[aria-label=deleteCounter]').click();
        });

        cy.get("[data-cy=deleteCounterButton]").click();

        cy.get("#delete-counter-modal").should('not.exist');
        cy.contains("Counter weak-5 has been deleted.");
        cy.get("[data-cy=counter-search]").type('weak-5')
        cy.contains('No result found');
      });

      it ('successfully deletes strong counter', () => {
        cy.get('[data-cy="tab-Counters"]').click();
        cy.contains('strong-5');
        cy.contains('td', 'strong-5').parent()
        .within($tr => {
            cy.get('td button').should('exist');
            cy.get('td button').click();
            cy.get('[aria-label=deleteCounter]').click();
        });

        cy.get("[data-cy=deleteCounterButton]").click();

        cy.get("#delete-counter-modal").should('not.exist');
        cy.contains("Counter strong-5 has been deleted.");
        cy.get("[aria-label='counters-table-label']").contains("td", "strong-5").should("not.exist");
      });


      // it ('successfully filters counters', () => {
      //   // There is an issue in Patternfly with size
      //   cy.get('[data-cy="tab-Counters"]').click();
      //   cy.contains('strong-4');
      //   cy.contains('weak-4');
      //
      //   //Selecting only strong counters
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click();
      //   cy.get("[data-cy='strongCounter']").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click();  //Closing the filter select
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.contains("weak-4").should("not.exist");
      //   cy.contains("Persistent");
      //   cy.contains("Volatile");
      //   cy.contains("1 - 6 of 6");
      //
      //   //Selecting only strong and perisitent counters
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click();
      //   cy.get("[data-cy='persistentCounter']").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click();  //Closing the filter select
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.contains("weak-4").should("not.exist");
      //   cy.contains("Persistent");
      //   cy.contains("Volatile").should('not.exist');
      //   cy.contains("1 - 5 of 5");
      //
      //   //Selecting only strong and perisitent counters
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click();
      //   cy.get("[data-cy='volatileCounter']").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click();  //Closing the filter select
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.contains("weak-4").should("not.exist");
      //   cy.contains("Persistent").should('not.exist');
      //   cy.contains("Volatile");
      //   cy.contains("1 - 1 of 1");
      //
      //   //Selecting only weak and volatile counters
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click();
      //   cy.get("[data-cy='weakCounter']").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click();  //Closing the filter select
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.contains("strong-4").should("not.exist");
      //   cy.contains("weak-4").should("not.exist");
      //   cy.contains("Persistent").should('not.exist');
      //   cy.contains("Volatile");
      //   cy.contains("TestWeakVolatileCounter");
      //   cy.contains("1 - 1 of 1");
      //
      //   //Selecting only weak and persistent counters
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click();
      //   cy.get("[data-cy='persistentCounter']").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click();  //Closing the filter select
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.contains("strong-4").should("not.exist");
      //   cy.contains("weak-4");
      //   cy.contains("Persistent");
      //   cy.contains("Volatile").should('not.exist');
      //   cy.contains("1 - 5 of 5");
      //
      //   //Selecting all weak counters
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click();
      //   cy.get("[data-cy='persistentCounter']").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click(); //Closing the filter select
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.contains("strong-4").should("not.exist");
      //   cy.contains("weak-4");
      //   cy.contains("Persistent");
      //   cy.contains("Volatile");
      //   cy.contains("1 - 6 of 6");
      //
      //   //Selecting all counters
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click();
      //   cy.get("[data-cy='weakCounter']").click();
      //   cy.get('[data-cy=counterFilterSelectExpanded] > div > button').click();  //Closing the filter select
      //   cy.get("[data-cy=counterFilterSelect]").click();
      //   cy.contains("strong-4");
      //   cy.contains("weak-4");
      //   cy.contains("Persistent");
      //   cy.contains("Volatile");
      //   cy.contains("1 - 10 of 12");
      // });

      it ('successfully sets value to strong counter', () => {
        cy.get('[data-cy="tab-Counters"]').click();
        cy.contains('strong-4');
        cy.contains('td', 'strong-4').parent()
        .within($tr => {
            cy.get('td button').should('exist');
            cy.get('td button').click();
            cy.get('[aria-label=setCounterAction]').click();
        });
        cy.get("#set-counter-modal").should('exist');

        //Writing normal value to set counter
        cy.get("[data-cy=counterSetNum]").clear().type(4);
        cy.get("[data-cy=confirmSetbutton]").click();
        cy.contains("Counter strong-4 has been set to value 4")
        cy.get("#set-counter-modal").should('not.exist');
        cy.contains('td', 'strong-4').parent()
        .within($tr => {
            cy.get('[data-label="Current value"]').contains('4');
        });
      });

      it('successully shows error while setting value to strong counter with value out of bounds', () => {
        cy.get('[data-cy="tab-Counters"]').click();
        cy.contains('TestStrongPersistentCounter');
        cy.contains('td', 'TestStrongPersistentCounter').parent()
        .within($tr => {
            cy.get('td button').should('exist');
            cy.get('td button').click();
            cy.get('[aria-label=setCounterAction]').click();
        });
        cy.get("#set-counter-modal").should('exist');

        //Writing value out of upper bound to set counter
        cy.get("[data-cy=counterSetNum]").clear().type(101);
        cy.contains("The counter value must be between the lower bound and the upper bound inclusively");

        //Writing normal value to set counter
        cy.get("[data-cy=counterSetNum]").clear().type(3);
        cy.contains("The counter value must be between the lower bound and the upper bound inclusively").should('not.exist');

        //Writing value out of lower bound to set counter
        cy.get("[data-cy=counterSetNum]").clear().type(-1);
        cy.contains("The counter value must be between the lower bound and the upper bound inclusively");

        cy.get("[data-cy=cancelSetButton]").click();
        cy.get("#set-counter-modal").should('not.exist');
        cy.contains('td', 'TestStrongPersistentCounter').parent()
        .within($tr => {
            cy.get('[data-label="Current value"]').contains('16');
        });
      })
  });
