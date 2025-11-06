# @screeny05/ts-money

[![NPM version](https://img.shields.io/npm/v/@screeny05/ts-money.svg?style=flat-square)](https://www.npmjs.com/package/@screeny05/ts-money)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/npm/dm/@screeny05/ts-money.svg?style=flat-square)](https://www.npmjs.com/package/@screeny05/ts-money)
[![](https://deno.bundlejs.com/?q=@screeny05/ts-money&badge&badge-style=flat-square)](https://bundlejs.com/?q=%40screeny05%2Fts-money)

TS Money is a Typescript port of the great [js-money](https://www.npmjs.com/package/js-money) package, which is an implementation of Martin Fowlers [Money pattern](http://martinfowler.com/eaaCatalog/money.html).

## Install

```sh
npm install @screeny05/ts-money
```

## Differences from original [ts-money](https://github.com/macor161/ts-money)

- Currencies are now exported in a standalone object.
- Fixed bug with allocate method when a single allocation is zero. (thanks to [@dotpack](https://github.com/dotpack), see [PR #5](https://github.com/macor161/ts-money/pull/5))
- Drastically reduced bundle-size by getting rid of lodash and removing unnecessary currency-data.
  - Instead of using currency-data like currency-name, symbols, etc. from this package you should rely on either your environments [Intl.DisplayNames](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames) API or the [currency-codes](https://www.npmjs.com/package/currency-codes) package.
- Added `Money.from(amount: Amount)` as shortcut for `Money.fromInteger(amount: Amount)`
- Added `Money#fractionOf()` and `Money#percentageOf()` (see [below](#basic-arithmetics))
- Migrated package to vitest and unbuild.
- Throws a more descriptive error when dividing by zero.

## Usage

First we need to import the library.

```typescript
import { Money, Currencies } from '@screeny05/ts-money'
```

or in javascript:

```javascript
const TsMoney = require('@screeny05/ts-money')
const Money = TsMoney.Money
const Currencies = TsMoney.Currencies
```

### Creating a new instance

There are multiple options of what to pass into the constructor to create a new Money instance:

- amount as number, currency as string
- amount as number, currency as object
- object with amount and currency fields (only with `fromInteger` and `fromDecimal` methods)

Amounts can be supplied either as integers or decimal numbers.

Instances of Money are immutable and each arithmetic operation will return a new instance of the object.

When using decimals the library will allow only decimals with the precision allowed by the currencies smallest unit.

```typescript
const fiveEur = new Money(500, Currencies.EUR)
const tenDollars = Money.fromInteger({ amount: 1000, currency: Currencies.USD })
const someDollars = Money.fromDecimal(15.25, 'USD')

// the following will fail and throw an Error since USD allows for 2 decimals
const moreDollars = Money.fromDecimal(15.3456, Currencies.USD)
// but with rounder function provider the following will work
const someMoreDollars = Money.fromDecimal(15.12345, 'USD', Math.ceil)
```

The `Currency` interface hold the following properties:

```typescript
interface Currency {
  decimal_digits: number
  code: string
}
```

Ex:

```typescript
import { Currency } from '@screeny05/ts-money'

const usd: Currency = {
  decimal_digits: 2,
  code: 'USD',
}
```

### Basic arithmetics

Arithmetic operations involving multiple objects are only possible on instances with the same currency and will throw an Error otherwise.

```typescript
const fiveEur = new Money(500, Currencies.EUR) // 5 EUR

// add
fiveEur.add(new Money(250, Currencies.EUR)) // 7.50 EUR

// subtract
fiveEur.subtract(new Money(470, Currencies.EUR)) // 0.30 EUR

// multiply
fiveEur.multiply(1.2345) // 6.17 EUR
fiveEur.multiply(1.2345, Math.ceil) // 6.18 EUR

// divide
fiveEur.divide(2.3456) // 2.13 EUR
fiveEur.divide(2.3456, Math.ceil) // 2.14 EUR

// fraction calculation
fiveEur.fractionOf(new Money(750, Currencies.EUR)) // 0.6667

// percentage calculation (same as fraction but with rounding and precision)
fiveEur.percentageOf(new Money(750, Currencies.EUR)) // 67
fiveEur.percentageOf(new Money(750, Currencies.EUR), 2) // 66.67
fiveEur.percentageOf(new Money(750, Currencies.EUR), 2, 'floor') // 66.66
```

### Allocating funds

Will divide the funds based on the ratio without losing any pennies.

```typescript
const tenEur = new Money(1000, Currencies.EUR)

// divide 10 EUR into 3 parts
const shares = tenEur.allocate([1, 1, 1])
// returns an array of Money instances worth [334,333,333]

// split 5 EUR 70/30
const fiveEur = new Money(500, Currencies.EUR)
const shares = fiveEur.allocate([70, 30])
// returns an array of money [350,150]
```

### Comparison and equality

Two objects are equal when they are of the same amount and currency.
Trying to compare 2 objects with different currencies will throw an Error.

```typescript
const fiveEur = new Money(500, Currencies.EUR)
const anotherFiveEur = new Money(500, Currencies.EUR)
const sevenEur = new Money(700, Currencies.EUR)
const fiveDollars = new Money(500, Currencies.USD)

fiveEur.equals(fiveDollars) // return false
fiveEur.equals(anotherFiveEur) // return true

fiveEur.compare(sevenEur) // return -1
sevenEur.compare(fiveEur) // return 1
fiveEur.compare(anotherFiveEur) // return 0

fiveEur.compare(fileDollars) // throw Error

fiveEur.greaterThan(sevenEur) // return false
fiveEur.greaterThanOrEqual(sevenEur) // return false
fiveEur.lessThan(sevenEur) // return true
fiveEur.lessThanOrEqual(fiveEur) // return true
```

## Modifications

Some changes have been made compared with the javascript version:

### Currencies object

Currencies are now exported in a standalone object:

```typescript
import { Money, Currencies } from '@screeny05/ts-money'

Currencies.LTC = {
  decimal_digits: 8,
  code: 'LTC',
}

const m1 = new Money(12, 'LTC')
const m2 = new Money(234, Currencies.USD)
const m3 = new Money(543, Currencies.LTC)
```

### Case insensitive currencies

Money accepts currencies as case insensitive:

```typescript
const m1 = new Money(1, 'usd')
const m2 = new Money(2, 'USD')
const m3 = new Money(3, 'Usd')
```

## Development

### Install dependencies

```sh
npm install
```

### Build library

```sh
npm run build
```

### Run tests

```sh
npm test
```

## License

[The MIT License](http://opensource.org/licenses/MIT)
