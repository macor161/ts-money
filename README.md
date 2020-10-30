# TS Money

TS Money is a Typescript port of the great [js-money](https://www.npmjs.com/package/js-money) package, which is an implementation of Martin Fowlers [Money pattern](http://martinfowler.com/eaaCatalog/money.html). 

## Install

    $ npm install ts-money


## Usage

First we need to import the library.

```javascript
import { Money, Currencies } from 'ts-money'
```

or in javascript:

```javascript
var TsMoney = require('ts-money')
var Money = TsMoney.Money
var Currencies = TsMoney.Currencies
```

### Creating a new instance

There are multiple options of what to pass into the constructor to create a new Money instance:
* amount as number, currency as string
* amount as number, currency as object
* object with amount and currency fields (only with `fromInteger` and `fromDecimal` methods)

Amounts can be supplied either as integers or decimal numbers.

Instances of Money are immutable and each arithmetic operation will return a new instance of the object.

When using decimals the library will allow only decimals with the precision allowed by the currencies smallest unit.

```javascript
var fiveEur = new Money(500, Currencies.EUR);
var tenDollars = Money.fromInteger({ amount: 1000, currency: Currencies.USD });
var someDollars = Money.fromDecimal(15.25, 'USD');

// the following will fail and throw an Error since USD allows for 2 decimals
var moreDollars = Money.fromDecimal(15.3456, Currencies.USD);
// but with rounder function provider the following will work
var someMoreDollars = Money.fromDecimal(15.12345, 'USD', Math.ceil);
```

The currency object hold the following properties

```javascript
    {
        "symbol": "$",
        "name": "US Dollar",
        "symbol_native": "$",
        "decimal_digits": 2,
        "rounding": 0,
        "code": "USD",
        "name_plural": "US dollars"
    }
```

### Basic arithmetics

Arithmetic operations involving multiple objects are only possible on instances with the same currency and will throw an Error otherwise.

```javascript
var fiveEur = new Money(500, Currencies.EUR); // 5 EUR

// add
fiveEur.add(new Money(250, Currencies.EUR)); // 7.50 EUR

// subtract 
fiveEur.subtract(new Money(470, Currencies.EUR)); // 0.30 EUR

// multiply
fiveEur.multiply(1.2345); // 6.17 EUR
fiveEur.multiply(1.2345, Math.ceil); // 6.18 EUR

// divide 
fiveEur.divide(2.3456); // 2.13 EUR
fiveEur.divide(2.3456, Math.ceil); // 2.14 EUR
```

### Allocating funds

Will divide the funds based on the ratio without loosing any pennies. 

```javascript
var tenEur = new Money(1000, Currencies.EUR);

// divide 10 EUR into 3 parts
var shares = tenEur.allocate([1,1,1]); 
// returns an array of Money instances worth [334,333,333]

// split 5 EUR 70/30
var fiveEur = new Money(500, Currencies.EUR);
var shares = fiveEur.allocate([70,30]);
// returns an array of money [350,150]

```

### Comparison and equality

Two objects are equal when they are of the same amount and currency.
Trying to compare 2 objects with different currencies will throw an Error.

```javascript
var fiveEur = new Money(500, Currencies.EUR);
var anotherFiveEur = new Money(500, Currencies.EUR);
var sevenEur = new Money(700, Currencies.EUR);
var fiveDollars = new Money(500, Currencies.USD);

fiveEur.equals(fiveDollars); // return false
fiveEur.equals(anotherFiveEur); // return true

fiveEur.compare(sevenEur); // return -1
sevenEur.compare(fiveEur); // return 1
fiveEur.compare(anotherFiveEur); // return 0

fiveEur.compare(fileDollars); // throw Error

fiveEur.greaterThan(sevenEur); // return false
fiveEur.greaterThanOrEqual(sevenEur); // return false
fiveEur.lessThan(sevenEur); // return true
fiveEur.lessThanOrEqual(fiveEur); // return true
```


## Modifications

Some changes have been made compared with the javascript version:

### Currencies object

Currencies are now in a stand-alone object. This has many benefits, like preventing autocomplete "pollution" of the Money class and enabling easy extensibility:

```javascript
import { Money, Currencies } from 'ts-money'

Currencies.LTC = {
    symbol: "Ł",
    name: "Litecoin",
    symbol_native: "Ł",
    decimal_digits: 8,
    rounding: 0,
    code: "LTC",
    name_plural: "Litecoins"    
}

let m1 = new Money(12, 'LTC')
let m2 = new Money(234, Currencies.USD)
let m3 = new Money(543, Currencies.LTC)

```

### Case insensitive currencies

Money accepts currencies as case insensitive:

```javascript
let m1 = new Money(1, 'usd')
let m2 = new Money(2, 'USD')
let m3 = new Money(3, 'Usd')
```


## Tests

    $ npm install
    $ npm test

## License

[The MIT License](http://opensource.org/licenses/MIT)

[npm-url]: https://npmjs.org/package/ts-money
[npm-image]: http://img.shields.io/npm/v/ts-money.svg
