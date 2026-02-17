import { useBraveryBankContext } from './BraveryBankContext';

/**
 * Shared bravery bank state and actions. Must be used within BraveryBankProvider
 * (root layout). Today and Progress tabs share this state so completion updates
 * are reflected everywhere without reloading.
 */
export const useBraveryBank = useBraveryBankContext;
