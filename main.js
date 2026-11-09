import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// Concept store: every architectural element is built in code.
// Replace the stylized display outfits with your own .glb or .fbx character using ADD 3D MODEL.
const scene = new THREE.Scene();
scene.background = new THREE.Color('#f2ede9');
scene.fog = new THREE.Fog('#f2ede9', 28, 70);

const canvasHost = document.querySelector('#scene');
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.08, 140);
camera.position.set(4.1, 4.45, 13.8);
const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false, preserveDrawingBuffer:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.65;
canvasHost.appendChild(renderer.domElement);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = .07;
orbit.target.set(0, 2, -.25);
orbit.minDistance = 3.2;
orbit.maxDistance = 39;
orbit.maxPolarAngle = Math.PI * .51;
orbit.enablePan = true;
orbit.autoRotateSpeed = .65;
orbit.update();

const color = {
  blush:'#e7b8c8', pale:'#f4e5ea', warm:'#fff2ed', ivory:'#fffaf4', wine:'#ae7995',
  silver:'#cbd3db', dark:'#65525f', gold:'#c7a68c', lilac:'#c4b5d6', blue:'#d2e6ed',
  pearl:'#f8f1e8', wood:'#d8bdba', shadow:'#d6c6c7'
};
const m = (c, metalness=0, roughness=.7, extra={}) => new THREE.MeshStandardMaterial({ color:c, metalness, roughness, ...extra });
const mat = {
  pink:m(color.blush,.05,.45), pale:m('#d6cfca',0,.92), ivory:m('#fffefa',0,.66),
  silver:m(color.silver,.62,.24), gold:m(color.gold,.67,.3), wine:m(color.wine,.1,.5),
  dark:m(color.dark,.18,.35), lilac:m(color.lilac,.02,.48), blue:m(color.blue,.06,.42),
  pearl:m(color.pearl,.12,.18), translucent:m('#fff7f7',.04,.21,{transparent:true,opacity:.66,side:THREE.DoubleSide}),
  screen:m('#5e506c',.13,.17,{emissive:'#372342',emissiveIntensity:.35})
};
function mesh(geometry, material, parent=scene) {
  const o=new THREE.Mesh(geometry,material); o.castShadow=true; o.receiveShadow=true;parent.add(o);return o;
}
function box(w,h,d,x,y,z,material,parent=scene){const o=mesh(new THREE.BoxGeometry(w,h,d),material,parent);o.position.set(x,y,z);return o;}
function cylinder(rt,rb,h,x,y,z,material,parent=scene,segments=36){const o=mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material,parent);o.position.set(x,y,z);return o;}
function ball(r,x,y,z,material,parent=scene){const o=mesh(new THREE.SphereGeometry(r,16,12),material,parent);o.position.set(x,y,z);return o;}
function ring(radius,tube,x,y,z,material,parent=scene,arc=Math.PI*2,rotationX=0){const o=mesh(new THREE.TorusGeometry(radius,tube,9,64,arc),material,parent);o.position.set(x,y,z);o.rotation.x=rotationX;return o;}
function line(from,to,r,material,parent=scene){const a=new THREE.Vector3(...from), b=new THREE.Vector3(...to);const d=b.clone().sub(a); const o=mesh(new THREE.CylinderGeometry(r,r,d.length(),10),material,parent);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;}
function curveTube(points,r,material,parent=scene){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),48,r,8,false),material,parent);}

// Studio lighting
scene.add(new THREE.HemisphereLight(0xffffff,0xd4b9c7,2.4));
const sun=new THREE.DirectionalLight('#fff6ed',3.35);sun.position.set(9,16,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=15;sun.shadow.camera.bottom=-15;sun.shadow.normalBias=.03;scene.add(sun);
const area=new THREE.PointLight('#f0c1d5',72,25,2);area.position.set(-3,4,3);scene.add(area);
const blueLight=new THREE.PointLight('#d6d8ff',58,21,2);blueLight.position.set(5,4,-1);scene.add(blueLight);
const ground=mesh(new THREE.PlaneGeometry(150,150),m('#eae0e2',0,.95));ground.rotation.x=-Math.PI/2;ground.position.y=-.22;ground.castShadow=false;

// Light wood planks close to the original Homestyler space reference.
function parquetTexture(){
 const c=document.createElement('canvas');c.width=1024;c.height=1024;
 const g=c.getContext('2d');const shades=['#dec8b3','#d5b99f','#e1cdb7','#cfb59d','#e8d4be'];
 const plank=90;
 for(let row=0;row<12;row++){
  const y=row*plank-3, offset=(row%2)*136;
  for(let x=-260+offset;x<1250;x+=272){
   g.fillStyle=shades[(row*3+Math.floor((x+260)/272)*2+15)%shades.length];g.fillRect(x,y,271,plank-1);
   g.strokeStyle='rgba(117,80,54,.20)';g.lineWidth=1.1;g.strokeRect(x,y,271,plank-1);
   for(let k=0;k<7;k++){
     const oy=y+12+k*11;
     g.strokeStyle='rgba(122,85,63,.075)';g.beginPath();g.moveTo(x+8,oy);g.bezierCurveTo(x+92,oy-4,x+170,oy+3,x+262,oy);g.stroke();
   }
  }
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return t;
}
box(14.6,.26,10.8,0,-.03,0,m('#d9bbab',0,.9));
const floor=mesh(new THREE.PlaneGeometry(14.35,10.55),new THREE.MeshStandardMaterial({map:parquetTexture(),roughness:.78}));floor.rotation.x=-Math.PI/2;floor.position.y=.105;floor.castShadow=false;
for(const y of [.09,.2]){
  box(14.8,.035,.11,0,y,5.43,mat.gold);box(14.8,.035,.11,0,y,-5.43,mat.gold);
  box(.11,.035,10.9,-7.37,y,0,mat.gold);box(.11,.035,10.9,7.37,y,0,mat.gold);
}

// Rear backdrop and partially open sides
box(14.4,5.4,.34,0,2.74,-5.3,mat.pale);
box(14.5,.2,.54,0,5.52,-5.25,mat.ivory);
box(14.5,.11,.55,0,5.33,-5.25,mat.ivory);
for(let x=-6.7;x<=6.7;x+=2.23){box(.11,5.1,.09,x,2.7,-5.04,mat.ivory);box(.045,4.85,.13,x+.14,2.7,-5.01,mat.gold);}
box(.24,4.6,6.6,-7.15,2.38,-2.07,mat.pale);
box(.24,4.6,6.6,7.15,2.38,-2.07,mat.pale);
for(const x of [-7.2,7.2]){
  box(.42,5.45,.44,x,2.77,5.05,mat.ivory);
  cylinder(.34,.37,.24,x,5.53,5.05,mat.gold);
  box(.18,4.7,.18,x>0?x-.19:x+.19,2.6,-.2,mat.gold);
}
// Accent wall frames
for(const x of [-5.35,-2.7,0,2.7,5.35]){
 box(1.64,.06,.07,x,1.05,-5.08,mat.gold);box(1.64,.06,.07,x,4.63,-5.08,mat.gold);
 box(.055,3.58,.07,x-.82,2.83,-5.08,mat.gold);box(.055,3.58,.07,x+.82,2.83,-5.08,mat.gold);
}
// Classical columns and ceiling relief inspired by the supplied Homestyler renders.
for(const z of [-3.9,3.25])for(const x of [-6.78,6.78]){
 cylinder(.225,.25,4.5,x,2.45,z,mat.ivory,scene,32);
 cylinder(.39,.37,.25,x,.28,z,mat.ivory);
 cylinder(.33,.31,.28,x,4.88,z,mat.ivory);
 box(.84,.15,.84,x,5.09,z,mat.ivory);
 for(const t of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
  const px=x+Math.cos(t)*.33,pz=z+Math.sin(t)*.33;
  ball(.115,px,4.86,pz,mat.ivory);
 }
}
// Coiffured ceiling: fine white frames & circular medallions.
const ceiling=mesh(new THREE.PlaneGeometry(14.35,10.55),m('#f9f7f4',0,.9,{side:THREE.DoubleSide}));
ceiling.rotation.x=Math.PI/2;ceiling.position.y=5.44;ceiling.castShadow=false;
const ceilingOrnaments=[];
for(const x of [-4.8,0,4.8])for(const z of [-2.85,2.1]){
 const panel=mesh(new THREE.TorusGeometry(1.48,.064,8,68),mat.ivory);
 panel.rotation.x=Math.PI/2;panel.position.set(x,5.37,z);panel.castShadow=false;ceilingOrnaments.push(panel);
 const inner=mesh(new THREE.TorusGeometry(1.08,.024,8,68),mat.ivory);
 inner.rotation.x=Math.PI/2;inner.position.set(x,5.36,z);inner.castShadow=false;ceilingOrnaments.push(inner);
}
for(const x of [-7.07,7.07])box(.12,.12,10.3,x,5.30,0,mat.ivory);
for(const z of [-5.02,5.04])box(14.0,.12,.14,0,5.30,z,mat.ivory);

// Text signs from canvas texture (no font/image downloads needed for 3D signage)
function textSurface(lines,{width=1024,height=320,bg=null,textColor='#564450',subColor='#a37b90',border=false}={}){
  const cv=document.createElement('canvas');cv.width=width;cv.height=height;
  const ctx=cv.getContext('2d');
  if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);}
  if(border){ctx.strokeStyle='#bf9aa9';ctx.lineWidth=5;ctx.strokeRect(15,15,width-30,height-30);}
  ctx.textAlign='center';ctx.textBaseline='middle';
  if(lines.length===1){ctx.fillStyle=textColor;ctx.font='normal 77px Georgia, serif';ctx.fillText(lines[0],width/2,height/2,width-60);}
  else {
    ctx.fillStyle=subColor;ctx.font='600 29px Arial';ctx.fillText(lines[0],width/2,height*.29,width-50);
    ctx.fillStyle=textColor;ctx.font='normal 82px Georgia, serif';ctx.fillText(lines[1],width/2,height*.55,width-50);
    if(lines[2]){ctx.fillStyle=subColor;ctx.font='600 29px Arial';ctx.fillText(lines[2],width/2,height*.82,width-50);}
  }
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function sign(lines,x,y,z,w,h,opts={}){
  const surf=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textSurface(lines,opts),transparent:!opts.bg,side:THREE.DoubleSide,depthWrite:false}));
  surf.position.set(x,y,z);surf.castShadow=false;return surf;
}
// Branding appears on the supplied photo booth artwork.



// Ornamental arch, columns and pearl details
function arch(x,z,r=1.45,y=3.22,material=mat.ivory){
 for(let side of [-1,1]){
   cylinder(.105,.11,y-.75,x+side*r,(y-.75)/2+.18,z,material);
   cylinder(.17,.18,.16,x+side*r,.3,z,mat.gold);
 }
 ring(r,.12,x,y,z,material,scene,Math.PI);
 ring(r,.035,x,y,z+.07,mat.gold,scene,Math.PI);
 for(let k=0;k<=10;k++){const a=k/10*Math.PI;ball(.075,x+Math.cos(a)*r,y+Math.sin(a)*r,z+.09,mat.pearl);}
}
// Kept the back wall clear for the large central sculptural installation.

// CENTERPIECE: user's original white ballerina artwork, NOT a generated replacement.
// This is a 2.5D photo cutout in the interactive 3D space; true 360° of the sculpture needs a GLB/FBX model.
const artLoader=new THREE.TextureLoader();
function loadArt(path){const t=artLoader.load('./assets/'+path);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return t;}
const sculptureFront=loadArt('sculpture-front.png');
const sculptureSide=loadArt('sculpture-side.png');
const sculptureMat=new THREE.SpriteMaterial({map:sculptureFront,transparent:true,depthWrite:false,alphaTest:.04,toneMapped:false});
const sculpture=new THREE.Sprite(sculptureMat);
// Visual dimensions are indicative because assets are photographs instead of 3D meshes.
sculpture.position.set(0,1.98,0);
sculpture.scale.set(3.25,3.95,1);sculpture.center.set(.5,.5);
sculpture.renderOrder=2;
scene.add(sculpture);
const sculptureShadow=mesh(new THREE.CircleGeometry(1.52,48),new THREE.MeshBasicMaterial({color:'#9a8077',transparent:true,opacity:.14,depthWrite:false}));
sculptureShadow.rotation.x=-Math.PI/2;sculptureShadow.position.set(0,.115,0);sculptureShadow.castShadow=false;

// LEFT AND RIGHT EXHIBITION INSTALLATIONS
// The following assets are original artwork isolated from the user's earlier whole-room reference renders.
// They are low-resolution 2.5D placeholders; replace /assets/*.png with original high-res transparent cutouts.
// Spatial sequence follows the order in the left and right wall reference images.
const exhibitSets={
 left:[
  ['left-dancer-01.png',2.52,1.66], ['left-mannequin-01.png',2.33,1.18],
  ['left-standee-02.png',2.1,1.87], ['left-mannequin-02.png',2.26,1.26],
  ['left-dancer-03.png',2.45,1.18], ['left-mannequin-03.png',2.2,.98]
 ],
 right:[
  ['right-mannequin-01.png',2.12,.9], ['right-dancer-01.png',2.34,1.2],
  ['right-mannequin-02.png',2.1,1.15], ['right-dancer-02.png',2.38,1.25],
  ['right-mannequin-03.png',2.14,.9], ['right-dancer-03.png',2.37,1.22]
 ]
};
const exhibitSprites=[];
function installCutout(file,{x,z,height=2.3,maxwidth=1.5}){
 const tex=loadArt(file); const material=new THREE.SpriteMaterial({map:tex,transparent:true,alphaTest:.075,depthWrite:false,toneMapped:false});
 const spr=new THREE.Sprite(material); const object={file,spr};
 if(tex.image)setRatio();
 // Texture metadata arrives asynchronously, so preserve the original visual aspect ratio on load.
 function setRatio(){
  const iw=tex.image?.width||400,ih=tex.image?.height||600;
  const width=Math.min(maxwidth,height*iw/ih);
  spr.scale.set(width,height,1);
 }
 const texURL='./assets/'+file;
 // Register an independent image load for accurate dimensions and automatic replacement support.
 const probe=new Image();probe.onload=()=>{tex.image=probe;setRatio();};probe.src=texURL;
 setRatio();spr.position.set(x,.16+height/2,z);spr.renderOrder=2;scene.add(spr);
 const sh=mesh(new THREE.CircleGeometry(Math.min(maxwidth/2,.62),24),new THREE.MeshBasicMaterial({color:'#806c67',transparent:true,opacity:.11,side:THREE.DoubleSide,depthWrite:false}));
 sh.rotation.x=-Math.PI/2;sh.position.set(x,.12,z);sh.castShadow=false;
 exhibitSprites.push(object);
 return spr;
}
// Left wing, from front entrance to back of the gallery.
const leftZ=[3.58,2.11,.65,-.75,-2.13,-3.55];
exhibitSets.left.forEach(([file,height,width],i)=>installCutout(file,{x:-5.72,z:leftZ[i],height,maxwidth:width}));
// Right wing, photobooth is the large focal installation further back.
const rightZ=[3.6,2.37,1.12,-.12,-1.38,-2.61];
exhibitSets.right.forEach(([file,height,width],i)=>installCutout(file,{x:5.87,z:rightZ[i],height,maxwidth:width}));
// Minimal ballet studio barre: pale wood rail on both real side walls.
for(const x of [-6.75,6.75]){
 line([x,1.42,-4.65],[x,1.42,4.58],.027,mat.ivory);
 for(const z of [-4,-1.5,1,3.5])line([x,1.42,z],[x, .32,z],.025,mat.ivory);
}

// RIGHT WING: supplied transparent photobooth artwork over supplied pink baroque curtain.
// Separate image layers preserve their original designs and depth order.
const booth=new THREE.Group();booth.position.set(4.63,0,-4.63);scene.add(booth);
const curtainTexture=loadArt('pink-curtain.png');
const curtainLayer=mesh(new THREE.PlaneGeometry(3.72,4.58),new THREE.MeshBasicMaterial({map:curtainTexture,transparent:true,alphaTest:.035,side:THREE.DoubleSide,depthWrite:false,toneMapped:false}),booth);
curtainLayer.position.set(0,2.61,-.11);curtainLayer.castShadow=false;curtainLayer.renderOrder=3;
// The frame stays on its own physical wall plane, in front of the drapery.
const boothArtwork=loadArt('photobooth.png');
const boothPanel=mesh(new THREE.PlaneGeometry(2.76,3.68),new THREE.MeshBasicMaterial({map:boothArtwork,transparent:true,alphaTest:.035,side:THREE.DoubleSide,depthWrite:false,toneMapped:false}),booth);
boothPanel.position.set(0,1.96,.22);boothPanel.castShadow=false;boothPanel.renderOrder=4;
// Narrow satin shell gives a little thickness when exploring from an oblique angle.
box(2.37,3.37,.09,0,1.98,.035,mat.pale,booth);
box(2.5,.09,.45,0,.23,.25,mat.ivory,booth);
// Thin location highlight on floor, not a replacement for the user's photo booth design.
const boothMat=mesh(new THREE.PlaneGeometry(2.9,1.3),new THREE.MeshStandardMaterial({color:'#f5e5e8',transparent:true,opacity:.64,side:THREE.DoubleSide}),scene);
boothMat.rotation.x=-Math.PI/2;boothMat.position.set(4.63,.117,-3.25);boothMat.castShadow=false;

// Architectural elements and original exhibition artwork retain visual priority.

// Camera interaction
const modes={orbit:'orbit',walk:'walk'};
let mode='orbit',walkYaw=0,walkPitch=0,dragPointer=false,lastX=0,lastY=0,flight=null,importedObject=null;
const walkKeys=new Set();
const orbitBtn=document.querySelector('#orbitMode'),walkBtn=document.querySelector('#walkMode');
const noticeBox=document.querySelector('#notice');let noticeTimer;
function notice(message){noticeBox.textContent=message;noticeBox.classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>noticeBox.classList.remove('visible'),4200);}
function setMode(next){
 mode=next;flight=null;orbit.enabled=next==='orbit';orbitBtn.classList.toggle('active',next==='orbit');walkBtn.classList.toggle('active',next==='walk');
 orbitBtn.setAttribute('aria-pressed',String(next==='orbit'));walkBtn.setAttribute('aria-pressed',String(next==='walk'));
 document.querySelector('#walkpad').classList.toggle('visible',next==='walk');
 const hint=document.querySelector('#hint');
 if(next==='walk'){
   orbit.autoRotate=false;document.querySelector('#autoRotate').classList.remove('active');document.querySelector('#autoRotate').setAttribute('aria-pressed','false');
   camera.position.set(0,1.72,4.5);walkYaw=0;walkPitch=0;camera.rotation.order='YXZ';camera.rotation.set(0,0,0);walkKeys.clear();
   hint.textContent='DRAG TO LOOK · WASD / ARROWS TO MOVE';
   notice('Walk mode: use WASD / arrow keys to move, drag to look.');
 }else{resetView();hint.textContent='DRAG TO ROTATE · SCROLL TO ZOOM';}
}
function resetView(){setFlight([4.1,4.45,13.8],[0,2,-.25]);}
function setFlight(pos,target){
 mode='orbit';orbit.enabled=true;orbitBtn.classList.add('active');walkBtn.classList.remove('active');orbitBtn.setAttribute('aria-pressed','true');walkBtn.setAttribute('aria-pressed','false');
 document.querySelector('#walkpad').classList.remove('visible');document.querySelector('#hint').textContent='DRAG TO ROTATE · SCROLL TO ZOOM';
 orbit.autoRotate=false;document.querySelector('#autoRotate').classList.remove('active');document.querySelector('#autoRotate').setAttribute('aria-pressed','false');
 flight={from:camera.position.clone(),to:new THREE.Vector3(...pos),targetFrom:orbit.target.clone(),targetTo:new THREE.Vector3(...target),t:0};
}
orbitBtn.addEventListener('click',()=>setMode('orbit'));
walkBtn.addEventListener('click',()=>setMode('walk'));
document.querySelector('#resetView').addEventListener('click',resetView);
document.querySelector('#autoRotate').addEventListener('click',()=>{
 if(mode!=='orbit')setMode('orbit');orbit.autoRotate=!orbit.autoRotate;
 document.querySelector('#autoRotate').classList.toggle('active',orbit.autoRotate);
 document.querySelector('#autoRotate').setAttribute('aria-pressed',String(orbit.autoRotate));
});
const views={
 stage:{pos:[1.3,3.2,6.6],target:[0,1.9,0]},
 left:{pos:[-2.4,2.9,4.1],target:[-5.7,1.35,.1]},
 right:{pos:[2.4,2.9,4.1],target:[5.8,1.35,.1]},
 booth:{pos:[4.8,2.8,-.62],target:[4.63,2.25,-4.6]}
};
document.querySelectorAll('[data-destination]').forEach(btn=>btn.addEventListener('click',()=>{
 const v=views[btn.dataset.destination];setFlight(v.pos,v.target);
}));

// Save screenshots, no server needed
document.querySelector('#screenshot').addEventListener('click',()=>{
 try{renderer.render(scene,camera);const a=document.createElement('a');a.href=renderer.domElement.toDataURL('image/png');a.download='shushutong-pop-up-view.png';document.body.append(a);a.click();a.remove();notice('View saved as PNG.');}
 catch(err){notice('Screenshot unavailable in this browser.');console.error(err);}
});

// Drag to look in first-person mode
renderer.domElement.addEventListener('pointerdown',(e)=>{if(mode==='walk'){dragPointer=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);}});
renderer.domElement.addEventListener('pointermove',(e)=>{
 if(mode!=='walk'||!dragPointer)return;
 walkYaw-=(e.clientX-lastX)*.0045;
 walkPitch=Math.max(-1.25,Math.min(1.25,walkPitch-(e.clientY-lastY)*.0045));
 lastX=e.clientX;lastY=e.clientY;
});
renderer.domElement.addEventListener('pointerup',()=>dragPointer=false);
renderer.domElement.addEventListener('pointercancel',()=>dragPointer=false);
window.addEventListener('keydown',(e)=>{
 if(mode!=='walk')return;
 if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();walkKeys.add(e.code);}
});
window.addEventListener('keyup',e=>walkKeys.delete(e.code));
window.addEventListener('blur',()=>walkKeys.clear());
document.querySelectorAll('[data-move]').forEach(button=>{
 const map={forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD'};const code=map[button.dataset.move];
 button.addEventListener('pointerdown',e=>{e.preventDefault();walkKeys.add(code);button.setPointerCapture(e.pointerId);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>walkKeys.delete(code));
});

// Import visitor-owned GLB / FBX assets, replacing the central placeholder outfit.
const upload=document.querySelector('#modelUpload');
upload.addEventListener('change',async(e)=>{
 const file=e.target.files?.[0];if(!file)return;
 const extension=file.name.split('.').pop().toLowerCase();
 if(!['glb','fbx'].includes(extension)){notice('Please choose a .glb or .fbx model.');return;}
 notice('Importing your 3D model…');
 try{
   const arrayBuffer=await file.arrayBuffer();let obj;
   if(extension==='fbx')obj=new FBXLoader().parse(arrayBuffer,'');
   else obj=await new Promise((resolve,reject)=>new GLTFLoader().parse(arrayBuffer,'',gltf=>resolve(gltf.scene),reject));
   if(importedObject)scene.remove(importedObject);
   const bounds=new THREE.Box3().setFromObject(obj);const dims=bounds.getSize(new THREE.Vector3());
   if(!Number.isFinite(dims.y)||dims.y<=.00001)throw Error('Invalid model size');
   obj.scale.multiplyScalar(2.9/dims.y);
   const resized=new THREE.Box3().setFromObject(obj);const center=resized.getCenter(new THREE.Vector3());
   obj.position.set(-center.x,.15-resized.min.y,-center.z);
   obj.traverse(item=>{if(item.isMesh){item.castShadow=true;item.receiveShadow=true;}});
   scene.add(obj);importedObject=obj;sculpture.visible=false;setFlight([3.5,3.8,7.0],[0,1.8,0]);
   notice('Model added to the central runway: '+file.name);
 }catch(err){console.error(err);notice('Could not load model. Export as a self-contained .glb, or try another .fbx file.');}
 upload.value='';
});

function resize(){
 const w=window.innerWidth,h=window.innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.8));
}
window.addEventListener('resize',resize);
const clock=new THREE.Clock();
let loaded=false;
function animate(){
 // Dollhouse view: hide the ceiling when the orbit camera is looking down from outside.
 const roofVisible=mode==='walk'||camera.position.y<5.25;
 ceiling.visible=roofVisible;
 for(const ornament of ceilingOrnaments)ornament.visible=roofVisible;
 // Change sculpture reference front ↔ side when orbiting toward the right wing.
 const dx=camera.position.x-sculpture.position.x, dz=camera.position.z-sculpture.position.z;
 const angle=Math.atan2(Math.abs(dx),Math.max(.01,dz));
 const side=angle>.62;
 if(sculptureMat.map!==(side?sculptureSide:sculptureFront)){sculptureMat.map=side?sculptureSide:sculptureFront;sculptureMat.needsUpdate=true;sculpture.scale.set(side?4.08:3.25,side?3.77:3.95,1);}
 
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.05);
 if(mode==='orbit'){
   if(flight){
     flight.t=Math.min(flight.t+dt/1.15,1);
     const eased=1-Math.pow(1-flight.t,3);
     camera.position.lerpVectors(flight.from,flight.to,eased);
     orbit.target.lerpVectors(flight.targetFrom,flight.targetTo,eased);
     if(flight.t===1)flight=null;
   }
   orbit.update();
 }else{
   camera.rotation.set(walkPitch,walkYaw,0,'YXZ');
   const speed=dt*(walkKeys.has('ShiftLeft')||walkKeys.has('ShiftRight')?6:3);
   let f=Number(walkKeys.has('KeyW')||walkKeys.has('ArrowUp'))-Number(walkKeys.has('KeyS')||walkKeys.has('ArrowDown'));
   let r=Number(walkKeys.has('KeyD')||walkKeys.has('ArrowRight'))-Number(walkKeys.has('KeyA')||walkKeys.has('ArrowLeft'));
   const norm=Math.hypot(f,r)||1;f/=norm;r/=norm;
   camera.position.x+=(-Math.sin(walkYaw)*f+Math.cos(walkYaw)*r)*speed;
   camera.position.z+=(-Math.cos(walkYaw)*f-Math.sin(walkYaw)*r)*speed;
   camera.position.x=THREE.MathUtils.clamp(camera.position.x,-6.7,6.7);
   camera.position.z=THREE.MathUtils.clamp(camera.position.z,-4.75,4.8);
 }
 renderer.render(scene,camera);
 if(!loaded){loaded=true;document.querySelector('#loading').classList.add('done');}
}
animate();
