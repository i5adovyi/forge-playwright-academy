export default async function teardown() {
  if (process.env.FORGE_GATE_SCENARIO === 'global-error') {
    throw new Error('CONTROLLED_GATE_GLOBAL_ERROR: teardown failed after passing tests');
  }
}
