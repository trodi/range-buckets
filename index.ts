/**
 * This module provides means to split a data range into n number of smaller
 * ranges or "buckets". You can use this to create subfilters for data.
 *
 * The algorithmns used are based on how Excel produces smart chart axis.
 *
 * Microsoft Article ID: 214075
 * https://support.microsoft.com/en-us/help/214075/xl2000-how-chart-axis-limits-are-determined
 */

/** Fix decimals to match the given unit. Avoids floating point math errors (e.g., modulo). */
const round = (num: number, unit: number): number => {
    const decimals: string = unit.toString().split(".")[1];
    const decimalsInUnit: number = decimals ? decimals.length : 0;
    return Number(num.toFixed(decimalsInUnit));
};

/**
 * Calc the major unit for our buckets. This is used to determine if buckets will
 * be split up on '1', '5', or '.5' etc. NOTE: Change this if change in bucket
 * split points is desired.
 */
const calcMajorUnit = (min: number, max: number): number => {
    const power: number = Math.log(max - min) / Math.log(10);
    const scale: number = Math.pow(10, power - Math.floor(power));
    const multiplicationFactor = (): number => {
        if (scale <= 2.5) {
            return .2; // other potential values: .1 .2 .25 .5
        } else if (scale <= 5) {
            return .5;
        } else if (scale <= 7.5) {
            return 1;
        } else {
            return 2;
        }
    };
    // clip major unit to 2 decimals. if that causes unit to become 0, bump unit up to smallest allowed
    return Number((multiplicationFactor() * Math.pow(10, Math.floor(power))).toFixed(2)) || .02;
};

/**
 * Scale factor for threshold to determine whether to pin value to zero based on the size of the range.
 * Sometimes friendly buckets make more since when min/max pinned to zero.
 */
const ZERO_THRESHOLD_SCALE = 5 / 6;
/**
 * Scale factor to determine size of cushion needed around actual data.
 * Min/Max want some wiggle room around actual data.
 */
const SCALE = 20;

/** Calc a smart min for buckets given the range/unit. */
const calcMin = (min: number, max: number, unit: number): number => {
    if (min >= 0 && max >= 0) {
        const pinToZero: boolean = max - min > ZERO_THRESHOLD_SCALE * max;
        const initial: number = min - (max - min) / SCALE;
        return pinToZero ? 0 : round(initial - (initial % unit), unit);
    } else if (min < 0 && max < 0) {
        const initial: number = min + (min - max) / SCALE;
        return round(initial - (initial % unit), unit);
    } else { // min is negative, max is positive
        const initial: number = min + (min - max) / SCALE;
        return round(initial - (initial % unit), unit);
    }
};

/** Calc a smart max for buckets given the range/unit. */
const calcMax = (min: number, max: number, unit: number): number => {
    if (min >= 0 && max >= 0) {
        const initial: number = max + (max - min) / SCALE;
        return round(initial + unit - (initial % unit), unit);
    } else if (min < 0 && max < 0) {
        const pinToZero: boolean = max - min > ZERO_THRESHOLD_SCALE * min;
        const initial: number = max - ((min - max) / SCALE);
        return pinToZero ? 0 : round(initial + unit - (initial % unit), unit);
    } else { // min is negative, max is positive
        const initial: number = max + (max - min) / SCALE;
        return round(initial + unit - (initial % unit), unit);
    }
};

/** Calc the size of every bucket (they are all the same). */
const calcSize = (begin: number, end: number, unit: number, numBuckets: number): number => {
    // bucket size to nearest "unit" >= even split
    const even: number = ((end - begin) / numBuckets);
    return round((even + unit - (even % unit)), unit);
};

/** A range bucket */
export interface Bucket { min: number; max: number; }

/**
 * Create range buckets for a given data range, breaking up a full range into smaller
 * bits. (e.g., 0-20 => 0-5, 5-10, 10-20)
 * @param min - min number in data range
 * @param max - max number in data range
 * @param numBuckets - suggested number of buckets to create (currently this will the max created)
 */
export const getBuckets = (min: number, max: number, numBuckets: number): Bucket[] => {
    const unit = calcMajorUnit(min, max);
    const begin: number = calcMin(min, max, unit);
    const end: number = calcMax(min, max, unit);
    const bucketSize: number = calcSize(begin, end, unit, numBuckets);
    const range = Array(numBuckets);
    for (let i = 0; i < numBuckets; i ++) {
        range[i] = i;
    }
    const buckets: Bucket[] = range.map( (val: number, i: number) => {
        return {
            max: i === numBuckets - 1 ? end : round(begin + (bucketSize * (i + 1)), unit),
            min: round(begin + (bucketSize * i), unit),
        };
    });
    // NOTE: commented logging for easy testing and playing with output. Too verbose for
    // console.log(`Range-Buckets: data: min [${min} | max [${max}]`
    //     + ` | unit [${unit}] | begin [${begin}] | end [${end}] | size [${bucketSize}]`);
    return buckets.reduce((memo: Bucket[], b: Bucket): Bucket[] => {
        // only keep buckets that are in the begin-end range
        if (b.min < end) {
            memo.push(b);
        }
        return memo;
    }, []);
};
