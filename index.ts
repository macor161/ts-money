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
    

    /**
     * Creates a Money object from a string representing a 
     * decimal number
     */
    static fromStringDecimal(amount: string|any, currency: string|Currency|RoundingMode, rounding: RoundingMode = Rounding.ROUND_HALF_UP): Money {
        if (isObject(amount)) {
            if (amount.amount === undefined || amount.currency === undefined)
                throw new TypeError('Missing required parameters amount,currency')

            rounding = currency as RoundingMode
            currency = amount.currency
            amount = amount.amount
        }

        if (!isString(amount))
            throw new TypeError('amount must be of type string')

        
        currency = isString(currency) ? getCurrencyObject(currency) : currency as Currency

        let bigAmount = new BigNumber(amount).round(currency.decimal_digits, rounding)

        return new Money(bigAmount.mul(10 ** currency.decimal_digits).toString(), currency)
    }


    /**
     * Creates a Money object from a decimal number
     * 
     * WARNING: Does not support large numbers
     */
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
     */
    compare(other: Money): number {
        assertType(other)
        assertSameCurrency(this, other)

        return this.bigAmount.comparedTo(other.bigAmount)
    }

    /**
     * Checks whether the value represented by this object is greater than the other.
     */
    greaterThan(other: Money): boolean {
        return 1 === this.compare(other)
    }

    /**
     * Checks whether the value represented by this object is greater or equal to the other.
     */
    greaterThanOrEqual(other: Money): boolean {
        return 0 <= this.compare(other)
    }

    /**
     * Checks whether the value represented by this object is less than the other.
     */
    lessThan(other: Money): boolean {
        return -1 === this.compare(other)
    }

    /**
     * Checks whether the value represented by this object is less than or equal to the other.
     */
    lessThanOrEqual(other: Money): boolean {
        return 0 >= this.compare(other)
    }

    /**
     * Returns true if the amount is zero.
     */
    isZero(): boolean {
        return this.bigAmount.isZero()
    }

    /**
     * Returns true if the amount is positive.
     */
    isPositive(): boolean {
        return !this.bigAmount.isNegative()
    }

    /**
     * Returns true if the amount is negative.
     */
    isNegative(): boolean {
        return this.bigAmount.isNegative()
    }

    /**
     * Returns the decimal value as a float.
     *
     * WARNING: Does not support large numbers
     */
    toDecimal(): number {
        return Number(this.toString())
    }

    /**
     * Returns the decimal value as a string.
     */
    toString(): string {       
        return this.bigAmount.toFixed(this.getCurrencyInfo().decimal_digits)
    }

    /**
     * Returns a serialised version of the instance.
     */
    toJSON(): {bigAmount: string, currency: string} {
        return {
            bigAmount: this.bigAmount.toString(),
            currency: this.currency
        }
    }

    /**
     * Returns the amount represented by this object.
     * @deprecated
     */
    getAmount(): number {
        return this.amount
    }


    /**
     * Returns the currency represented by this object.
     */
    getCurrency(): string {
        return this.currency
    }

    /**
     * Returns the full currency object
     */
    getCurrencyInfo(): Currency {
        return getCurrencyObject(this.currency)
    }

}



Object.assign(Money, Currencies)

export { Money, Currencies, Currency, Rounding }
