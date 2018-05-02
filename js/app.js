/**
 * Budget App JavaScript
 */

// Helper functions for grabbing multiple elements
const getDestructuredElementsByIds = (document) => {
  return new Proxy({}, {
    get: (_, id) => document.getElementById(id),
  });
};

const { 
  addType, 
  addDescription, 
  addValue, 
  addButton,
  budgetContainer,
  budgetIncomeList,
  budgetExpensesList,
  budgetValue,
  budgetIncomeValue,
  budgetExpensesValue,
  budgetExpensesPercentage,
} = getDestructuredElementsByIds(document);

const BudgetController = (() => {
  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  class Income {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    expensePercentage: -1,
  };

  const calculateTotal = (type) => {
    let sum = 0;
    _.forEach(data.allItems[type], (currentItem) => {
      sum += currentItem.value;
    });
    data.totals[type] = sum;
  };

  return {
    addItem(type, description, value) {
      let newItem, id;

      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0;
      }

      if (type === 'exp') {
        newItem = new Expense(id, description, value);
      } else if (type === 'inc') {
        newItem = new Income(id, description, value);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },
    deleteItem(type, id) {
      const ids = _.map(data.allItems[type], (currentItem) => {
        return currentItem.id;
      });
      const index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget() {
      calculateTotal('exp');
      calculateTotal('inc');
      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        data.expensePercentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
      } else {
        data.expensePercentage = -1;
      }
    },
    getBudget() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        expensePercentage: data.expensePercentage,
      };
    },
  };
})();

const UIController = (() => {
  return {
    getInput() {
      return { 
        type: addType.value, 
        description: addDescription.value, 
        value: parseFloat(addValue.value),
      };
    },
    addListItem(obj, type) {
      let grabbedDomContent, grabbedDomElement;

      if (type === 'inc') {
        grabbedDomContent = `
          <div class="item clearfix" id="income-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
              <div class="item__value">${obj.value}</div>
              <div class="item__delete">
                <button class="item__delete--btn">
                  <i class="ion-ios-close-outline"></i>
                </button>
              </div>
            </div>
          </div>
        `;
        grabbedDomElement = budgetIncomeList;
      } else if (type === 'exp') {
        grabbedDomContent = `
          <div class="item clearfix" id="expense-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
              <div class="item__value">- ${obj.value}</div>
              <div class="item__percentage">21%</div>
              <div class="item__delete">
                <button class="item__delete--btn">
                  <i class="ion-ios-close-outline"></i>
                </button>
              </div>
            </div>
          </div>
        `;
        grabbedDomElement = budgetExpensesList;
      }

      grabbedDomElement.insertAdjacentHTML('beforeend', grabbedDomContent);
    },
    deleteListItem(selectorId) {
      const grabbedListItem = document.getElementById(selectorId);
      grabbedListItem.parentNode.removeChild(grabbedListItem);
    },
    clearFields() {
      const fields = [addDescription, addValue];
      _.forEach(fields, (field) => {
        field.value = '';
      });
      fields[0].focus();
    },
    displayBudget(obj) {
      budgetValue.textContent = `+ ${obj.budget}`;
      budgetIncomeValue.textContent = `+ ${obj.totalInc}`;
      budgetExpensesValue.textContent = `- ${obj.totalExp}`;
      if (obj.expensePercentage > 0) {
        budgetExpensesPercentage.textContent = `${obj.expensePercentage}%`;
      } else {
        budgetExpensesPercentage.textContent = '---';
      }
    },
  };
})();

const AppController = ((BudgetController, UIController) => {
  const updateBudget = () => {
    BudgetController.calculateBudget();
    const budget = BudgetController.getBudget();
    console.log(budget);
    UIController.displayBudget(budget);
  };

  const addItemController = () => {
    const input = UIController.getInput();
    
    if (input.description !== '' && !this.isNaN(input.value) && input.value !== 0) {
      const newItem = BudgetController.addItem(input.type, input.description, input.value);
      UIController.addListItem(newItem, input.type);
      UIController.clearFields();
      updateBudget();
    }
  };

  const deleteItemController = (event) => {
    const itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemId) {
      const splitId = itemId.split('-');
      const type = splitId[0];
      const id = parseInt(splitId[1], 10);

      BudgetController.deleteItem(type, id);
      UIController.deleteListItem(itemId);
      updateBudget();
    }
  };

  const setupEventListeners = () => {
    addButton.addEventListener('click', addItemController);
    document.addEventListener('keypress', (event) => {
      const charCode = event.which ? event.which : event.keyCode;
      if (charCode === 13) addItemController();
    });

    budgetContainer.addEventListener('click', deleteItemController);
  };

  return {
    init() {
      UIController.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        expensePercentage: -1,
      });
      setupEventListeners();
    },
  };
})(BudgetController, UIController);

AppController.init();

