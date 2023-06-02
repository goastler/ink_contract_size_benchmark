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

### As the value type of `Mapping` (on top of the 0.5KB for a `Mapping` in the first place)
- a `Mapping` with `Vec` adds 0.6KB
- a `Mapping` with `BTreeSet` adds ~0KB (I think this is small because a lot of the `BTreeSet` functionality is not used due to it being the value of a `Mapping`, and therefore removed from the contract)
- a `Mapping` with `BTreeMap` adds 0.4KB

### Comparison
- `Mapping` is a lot lighter-weight than `BTreeSet` or `BTreeMap` to import (I imagine this is because `Mapping` is always compiled into the contract, so is present in the empty contract and importing it does not do anything. This is supported by the single `Mapping` contract increase being almost equal to that of adding another `Mapping` above)
- adding additional `Mapping`, `BTreeSet` or `BTreeMap` increases contract size by ~0.5KB for each
- adding additional `Vec` is rather expensive at 2.3KB each, but the original import is much smaller than `BTreeSet` or `BTreeMap`
- having data structures like `Vec`, `BTreeSet` or `BTreeMap` loaded via a `Mapping` costs less than having them in the contract storage directly. (I imagine this is because much of their functionality can be optimised away based on their usage)

|Type|Import size (KB)|Usage size (KB)|
|---|---|---|
|`Mapping`|0.5|0.6|
|`BTreeSet`|8.7|0.4|
|`BTreeMap`|9.1|0.5|
|`Vec`|2|2.3|
* import size is the cost of using only 1 of the data structure
* usage size is the cost of each additional use of the data structure


## Tldr;
- Avoiding `BTreeSet` or `BTreeMap` can save ~10KB
- Each `Vec` avoided saves ~2KB
- Use `Mapping` (or `BTreeSet` or `BTreeMap` if already in use elsewhere) over `Vec` where possible to save ~1.5KB
- Adding additional `Mapping`, `BTreeSet` or `BTreeMap` all cost approximately the same amount (~0.5KB)
- Lazy load `BTreeSet`, `BTreeMap` and `Vec` to save ~0.6KB at most
- Using five or more `BTreeSet`s or `BTreeMap`s is more cost-effective than using `Vec`s
- Using less than five `Vec`s is more cost-effective than using `BTreeSet`s or `BTreeMap`s