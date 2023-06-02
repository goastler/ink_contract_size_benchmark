#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
pub mod contract {
    use ink::storage::Mapping;
    use ink::prelude::collections::btree_map::BTreeMap;

    #[ink(storage)]
    pub struct Contract {
        a: Mapping<AccountId, BTreeMap<AccountId, AccountId>>
    }

    impl Contract {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                a: Default::default(),
            }
        }

        // A function which makes use of the storage to ensure optimisation cannot eliminate it from storage entirely (not sure if this happens, but best to do this just in case).
        #[ink(message)]
        pub fn func(&mut self) {
            let mut x: BTreeMap<AccountId, AccountId> = Default::default();
            x.insert(Self::env().caller(), Self::env().caller());
            self.a.insert(Self::env().caller(), &x);
        }
    }
}