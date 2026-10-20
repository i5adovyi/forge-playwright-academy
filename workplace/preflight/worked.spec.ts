import { registerCases } from './acceptance';
import { mutatedHelpers } from './mutants';

// WB-01, WB-02, WB-03: run the same contract against the reference or an
// explicitly selected controlled mutation owned by run.mjs.
registerCases(mutatedHelpers(process.env.FORGE_PREFLIGHT_MUTANT || ''));
