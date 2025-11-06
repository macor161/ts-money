import type { Currency } from './lib/currency'
import { Currencies } from './lib/currencies'

export type Rounder = 'round' | 'floor' | 'ceil' | Function

export interface Amount {
  amount: number
  currency: string | Currency
}

let isInt = function (n: any) {
  return Number(n) === n && n % 1 === 0
}

let decimalPlaces = function (num: number) {
  let match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/)

  if (!match) return 0

  return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0))
}

let assertSameCurrency = function (left: Money, right: Money) {
  if (left.currency !== right.currency) throw new Error('Different currencies')
}

let assertType = function (other: any) {
  if (!(other instanceof Money)) throw new TypeError('Instance of Money required')
}

let assertOperand = function (operand: any) {
  if (Number.isNaN(parseFloat(operand)) && !isFinite(operand))
    throw new TypeError('Operand must be a number')
}

let getCurrencyObject = function (currency: string): Currency {
  let currencyObj = Currencies[currency]

  if (currencyObj) {
    return currencyObj
  } else {
    for (let key in Currencies) {
      if (key.toUpperCase() === currency.toUpperCase()) return Currencies[key]
    }
  }
  throw new TypeError(`No currency found with code ${currency}`)
}

let isObjectLike = (value: any): boolean => {
  return value !== null && typeof value === 'object'
}

let isObject = (value: any): boolean => {
  const type = typeof value
  return value != null && (type === 'object' || type === 'function')
}

let getTag = (value: any): string => {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }
  return Object.prototype.toString.call(value)
}

let isPlainObject = (value: any): boolean => {
  if (!isObjectLike(value) || getTag(value) != '[object Object]') {
    return false
  }
  if (Object.getPrototypeOf(value) === null) {
    return true
  }
  let proto = value
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }
  return Object.getPrototypeOf(value) === proto
}

function isAmountObject(amount: number | Amount): amount is Amount {
  return isObject(amount)
}

class Money {
  amount: number
  currency: string

  /**
   * Creates a new Money instance.
   * The created Money instances is a value object thus it is immutable.
   *
   * @param {Number} amount
   * @param {Object/String} currency
   * @returns {Money}
   * @constructor
   */
  constructor(amount: number, currency: Currency | string) {
    if (typeof currency === 'string') currency = getCurrencyObject(currency)

    if (!isPlainObject(currency)) throw new TypeError('Invalid currency')

    if (!isInt(amount)) throw new TypeError('Amount must be an integer')

    this.amount = amount
    this.currency = currency.code
    Object.freeze(this)
  }

  /**
   * Creates a new Money instance from an amount object.
   *
   * Amount is assumed to be an integer-amount of the currencies smallest unit.
   *
   * @param {Number} amount
   * @returns {Money}
   */
  static from(amount: Amount): Money {
    return Money.fromInteger(amount)
  }

  static fromInteger(amount: Amount): Money
  static fromInteger(amount: number, currency: Currency | string): Money
  static fromInteger(amount: number | Amount, currency?: Currency | string): Money {
    if (isAmountObject(amount)) {
      if (amount.amount === undefined || amount.currency === undefined)
        throw new TypeError('Missing required parameters amount,currency')

      currency = amount.currency
      amount = amount.amount
    }

    if (!isInt(amount)) throw new TypeError('Amount must be an integer value')

    if (!currency) throw new TypeError('Missing required parameter currency')

    return new Money(amount, currency)
  }

  static fromDecimal(amount: Amount, rounder?: Rounder): Money
  static fromDecimal(
    amount: number,
    currency: string | Currency,
    rounder?: Rounder,
  ): Money
  static fromDecimal(
    amount: number | Amount,
    currency: string | Currency | any,
    rounder?: Rounder,
  ): Money {
    if (isAmountObject(amount)) {
      if (amount.amount === undefined || amount.currency === undefined)
        throw new TypeError('Missing required parameters amount,currency')

      rounder = currency
      currency = amount.currency
      amount = amount.amount
    }

    if (typeof currency === 'string') currency = getCurrencyObject(currency)

    if (!isPlainObject(currency)) throw new TypeError('Invalid currency')

    if (rounder === undefined) {
      let decimals = decimalPlaces(amount)

      if (decimals > currency.decimal_digits)
        throw new Error(
          `The currency ${currency.code} supports only` +
            ` ${currency.decimal_digits} decimal digits`,
        )

      rounder = Math.round
    } else {
      if (
        ['round', 'floor', 'ceil'].indexOf(rounder as string) === -1 &&
        typeof rounder !== 'function'
      )
        throw new TypeError('Invalid parameter rounder')

      if (typeof rounder === 'string') rounder = Math[rounder]
    }

    let precisionMultiplier = Math.pow(10, currency.decimal_digits)
    let resultAmount = amount * precisionMultiplier

    resultAmount = (rounder as Function)(resultAmount)

    return new Money(resultAmount, currency)
  }

  /**
   * Returns true if the two instances of Money are equal, false otherwise.
   *
   * @param {Money} other
   * @returns {Boolean}
   */
  equals(other: Money): boolean {
    let self = this
    assertType(other)

    return self.amount === other.amount && self.currency === other.currency
  }

  /**
   * Adds the two objects together creating a new Money instance that holds the result of the operation.
   *
   * @param {Money} other
   * @returns {Money}
   */
  add(other: Money): Money {
    let self = this
    assertType(other)
    assertSameCurrency(self, other)

    return new Money(self.amount + other.amount, self.currency)
  }

  /**
   * Subtracts the two objects creating a new Money instance that holds the result of the operation.
   *
   * @param {Money} other
   * @returns {Money}
   */
  subtract(other: Money): Money {
    let self = this
    assertType(other)
    assertSameCurrency(self, other)

    return new Money(self.amount - other.amount, self.currency)
  }

  /**
   * Multiplies the object by the multiplier returning a new Money instance that holds the result of the operation.
   *
   * @param {Number} multiplier
   * @param {Function} [fn=Math.round]
   * @returns {Money}
   */
  multiply(multiplier: number, fn?: Function): Money {
    if (typeof fn !== 'function') fn = Math.round

    assertOperand(multiplier)
    let amount = fn(this.amount * multiplier)

    return new Money(amount, this.currency)
  }

  /**
   * Divides the object by the multiplier returning a new Money instance that holds the result of the operation.
   *
   * @param {Number} divisor
   * @param {Function} [fn=Math.round]
   * @returns {Money}
   */
  divide(divisor: number, fn?: Function): Money {
    if (typeof fn !== 'function') fn = Math.round

    assertOperand(divisor)
    if (divisor === 0) throw new Error('Operand must be a non-zero number')
    let amount = fn(this.amount / divisor)

    return new Money(amount, this.currency)
  }

  /**
   * Allocates fund bases on the ratios provided returing an array of objects as a product of the allocation.
   *
   * @param {Array} other
   * @returns {Array.Money}
   */
  allocate(ratios: number[]): Money[] {
    let self = this
    let remainder = self.amount
    let results: Money[] = []
    let total = 0

    ratios.forEach(function (ratio) {
      total += ratio
    })

    ratios.forEach(function (ratio) {
      let share = Math.floor((self.amount * ratio) / total)
      results.push(new Money(share, self.currency))
      remainder -= share
    })

    for (let i = 0; remainder > 0; i++) {
      while (results[i].amount === 0) {
        i++
      }
      results[i] = new Money(results[i].amount + 1, results[i].currency)
      remainder--
    }

    return results
  }

  /**
   * Calculates which fraction of the other amount this amount is.
   * E.g. 150 EUR is 75% of 200 EUR, so `new Money(1500, 'EUR').fractionOf(new Money(2000, 'EUR'))` returns 0.75.
   *
   * Division by zero will return 0.
   *
   * @param {Money} other
   * @returns {number}
   */
  fractionOf(other: Money): number {
    let self = this
    assertType(other)
    assertSameCurrency(self, other)

    if (other.isZero()) return 0

    return self.amount / other.amount
  }

  percentageOf(
    other: Money,
    precision: number = 0,
    rounder: Rounder = 'round',
  ): number {
    const fraction = this.fractionOf(other) * 100
    const multiplier = Math.pow(10, precision)

    if (typeof rounder === 'string') {
      rounder = Math[rounder]
    }

    return rounder(fraction * multiplier) / multiplier
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

    if (self.amount === other.amount) return 0

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
    return (this.amount / Math.pow(10, currency.decimal_digits)).toFixed(
      currency.decimal_digits,
    )
  }

  /**
   * Returns a serialised version of the instance.
   *
   * @returns {{amount: number, currency: string}}
   */
  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
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
    return getCurrencyObject(this.currency)
  }
}

export { Money, Currencies, Currency }
