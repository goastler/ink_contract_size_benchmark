# ink_contract_size_benchmark
I wanted to know how much of a contract size increment different storage mechanisms gave in ink, so here's the benchmark.

I'm looking at:
- `Mapping`
- `BTreeSet`
- `BTreeMap`
- `Vec`

and multiples of the above. This should tell us what the contract size increment is to start using each of these types in contract storage *and* how much using multiples of the storage type, e.g. 2x `Mapping`s.

My rationale here is that there's a cost to bringing in a storage type, e.g. `BTreeSet`, in that it imports new code into the contract. Any further usage, e.g. a second/third/fourth `BTreeSet`, should not have to import this code again, hence won't face such a penalty, but will still increase the final code size a bit.

Why is this all needed? At the moment, the contract size limit is 128KB. I've hit that limit many times now, so we need some benchmarking of the storage mechanism sizes to guide design given this limit.

## Results
Takeaways (from release contract size):
- an empty contract is 0.8KB

### Importing
- importing `Vec` is 2KB
- importing `BTreeSet` is 8.3KB
- importing `BTreeMap` is 9.1KB
- importing `BTreeMap` and `BTreeSet` is 16.1KB, which is less than their combined sizes so there is some shared code here
- a single `Mapping` takes 0.5KB

### Additional
- adding another `Vec` adds 2.3KB
- adding another `BTreeSet` adds 0.4KB
- adding another `BTreeMap` adds 0.5KB, so `BTreeMap` is slightly heavier than `BTreeSet`
- adding another `Mapping` takes 0.6KB

### As the value type of `Mapping`
- a `Mapping` with `Vec` as the value type is 1.4KB
- a `Mapping` with `BTreeSet` as the value type is 1.0KB (I think this is small because a lot of the `BTreeSet` functionality is not used due to it being the value of a `Mapping`, and therefore removed from the contract)
- a `Mapping` with `BTreeMap` as the value type is 1.1KB (I think this is small because a lot of the `BTreeMap` functionality is not used due to it being the value of a `Mapping`, and therefore removed from the contract)

### Conclusion
- `Mapping` is a lot lighter-weight that `BTreeSet` or `BTreeMap` to import (I imagine this is because `Mapping` is always compiled into the contract, so is present in the empty contract and importing it does not do anything. This is supported by the single `Mapping` contract increase being almost equal to that of adding another `Mapping` above)
- adding additional `Mapping`, `BTreeSet` or `BTreeMap` increases contract size by ~0.5KB for each
- adding additional `Vec` is rather expensive at 2.3KB each, but the original import is much smaller than `BTreeSet` or `BTreeMap`