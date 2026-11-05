export const TILE=40, W=92,H=65;
const rnd=(x,y,z=0)=>{let n=Math.sin(x*127.1+y*311.7+z*83.13)*43758.5453;return n-Math.floor(n)};
const grid=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>'grass'));
const roads=[[7,7],[19,7],[19,18],[34,18],[34,9],[52,9],[52,25],[70,25],[70,12],[84,12],[84,40],[63,40],[63,53],[42,53],[42,39],[24,39],[24,54],[9,54],[9,34],[7,7]];
function carve(x,y,r=2,t='path'){for(let yy=Math.max(0,y-r);yy<=Math.min(H-1,y+r);yy++)for(let xx=Math.max(0,x-r);xx<=Math.min(W-1,x+r);xx++)if(Math.hypot(xx-x,yy-y)<=r+.2)grid[yy][xx]=t}
for(let i=1;i<roads.length;i++){let [x1,y1]=roads[i-1],[x2,y2]=roads[i];let len=Math.hypot(x2-x1,y2-y1);for(let s=0;s<=len*2;s++){let t=s/(len*2);carve(Math.round(x1+(x2-x1)*t),Math.round(y1+(y2-y1)*t),2)}}
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 if(x>=36&&x<=40&&y<30){grid[y][x]='water';continue}
 if(x>=58&&x<=62&&y>31&&y<65){grid[y][x]='water';continue}
 if(grid[y][x]==='path')continue;
 const q=rnd(x,y);const region=x>48&&y>31?'ruins':x>43?'forest':y>28?'forest':'village';
 if(region==='forest'&&q<.35)grid[y][x]='tree';else if(region==='ruins'&&q<.27)grid[y][x]='rock';else if(q<.10)grid[y][x]='bush';
}
// Bridges and clear access to all landmark centers.
for(let y=6;y<=11;y++)for(let x=35;x<=41;x++)grid[y][x]='bridge';
for(let y=37;y<=43;y++)for(let x=57;x<=63;x++)grid[y][x]='bridge';
const spots=[];
for(let i=0;i<88;i++){
 const seg=i%4;const xx=seg===0?6+(i*13)%27:seg===1?42+(i*7)%43:seg===2?6+(i*11)%28:42+(i*17)%43;
 const yy=seg===0?5+(i*7)%23:seg===1?5+(i*13)%24:seg===2?33+(i*9)%27:33+(i*11)%27;
 let x=xx,y=yy;let n=0;while(n++<100&&(grid[y][x]==='water'||spots.some(p=>Math.hypot(p.x-x,p.y-y)<3))){x=5+(x+3)%82;y=4+(y+5)%57}
 spots.push({id:i,x,y,type:['chest','crystal','rune','bell','portal'][i%5]});carve(x,y,1,'clearing');
}
for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(grid[y][x]==='bridge'&&rnd(x,y)>.5)grid[y][x]='bridge';
export const objects=spots;
export const landmarks=[{x:8,y:7,name:'Landsbyen'},{x:29,y:22,name:'Skogstien'},{x:48,y:11,name:'Elvedalen'},{x:72,y:17,name:'Nordskogen'},{x:70,y:45,name:'Ruinene'},{x:26,y:52,name:'Magisk lysning'}];
export function tile(x,y){return grid[Math.floor(y)]?.[Math.floor(x)]||'water'}
export function walkable(x,y){return !['water','tree','rock'].includes(tile(x,y))}
export function region(x,y){if(x>57&&y>34)return 'Steinruinene';if(x>42&&y>30)return 'Den magiske lysningen';if(x>42)return 'Elvedalen';if(y>30)return 'Den ville skogen';return 'Landsbyen'}
export function drawWorld(ctx,camera,time,done){const w=ctx.canvas.width,h=ctx.canvas.height;ctx.fillStyle='#8bc985';ctx.fillRect(0,0,w,h);const x0=Math.max(0,Math.floor(camera.x/TILE)-1),x1=Math.min(W,Math.ceil((camera.x+w)/TILE)+1),y0=Math.max(0,Math.floor(camera.y/TILE)-1),y1=Math.min(H,Math.ceil((camera.y+h)/TILE)+1);
for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){let px=x*TILE-camera.x,py=y*TILE-camera.y,t=grid[y][x];ctx.fillStyle=t==='path'?'#e5ca91':t==='clearing'?'#b4d89b':t==='bridge'?'#b88250':t==='water'?'#54b8d8':(rnd(x,y)>.5?'#90c783':'#86c27c');ctx.fillRect(px,py,TILE+1,TILE+1);
if(t==='grass'||t==='clearing'){if(rnd(x,y,4)>.7){ctx.fillStyle=rnd(x,y,5)>.5?'#f7e7a7':'#c4e6a5';ctx.fillRect(px+8+rnd(x,y)*19,py+9,3,5)}}
if(t==='water'){ctx.fillStyle='#8bdef0';ctx.fillRect(px+5+Math.sin(time/450+x)*4,py+10,18,3);ctx.fillRect(px+20,py+30,12,2)}
if(t==='bridge'){ctx.fillStyle='#875c36';ctx.fillRect(px,py+4,TILE,3);ctx.fillRect(px,py+33,TILE,3)}
if(t==='tree'){ctx.fillStyle='#426e37';ctx.fillRect(px+16,py+21,8,19);ctx.fillStyle='#286e48';ctx.beginPath();ctx.arc(px+19,py+17,18,0,7);ctx.fill();ctx.fillStyle='#449a61';ctx.beginPath();ctx.arc(px+13,py+12,12,0,7);ctx.fill()}
if(t==='rock'){ctx.fillStyle='#778d87';ctx.beginPath();ctx.ellipse(px+20,py+23,17,13,0,0,7);ctx.fill();ctx.fillStyle='#aabbb1';ctx.fillRect(px+10,py+13,13,4)}
if(t==='bush'){ctx.fillStyle='#4f9b5b';ctx.beginPath();ctx.arc(px+20,py+23,12,0,7);ctx.fill()}
}
for(const p of spots){let px=(p.x+.5)*TILE-camera.x,py=(p.y+.5)*TILE-camera.y;if(px<-40||py<-40||px>w+40||py>h+40)continue;let completed=!!done[p.id];ctx.save();ctx.translate(px,py);ctx.font='29px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(completed?{chest:'📭',crystal:'◈',rune:'▣',bell:'🔕',portal:'◌'}[p.type]:{chest:'🎁',crystal:'💎',rune:'🪨',bell:'🔔',portal:'🌀'}[p.type],0,0);if(!completed){ctx.fillStyle='#fff5a3';ctx.font='bold 20px system-ui';ctx.fillText('!',12,-19)}else{ctx.fillStyle='#f2f7f4';ctx.font='bold 16px system-ui';ctx.fillText('✓',15,-16)}ctx.restore()}
}
