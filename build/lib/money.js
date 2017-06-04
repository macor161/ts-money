"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const currency_1 = require("./currency");
var isInt = function (n) {
    return Number(n) === n && n % 1 === 0;
};
var decimalPlaces = function (num) {
    var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match)
        return 0;
    return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
};
var assertSameCurrency = function (left, right) {
    if (left.currency !== right.currency)
        throw new Error('Different currencies');
};
var assertType = function (other) {
    if (!(other instanceof Money))
        throw new TypeError('Instance of Money required');
};
var assertOperand = function (operand) {
    if (lodash_1.isNaN(parseFloat(operand)) && !isFinite(operand))
        throw new TypeError('Operand must be a number');
};
class Money {
    constructor(amount, currency) {
        if (lodash_1.isString(currency))
            currency = currency_1.currencies[currency];
        if (!lodash_1.isPlainObject(currency))
            throw new TypeError('Invalid currency');
        if (!isInt(amount))
            throw new TypeError('Amount must be an integer');
        this.amount = amount;
        this.currency = currency.code;
        Object.freeze(this);
    }
    static fromInteger(amount, currency) {
        if (lodash_1.isObject(amount)) {
            if (amount.amount === undefined || amount.currency === undefined)
                throw new TypeError('Missing required parameters amount,currency');
            currency = amount.currency;
            amount = amount.amount;
        }
        if (!isInt(amount))
            throw new TypeError('Amount must be an integer value');
        return new Money(amount, currency);
    }
    static fromDecimal(amount, currency, rounder) {
        if (lodash_1.isObject(amount)) {
            if (amount.amount === undefined || amount.currency === undefined)
                throw new TypeError('Missing required parameters amount,currency');
            rounder = currency;
            currency = amount.currency;
            amount = amount.amount;
        }
        if (lodash_1.isString(currency))
            currency = currency_1.currencies[currency];
        if (!lodash_1.isPlainObject(currency))
            throw new TypeError('Invalid currency');
        if (rounder === undefined) {
            var decimals = decimalPlaces(amount);
            if (decimals > currency.decimal_digits)
                throw new Error("The currency " + currency.code + " supports only "
                    + currency.decimal_digits + " decimal digits");
        }
        else {
            if (['round', 'floor', 'ceil'].indexOf(rounder) === -1 && typeof rounder !== 'function')
                throw new TypeError('Invalid parameter rounder');
            if (lodash_1.isString(rounder))
                rounder = Math[rounder];
        }
        var precisionMultiplier = Math.pow(10, currency.decimal_digits);
        var resultAmount = amount * precisionMultiplier;
        if (lodash_1.isFunction(rounder))
            resultAmount = rounder(resultAmount);
        return new Money(resultAmount, currency);
    }
    ;
    equals(other) {
        var self = this;
        assertType(other);
        return self.amount === other.amount &&
            self.currency === other.currency;
    }
    ;
    add(other) {
        var self = this;
        assertType(other);
        assertSameCurrency(self, other);
        return new Money(self.amount + other.amount, self.currency);
    }
    ;
    subtract(other) {
        var self = this;
        assertType(other);
        assertSameCurrency(self, other);
        return new Money(self.amount - other.amount, self.currency);
    }
    ;
    multiply(multiplier, fn) {
        if (!lodash_1.isFunction(fn))
            fn = Math.round;
        assertOperand(multiplier);
        var amount = fn(this.amount * multiplier);
        return new Money(amount, this.currency);
    }
    ;
    divide(divisor, fn) {
        if (!lodash_1.isFunction(fn))
            fn = Math.round;
        assertOperand(divisor);
        var amount = fn(this.amount / divisor);
        return new Money(amount, this.currency);
    }
    ;
    allocate(ratios) {
        var self = this;
        var remainder = self.amount;
        var results = [];
        var total = 0;
        ratios.forEach(function (ratio) {
            total += ratio;
        });
        ratios.forEach(function (ratio) {
            var share = Math.floor(self.amount * ratio / total);
            results.push(new Money(share, self.currency));
            remainder -= share;
        });
        for (var i = 0; remainder > 0; i++) {
            results[i] = new Money(results[i].amount + 1, results[i].currency);
            remainder--;
        }
        return results;
    }
    ;
    compare(other) {
        var self = this;
        assertType(other);
        assertSameCurrency(self, other);
        if (self.amount === other.amount)
            return 0;
        return self.amount > other.amount ? 1 : -1;
    }
    ;
    greaterThan(other) {
        return 1 === this.compare(other);
    }
    ;
    greaterThanOrEqual(other) {
        return 0 <= this.compare(other);
    }
    ;
    lessThan(other) {
        return -1 === this.compare(other);
    }
    ;
    lessThanOrEqual(other) {
        return 0 >= this.compare(other);
    }
    ;
    isZero() {
        return this.amount === 0;
    }
    ;
    isPositive() {
        return this.amount > 0;
    }
    ;
    isNegative() {
        return this.amount < 0;
    }
    ;
    toDecimal() {
        return Number(this.toString());
    }
    ;
    toString() {
        var currency = currency_1.currencies[this.currency];
        return (this.amount / Math.pow(10, currency.decimal_digits)).toFixed(currency.decimal_digits);
    }
    ;
    toJSON() {
        return {
            amount: this.amount,
            currency: this.currency
        };
    }
    ;
    getAmount() {
        return this.amount;
    }
    getCurrency() {
        return this.currency;
    }
}
exports.Money = Money;
