#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
pub mod contract {

    #[ink(storage)]
    pub struct Contract {

    }

    impl Contract {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {

            }
        }

        // A function which makes use of the storage to ensure optimisation cannot eliminate it from storage entirely (not sure if this happens, but best to do this just in case).
        #[ink(message)]
        pub fn func(&mut self) {
            
        }
    }
}
