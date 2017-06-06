export type RoundingMode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export let Rounding = {
        /**
         * Rounds away from zero
         */
        ROUND_UP: 0 as RoundingMode,

        /**
         * Rounds towards zero
         */
        ROUND_DOWN: 1 as RoundingMode,

        /**
         * Rounds towards `Infinity`
         */
        ROUND_CEIL: 2 as RoundingMode,

        /**
         * Rounds towards `-Infinity`
         */
        ROUND_FLOOR: 3 as RoundingMode,

        /**
         * Rounds towards nearest neighbour.
         * If equidistant, rounds away from zero.
         */
        ROUND_HALF_UP: 4 as RoundingMode,

        /**
         * Rounds towards nearest neighbour.
         * If equidistant, rounds towards zero.
         */
        ROUND_HALF_DOWN: 5 as RoundingMode,

        /**
         * Rounds towards nearest neighbour.
         * If equidistant, rounds towards even neighbour.
         */
        ROUND_HALF_EVEN: 6 as RoundingMode,

        /**
         * Rounds towards nearest neighbour.
         * If equidistant, rounds towards `Infinity`.
         */
        ROUND_HALF_CEIL: 7 as RoundingMode,

        /**
         * Rounds towards nearest neighbour.
         * If equidistant, rounds towards `-Infinity`.
         */
        ROUND_HALF_FLOOR: 8 as RoundingMode,

        /**
         * The remainder is always positive.
         *
         * Euclidian division: `q = sign(n) * floor(a / abs(n))`
         */
        EUCLID: 9 as RoundingMode
}