"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const currencies_1 = require("./lib/currencies");
exports.Currencies = currencies_1.Currencies;
const rounding_1 = require("./lib/rounding");
exports.Rounding = rounding_1.Rounding;
const BigNumber = require("bignumber.js");
let isInt = function (n) {
    return Number(n) === n && n % 1 === 0;
};
let decimalPlaces = function (num) {
    let match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match)
        return 0;
    return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
};
let assertSameCurrency = function (left, right) {
    if (left.currency !== right.currency)
        throw new Error('Different currencies');
};
let assertType = function (other) {
    if (!(other instanceof Money))
        throw new TypeError('Instance of Money required');
};
let assertOperand = function (operand) {
    if (lodash_1.isNaN(parseFloat(operand)) && !isFinite(operand))
        throw new TypeError('Operand must be a number');
};
let getCurrencyObject = function (currency) {
    let currencyObj = currencies_1.Currencies[currency];
    if (currencyObj) {
        return currencyObj;
    }
    else {
        for (let key in currencies_1.Currencies) {
            if (key.toUpperCase() === currency.toUpperCase())
                return currencies_1.Currencies[key];
        }
    }
};
class Money {
    /**
     * Creates a new Money instance.
     * The created Money instances is a value object thus it is immutable.
     */
    constructor(amount, currency) {
        if (lodash_1.isString(currency))
            currency = getCurrencyObject(currency);
        if (!lodash_1.isPlainObject(currency))
            throw new TypeError('Invalid currency');
        if (!isInt(amount) && !lodash_1.isString(amount))
            throw new TypeError('Amount must be a string or an integer');
        this.currency = currency.code;
        this.bigAmount = new BigNumber(amount).dividedBy(Math.pow(10, currency.decimal_digits));
        this.amount = isInt(amount) ? amount : parseInt(amount);
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
    static fromStringDecimal(amount, currency, rounder) {
        throw ('Not implemented');
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
            currency = getCurrencyObject(currency);
        if (!lodash_1.isPlainObject(currency))
            throw new TypeError('Invalid currency');
        if (rounder === undefined) {
            let decimals = decimalPlaces(amount);
            if (decimals > currency.decimal_digits)
                throw new Error(`The currency ${currency.code} supports only` +
                    ` ${currency.decimal_digits} decimal digits`);
        }
        else {
            if (['round', 'floor', 'ceil'].indexOf(rounder) === -1 && typeof rounder !== 'function')
                throw new TypeError('Invalid parameter rounder');
            if (lodash_1.isString(rounder))
                rounder = Math[rounder];
        }
        let precisionMultiplier = Math.pow(10, currency.decimal_digits);
        let resultAmount = amount * precisionMultiplier;
        if (lodash_1.isFunction(rounder))
            resultAmount = rounder(resultAmount);
        return new Money(resultAmount, currency);
    }
    /**
     * Returns true if the two instances of Money are equal, false otherwise.
     */
    equals(other) {
        assertType(other);
        return this.bigAmount.equals(other.bigAmount) &&
            this.currency === other.currency;
    }
    /**
     * Adds the two objects together creating a new Money instance that holds the result of the operation.
     */
    add(other) {
        assertType(other);
        assertSameCurrency(this, other);
        return new Money(this.bigAmount.add(other.bigAmount).mul(Math.pow(10, this.getCurrencyInfo().decimal_digits)).toString(), this.currency);
    }
    /**
     * Subtracts the two objects creating a new Money instance that holds the result of the operation.
     */
    subtract(other) {
        assertType(other);
        assertSameCurrency(this, other);
        return new Money(this.bigAmount.sub(other.bigAmount).mul(Math.pow(10, this.getCurrencyInfo().decimal_digits)).toString(), this.currency);
    }
    /**
     * Multiplies the object by the multiplier returning a new Money instance that holds the result of the operation.
     */
    multiply(multiplier, round = rounding_1.Rounding.ROUND_HALF_UP) {
        assertOperand(multiplier);
        let amount = this.bigAmount.mul(multiplier).round(this.getCurrencyInfo().decimal_digits, round);
        return new Money(amount.mul(Math.pow(10, this.getCurrencyInfo().decimal_digits)).toString(), this.currency);
    }
    /**
     * Divides the object by the multiplier returning a new Money instance that holds the result of the operation.
     */
    divide(divisor, round = rounding_1.Rounding.ROUND_HALF_UP) {
        assertOperand(divisor);
        let amount = this.bigAmount.div(divisor).round(this.getCurrencyInfo().decimal_digits, round);
        return new Money(amount.mul(Math.pow(10, this.getCurrencyInfo().decimal_digits)).toString(), this.currency);
    }
    /**
     * Allocates fund bases on the ratios provided returing an array of objects as a product of the allocation.
     */
    allocate(ratios) {
        let remainder = this.bigAmount;
        let results = [];
        let total = 0;
        let decimals = this.getCurrencyInfo().decimal_digits;
        ratios.forEach(ratio => {
            total += ratio;
        });
        ratios.forEach(ratio => {
            let share = this.bigAmount.mul((ratio / total).toString()).round(decimals, rounding_1.Rounding.ROUND_FLOOR);
            results.push(new Money(share.mul(Math.pow(10, decimals)).toString(), this.currency));
            remainder = remainder.sub(share);
        });
        for (let i = 0; remainder.greaterThan(0); i++) {
            results[i] = new Money(results[i].bigAmount.add(1 / (Math.pow(10, decimals))).mul(Math.pow(10, decimals)).toString(), results[i].currency);
            remainder = remainder.sub(1 / (Math.pow(10, decimals)));
        }
        return results;
    }
    /**
     * Compares two instances of Money.
     */
    compare(other) {
        assertType(other);
        assertSameCurrency(this, other);
        return this.bigAmount.comparedTo(other.bigAmount);
    }
    /**
     * Checks whether the value represented by this object is greater than the other.
     */
    greaterThan(other) {
        return 1 === this.compare(other);
    }
    /**
     * Checks whether the value represented by this object is greater or equal to the other.
     */
    greaterThanOrEqual(other) {
        return 0 <= this.compare(other);
    }
    /**
     * Checks whether the value represented by this object is less than the other.
     */
    lessThan(other) {
        return -1 === this.compare(other);
    }
    /**
     * Checks whether the value represented by this object is less than or equal to the other.
     */
    lessThanOrEqual(other) {
        return 0 >= this.compare(other);
    }
    /**
     * Returns true if the amount is zero.
     */
    isZero() {
        return this.bigAmount.isZero();
    }
    /**
     * Returns true if the amount is positive.
     */
    isPositive() {
        return !this.bigAmount.isNegative();
    }
    /**
     * Returns true if the amount is negative.
     */
    isNegative() {
        return this.bigAmount.isNegative();
    }
    /**
     * Returns the decimal value as a float.
     *
     * @returns {number}
     */
    toDecimal() {
        return Number(this.toString());
    }
    /**
     * Returns the decimal value as a string.
     *
     * @returns {string}
     */
    toString() {
        let currency = getCurrencyObject(this.currency);
        return (this.amount / Math.pow(10, currency.decimal_digits)).toFixed(currency.decimal_digits);
    }
    /**
     * Returns a serialised version of the instance.
     *
     * @returns {{amount: number, currency: string}}
     */
    toJSON() {
        return {
            amount: this.amount,
            currency: this.currency
        };
    }
    /**
     * Returns the amount represented by this object.
     *
     * @returns {number}
     */
    getAmount() {
        return this.amount;
    }
    /**
     * Returns the currency represented by this object.
     *
     * @returns {string}
     */
    getCurrency() {
        return this.currency;
    }
    /**
     * Returns the full currency object
     */
    getCurrencyInfo() {
        BigNumber.ROUND_CEIL;
        return getCurrencyObject(this.currency);
    }
}
exports.Money = Money;
Object.assign(Money, currencies_1.Currencies);
