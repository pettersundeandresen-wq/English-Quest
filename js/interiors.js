// Four explorable interior maps. The 56 quests here use IDs 124–179.
// These IDs are not duplicated outdoors, and all saved progress is preserved.
export const indoorDefinitions = [
  {id:'library', name:'Det magiske biblioteket', icon:'📚', floor:'#bd8c57', wall:'#644d48', accent:'#e4c78c', seed:13},
  {id:'maze', name:'Den gamle labyrinten', icon:'🧩', floor:'#9ca99c', wall:'#455f5c', accent:'#d9b36d', seed:37},
  {id:'tower', name:'Trollmannstårnet', icon:'🧙', floor:'#9c88c5', wall:'#544577', accent:'#e6c6f7', seed:71},
  {id:'cave', name:'Ekko-hulen', icon:'🔔', floor:'#6a9eaa', wall:'#2b5769', accent:'#9be9ee', seed:101}
];
const WIDTH=31, HEIGHT=23;
const hash=(x,y,seed)=>{const n=Math.sin(x*127.1+y*311.7+seed*73.13)*43758.5453;return n-Math.floor(n)};
function makeMap(def, index){
  const tiles=Array.from({length:HEIGHT},()=>Array(WIDTH).fill('wall'));
  // DFS maze: every carved cell is reachable from the entrance.
  const stack=[[15,19]];
  tiles[19][15]='floor';
  const visited=new Set(['15,19']);
  while(stack.length){
    const [x,y]=stack[stack.length-1];
    const directions=[[2,0],[-2,0],[0,2],[0,-2]].sort((a,b)=>hash(x+a[0],y+a[1],def.seed)-hash(x+b[0],y+b[1],def.seed));
    const next=directions.map(([dx,dy])=>[x+dx,y+dy,dx,dy]).find(([nx,ny])=>nx>1&&ny>1&&nx<WIDTH-2&&ny<HEIGHT-2&&!visited.has(`${nx},${ny}`));
    if(!next){stack.pop();continue;}
    const [nx,ny,dx,dy]=next;
    visited.add(`${nx},${ny}`);
    tiles[y+dy/2][x+dx/2]='floor';tiles[ny][nx]='floor';stack.push([nx,ny]);
  }
  // Small rooms create landmarks, intersections and alternative paths.
  const rooms=[[5,5],[25,5],[5,15],[25,15],[15,9]];
  for(const [cx,cy] of rooms){
    for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++)tiles[y][x]='floor';
  }
  // Entrance courtyard and exit tile.
  for(let y=17;y<=20;y++)for(let x=13;x<=17;x++)tiles[y][x]='floor';
  const reachable=new Set();const queue=[[15,19]];
  while(queue.length){const [x,y]=queue.shift();const key=`${x},${y}`;if(reachable.has(key)||tiles[y]?.[x]!=='floor')continue;reachable.add(key);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])queue.push([x+dx,y+dy]);}
  const candidates=[...reachable].map(s=>{const [x,y]=s.split(',').map(Number);return{x,y}})
    .filter(p=>p.y<17&&p.x>2&&p.x<WIDTH-3)
    .sort((a,b)=>hash(a.x,a.y,def.seed+5)-hash(b.x,b.y,def.seed+5));
  const positions=[];
  for(const p of candidates){if(positions.every(q=>Math.hypot(p.x-q.x,p.y-q.y)>=2.6))positions.push(p);if(positions.length===14)break;}
  if(positions.length!==14)throw Error(`Not enough accessible quest positions in ${def.id}`);
  const objects=positions.map((p,i)=>({id:124+index*14+i,x:p.x,y:p.y,type:['chest','crystal','rune','bell','portal'][(124+index*14+i)%5]}));
  return {...def,w:WIDTH,h:HEIGHT,tiles,objects,exit:{x:15,y:19},spawn:{x:15.5,y:18.5},reachable};
}
export const interiors=Object.fromEntries(indoorDefinitions.map((d,i)=>[d.id,makeMap(d,i)]));
export const indoorObjects=indoorDefinitions.flatMap(d=>interiors[d.id].objects);
export function indoorWalkable(map,x,y){return map.tiles[Math.floor(y)]?.[Math.floor(x)]==='floor';}
export function drawInterior(ctx,camera,time,map,done,tileSize=40){
  const w=ctx.canvas.width,h=ctx.canvas.height;
  ctx.fillStyle='#151f2a';ctx.fillRect(0,0,w,h);
  const x0=Math.max(0,Math.floor(camera.x/tileSize)-1),x1=Math.min(map.w,Math.ceil((camera.x+w)/tileSize)+1);
  const y0=Math.max(0,Math.floor(camera.y/tileSize)-1),y1=Math.min(map.h,Math.ceil((camera.y+h)/tileSize)+1);
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
    const px=x*tileSize-camera.x,py=y*tileSize-camera.y,wall=map.tiles[y][x]==='wall';
    ctx.fillStyle=wall?map.wall:map.floor;ctx.fillRect(px,py,tileSize+1,tileSize+1);
    if(wall){ctx.fillStyle='#ffffff13';ctx.fillRect(px+2,py+2,tileSize-4,3);ctx.fillStyle='#00000035';ctx.fillRect(px,py+tileSize-6,tileSize,6);}
    else {
      ctx.strokeStyle='#ffffff19';ctx.strokeRect(px+1,py+1,tileSize-2,tileSize-2);
      if(hash(x,y,map.seed)>.84){ctx.fillStyle=map.accent;ctx.globalAlpha=.55;ctx.fillRect(px+14,py+16,5,5);ctx.globalAlpha=1;}
      if(map.id==='library'&&hash(x,y,map.seed+7)>.93){ctx.fillStyle='#805a3a';ctx.fillRect(px+8,py+8,24,7);ctx.fillStyle='#d8c58b';ctx.fillRect(px+11,py+8,4,7);}
      if(map.id==='cave'&&hash(x,y,map.seed+7)>.94){ctx.fillStyle='#a7f6ff';ctx.beginPath();ctx.moveTo(px+20,py+7);ctx.lineTo(px+12,py+29);ctx.lineTo(px+27,py+26);ctx.fill();}
      if(map.id==='tower'&&hash(x,y,map.seed+7)>.94){ctx.fillStyle='#e9c8ff';ctx.beginPath();ctx.arc(px+20,py+18,4+Math.sin(time/550)*1.5,0,Math.PI*2);ctx.fill();}
    }
  }
  const ex=map.exit;
  ctx.font='27px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('🚪',(ex.x+.5)*tileSize-camera.x,(ex.y+.5)*tileSize-camera.y);
  for(const p of map.objects){
    const px=(p.x+.5)*tileSize-camera.x,py=(p.y+.5)*tileSize-camera.y;
    if(px<-40||py<-40||px>w+40||py>h+40)continue;
    const completed=!!done[p.id];ctx.font='27px system-ui';ctx.fillText(completed?{chest:'📭',crystal:'◈',rune:'▣',bell:'🔕',portal:'◌'}[p.type]:{chest:'🎁',crystal:'💎',rune:'🪨',bell:'🔔',portal:'🌀'}[p.type],px,py);
    ctx.fillStyle=completed?'#e2ffed':'#fff4a4';ctx.font='bold 17px system-ui';ctx.fillText(completed?'✓':'!',px+14,py-17);
  }
  ctx.font='bold 17px system-ui';ctx.textAlign='left';ctx.fillStyle='#ffffff';ctx.fillText(map.icon+' '+map.name,14,25);
}
