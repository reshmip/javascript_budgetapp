//TODO List
//1. Get the input values
//2. On click event handler
//3. Add items to their respective data structure
//4. Update the items on the UI
//5. Calculate the budget
//6. Update budget on UI


//UI MODULE
var uiController = (function(){

  var DOMstrings = {
    inputType: '.add__type',
    inputDesc: '.add__description',
    inputVal: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensePercLabel: '.item__percentage ',
    dateLabel: '.budget__title--month'
  }

  var formatNumber = function(num,type){
    /*
    - or + before number
    2 decimal points
    , separating thousands
    */
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    if(int.length > 3)
      int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,int.length);

    dec = numSplit[1];
    return (type === 'exp' ? '-' : "+") + " "+ int + "."+ dec;
  };

  var nodeListForEach = function(list,callback){
    for(var i = 0; i < list.length; i++){
      callback(list[i],i);
    }
  };

  return{
    getInput : function(){
      return{
        type : document.querySelector(DOMstrings.inputType).value,
        description : document.querySelector(DOMstrings.inputDesc).value,
        value : parseFloat(document.querySelector(DOMstrings.inputVal).value)
      };
    },

    addListItem : function(obj,type){
      var html, newHtml, element;
      if(type === 'inc'){
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }else if(type === 'exp'){
        element = DOMstrings.expenseContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      newHtml = html.replace('%id%',obj.id);
      newHtml = newHtml.replace('%description%',obj.description);
      newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

      document.querySelector(element).insertAdjacentHTML('beforebegin',newHtml);
    },

    deleteListItem : function(selectorID){
      console.log(selectorID);
      var el = document.getElementById(selectorID);
      console.log("el+",+el);
      el.parentNode.removeChild(el);
    },

    clearFields : function(){
      var fields, fieldsArray;
      fields = document.querySelectorAll(DOMstrings.inputDesc + ',' + DOMstrings.inputVal);
      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(current, index, array){
        current.value = "";
      });
      fieldsArray[0].focus();
    },

    displayBudget : function(obj){
        var type;
        obj.budget > 0 ? type = 'inc' : type = 'exp';
        document.querySelector('.budget__value').textContent = formatNumber(obj.budget,type);
        document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
        document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
        if(obj.percentage>0){
          document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
        }else{
          document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        }
    },

    displayPercentages : function(percentages){
      var fields = document.querySelectorAll(DOMstrings.expensePercLabel);

      nodeListForEach(fields,function(curr,index){
        if(percentages[index] > 0)
          curr.textContent = percentages[index] + '%';
        else {
          curr.textContent = '---';
        }
      });
    },

    displayMonth : function(){
      var date,year,month,months;
      date = new Date();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      year = date.getFullYear();
      month = date.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] +' '+ year;
    },

    changedType : function(){
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDesc + ',' +
        DOMstrings.inputVal
      );

      nodeListForEach(fields, function(curr){
        curr.classList.toggle('red-focus');
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstring : function(){
      return DOMstrings;
    }
  };
})();

//DATA MODULE
var budgetController = (function(){
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome > 0)
      this.percentage = Math.round((this.value/totalIncome)*100);
    else {
      this.percentage = -1;
    }
  }

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  }
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotals = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(current){
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems : {
      exp: [],
      inc: []
    },

    totals : {
      exp: 0,
      inc: 0
    },
    budget : 0,
    percentage : -1
  };

  return {
    addItem: function(type,desc,val){
      var newItem,ID;
      //ID = lastID + 1;
      //lastID = get index of the last element of the array
      if(data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      else{
        ID = 0;
      }
      //create new item based on 'exp' or 'inc' type
      if(type === 'exp'){
        newItem = new Expense(ID,desc,val);
      }else if(type === 'inc'){
        newItem = new Income(ID,desc,val);
      }

      //push items to the data structure
      data.allItems[type].push(newItem);

      //return the new element
      return newItem;
    },

    deleteItem : function(type,id){
      var ids, index;

      ids = data.allItems[type].map(function(current){
        return current.id;
      });
      index = ids.indexOf(id);
      if(index !== -1)
        data.allItems[type].splice(index,1);
    },

    calculateBudget : function(){
      //calculate total income and expenses
      calculateTotals('exp');
      calculateTotals('inc');
      //calculate budget
      data.budget = data.totals.inc - data.totals.exp;
      //calculate percentage
      if(data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
      }else{
        data.percentage = -1;
      }
    },

    calculatePercentages : function(){
      data.allItems.exp.forEach(function(cur){
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages : function(){
      var allPercs = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPercs;
    },

    getBudget : function(){
      return{
        budget : data.budget,
        totalInc : data.totals.inc,
        totalExp : data.totals.exp,
        percentage : data.percentage
      }
    },

    test : function(){
      console.log(data);
    }
  };

})();

//APP CONTROLLER MODULE
var appController = (function(budgetCtrl,uiCtrl){
  var setEventListeners = function(){
    var DOM = uiCtrl.getDOMstring();
    document.querySelector(DOM.inputBtn).addEventListener('click',addItemFnc);
    document.addEventListener('keypress',function(event){
      if(event.keycode === 13 || event.which === 13){
        addItemFnc();
      }
    });
    document.querySelector(DOM.container).addEventListener('click',deleteItemFnc);
    document.querySelector(DOM.inputType).addEventListener('change',uiCtrl.changedType);
  };

  var updateBudget = function(){
    // 1. Calculate budget
    budgetCtrl.calculateBudget();
    //2. Return the budget
    var budget = budgetCtrl.getBudget();
    // 3. Display on the UI
    uiCtrl.displayBudget(budget);
  };

  var addItemFnc = function(){
    var input,newItem;
    //1. Get the input values
    input = uiCtrl.getInput();

    if(input.description != "" && !isNaN(input.value) && input.value > 0)
    {
      //2. Add items to their budget controller
      newItem = budgetCtrl.addItem(input.type,input.description,input.value);
      //3. Update the items on the UI
      uiCtrl.addListItem(newItem,input.type);
      //4. Clear fields
      uiCtrl.clearFields();
      //5. Calculate and update budget
      updateBudget();
      //6. Update percentages
      updatePercentages();
    }

  };

  var deleteItemFnc = function(event){
    var itemId,splitId,type,id;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemId){
      //console.log("itemID:"+itemId);
      splitId = itemId.split('-');
      type = splitId[0];
      id = parseInt(splitId[1]);

      //1. Delete the item from the datastructure
      budgetCtrl.deleteItem(type,id);
      //2. Delete the item from the UI
      uiCtrl.deleteListItem(itemId);
      //3. Update the budget
      updateBudget();
    }
  };

  var updatePercentages = function(){
    //1. Calculate the percentage
    budgetCtrl.calculatePercentages();
    //2. Read percentages from the budget controller
    var perc = budgetCtrl.getPercentages();
    //3. Update percentages on the UI
    uiCtrl.displayPercentages(perc);
  };
  return{
    init: function(){
      console.log("application started");
      uiCtrl.displayMonth();
      uiCtrl.displayBudget({
        budget : 0,
        totalInc : 0,
        totalExp : 0,
        percentage : 0
    });

      setEventListeners();
    }
  }
})(budgetController,uiController);

appController.init();
