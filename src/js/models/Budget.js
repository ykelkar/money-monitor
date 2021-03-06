import Expense from './Expense';
import Income from './Income';

export default class Budget { 
    constructor() {
        this.data = {
            allItems: {
                exp: [],
                inc: []
            },
            totals: {
                exp: 0,
                inc: 0
            },
            budget: 0, 
            percentage: -1
        };
    }

    addItem(type, des, val) {
        let newItem,id;

        // Create new ID
        if (this.data.allItems[type].length > 0) {
            id =  this.data.allItems[type][this.data.allItems[type].length - 1].id + 1;
        } else {
            id = 0;
        }
        
        // Create new item based on 'inc' or 'exp' type
        if (type === 'exp') {
            newItem = new Expense(id, des, val);
        } else if (type === 'inc') {
            newItem = new Income(id, des, val);
        }

        // Push it into our data structure 
        this.data.allItems[type].push(newItem);

        this.persistData();
        
        // Return the new element
        return [newItem, id];
    }

    deleteItem(type, id) {
        const ids = this.data.allItems[type].map(current => current.id);
        
        const index = ids.indexOf(id);
        
        if (index !== -1) this.data.allItems[type].splice(index, 1);

        this.persistData();
    }

    updateItem(type, id, val) {
        const ids = this.data.allItems[type].map(current => current.id);

        const index = ids.indexOf(id);

        this.data.allItems[type][index].value += val; 

        this.persistData();

        return this.data.allItems[type][index].value;
    }

    calculateBudget() {
        // calculate total income and expenses 
        this.calculateTotal('exp');
        this.calculateTotal('inc');

        // Calculate the budget: income - expenses 
        this.data.budget = this.data.totals.inc - this.data.totals.exp;

        // calculate the percentage of income that we spent
        if (this.data.totals.inc > 0) {
            this.data.percentage = Math.round((this.data.totals.exp / this.data.totals.inc) * 100);
        } else {
            this.data.percentage = -1;
        }
        this.persistData();
    }

    calculatePercentages() {
        const expenses = [];
        this.data.allItems.exp.forEach(current => {
            current = new Expense(current.id, current.description, current.value);
            current.percentage = current.calcPercentage(this.data.totals.inc);
            expenses.push(current);
            this.data.allItems.exp = expenses;
        });
        this.persistData();
        
    }

    getPercentages() {
        const allPerc = [];
        this.data.allItems.exp.forEach(current => {
            const perc = current.percentage;
            current = new Expense(current.id, current.description, current.value);
            current.percentage = perc;
            allPerc.push(current.getPercentage());
        });
        this.persistData();
        return allPerc;
    }

    getBudget() {
        return {
            budget: this.data.budget,
            totalInc: this.data.totals.inc,
            totalExp: this.data.totals.exp,
            percentage: this.data.percentage
        };
    }

    calculateTotal(type) {
        let sum = 0;
        this.data.allItems[type].forEach(current => sum += current.value);
        this.data.totals[type] = sum;
        this.persistData();
    }

    persistData() {
        localStorage.setItem('budget', JSON.stringify(this.data));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('budget'));

        // Restoring list from the localStorage
        if (storage) {
            this.data = storage;
            this.data.allItems.exp.forEach(item => {
                const perc = item.percentage;
                item = new Expense(item.id, item.description, item.value);
                item.percentage = perc;
            });
            this.data.allItems.inc.forEach(item => item = new Income(item.id, item.description, item.value));
        }
    }
}

