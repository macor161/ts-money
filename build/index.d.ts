import { Currency } from './lib/currency';
import { Currencies } from './lib/currencies';
import { Rounding, RoundingMode } from './lib/rounding';
import * as BigNumber from 'bignumber.js';
declare class Money {
    amount: number;
    currency: string;
    bigAmount: BigNumber.BigNumber;
    /**
     * Creates a new Money instance.
     * The created Money instances is a value object thus it is immutable.
     */
    constructor(amount: number | string, currency: Currency | string);
    static fromInteger(amount: number | any, currency?: string): Money;
    static fromStringDecimal(amount: string, currency: string, rounder?: string): Money;
    static fromDecimal(amount: number | any, currency: string | any, rounder?: string | Function): Money;
    /**
     * Returns true if the two instances of Money are equal, false otherwise.
     */
    equals(other: Money): boolean;
    /**
     * Adds the two objects together creating a new Money instance that holds the result of the operation.
     */
    add(other: Money): Money;
    /**
     * Subtracts the two objects creating a new Money instance that holds the result of the operation.
     */
    subtract(other: Money): Money;
    /**
     * Multiplies the object by the multiplier returning a new Money instance that holds the result of the operation.
     */
    multiply(multiplier: number, round?: RoundingMode): Money;
    /**
     * Divides the object by the multiplier returning a new Money instance that holds the result of the operation.
     */
    divide(divisor: number, round?: RoundingMode): Money;
    /**
     * Allocates fund bases on the ratios provided returing an array of objects as a product of the allocation.
     */
    allocate(ratios: any[]): Money[];
    /**
     * Compares two instances of Money.
     */
    compare(other: Money): number;
    /**
     * Checks whether the value represented by this object is greater than the other.
     */
    greaterThan(other: Money): boolean;
    /**
     * Checks whether the value represented by this object is greater or equal to the other.
     */
    greaterThanOrEqual(other: Money): boolean;
    /**
     * Checks whether the value represented by this object is less than the other.
     */
    lessThan(other: Money): boolean;
    /**
     * Checks whether the value represented by this object is less than or equal to the other.
     */
    lessThanOrEqual(other: Money): boolean;
    /**
     * Returns true if the amount is zero.
     */
    isZero(): boolean;
    /**
     * Returns true if the amount is positive.
     */
    isPositive(): boolean;
    /**
     * Returns true if the amount is negative.
     */
    isNegative(): boolean;
    /**
     * Returns the decimal value as a float.
     *
     * WARNING: Does not support large numbers
     */
    toDecimal(): number;
    /**
     * Returns the decimal value as a string.
     */
    toString(): string;
    /**
     * Returns a serialised version of the instance.
     */
    toJSON(): {
        bigAmount: string;
        currency: string;
    };
    /**
     * Returns the amount represented by this object.
     * @deprecated
     */
    getAmount(): number;
    /**
     * Returns the currency represented by this object.
     */
    getCurrency(): string;
    /**
     * Returns the full currency object
     */
    getCurrencyInfo(): Currency;
}
export { Money, Currencies, Currency, Rounding };
