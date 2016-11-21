# sg-simd-2016
##The Scottish Index of Multiple Deprivation 2016

The Scottish Index of Multiple Deprivation (SIMD) provides a relative ranking of the data zones in Scotland from 1 (most deprived) to 6,976 (least deprived) based on a weighted combination of data in the domains of Income; Employment; Health; Education, Skills and Training; Geographic Access to Services; Crime; and Housing.

Each of the domains can also be ranked individually. Using the relative rankings each data zone can be assigned to a decile for each domain and the overall index. Decile 1 contains the most deprived 10% of data zones and decile 10 contains the least deprived 10% of data zones.

When comparing results from the different versions of the SIMD it is important to take into account changes to the methodology used to construct the individual domains and the overall SIMD between the three indices. More information can be found at [www.gov.scot/simd](http://www.gov.scot/simd).

Statistics provided by the Scottish Government:  http://http://statistics.gov.scot/data/scottish-index-of-multiple-deprivation-2016

Interactive mapping at [simd.scot](http://simd.scot)

## License

Data is licensed under the Open Government License: http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/

## Requirements

- NodeJS
- npm

## Installation

Clone the repository

```
git clone https://github.com/EdinburghCityScope/sg-simd-2016.git
```

Install npm dependencies

```
cd sg-simd-2016
npm install
```

Run the API (from the sg-simd-2016 directory)

```
node .
```

Converting the extracted data into loopback data.

```
node scripts/featureCollectionToLoopbackJson.js
```

Re-build data files from the statistics.gov.scot API

```
node scripts/build-data.js
```
