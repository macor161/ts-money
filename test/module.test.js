var Money = require('../build/').Money;

describe('js-money', function() {

    it('should export constructor directly from package', function() {
        expect(Money).to.be.a('function');
    });

    it('should export currencies', function() {
        expect(Money.EUR).to.be.a('object');
    });

    it('should export factory methods', function() {
        expect(Money.fromDecimal).to.be.a('function');
    });
});