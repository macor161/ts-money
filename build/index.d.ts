import { Currency } from './lib/currency';
import { Currencies } from './lib/currencies';
export declare type Rounder = 'round' | 'floor' | 'ceil' | Function;
export interface Amount {
    amount: number;
    currency: string | Currency;
}
declare class Money {
    amount: number;
    currency: string;
    /**
     * Creates a new Money instance.
     * The created Money instances is a value object thus it is immutable.
     *
     * @param {Number} amount
     * @param {Object/String} currency
     * @returns {Money}
     * @constructor
     */
    constructor(amount: number, currency: Currency | string);
    static fromInteger(amount: number | Amount, currency?: Currency | string): Money;
    static fromDecimal(amount: Amount, rounder?: Rounder): Money;
    static fromDecimal(amount: number, currency: string | Currency, rounder?: Rounder): Money;
    /**
     * Returns true if the two instances of Money are equal, false otherwise.
     *
     * @param {Money} other
     * @returns {Boolean}
     */
    equals(other: Money): boolean;
    /**
     * Adds the two objects together creating a new Money instance that holds the result of the operation.
     *
     * @param {Money} other
     * @returns {Money}
     */
    add(other: Money): Money;
    /**
     * Subtracts the two objects creating a new Money instance that holds the result of the operation.
     *
     * @param {Money} other
     * @returns {Money}
     */
    subtract(other: Money): Money;
    /**
     * Multiplies the object by the multiplier returning a new Money instance that holds the result of the operation.
     *
     * @param {Number} multiplier
     * @param {Function} [fn=Math.round]
     * @returns {Money}
     */
    multiply(multiplier: number, fn?: Function): Money;
    /**
     * Divides the object by the multiplier returning a new Money instance that holds the result of the operation.
     *
     * @param {Number} divisor
     * @param {Function} [fn=Math.round]
     * @returns {Money}
     */
    divide(divisor: number, fn?: Function): Money;
    /**
     * Allocates fund bases on the ratios provided returing an array of objects as a product of the allocation.
     *
     * @param {Array} other
     * @returns {Array.Money}
     */
    allocate(ratios: number[]): Money[];
    /**
     * Compares two instances of Money.
     *
     * @param {Money} other
     * @returns {Number}
     */
    compare(other: Money): number;
    /**
     * Checks whether the value represented by this object is greater than the other.
     *
     * @param {Money} other
     * @returns {boolean}
     */
    greaterThan(other: Money): boolean;
    /**
     * Checks whether the value represented by this object is greater or equal to the other.
     *
     * @param {Money} other
     * @returns {boolean}
     */
    greaterThanOrEqual(other: Money): boolean;
    /**
     * Checks whether the value represented by this object is less than the other.
     *
     * @param {Money} other
     * @returns {boolean}
     */
    lessThan(other: Money): boolean;
    /**
     * Checks whether the value represented by this object is less than or equal to the other.
     *
     * @param {Money} other
     * @returns {boolean}
     */
    lessThanOrEqual(other: Money): boolean;
    /**
     * Returns true if the amount is zero.
     *
     * @returns {boolean}
     */
    isZero(): boolean;
    /**
     * Returns true if the amount is positive.
     *
     * @returns {boolean}
     */
    isPositive(): boolean;
    /**
     * Returns true if the amount is negative.
     *
     * @returns {boolean}
     */
    isNegative(): boolean;
    /**
     * Returns the decimal value as a float.
     *
     * @returns {number}
     */
    toDecimal(): number;
    /**
     * Returns the decimal value as a string.
     *
     * @returns {string}
     */
    toString(): string;
    /**
     * Returns a serialised version of the instance.
     *
     * @returns {{amount: number, currency: string}}
     */
    toJSON(): {
        amount: number;
        currency: string;
    };
    /**
     * Returns the amount represented by this object.
     *
     * @returns {number}
     */
    getAmount(): number;
    /**
     * Returns the currency represented by this object.
     *
     * @returns {string}
     */
    getCurrency(): string;
    /**
     * Returns the full currency object
     */
    getCurrencyInfo(): Currency;
}
export { Money, Currencies, Currency };
