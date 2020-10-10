# range-buckets [![Build Status](https://travis-ci.org/trodi/range-buckets.svg)](https://travis-ci.org/trodi/range-buckets)

> *Create nice buckets for a given range of data.*

This splits a data range into `n` number of smaller ranges or "buckets". You can use this to create sub-filters for data. The algorithms used are based on how Excel produces smart chart axis.

Microsoft Article ID: [214075](https://support.microsoft.com/en-us/help/214075/xl2000-how-chart-axis-limits-are-determined)

## Install

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

## Publish

- `npm version` <patch|minor|major>
- `npm publish`
- Commit and push changes to git

## License

[MIT License](LICENSE)
