import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// Concept store: every architectural element is built in code.
// Replace the stylized display outfits with your own .glb or .fbx character using ADD 3D MODEL.
const scene = new THREE.Scene();
scene.background = new THREE.Color('#e6d3cc');
scene.fog = new THREE.Fog('#e6d3cc', 32, 70);

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
renderer.toneMappingExposure = 1.12; // V5: prevent overexposed, pale architectural details
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
scene.add(new THREE.HemisphereLight(0xfff4ec,0xd5b9b5,1.55));
const sun=new THREE.DirectionalLight('#ffebdf',2.0);sun.position.set(9,16,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=15;sun.shadow.camera.bottom=-15;sun.shadow.normalBias=.03;scene.add(sun);
const area=new THREE.PointLight('#f6cdc6',24,25,2);area.position.set(-3,4,3);scene.add(area);
const blueLight=new THREE.PointLight('#f1dfed',12,21,2);blueLight.position.set(5,4,-1);scene.add(blueLight);
const ground=mesh(new THREE.PlaneGeometry(150,150),m('#e8dbd6',0,.95));ground.rotation.x=-Math.PI/2;ground.position.y=-.22;ground.castShadow=false;

// ============================================================================
// BACKGROUND V5 — SOLID BLUSH-BEIGE architectural walls to match the provided
// pink reference room (second image). NO wall-photo/plaster overlay or wallpaper.
// Ceiling: real decorative photo. Floor: real wood photo. White columns remain 3D.
// Sculptures, mannequins, dancers, curtain, photo booth and camera logic UNCHANGED.
// ============================================================================
const architectureLoader = new THREE.TextureLoader();
function architectureTexture(name,rx=1,ry=1){
  const texture=architectureLoader.load('./assets/'+name,undefined,undefined,e=>console.warn('Missing architecture texture:',name,e));
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
  texture.wrapS=THREE.RepeatWrapping;
  texture.wrapT=THREE.RepeatWrapping;
  texture.repeat.set(rx,ry);
  return texture;
}
// V5: walls intentionally use NO wallpaper/plaster image. Uniform blush-beige like reference #2.
const woodGrain=architectureTexture('background-floor.jpg',1.35,4.7);
const ceilingRelief=architectureTexture('background-ceiling.jpg');
const plasterMat=new THREE.MeshBasicMaterial({color:'#c9aaa3',side:THREE.DoubleSide,toneMapped:false}); // exact matte solid color, unaffected by lighting
const timberMat=new THREE.MeshStandardMaterial({map:woodGrain,color:'#fff2eb',roughness:.48,metalness:0});
const plasterTrim=m('#f6e8e3',0,.78);
const columnMat=m('#fff8f5',0,.72);
const railMat=m('#c7b2ac',0,.83);

// Floor: same pale natural wood as the empty reference room. No pink/gold outline.
box(14.6,.18,10.85,0,-.025,0,m('#b6a494',0,.95));
const floor=mesh(new THREE.PlaneGeometry(14.4,10.6),timberMat);
floor.rotation.x=-Math.PI/2;floor.position.y=.075;floor.castShadow=false;

// Same open-front gallery geometry as the original Homestyler shell.
// The walls are solid plaster surfaces, not duplicated perspective photographs.
box(14.5,5.40,.28,0,2.79,-5.28,plasterMat);
for (const x of [-7.17,7.17]) {
  box(.26,5.40,10.65,x,2.79,-.01,plasterMat);
  // Thin taupe skirting is present on the reference room.
  box(.09,.17,10.48,x>0?x-.15:x+.15,.23,-.01,railMat);
}
box(14.32,.19,.10,0,.24,-5.045,railMat);

// Background ornamental ceiling, mapped with the actual supplied ceiling photo.
// The decorative panel runs across the entire gallery when walking inside.
const ceiling=mesh(new THREE.PlaneGeometry(14.35,10.52),new THREE.MeshStandardMaterial({map:ceilingRelief,color:'#f5e4df',roughness:.92,side:THREE.DoubleSide}));
ceiling.rotation.x=Math.PI/2;ceiling.position.y=5.43;ceiling.castShadow=false;ceiling.receiveShadow=false;
const ceilingOrnaments=[];
function ceilingDetail(meshObj){ meshObj.castShadow=false;meshObj.receiveShadow=false;ceilingOrnaments.push(meshObj);return meshObj; }
// Crisp white plaster rails and crown cornice frame the real ceiling relief.
for(const x of [-7.025,7.025]){
  ceilingDetail(box(.22,.20,10.4,x,5.29,0,plasterTrim));
  ceilingDetail(box(.10,.08,10.4,x>0?x-.25:x+.25,5.17,0,plasterTrim));
}
for(const z of [-5.035,5.04]){
  ceilingDetail(box(14.0,.18,.22,0,5.30,z,plasterTrim));
  ceilingDetail(box(13.98,.08,.08,0,5.17,z>0?z-.21:z+.21,plasterTrim));
}

// Raised plaster moldings around the back wall and side wall perimeter.
box(14.25,.16,.12,0,5.13,-5.02,plasterTrim);
box(14.26,.05,.13,0,4.99,-5.01,plasterTrim);
for(const x of [-7.015,7.015]){
  box(.14,.17,10.30,x,5.13,0,plasterTrim);
  box(.06,.065,10.30,x>0?x-.12:x+.12,4.98,0,plasterTrim);
}

// Pale white Corinthian columns placed to match the empty store photograph.
// Capitals have ornamental leaf detailing. Positions avoid the exhibition cutouts.
const ivoryCapital=m('#f3e5e0',0,.8);
function corinthianColumn(x,z){
 const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);
 const col=(r0,r1,h,y,material=columnMat,segments=36)=>cylinder(r0,r1,h,0,y,0,material,group,segments);
 const base=box(.82,.16,.82,0,.19,0,columnMat,group);
 col(.335,.37,.13,.35);col(.287,.308,.12,.47);
 col(.253,.29,4.21,2.64);
 col(.30,.30,.14,4.79);
 col(.37,.30,.26,4.98,ivoryCapital);
 col(.43,.40,.12,5.12,columnMat);
 box(.84,.13,.84,0,5.22,0,columnMat,group);
 // Fine classical fluting, kept subtle so it doesn't distract from the artworks.
 for(let k=0;k<16;k++){
  const angle=k*Math.PI*2/16;
  const rr=.253;
  line([Math.cos(angle)*rr,.56,Math.sin(angle)*rr],[Math.cos(angle)*rr,4.66,Math.sin(angle)*rr],.0105,m('#f0eded',0,.84),group);
 }
 // Acanthus-style leaves and scrolls along the capital.
 for(let k=0;k<12;k++){
  const angle=k*Math.PI*2/12;
  const leaf=mesh(new THREE.ConeGeometry(.103,.36,5),ivoryCapital,group);
  leaf.position.set(Math.cos(angle)*.30,4.87,Math.sin(angle)*.30);
  leaf.rotation.z=-Math.cos(angle)*.22;leaf.rotation.x=Math.sin(angle)*.22;
 }
 for(let k=0;k<4;k++){
  const angle=Math.PI/4+k*Math.PI/2;
  const spir=ring(.115,.029,Math.cos(angle)*.31,5.04,Math.sin(angle)*.31,columnMat,group);
  spir.rotation.y=angle;
 }
 return group;
}
// Four corner features plus three far-wall columns, inspired by the frontal shot.
for(const x of [-6.65,6.65])corinthianColumn(x,4.9);
for(const x of [-5.3,0,5.3])corinthianColumn(x,-4.86);

// Ballet-studio side rails remain in the original campaign scene (below).

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
