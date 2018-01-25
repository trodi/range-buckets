# range-buckets [![Build Status](https://travis-ci.org/trodi/range-buckets.svg)](https://travis-ci.org/trodi/range-buckets)
> *Create nice buckets for a given range of data.*

## Install
Future: *(Currently not published on npm)*

`npm install @trodi/range-buckets`

## Usage
Code:
```typescript
import * as Buckets from "range-buckets";
Buckets.getBuckets(0, 100, 3);
```
Output:
```typescript
[ { min: 0, max: 40, },
  { min: 40, max: 80, },
  { min: 80, max: 120 } ]
```
*Note that the number of buckets returned may be fewer than requested.*

## Build
`npm run build`

## License
[MIT License](LICENSE)
