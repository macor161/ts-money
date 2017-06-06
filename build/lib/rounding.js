"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rounding = {
    /**
     * Rounds away from zero
     */
    ROUND_UP: 0,
    /**
     * Rounds towards zero
     */
    ROUND_DOWN: 1,
    /**
     * Rounds towards `Infinity`
     */
    ROUND_CEIL: 2,
    /**
     * Rounds towards `-Infinity`
     */
    ROUND_FLOOR: 3,
    /**
     * Rounds towards nearest neighbour.
     * If equidistant, rounds away from zero.
     */
    ROUND_HALF_UP: 4,
    /**
     * Rounds towards nearest neighbour.
     * If equidistant, rounds towards zero.
     */
    ROUND_HALF_DOWN: 5,
    /**
     * Rounds towards nearest neighbour.
     * If equidistant, rounds towards even neighbour.
     */
    ROUND_HALF_EVEN: 6,
    /**
     * Rounds towards nearest neighbour.
     * If equidistant, rounds towards `Infinity`.
     */
    ROUND_HALF_CEIL: 7,
    /**
     * Rounds towards nearest neighbour.
     * If equidistant, rounds towards `-Infinity`.
     */
    ROUND_HALF_FLOOR: 8,
    /**
     * The remainder is always positive.
     *
     * Euclidian division: `q = sign(n) * floor(a / abs(n))`
     */
    EUCLID: 9
};
