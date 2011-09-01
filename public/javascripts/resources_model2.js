//  ******************************************************************************************************************
//  ResourcesCollectionModel
//
//
//  ******************************************************************************************************************
var ResourcesCollectionModel = Class.create({
    initialize: function(theResources, theAreaElements, theUnits) {
        this.resources = theResources;
        this.areaElements = theAreaElements;
        this.units = theUnits;
        this.incomes = new Hash();
        this.expenses = new Hash();

        var theThis = this;
        var aeCityIncome = new Array();
        // TODO: Needs update to support more AreaElements
        this.addIncomesFromAreaElementType("city");
        this.addIncomesFromAreaElementType("harbor");
        
        var aeBuildOrders = this.areaElements.getAllAreaElementsOrdersOfType("build");
        $A(aeBuildOrders).each(function(aeOrderAction) {
            var ut = theThis.units.getUnitTypeObjectFromString(aeOrderAction[1]);
            var buildCost = theThis.units.getUnitTypeResourceCost(ut);
            theThis.expenses.set(aeOrderAction[0], ["Building "+aeOrderAction, buildCost]);
        });
        
        var theTotalExpenses = 0;
        this.expenses.each(function(eh) {
            var e = eh[1]
            theTotalExpenses += e[1];
        });
        this.totalExpenses = theTotalExpenses;

        var theTotalIncomes = 0;
        this.incomes.each(function(ih) {
            var i = ih[1]
            theTotalIncomes += i[1];
        });
        this.totalIncomes = theTotalIncomes;
    },

    addIncomesFromAreaElementType: function(aeType) {
        var theThis = this;
        var aes = theThis.areaElements.getAllAreaElementsOfType(aeType, user_id);
        $A(aes).each(function(ae) {
            theThis.incomes.set(theThis.areaElements.getAreaElementId(ae), [theThis.areaElements.getAreaElementName(ae), theThis.areaElements.getAreaElementResourceGain(ae)]);
        });
    },
    
    getResources: function() {
        return this.resources;
    },

    setResources: function(theResources) {
        this.resources = theResources;
    },

    getIncomes: function() {
        return this.incomes;
    },

    getExpenses: function() {
        return this.expenses;
    },

    addExpense: function(area_element, unit_type_name) {
        var id = this.areaElements.getAreaElementId(area_element);
        var description = "City of "+this.areaElements.getAreaElementName(area_element)+" builds "+unit_type_name;
        var ut = this.units.getUnitTypeObjectFromString(unit_type_name);
        var buildCost = this.units.getUnitTypeResourceCost(ut);


        this.expenses[id] = [description, buildCost]
        this.totalExpenses += buildCost;
    },

    addUpgradExpense: function(theAreaElement) {
        var id = this.areaElements.getAreaElementId(theAreaElement);
        var description = "City of "+this.areaElements.getAreaElementName(theAreaElement)+" is upgraded";
        var upgradCost = this.areaElements.getAreaElementUpgradCost(theAreaElement);


        this.expenses[id] = [description, upgradCost]
        this.totalExpenses += upgradCost;
    },

    removeExpense: function(expenseId) {
        var e = this.expenses[expenseId];
        this.totalExpenses -= e[1];
        delete this.expenses[expenseId];
    },

    removeUpgradExpense: function(expenseId) {
        var e = this.expenses[expenseId];
        this.totalExpenses -= e[1];
        delete this.expenses[expenseId];
    },

    removeAllExpense: function() {
        this.totalExpenses = 0;
        this.expenses = new Hash();
    },

    getTotalExpenses: function() {
        return this.totalExpenses;
    },

    addIncome: function(incomeId, incomeDescription, amount) {
        this.incomes[incomeId] = [incomeDescription, amount];
        this.totalIncomes += amount;
    },

    removeIncome: function(incomeId) {
        var i = this.incomes[incomeId];
        this.totalIncomes -= i[1];
        this.incomes[incomeId] = null;
    },

    getTotalIncomes: function() {
        return this.totalIncomes;
    }
});