# ink_contract_size_benchmark
benchmark of ink contract sizes given different storage mechanisms

I wanted to know how much of a contract size increment different storage mechanisms gave in ink, so here's the benchmark.

I'm looking at:
- `Mapping`
- `BTreeSet`
- `BTreeMap`

and multiples of the above. This should tell us what the contract size increment is to start using each of these types in contract storage *and* how much using multiples of the storage type, e.g. 2x `Mapping`s.

My rationale here is that there's a cost to bringing in a storage type, e.g. `BTreeSet`, in that it imports new code into the contract. Any further usage, e.g. a second/third/fourth `BTreeSet`, should not have to import this code again, hence won't face such a penalty, but will still increase the final code size a bit.

Why is this all needed? At the moment, the contract size limit is 128KB. I've hit that limit many times now, so we need some benchmarking of the storage mechanism sizes to guide design given this limit.