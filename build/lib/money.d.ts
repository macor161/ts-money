export declare class Money {
    amount: number;
    currency: string;
    constructor(amount: number, currency: any | string);
    static fromInteger(amount: number | any, currency: string): Money;
    static fromDecimal(amount: number | any, currency: string | any, rounder: string): Money;
    equals(other: Money): boolean;
    add(other: Money): Money;
    subtract(other: Money): Money;
    multiply(multiplier: number, fn: Function): Money;
    divide(divisor: number, fn: Function): Money;
    allocate(ratios: any[]): Money[];
    compare(other: Money): number;
    greaterThan(other: Money): boolean;
    greaterThanOrEqual(other: Money): boolean;
    lessThan(other: Money): boolean;
    lessThanOrEqual(other: Money): boolean;
    isZero(): boolean;
    isPositive(): boolean;
    isNegative(): boolean;
    toDecimal(): number;
    toString(): string;
    toJSON(): {
        amount: number;
        currency: string;
    };
    getAmount(): number;
    getCurrency(): string;
}
