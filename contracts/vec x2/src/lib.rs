#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
pub mod contract {

    use ink::prelude::vec::Vec;

    #[ink(storage)]
    pub struct Contract {
        a: Vec<AccountId>,
        b: Vec<AccountId>,
    }

    impl Contract {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                a: Default::default(),
                b: Default::default(),
            }
        }

        // A function which makes use of the storage to ensure optimisation cannot eliminate it from storage entirely (not sure if this happens, but best to do this just in case).
        #[ink(message)]
        pub fn func(&mut self) {
            self.a.push(Self::env().caller());
            self.b.push(Self::env().caller());
        }
    }
}
