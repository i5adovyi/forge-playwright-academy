import { registerCases } from './acceptance';
import * as learner from './helpers.starter';

// WB-01, WB-02, WB-03: the typed helpers are the learner's implementation.
// Skips do not count as completion; --practice --prove requires all 21 cases.
registerCases(learner, process.env.FORGE_PREFLIGHT_ENABLE_STARTERS !== '1');
