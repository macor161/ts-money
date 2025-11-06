import { describe, expect, it } from 'vitest'
import { Money, Currencies } from '../src/index'


describe('ts-money', () => {

    it('should export Money constructor', () => {
        expect(Money).to.be.a('function')
    })

    it('should export currencies', () => {
        expect(Currencies.EUR).to.be.a('object')
    })

    it('should export factory methods', () => {
        expect(Money.fromDecimal).to.be.a('function')
    })

    it('should export stand-alone Currencies object', () => {
        expect(Currencies).to.be.a('object')
        expect(Currencies.EUR).to.be.a('object')
    })
})
