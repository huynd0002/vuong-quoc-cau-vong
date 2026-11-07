import assert from 'node:assert/strict';
import { SaveAdapter } from '../../services/save/saveAdapter.js';
import { CookingSystem, normalizeCookingState } from '../../game/systems/cookingSystem.js';
import { RECIPES, getRecipe, recipeSteps } from '../../content/cooking/recipes.js';
import { ProgressionSystem } from '../../game/systems/progressionSystem.js';
import { GameStateMachine, GAME_STATES } from '../../game/systems/gameStateMachine.js';

export function runCookingSystemTests() {
  const adapter = new SaveAdapter('TEST_COOKING'); adapter.reset();
  let time=10000;
  const cooking = new CookingSystem(adapter,()=>{},()=>time);
  assert.equal(cooking.buy('banana').reason,'stars');
  assert.deepEqual(cooking.getState().ingredients,{});
  const progression = new ProgressionSystem(adapter.load());
  progression.addReward({stars:500}); adapter.save(progression.state);
  const stale=adapter.load();
  assert.equal(cooking.buy('unknown').ok,false);
  assert.equal(cooking.start('veggie_soup').reason,'locked');
  function prepare(id) {
    const r=getRecipe(id);
    for(const item of r.ingredients) for(let n=0;n<item.count;n++) assert.equal(cooking.buy(item.id).ok,true);
    assert.equal(cooking.completeHandWash().ok,true);
    assert.equal(cooking.start(id).ok,true);
    const s=cooking.getState().session;
    for(const item of r.ingredients) for(let n=0;n<item.count;n++) assert.equal(cooking.stage(s.id,item.id).ok,true);
    cooking.configure(s.id,'heat',r.heat); cooking.configure(s.id,'ticks',r.ticks);
    return s.id;
  }
  function finish(id) {
    const sessionId=prepare(id);
    assert.equal(cooking.cook(sessionId).ok,true);
    assert.equal(cooking.cook(sessionId).ok,false,'double Cook cannot spend twice');
    assert.equal(cooking.finish().ok,false,'no early completion');
    time+=getRecipe(id).durationMs;
    assert.equal(new CookingSystem(adapter,()=>{},()=>time).finish().ok,true,'resume after reload');
    assert.equal(cooking.finish().ok,false,'completion is exactly once');
    return sessionId;
  }
  assert.equal(cooking.start('fruit_yogurt').reason,'hygiene');
  assert.equal(cooking.completeHandWash().ok,true);
  assert.equal(cooking.start('fruit_yogurt').ok,true);
  let s=cooking.getState().session;
  assert.equal(cooking.cook(s.id).reason,'missing');
  assert.equal(cooking.stage(s.id,'banana').reason,'missing');
  cooking.buy('banana');
  assert.equal(cooking.stage(s.id,'carrot').reason,'wrong');
  cooking.stage(s.id,'banana');
  assert.equal(cooking.stage(s.id,'banana').reason,'missing');
  cooking.stage(s.id,'banana',true);
  assert.equal(cooking.getState().session.staged.banana,0);
  cooking.stage(s.id,'banana'); cooking.cancel();
  assert.equal(cooking.getState().ingredients.banana,1,'cancel preparation preserves paid stock');
  // Fail session (hụt nhịp) loses staged ingredients
  cooking.start('fruit_yogurt');
  const failS = cooking.getState().session;
  cooking.stage(failS.id, 'banana');
  assert.equal(cooking.failSession(failS.id).ok, true);
  assert.equal(cooking.getState().ingredients.banana, undefined, 'failSession burns/deducts staged ingredients');
  assert.equal(cooking.getState().session, null);
  const fruit=finish('fruit_yogurt');
  const spend=cooking.getState().spentStars;
  adapter.save(stale);
  assert.equal(cooking.getStars(),500-spend,'old snapshots cannot refund purchases');
  assert.equal(cooking.getState().dishes.length,1);
  const rewardState=adapter.load(), reward=new ProgressionSystem(rewardState);
  reward.addReward({stars:3});adapter.save(rewardState);
  assert.equal(cooking.getStars(),503-spend,'challenge reward applies to remaining balance');
  assert.equal(cooking.eat(fruit).ok,true);assert.equal(cooking.eat(fruit).ok,false);
  assert.equal(cooking.beginBattle().hearts,4);assert.equal(cooking.beginBattle().hearts,3);
  cooking.recordBattleHearts(1);
  const sandwich=finish('rainbow_sandwich');cooking.eat(sandwich);
  assert.equal(cooking.getState().hearts,2);assert.equal(cooking.useEnergy().ok,true);assert.equal(cooking.useEnergy().ok,false);
  finish('veggie_soup');finish('egg_rice');
  assert.equal(cooking.unlocked(getRecipe('rainbow_plate')),true);
  cooking.eat(finish('rainbow_plate'));cooking.eat(finish('rainbow_plate'));
  assert.equal(cooking.getState().bonusHearts,2);assert.equal(cooking.getState().energy,3);
  const full=finish('rainbow_plate');assert.equal(cooking.eat(full).ok,false,'full stats keep food');
  assert.equal(cooking.discard(full).ok,true);assert.equal(cooking.discard(full).ok,false);

  // Wrong controls do not destroy ingredients; failed storage commits nothing.
  const id=prepare('fruit_yogurt'); cooking.configure(id,'heat','high');
  const stock=cooking.getState().ingredients;
  assert.equal(cooking.cook(id).reason,'setting');assert.deepEqual(cooking.getState().ingredients,stock);
  cooking.configure(id,'heat','off');
  const realSave=adapter.save;
  for(const action of [()=>cooking.buy('banana'),()=>cooking.stage(id,'banana',true),()=>cooking.cook(id)]) {
    const before=adapter.load();adapter.save=()=>false;assert.equal(action().reason,'save');assert.deepEqual(adapter.load(),before);adapter.save=realSave;
  }
  cooking.cook(id);assert.equal(cooking.cancel().reason,'cooking');
  time+=2000;
  const beforeFinish=adapter.load();adapter.save=()=>false;
  assert.equal(cooking.finish().reason,'save');assert.deepEqual(adapter.load(),beforeFinish);
  adapter.save=realSave;assert.equal(cooking.finish().ok,true);
  const petDish=cooking.getState().dishes[0].id;
  const petSave=adapter.load();petSave.pet.hunger=40;adapter.save(petSave);
  const beforeFeed=adapter.load();adapter.save=()=>false;
  assert.equal(cooking.feedPet(petDish).reason,'save');assert.deepEqual(adapter.load(),beforeFeed);
  adapter.save=realSave;assert.equal(cooking.feedPet(petDish).ok,true);
  assert.equal(adapter.load().pet.hunger,90);assert.equal(cooking.feedPet(petDish).ok,false);
  while(cooking.getState().dishes.length<6) finish('fruit_yogurt');
  const beforeFull=adapter.load();assert.equal(cooking.start('fruit_yogurt').reason,'full');assert.deepEqual(adapter.load(),beforeFull);

  const corrupt=normalizeCookingState({hearts:-4,bonusHearts:500,ingredients:{banana:1000,unknown:40,yogurt:-2},dishes:[null],session:{recipeId:'unknown'}});
  assert.equal(corrupt.hearts,3);assert.equal(corrupt.bonusHearts,2);assert.deepEqual(corrupt.ingredients,{banana:99});assert.equal(corrupt.session,null);
  const legacy=normalizeCookingState({session:{id:'cook-9',recipeId:'fruit_yogurt',step:recipeSteps(getRecipe('fruit_yogurt')).length},mastery:{rainbow_sandwich:2}});
  assert.equal(legacy.session.phase,'cooking');assert.equal(legacy.session.readyAt,0);assert.equal(legacy.mastery.rainbow_sandwich,2);
  const fsm=new GameStateMachine(GAME_STATES.WORLD_EXPLORATION);
  assert.equal(fsm.transition(GAME_STATES.KITCHEN),true);assert.equal(fsm.isModalActive(),true);
  assert.equal(fsm.canTransitionTo(GAME_STATES.BOSS_BATTLE),false);
  assert.equal(RECIPES.length,8);adapter.reset();
  console.log('✓ Kitchen: paid stock, stars, drag staging, controls, atomic cooking, reload, inventory, effects, caps and failed storage');
}
