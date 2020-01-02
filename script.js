// Budeget Controller
var budgetController = (function () {
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
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
        container: '.container'

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
                html ='<div class="item clearfix" id="inc-'+ obj.id +'"><div class="item__description">'+ obj.description +'</div> <div class="right clearfix"> <div class="item__value">'+ obj.value +'</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                element = incList;
            } else if (type === 'exp'){
                html = '<div class="item clearfix" id="exp-'+ obj.id +'"> <div class="item__description">'+ obj.description +'</div> <div class="right clearfix"> <div class="item__value">'+ obj.value +'</div> <div class="item__percentage">10%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
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
            let percentLabel = '';
            document.querySelector(DomStrings.budgetLabel).textContent = budget;
            document.querySelector(DomStrings.incomeLabel).textContent = totalInc;
            document.querySelector(DomStrings.expenseLabel).textContent = totalExp;
            percentLabel = (percentSpent > 0) ? percentSpent + "%" : "---"
            document.querySelector(DomStrings.percentageLabel).textContent = percentLabel;
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
        const {container, inputButton} = UICtrl.getDOMStrings();
        document.querySelector(inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13 ) {
                ctrlAddItem()
            }
        });

        document.querySelector(container).addEventListener('click', ctrlDeleteItem);
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

        }

    };

    var ctrlDeleteItem = function (event) {
        var id, type_id, type, itemId;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(`Item id selected: ${itemId}`);
        if (itemId) {
            type_id = itemId.split('-');
            type = type_id[0];
            id = parseInt(type_id[1]);



            //Update data structure
            budgetCtrl.deleteItem(type, id);

            //Remove element from UI

            //Update budget and total on UI

        }
    };

    return {
        init: function () {
            console.log("Application started...");
            setupEventListeners();
            UICtrl.displayBudget({totalInc:0,
                                    totalExp:0,
                                    budget:0,
                                    percentSpent:-1});
        }
    }

})(budgetController, UIController);

controller.init();