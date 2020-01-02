// Budeget Controller
var budgetController = (function () {
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.getPercentage = function (total){
        this.percentage = (total > 0) ?
            Math.round(this.value/total*100) : -1;
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var updateData = function () {
        var totalInc = 0;
        var totalExp = 0;
         data.allItems.exp.forEach((curr) => {
             totalExp += curr.value;
         });

        data.allItems.inc.forEach((curr) => {
            totalInc += curr.value;
        });

        data.totals.exp = totalExp;
        data.totals.inc = totalInc;
        data.budget = totalInc - totalExp;
    };

    var data = {
        allItems: {
            inc: [],
            exp: [],
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0
    };

    return {
        addItem: function ({type, desc, value}) {
            var newItem, ID, length;

            //ID is max(0, arraylength + 1)
            length = data.allItems[type].length;
            ID = (length === 0) ?
                0 : data.allItems[type][length-1].id + 1;

            //Sort incoming data into expenses and income
            if (type === 'inc'){
                newItem = new Income(ID, desc, value)
            } else {
                newItem = new Expense(ID, desc, value);
            }
            data.allItems[type].push(newItem);

            return newItem;
        },

        getBudget: function(){
            let percentSpent;
            //update data structure
            updateData();
            //calculate % of income spent
            percentSpent = (data.totals.inc > 0) ?
                Math.round(data.totals.exp/data.totals.inc*100): -1;
            //Return object with required data
            return {
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentSpent: percentSpent,
                budget: data.budget
            };

        },

        deleteItem: function(type, id) {
            let ids, index;
            ids = data.allItems[type].map((curr) => {
                return curr.id;
            });
            index = ids.indexOf(id);

            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        getPercentages: function() {
            return data.allItems.exp.map((curr) => {
                return curr.getPercentage(data.totals.inc);
            });
        },

        testing: function () {
            console.table([...data.allItems.exp, ...data.allItems.inc]);
        }
    };

})();

// View Controller
var UIController = (function () {
    const DomStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incList: '.income__list',
        expList: '.expenses__list',
        budgetLabel: ".budget__value",
        expenseLabel: '.budget__expenses--value' ,
        incomeLabel: '.budget__income--value',
        percentageLabel: '.budget__expenses--percentage' ,
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',

    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    let nodeListForEach = function (list, callback) {
        for (let i=0; i<list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
           const {inputType, inputDesc, inputValue} = DomStrings;
           return {
               type: document.querySelector(inputType).value,
               desc: document.querySelector(inputDesc).value,
               value: parseFloat(document.querySelector(inputValue).value),
           };
        },
        getDOMStrings: function () {return DomStrings;},

        addListItem: function (obj, type) {
            const {incList, expList} = DomStrings;
            var html, element;
            // Create html stub
            if (type === 'inc'){
                html ='<div class="item clearfix" id="inc-'+ obj.id +'"><div class="item__description">'+ obj.description +'</div> <div class="right clearfix"> <div class="item__value">'+ formatNumber(obj.value, 'inc') +'</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                element = incList;
            } else if (type === 'exp'){
                html = '<div class="item clearfix" id="exp-'+ obj.id +'"> <div class="item__description">'+ obj.description +'</div> <div class="right clearfix"> <div class="item__value">'+ formatNumber(obj.value, 'exp') +'</div> <div class="item__percentage">10%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
                element = expList;
            }

            /**
            //Insert object data into template
            var newhtml;
            newhtml = html.replace('%id%', obj.id);
            //newhtml = newhtml.replace('%description%', obj.description);
            newhtml = newhtml.replace('%value%', obj.value);
             **/

            //Insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);

        },

        displayBudget: function({totalInc, totalExp, budget, percentSpent}) {
            let percentLabel = ''; let type;
            (budget > 0) ? type = 'inc':'exp';
            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(budget, type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(totalInc, 'inc');
            document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(totalExp, 'exp');
            percentLabel = (percentSpent > 0) ? percentSpent + "%" : "---";
            document.querySelector(DomStrings.percentageLabel).textContent = percentLabel;
        },

        displayMonth: function(){
            let now, year, month;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        removeItem: function(itemId){
            let el = document.getElementById(itemId);
            el.parentNode.removeChild(el);
        },

        displayPercentages: function(percentages){
            const {expensePercLabel} = DomStrings;
            let fields = document.querySelectorAll(expensePercLabel);

            nodeListForEach(fields, (current, index) => {
                current.textContent = (percentages[index] > 0) ? percentages[index] + "%": '---';
            });

        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DomStrings.inputType + ',' +
                DomStrings.inputDescription + ',' +
                DomStrings.inputValue);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DomStrings.inputButton).classList.toggle('red');
        },

        clearFields: function () {
            var allFields, fieldArr;
            const {inputDesc, inputValue} = DomStrings;
            allFields = document.querySelectorAll(inputDesc + ', ' + inputValue);
            fieldArr = Array.prototype.slice.call(allFields);
            fieldArr.forEach((curr, i, arr) => {
                curr.value = "";
                fieldArr[0].focus();
            });
        }
    };


})();

// Global app controller
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        const {container, inputButton, inputType} = UICtrl.getDOMStrings();
        document.querySelector(inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13 ) {
                ctrlAddItem()
            }
        });

        document.querySelector(container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(inputType).addEventListener('change', UICtrl.changedType)
    };

    var updateBudget = function () {
        // Receive budget
        const budget = budgetCtrl.getBudget();

        // Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var ctrlAddItem = function() {
        var input, newItem;

        // Get the input data
        input = UICtrl.getInput();

        //If input fields are legal, proceed
        if (input.desc !== "" && !isNaN(input.value) && input.value > 0) {

            // Add the item to the budget controller
            newItem = budgetCtrl.addItem(input);

            // Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();

            //Calculate and update Budget
            updateBudget();

            //Update percentages
            updatePercentages();

        }

    };

    var ctrlDeleteItem = function (event) {
        var id, type_id, type, itemId;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            type_id = itemId.split('-');
            type = type_id[0];
            id = parseInt(type_id[1]);



            //Update data structure
            budgetCtrl.deleteItem(type, id);

            //Remove element from UI
            UICtrl.removeItem(itemId);

            //Update budget and total on UI
            updateBudget();

            //Update expense %s
            updatePercentages();
        }
    };

    var updatePercentages = function () {
        //Update Read percentages from BudgetController
        let percentages = budgetCtrl.getPercentages();

        //Update UI
        UICtrl.displayPercentages(percentages);

    };

    return {
        init: function () {
            console.log("Application started...");
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({totalInc:0,
                                    totalExp:0,
                                    budget:0,
                                    percentSpent:-1});
        }
    }

})(budgetController, UIController);

controller.init();