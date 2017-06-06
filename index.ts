import { extend, isFunction, isNaN, isObject, isPlainObject, isString } from 'lodash'
import { Currency } from './lib/currency'
import { Currencies } from './lib/currencies'
import { Rounding, RoundingMode } from './lib/rounding'
import * as BigNumber from 'bignumber.js'



let isInt = function (n) {
    return Number(n) === n && n % 1 === 0
}

let decimalPlaces = function (num) {
    let match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/)

    if (!match)
        return 0

    return Math.max(0,
        (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0))
}

let assertSameCurrency = function (left, right) {
    if (left.currency !== right.currency)
        throw new Error('Different currencies')
}

let assertType = function (other) {
    if (!(other instanceof Money))
        throw new TypeError('Instance of Money required')
}

let assertOperand = function (operand) {
    if (isNaN(parseFloat(operand)) && !isFinite(operand))
        throw new TypeError('Operand must be a number')
}

let getCurrencyObject = function (currency: string): Currency {
    let currencyObj = Currencies[currency]

    if (currencyObj) {
        return currencyObj
    }
    else {
        for (let key in Currencies) {
            if (key.toUpperCase() === currency.toUpperCase())
                return Currencies[key]
        }
    }
}


class Money {

    amount: number
    currency: string
    bigAmount: BigNumber.BigNumber


    /**
     * Creates a new Money instance.
     * The created Money instances is a value object thus it is immutable.
     */
    constructor(amount: number|string, currency: Currency|string) {
        if (isString(currency))
            currency = getCurrencyObject(currency)

        if (!isPlainObject(currency))
            throw new TypeError('Invalid currency')

        if (!isInt(amount) && !isString(amount))
            throw new TypeError('Amount must be a string or an integer')

        this.currency = currency.code
        this.bigAmount = new BigNumber(amount).dividedBy(10 ** currency.decimal_digits)   
        this.amount = isInt(amount) ? amount as number : parseInt(amount as string)
        
        Object.freeze(this)
    }

    static fromInteger(amount: number|any, currency?: string): Money {
        if (isObject(amount)) {
            if (amount.amount === undefined || amount.currency === undefined)
                throw new TypeError('Missing required parameters amount,currency')

            currency = amount.currency
            amount = amount.amount
        }

        if (!isInt(amount))
            throw new TypeError('Amount must be an integer value')

        return new Money(amount, currency)
    }
    
    static fromStringDecimal(amount: string, currency: string, rounder?: string): Money {
        throw('Not implemented')
    }

    static fromDecimal(amount: number|any, currency: string|any, rounder?: string|Function): Money {
        if (isObject(amount)) {
            if (amount.amount === undefined || amount.currency === undefined)
                throw new TypeError('Missing required parameters amount,currency')

            rounder = currency
            currency = amount.currency
            amount = amount.amount
        }

        if (isString(currency))
            currency = getCurrencyObject(currency)

        if (!isPlainObject(currency))
            throw new TypeError('Invalid currency')

        if (rounder === undefined) {
            let decimals = decimalPlaces(amount)

            if (decimals > currency.decimal_digits)
                throw new Error(`The currency ${currency.code} supports only` +
                     ` ${currency.decimal_digits} decimal digits`)
        } else {
            if (['round', 'floor', 'ceil'].indexOf(rounder as string) === -1 && typeof rounder !== 'function')
                throw new TypeError('Invalid parameter rounder')

            if (isString(rounder))
                rounder = Math[rounder]
        }

        let precisionMultiplier = Math.pow(10, currency.decimal_digits)
        let resultAmount = amount * precisionMultiplier

        if (isFunction(rounder))
            resultAmount = rounder(resultAmount)

        return new Money(resultAmount, currency)
    }

    /**
     * Returns true if the two instances of Money are equal, false otherwise.
     */
    equals(other: Money): boolean {
        assertType(other)

        return this.bigAmount.equals(other.bigAmount) &&
                this.currency === other.currency
    }

    /**
     * Adds the two objects together creating a new Money instance that holds the result of the operation.
     */
    add(other: Money): Money {
        assertType(other)
        assertSameCurrency(this, other)

        return new Money(this.bigAmount.add(other.bigAmount).mul(10 ** this.getCurrencyInfo().decimal_digits).toString(), this.currency)
    }

    /**
     * Subtracts the two objects creating a new Money instance that holds the result of the operation.
     */
    subtract(other: Money): Money {
        assertType(other)
        assertSameCurrency(this, other)

        return new Money(this.bigAmount.sub(other.bigAmount).mul(10 ** this.getCurrencyInfo().decimal_digits).toString(), this.currency)
    }

    /**
     * Multiplies the object by the multiplier returning a new Money instance that holds the result of the operation.
     */
    multiply(multiplier: number, round: RoundingMode = Rounding.ROUND_HALF_UP): Money {
        assertOperand(multiplier)

        let amount = this.bigAmount.mul(multiplier).round(this.getCurrencyInfo().decimal_digits, round)
        return new Money(amount.mul(10 ** this.getCurrencyInfo().decimal_digits).toString(), this.currency)
    }

    /**
     * Divides the object by the multiplier returning a new Money instance that holds the result of the operation.
     */
    divide(divisor: number, round: RoundingMode = Rounding.ROUND_HALF_UP): Money {
        assertOperand(divisor)

        let amount = this.bigAmount.div(divisor).round(this.getCurrencyInfo().decimal_digits, round)
        return new Money(amount.mul(10 ** this.getCurrencyInfo().decimal_digits).toString(), this.currency)
    }

    /**
     * Allocates fund bases on the ratios provided returing an array of objects as a product of the allocation.
     */
    allocate(ratios: any[]): Money[] {
        let remainder = this.bigAmount
        let results = []
        let total = 0
        let decimals = this.getCurrencyInfo().decimal_digits

        ratios.forEach(ratio => {
            total += ratio
        })

        ratios.forEach(ratio => {
            let share = this.bigAmount.mul((ratio / total).toString()).round(decimals, Rounding.ROUND_FLOOR)
            results.push(new Money(share.mul(10 ** decimals).toString(), this.currency))
            remainder = remainder.sub(share)
        })

        for (let i = 0; remainder.greaterThan(0); i++) {
            results[i] = new Money(results[i].bigAmount.add(1 / (10 ** decimals)).mul(10 ** decimals).toString(), results[i].currency)
            remainder = remainder.sub(1 / (10 ** decimals))
        }

        return results
    }

    /**
     * Compares two instances of Money.
     *
     * @param {Money} other
     * @returns {Number}
     */
    compare(other: Money): number {
        let self = this

        assertType(other)
        assertSameCurrency(self, other)

        if (self.amount === other.amount)
            return 0

        return self.amount > other.amount ? 1 : -1
    }

    /**
     * Checks whether the value represented by this object is greater than the other.
     *
     * @param {Money} other
     * @returns {boolean}
     */
    greaterThan(other: Money): boolean {
        return 1 === this.compare(other)
    }

    /**
     * Checks whether the value represented by this object is greater or equal to the other.
     *
     * @param {Money} other
     * @returns {boolean}
     */
    greaterThanOrEqual(other: Money): boolean {
        return 0 <= this.compare(other)
    }

    /**
     * Checks whether the value represented by this object is less than the other.
     *
     * @param {Money} other
     * @returns {boolean}
     */
    lessThan(other: Money): boolean {
        return -1 === this.compare(other)
    }

    /**
     * Checks whether the value represented by this object is less than or equal to the other.
     *
     * @param {Money} other
     * @returns {boolean}
     */
    lessThanOrEqual(other: Money): boolean {
        return 0 >= this.compare(other)
    }

    /**
     * Returns true if the amount is zero.
     *
     * @returns {boolean}
     */
    isZero(): boolean {
        return this.amount === 0
    }

    /**
     * Returns true if the amount is positive.
     *
     * @returns {boolean}
     */
    isPositive(): boolean {
        return this.amount > 0
    }

    /**
     * Returns true if the amount is negative.
     *
     * @returns {boolean}
     */
    isNegative(): boolean {
        return this.amount < 0
    }

    /**
     * Returns the decimal value as a float.
     *
     * @returns {number}
     */
    toDecimal(): number {
        return Number(this.toString())
    }

    /**
     * Returns the decimal value as a string.
     *
     * @returns {string}
     */
    toString(): string {
        let currency = getCurrencyObject(this.currency)
        return (this.amount / Math.pow(10, currency.decimal_digits)).toFixed(currency.decimal_digits)
    }

    /**
     * Returns a serialised version of the instance.
     *
     * @returns {{amount: number, currency: string}}
     */
    toJSON(): {amount: number, currency: string} {
        return {
            amount: this.amount,
            currency: this.currency
        }
    }

    /**
     * Returns the amount represented by this object.
     *
     * @returns {number}
     */
    getAmount(): number {
        return this.amount
    }


    /**
     * Returns the currency represented by this object.
     *
     * @returns {string}
     */
    getCurrency(): string {
        return this.currency
    }

    /**
     * Returns the full currency object
     */
    getCurrencyInfo(): Currency {
        BigNumber.ROUND_CEIL
        return getCurrencyObject(this.currency)
    }

}



Object.assign(Money, Currencies)

export { Money, Currencies, Currency, Rounding }
