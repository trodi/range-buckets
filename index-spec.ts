import { assert as Assert } from "chai";
import * as _ from "underscore";
import * as Util from "util";
import * as Buckets from "./index";

/**
 * Create random dummy data
 * @param requestedScale - scale factor to multiply random 0-1 by, defaults to 100
 */
const data = (requestedScale: number = 100): number[] => {
    const scale: number = 1 + Math.random() * requestedScale;
    return _.range(0, 2).map( (): number => {
        return Number((Math.random() * scale).toFixed(5));
    });
};
describe("Range-Buckets (test uses random data)", () => {
    it("number of buckets <= requested buckets", (): void => {
        // try bucket sizes
        _.range(0, 6).forEach( (numBuckets: number): void => {
            const d: number[] = data();
            const buckets: Buckets.Bucket[] = Buckets.getBuckets(Math.min(...d), Math.max(...d), numBuckets);
            Assert.isTrue(buckets.length <= numBuckets,
                `More buckets than expected: min [${Math.min(...d)}] max [${Math.max(...d)}]`);
        });
    });
    it("buckets never have more than 2 decimals", (): void => {
        const test = (scale?: number): void => {
            // try bucket sizes
            _.range(0, 6).forEach( (numBuckets: number): void => {
                const d: number[] = data(scale);
                const buckets: Buckets.Bucket[] = Buckets.getBuckets(Math.min(...d), Math.max(...d), numBuckets);
                buckets.forEach( (b: Buckets.Bucket): void => {
                    const calcDecimals = (num: number): number => {
                        const decimals: string = num.toString().split(".")[1];
                        return decimals ? decimals.length : 0;
                    };
                    const decimalsMin: number = calcDecimals(b.min);
                    const decimalsMax: number = calcDecimals(b.max);
                    const details = {
                        bucket: b,
                        decimalsMax,
                        decimalsMin,
                        max: Math.max(...d),
                        min: Math.min(...d),
                        numBuckets,
                    };
                    Assert.isTrue(decimalsMin <= 2, `Too many decimals | [${Util.inspect(details)}]`);
                    Assert.isTrue(decimalsMax <= 2, `Too many decimals | [${Util.inspect(details)}]`);
                });
            });
        };
        test();
        test(1); // really small range of data
    });
    it("Each bucket starts where the last stopped", (): void => {
        _.range(1, 6).forEach( (numBuckets: number): void => {
            const d: number[] = data();
            const buckets: Buckets.Bucket[] = Buckets.getBuckets(Math.min(...d), Math.max(...d), numBuckets);
            Assert.isTrue(buckets.length <= numBuckets,
                `More buckets than expected: min [${Math.min(...d)}] max [${Math.max(...d)}]`);
            buckets.forEach( (b: Buckets.Bucket, i: number): void => {
                if (i > 0) { // ignore first bucket!
                    Assert.equal(b.min, buckets[i - 1].max, `Unexpected bucket min: [${buckets}], index: [${i}]`);
                }
            });
        });
    });
    it("Last bucket ends >= max of data", (): void => {
        _.range(1, 6).forEach( (numBuckets: number): void => {
            const d: number[] = data();
            const buckets: Buckets.Bucket[] = Buckets.getBuckets(Math.min(...d), Math.max(...d), numBuckets);
            Assert.isAtLeast((_.last(buckets) as Buckets.Bucket).max, Math.max(...d),
                `Unexpected bucket max. data.max [${Math.max(...d)}] | buckets [${buckets}]`);
        });
    });
    it("First bucket begins <= min of data", (): void => {
        _.range(1, 6).forEach( (numBuckets: number): void => {
            const d: number[] = data();
            const buckets: Buckets.Bucket[] = Buckets.getBuckets(Math.min(...d), Math.max(...d), numBuckets);
            Assert.isAtMost((_.first(buckets) as Buckets.Bucket).min, Math.min(...d),
                `Unexpected bucket min. data.min [${Math.min(...d)}] | buckets [${buckets}]`);
        });
    });
});
describe("Range-Buckets (pre-defined data)", () => {
    it("Min/Max both positive", (): void => {
        const buckets: Buckets.Bucket[] = Buckets.getBuckets(0, 33, 5);
        const expected: Buckets.Bucket[] = [
            { min: 0, max: 10 },
            { min: 10, max: 20 },
            { min: 20, max: 30 },
            { min: 30, max: 40 },
        ];
        Assert.isTrue(_.isEqual(buckets, expected));
    });
    it("Min is negative and Max is positive", (): void => {
        const buckets: Buckets.Bucket[] = Buckets.getBuckets(-20, 33, 5);
        const expected: Buckets.Bucket[] = [
            { min: -20, max: 0 },
            { min: 0, max: 20 },
            { min: 20, max: 40 },
        ];
        Assert.isTrue(_.isEqual(buckets, expected));
    });
    it("Min/Max both negative", (): void => {
        const buckets: Buckets.Bucket[] = Buckets.getBuckets(-20, -5, 5);
        const expected: Buckets.Bucket[] = [
            { min: -20, max: -14 },
            { min: -14, max: -8 },
            { min: -8, max: -2 },
            { min: -2, max: 4 },
        ];
        Assert.isTrue(_.isEqual(buckets, expected));
    });
});
