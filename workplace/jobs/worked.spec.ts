import { registerJobCases } from './cases';
import { observeJob } from './observer';

// AJ-01 / AJ-02 / AJ-03: ten independent worked cases.
registerJobCases(observeJob);
