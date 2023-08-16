# Changelog

## [0.0.3](https://github.com/cloudquery/plugin-sdk-javascript/compare/v0.0.2...v0.0.3) (2023-08-16)


### Features

* Add `addCQIDsColumns` util, split MemDB into files ([#51](https://github.com/cloudquery/plugin-sdk-javascript/issues/51)) ([dd71c60](https://github.com/cloudquery/plugin-sdk-javascript/commit/dd71c60961a3b5636038188061bcce4c95646d85))
* Add arrow dependency ([#15](https://github.com/cloudquery/plugin-sdk-javascript/issues/15)) ([082213f](https://github.com/cloudquery/plugin-sdk-javascript/commit/082213fb9820c50373f95cc8278be05b82ab17d7))
* Add Bool scalar ([#17](https://github.com/cloudquery/plugin-sdk-javascript/issues/17)) ([80edcd5](https://github.com/cloudquery/plugin-sdk-javascript/commit/80edcd5be940aa250cfed45a02cf0843de1a7719))
* Add CLI argument parsing ([#10](https://github.com/cloudquery/plugin-sdk-javascript/issues/10)) ([0d70b25](https://github.com/cloudquery/plugin-sdk-javascript/commit/0d70b2501aaad8df09f5358bfe41689e9289ee6e))
* Add CQID and Parent CQID ([#53](https://github.com/cloudquery/plugin-sdk-javascript/issues/53)) ([fbb7c94](https://github.com/cloudquery/plugin-sdk-javascript/commit/fbb7c94341f47a7959182e643b2bce75c5226791))
* Add initial sync, scheduler ([#37](https://github.com/cloudquery/plugin-sdk-javascript/issues/37)) ([9b41287](https://github.com/cloudquery/plugin-sdk-javascript/commit/9b41287162019529afa3427364f07509328ca190))
* Add JSON scalar ([#55](https://github.com/cloudquery/plugin-sdk-javascript/issues/55)) ([7e39769](https://github.com/cloudquery/plugin-sdk-javascript/commit/7e397695dd509844fd93e956157052084744c9db))
* Add multiplexer, round-robin ([#48](https://github.com/cloudquery/plugin-sdk-javascript/issues/48)) ([00a842a](https://github.com/cloudquery/plugin-sdk-javascript/commit/00a842ab9ed562460cad4cab32f40b802e281ced))
* Add String type ([#29](https://github.com/cloudquery/plugin-sdk-javascript/issues/29)) ([4c07a3d](https://github.com/cloudquery/plugin-sdk-javascript/commit/4c07a3dfef6d21f70957852907d5fde3eac4d9cb))
* Add table types ([#32](https://github.com/cloudquery/plugin-sdk-javascript/issues/32)) ([c7b301d](https://github.com/cloudquery/plugin-sdk-javascript/commit/c7b301dfd20d4ce6dd1268090eedf0a4718fc2f9))
* Add UUID scalar ([#54](https://github.com/cloudquery/plugin-sdk-javascript/issues/54)) ([d8474ce](https://github.com/cloudquery/plugin-sdk-javascript/commit/d8474ce010f4be7dee11cfef785074cee8bbc5bf))
* Add UUID, JSON types ([#56](https://github.com/cloudquery/plugin-sdk-javascript/issues/56)) ([45ab919](https://github.com/cloudquery/plugin-sdk-javascript/commit/45ab919545af8428f87e44824428caa1bac476b7))
* Implement discovery service ([#19](https://github.com/cloudquery/plugin-sdk-javascript/issues/19)) ([3abe320](https://github.com/cloudquery/plugin-sdk-javascript/commit/3abe320876a580ab494529625ef9dc77d3445513))
* Implement logger ([#21](https://github.com/cloudquery/plugin-sdk-javascript/issues/21)) ([43becf1](https://github.com/cloudquery/plugin-sdk-javascript/commit/43becf18a20e8967a5655adadba90b7dfef2f8cd))
* List scalars ([#36](https://github.com/cloudquery/plugin-sdk-javascript/issues/36)) ([0eb6d62](https://github.com/cloudquery/plugin-sdk-javascript/commit/0eb6d622ab255da9276d989c022134be4a8e7e55))
* MemDB read ([#43](https://github.com/cloudquery/plugin-sdk-javascript/issues/43)) ([3429de0](https://github.com/cloudquery/plugin-sdk-javascript/commit/3429de055d1ca361e8d2073af31a290c32a0afe0)), closes [#41](https://github.com/cloudquery/plugin-sdk-javascript/issues/41)
* MemDB writes ([#42](https://github.com/cloudquery/plugin-sdk-javascript/issues/42)) ([8f21f52](https://github.com/cloudquery/plugin-sdk-javascript/commit/8f21f5205b1e99c8064bc097357c49cd279902cd))
* More scalars ([#50](https://github.com/cloudquery/plugin-sdk-javascript/issues/50)) ([a9589b6](https://github.com/cloudquery/plugin-sdk-javascript/commit/a9589b69d5d8cad900e43ddad6cb94bc241102af))
* Scaffold plugin server ([#27](https://github.com/cloudquery/plugin-sdk-javascript/issues/27)) ([f0864eb](https://github.com/cloudquery/plugin-sdk-javascript/commit/f0864eb01d0a2189b80b8ca43da3191b7834e5c1))
* **scalars:** Timestamp, float64, int64 ([#35](https://github.com/cloudquery/plugin-sdk-javascript/issues/35)) ([7fc391c](https://github.com/cloudquery/plugin-sdk-javascript/commit/7fc391cba95ffbd04d34b82948524e4d83f11e13))
* Transform objects ([#34](https://github.com/cloudquery/plugin-sdk-javascript/issues/34)) ([c14f017](https://github.com/cloudquery/plugin-sdk-javascript/commit/c14f0173e770285135c3cca56b9c5801b1ad6d45)), closes [#5](https://github.com/cloudquery/plugin-sdk-javascript/issues/5)
* Transformers ([#25](https://github.com/cloudquery/plugin-sdk-javascript/issues/25)) ([e96adb3](https://github.com/cloudquery/plugin-sdk-javascript/commit/e96adb300ca12f1a08144273f4e1c0a728418de2))


### Bug Fixes

* @grpc/grpc-js dependency ([2adf06d](https://github.com/cloudquery/plugin-sdk-javascript/commit/2adf06de155eff72e4f9ccbf10559c6e97579baa))
* **deps:** Update dependency @cloudquery/plugin-pb-javascript to ^0.0.6 ([#14](https://github.com/cloudquery/plugin-sdk-javascript/issues/14)) ([92a87a1](https://github.com/cloudquery/plugin-sdk-javascript/commit/92a87a19cf45c3f05c33974b8d2c5294a3ba5beb))
* Encode tables in migrate messages ([#38](https://github.com/cloudquery/plugin-sdk-javascript/issues/38)) ([f6413d2](https://github.com/cloudquery/plugin-sdk-javascript/commit/f6413d255ae45c2a7dca451541d1ba7a85957254))
* Error handling, `null` values in scalars, proper exports ([#61](https://github.com/cloudquery/plugin-sdk-javascript/issues/61)) ([2b283d1](https://github.com/cloudquery/plugin-sdk-javascript/commit/2b283d17ecc3331ae6087f2b5f219a9dd60ce75d))
* Extension types null values ([#58](https://github.com/cloudquery/plugin-sdk-javascript/issues/58)) ([e8bb0a0](https://github.com/cloudquery/plugin-sdk-javascript/commit/e8bb0a0d615e14838a811c36872fed9c95504f58))
* Flatten tables in GetTables gRPC call ([#57](https://github.com/cloudquery/plugin-sdk-javascript/issues/57)) ([5a8f3c3](https://github.com/cloudquery/plugin-sdk-javascript/commit/5a8f3c3ca25011207813b0b96dd421db2f9f8f43))
* Implement sync, scheduler, resource encoding ([#44](https://github.com/cloudquery/plugin-sdk-javascript/issues/44)) ([4a5f9e8](https://github.com/cloudquery/plugin-sdk-javascript/commit/4a5f9e8dbd3579dcab392797813059ee42ad6870))
* Parent CQId resolver ([8de14cb](https://github.com/cloudquery/plugin-sdk-javascript/commit/8de14cbb50ca7f365448837152810ac3a694140c))
* Properly encode uuid ([#59](https://github.com/cloudquery/plugin-sdk-javascript/issues/59)) ([72efa22](https://github.com/cloudquery/plugin-sdk-javascript/commit/72efa2236bd3f9ec9258215a8001a4603e22c1e1))
* Support only tcp network ([#23](https://github.com/cloudquery/plugin-sdk-javascript/issues/23)) ([e138e40](https://github.com/cloudquery/plugin-sdk-javascript/commit/e138e40bd7d6c8768fdf045edacde6a678f94cdf))
* Write gRPC call, use `for await` on write readble stream ([#52](https://github.com/cloudquery/plugin-sdk-javascript/issues/52)) ([773a0e5](https://github.com/cloudquery/plugin-sdk-javascript/commit/773a0e50d4f7ff77adef30beb0aa63e18457f2ba))

## [0.0.2](https://github.com/cloudquery/plugin-sdk-javascript/compare/v0.0.1...v0.0.2) (2023-08-07)


### Bug Fixes

* Package name ([644631a](https://github.com/cloudquery/plugin-sdk-javascript/commit/644631adafc0785a389bbff40da58c51c8657f2b))

## 0.0.1 (2023-08-03)


### Features

* Initial commit ([56fec12](https://github.com/cloudquery/plugin-sdk-javascript/commit/56fec12474e30029edc1fa0c6e54dfed84232e00))


### Bug Fixes

* Docs ([47832f5](https://github.com/cloudquery/plugin-sdk-javascript/commit/47832f503226a27b1ca7bde3b37c912350d7929d))


### Miscellaneous Chores

* Release 0.0.1 ([533a8ff](https://github.com/cloudquery/plugin-sdk-javascript/commit/533a8ff5b9f0a16046df2a2998a74aea71754451))
