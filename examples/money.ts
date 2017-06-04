import { Money } from 'js-money'

// creates a 10.00 EUR
let tenEur = new Money(1000, Money.EUR)

// 5 EUR
let fiveEur = tenEur.divide(2)
// 20 EUR
let twentyEur = tenEur.multiply(2)

// Returns an array of Money objects [3.34,3.33,3.33]
let shares = tenEur.allocate(1,1,1)

// 
let fromDecimal = new Money(15.62, Money.USD)
