import { createGame, score } from './engine';
import type { Action, Card, Game } from './engine';
export type Lesson = 'first' | 'bond' | 'reaction' | 'practice';
export const lessonNames = { first: '1 · 出牌与留牌', bond: '2 · 制气与检验', reaction: '3 · 催化与检验', practice: '4 · 反应接力对战' };
export const pool: Omit<Card, 'id' | 'ability' | 'row'>[] = [
 {name:'碳酸钙',symbol:'CaCO₃',power:4,chemical:'carbonate',fact:'与稀盐酸反应生成氯化钙、水和二氧化碳。'},
 {name:'稀盐酸',symbol:'HCl',power:4,chemical:'acid',fact:'稀盐酸是氯化氢的水溶液，属于混合物。一张牌代表一份实验材料。'},
 {name:'澄清石灰水',symbol:'Ca(OH)₂',power:3,chemical:'limewater',fact:'将生成的二氧化碳通入澄清石灰水，出现白色沉淀。不是把石灰水倒入制气容器。'},
 {name:'过氧化氢溶液',symbol:'H₂O₂',power:4,chemical:'peroxide',fact:'过氧化氢分解生成水和氧气；二氧化锰加快该反应。'},
 {name:'二氧化锰',symbol:'MnO₂',power:2,chemical:'catalyst',fact:'催化剂反应前后质量和化学性质不变。每局一次组合奖励是游戏限制，不代表催化剂只能使用一次。'},
 {name:'带火星的木条',symbol:'木条',power:2,chemical:'splint',fact:'伸入收集的氧气中，木条复燃。此处是检验，不是验满。'},
 {name:'铜丝',symbol:'Cu',power:6,fact:'铜具有良好的导电性。'},
 {name:'铁钉',symbol:'Fe',power:4,chemical:'metal',fact:'铁属于金属单质；铁与稀盐酸反应生成氯化亚铁和氢气。'},
 {name:'氮气',symbol:'N₂',power:5,fact:'空气中氮气的体积分数约为78%。'},
 {name:'二氧化硅',symbol:'SiO₂',power:6,fact:'二氧化硅属于氧化物。'},
 {name:'红磷',symbol:'P',power:4,fact:'红磷燃烧消耗氧气、生成五氧化二磷固体，可用于测定空气中氧气的含量。'},
 {name:'镁带',symbol:'Mg',power:5,chemical:'metal',fact:'镁与稀盐酸反应生成氯化镁和氢气；在空气中燃烧发出耀眼白光。'},
 {name:'蒸馏水',symbol:'H₂O',power:3,fact:'电解水生成氢气和氧气，体积比约为2:1。'},
 {name:'燃着的木条',symbol:'火焰',power:2,chemical:'flame',fact:'点燃收集的氢气，发出爆鸣声。氢气可燃，点燃前必须验纯；此处是检验氢气。'}
];
export function createLesson(lesson: Lesson): Game {
 const g=createGame(); g.experiments=[[],[]];
 g.players.forEach((p,side)=>{
  const route=lesson==='reaction'?[3,4,5]:[0,1,2], other=lesson==='reaction'?[0,1,2]:[3,4,5];
  let indices=lesson==='first'?[6,7,8,9,6,7,8,9,6,8]:side===0?[...route,...other,6,7,8,9]:[...other,9,8,9,8,9,8,9];
  if(lesson==='practice') indices=indices.map(n=>({n,order:Math.random()})).sort((a,b)=>a.order-b.order).map(x=>x.n);
  p.hand=indices.map((n,i)=>({...pool[n],id:`lesson-${side}-${i}`,row:0,ability:'unit'}));
  p.deck=[]; p.board=[]; p.discard=[]; p.leader=false;
 });
 g.phase='play';g.starter=0;g.turn=0;g.log=['每人10张牌。实验结束清场，手牌保留，不补牌。'];return g;
}
export function easyAI(g:Game,lesson:Lesson):Action {
 const p=g.players[1],enemy=g.players[0],budget=lesson==='first'?(g.round===1?2:3):3;
 if(!p.hand.length||(enemy.passed&&score(g,1)>score(g,0))||p.board.length>=budget+(enemy.passed?1:0)) return {type:'pass'};
 const order=['carbonate','acid','limewater','peroxide','catalyst','splint'];
 const next=[...p.hand].sort((a,b)=>(a.chemical?order.indexOf(a.chemical):10+a.power)-(b.chemical?order.indexOf(b.chemical):10+b.power))[0];
 return {type:'card',id:next.id};
}
export function guide(g:Game,lesson:Lesson):string {
 if(g.phase==='over')return '对决结束。可以换个出牌顺序再试一次。';
 if(g.phase==='round')return '本局实验结束：反应记录与产物标记清场，手牌保留，不补牌。';
 if(g.players[0].passed)return '你已停牌，剩余手牌留给下一局。';
 if(g.experiments?.[0].some(e=>!e.testedBy))return '生成物已经出现：如何检验呢？也可以保留手牌，让本局实验结束。';
 if(g.players[1].passed)return '对方已停牌。超过对方即可收手，也可以让局留牌。';
 if(lesson==='bond'&&!g.experiments?.[0].length)return '试试碳酸钙与稀盐酸。生成物会留在反应记录旁。';
 if(lesson==='reaction'&&!g.experiments?.[0].length)return '试试过氧化氢溶液与二氧化锰，观察反应物和催化剂的不同状态。';
 return '点击手牌，再确认出牌。得分记录已完成的实验；已反应材料不能重复使用。';
}
