import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {freeResponseFixture} from './fixtures/free-response.mjs';
import {verifyFreeResponseAdmission} from '../scripts/bank/free-response.mjs';
import {freeResponseEligibilityPolicy} from '../lib/server/free-response-eligibility.mjs';
import {eligibleMixedQuestionCatalog} from '../lib/server/mixed-question-catalog.mjs';
import {freeResponseQuestions} from '../lib/server/free-response-questions.mjs';
import {gradeAnswer} from '../lib/math-answer/versioned-grade.mjs';
import {initializeFreeResponseStorage,storeAdmittedFreeResponse} from '../scripts/bank/free-response-storage.mjs';

test('a held revision cannot become an assessment through a different contract or registry', async () => {
  const held = /assessment revision is held after/;
  const heldRevisions = [
    'cn_00d3e6f613b5cd750406@1',
    'cn_01b1e0792d30d89f3a52@1',
    'cn_05956f4dc78a03217cda@1',
    'cn_079369bc84d85062e59d@1',
    'cn_09eebb51b185fe450d9f@1',
    'cn_0b83859e350f85003597@1',
    'cn_0d2be5de4315f28689ee@1',
    'cn_10759a42b9d56856d0ed@1',
    'cn_109f3cebfe99142477f6@1',
    'cn_157d4ac6eb98495d877d@1',
    'cn_15ad8d4eb8f9b7b4a4bb@1',
    'cn_163771bc8fd1aab3a1d0@1',
    'cn_1c411b10d4bfe31bddff@1',
    'cn_1d77499a4de7da845703@1',
    'cn_229f3293a209f58b56b4@1',
    'cn_25b76923e9d3d3774507@1',
    'cn_26497039882051ac37c8@1',
    'cn_28aabfd30dce3c49353d@1',
    'cn_2aa14faa4efbd6cd8c41@1',
    'cn_3397f9c779cbca0da09e@2',
    'cn_35bccac4c72ab7341e74@1',
    'cn_366e7b3c0fc498b6c447@2',
    'cn_371fa13d177ceda0ebd0@1',
    'cn_386f945c60d701b16b1a@1',
    'cn_38e558c217547ca0bac7@2',
    'cn_397fe9a462be1e102a1f@1',
    'cn_3b31f07f2d1929b8c0c2@1',
    'cn_3c81f424d0a36ee83ac7@1',
    'cn_3ef5debb5d0e32f10a20@1',
    'cn_3f57f92156d340753be1@1',
    'cn_3f8fa2f33412aaa32bcc@1',
    'cn_401c0cd14578ad9e1e44@1',
    'cn_41d4f6cc9a47e5bb3605@1',
    'cn_43738af840df5d138c54@1',
    'cn_4582164b99b70897108a@1',
    'cn_498c0e1e33621386b3dc@2',
    'cn_4a3a3fbaed60b2893255@1',
    'cn_4ade7db01c5155490706@1',
    'cn_4cea955d20dab3fccf0b@1',
    'cn_52f0677e301f8d0a731a@1',
    'cn_54875320f2826bf598ac@1',
    'cn_54eff57956fa9bc306f4@1',
    'cn_57976064f0c6683ca4e0@2',
    'cn_58057fcecf351cf83406@1',
    'cn_5ad1ffad383a3c7d6676@1',
    'cn_5c11e4ad16ddcff77cf6@2',
    'cn_5ce691d3040b4cbd6829@1',
    'cn_5d5433e6cae81d8fa241@1',
    'cn_5f4e3d0fa7ab5f5f307c@1',
    'cn_648f0ca4f6d7c170a3c2@1',
    'cn_65d0618e2d78be8951ef@1',
    'cn_666d4ec7965c87b6bf40@1',
    'cn_6921d433b70737b8121b@1',
    'cn_6921d433b70737b8121b@2',
    'cn_6c9b748adc3d6a680c94@1',
    'cn_6d2806ea6ddbbf3e6bcf@1',
    'cn_709d967eca2d02e4decb@2',
    'cn_720c55d5accbb7b97aa0@2',
    'cn_73442d8583400a20d69b@1',
    'cn_751fc5abfce2727247e0@1',
    'cn_791aa06435e8883cee04@1',
    'cn_79dfffdda3794a9eff1c@1',
    'cn_7a6cd08aae21318ace60@1',
    'cn_7bb2532cdda2077c3bd0@1',
    'cn_7eae2d169586fbb28370@1',
    'cn_7f813afc648ced1dadf8@1',
    'cn_81aabad601dec5b97a33@1',
    'cn_81daef06521c216704d3@1',
    'cn_832edb779066c84c22f5@1',
    'cn_8592c080b3c27721211a@1',
    'cn_863fd9c756a52728c3e8@1',
    'cn_866a2d3ab36ecd37f6b0@1',
    'cn_8778d6eee840ca61de74@1',
    'cn_89c3d25d557990b9c0e7@1',
    'cn_8b0a97e380fc777590b9@1',
    'cn_8cdaf78f0a94549153c0@1',
    'cn_8cfb2c17b466a4cb95ba@1',
    'cn_92a9eb0413a89e9529a3@1',
    'cn_93099a3b74c3cc420fac@1',
    'cn_94db54ce30031210ceb0@1',
    'cn_94f1e2c286b58efcc942@1',
    'cn_9595c911423bc75cd6ed@1',
    'cn_971482589dc8c5539da0@1',
    'cn_9941e4574268139b8ccb@1',
    'cn_9ce80a2dd8554dffb2d7@1',
    'cn_9e7900ccd0b946666019@1',
    'cn_9eea5e40fdd6682c4d57@2',
    'cn_9f02276ad3f91f6794b6@1',
    'cn_9f02276ad3f91f6794b6@2',
    'cn_a0236f269f5395112d03@1',
    'cn_a0301209c5deb96eb304@1',
    'cn_a18c12c0daa9902ce675@1',
    'cn_a21c016f5705109183a4@1',
    'cn_a2e1ca88a5978da84ef3@2',
    'cn_a56af6c7edd0596d91b2@1',
    'cn_a697c4f168c254768fa4@1',
    'cn_ad0d136fa4fa50109fbc@1',
    'cn_af49bf1aa4f1e19d7cd9@1',
    'cn_af67e5ddd40650e04ba5@1',
    'cn_b00ec33493fa405c3c84@1',
    'cn_b48b06e4d34f97e1ff03@1',
    'cn_b53c8dc9be5f593945e8@1',
    'cn_b5bcc14ef1afe1ba6318@1',
    'cn_b7c97fc982fa06eb6e5c@2',
    'cn_b7dcbebbfb5411ca119f@1',
    'cn_baa480d1616aeea75184@1',
    'cn_bea144056c89a5b9e6b4@1',
    'cn_beb098d0880ed88fd901@1',
    'cn_c16ebd5f3b5ca6329870@1',
    'cn_c2ec82492744a0dc9587@1',
    'cn_c3922066df395435599c@1',
    'cn_c3a107b776d192dd9f84@1',
    'cn_c6f89fc681e652b23dea@1',
    'cn_c797600c0fc3b78c4c06@1',
    'cn_c8fa2353d275f3f4285d@1',
    'cn_c96f0833fbefbbce4c28@1',
    'cn_ca61a67b9857a0b1098b@1',
    'cn_cbb9edef46b8eb865e43@1',
    'cn_cc850c4db6c08c5dde04@1',
    'cn_ce249da07c883d0c04d2@1',
    'cn_cf7d22aebde3284b5a72@1',
    'cn_d49e56152c17322d7f5c@1',
    'cn_d613bf4d160f1dad170d@1',
    'cn_d6cf6e0576a958a4458c@1',
    'cn_d7b8648c1f5722bc362b@1',
    'cn_dac073ab5ecdc2e67b2d@1',
    'cn_dd9266e00d5849d4f278@1',
    'cn_de86fa44300789e276ab@1',
    'cn_dee7e3293fa9e6d8d494@1',
    'cn_df62fd3159159e9fd7ae@1',
    'cn_dfac194b86b402deb5e9@1',
    'cn_e0d6b3039c3c8fe1ba8b@2',
    'cn_e2119a73d44751251d40@1',
    'cn_e5fafa79d348815ce8ca@1',
    'cn_e73a9cd58582a18fa8f0@1',
    'cn_e73a9cd58582a18fa8f0@2',
    'cn_e8b241241b26548a3048@2',
    'cn_f11af7178472660d1c73@1',
    'cn_f123f4581902b0d9fdc1@1',
    'cn_f1de0a87fc48c870300a@1',
    'cn_f308a7f9355bd2bc5d21@1',
    'cn_f44eb91d31f9b8541c18@1',
    'cn_f479d92833e0a8dc06e2@1',
    'cn_f7f2bbb7cc5a44de22ac@1',
    'cn_f8a340239a89cf8a851c@1',
    'cn_fa5384732448902be659@1',
    'cn_fcf18833dac8fe57385e@1',
    'cn_fe4896fc738f803f9231@1',
    'cn_ff6fe26d84ddc0963f5b@1',
    'cn_ff9f0808e9f43830d4b1@1',
  ];
  for (const revision of heldRevisions) {
    const [problemId, number] = revision.split('@');
    const fixture = await freeResponseFixture({
      checkerVersion: Number(number),
      alterTask(task) {
        task.problemId = problemId;
        task.problemRevision = Number(number);
      },
      alterContract(contract) { contract.contractId = 'alternate-contract-for-same-task'; },
    });
    assert.throws(() => freeResponseEligibilityPolicy(fixture.admissions), held);
    await assert.rejects(verifyFreeResponseAdmission(fixture.record, fixture), held);
    await assert.rejects(freeResponseQuestions([fixture.record], fixture.admissions), held);
    const db = new DatabaseSync(':memory:');
    try {
      initializeFreeResponseStorage(db);
      await assert.rejects(storeAdmittedFreeResponse(db, fixture.record, fixture), held);
      assert.equal(db.prepare('SELECT count(*) AS n FROM frbank_records').get().n, 0);
    } finally { db.close(); }
    // Historical contracts still dispatch by saved version, separately from eligibility.
    assert.equal(gradeAnswer(fixture.record.contract, '2x').outcome, 'correct');
    for (const history of [{}, {problems: ['cn_d9b934f6d9ba1541daff']}]) {
      const noRead = {prepare() { assert.fail('A denied registry reached the catalog'); }};
      await assert.rejects(eligibleMixedQuestionCatalog(noRead, {difficulty:'medium', category:'limits'}, history, 0, fixture.admissions), held);
    }
  }
});

test('a historical hold provides no approval for other task revisions', async () => {
  const fixture = await freeResponseFixture({
    alterTask(task) { task.problemId = 'cn_9f02276ad3f91f6794b6'; task.problemRevision = 3; },
  });
  const registry = {...fixture.admissions, records: {}};
  assert.equal(freeResponseEligibilityPolicy(registry).count, 0);
  await assert.rejects(verifyFreeResponseAdmission(fixture.record, {...fixture, admissions: registry}), /Unknown|Unregistered/);
  assert.equal((await verifyFreeResponseAdmission(fixture.record, fixture)).fixtures, 3);
});
