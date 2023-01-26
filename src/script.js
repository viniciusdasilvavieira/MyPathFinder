import './style.css'
import * as THREE from '../node_modules/three'
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js'
import * as AI from './AI.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')
// Scene
const scene = new THREE.Scene()

// Materials
const blue          = new THREE.MeshStandardMaterial  ( {color:0x012763} )
const purple        = new THREE.MeshStandardMaterial  ( {color:0xad11a6} )
const translucid    = new THREE.MeshStandardMaterial  ( {transparent:true, opacity: 0.5 } )
const linematerial  = new THREE.LineBasicMaterial     ( {color: 0x012763} );
//material.color = new THREE.Color(0xff0000)

//geometries
const cubegeometry  = new THREE.BoxGeometry( .2, .2, .2)
const planegeometry = new THREE.PlaneGeometry( 6, 6)
const linegeometry  = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3( 0, 0, 1 ),new THREE.Vector3( 0, 0, 0 )]);
const arrow         = new THREE.ConeGeometry( 0.1, 0.3, 3)
function cube(sizeX, sizeY, sizeZ) { return new THREE.BoxGeometry( sizeX, sizeY, sizeZ)}

//a plane that receives shadows
const plane = new THREE.Mesh( planegeometry, blue );
plane.rotateX(-Math.PI / 2)
plane.position.set (2,-0.2,1.5);
plane.receiveShadow = true;
scene.add( plane );

//cone // AI body
const cone = new THREE.Mesh(new THREE.ConeGeometry( 0.3, 0.1, 3), translucid)
cone.position.set (0,0,3); // posição inicial do cone/triangulo
cone.castShadow = true;
cone.material.color
scene.add(cone)

// Cria uma mesh e adiciona ela na cena, talvez dividir em 2 metodos
// Parametros: OBJ { geo (geometry), mat (material), xyz (array [float,float,float]), shadow (bool), ret: (bool, 'retorno') }
// default params se não informado: cubegeometry, no mat, pos (0,0,0), shadow false, ret true 
// ex: {'geo': cubegeometry, 'mat': translucid, 'xyz': [1,0,2], 'shadow': true, 'ret': true}
function creates(ob)
{ 
    let item, mat, geo,x,y,z, ret;
    ob.mat ? mat = ob.mat : mat = false
    ob.geo ? geo = ob.geo : geo = cubegeometry
    ob.ret ? ret = ob.ret : ret = false;

    if (ob.xyz)  {
        x = ob.xyz[0]; y = ob.xyz[1]; z = ob.xyz[2];
    }
    else {
        x =0;y=0;z=0; 
    }   

    mat ? item = new THREE.Mesh(geo, mat) : item = new THREE.Mesh(geo)

    item.position.set(x,y,z)
    ob.shadow ? (item.castShadow = true) : null

    if(ret) return item
    else scene.add(item)    
}

manualNodes()
function manualNodes(){
    //Parameters: name, x,y,z, [ connected name, connected distance ] , active
    // X = movimento para direita, Z = movimento para baixo
    AI.addNode('a1',   0,0,0   ,[['a2',2],['a7',2]]             ,0)
    AI.addNode('a2',   2,0,0   ,[['a1',2],['a5',1]]             ,0)
    AI.addNode('a3',   4,0,0   ,[['a6',1],['a4',2]]             ,0)
    AI.addNode('a4',   6,0,0   ,[['a3',2],['a11',3]]            ,0) 
    AI.addNode('a5',   2,0,1   ,[['a2',1],['a8',1],['a6',2]]    ,0)
    AI.addNode('a6',   4,0,1   ,[['a3',1],['a5',2],['a10',2]]   ,0)
    AI.addNode('a7',   0,0,2   ,[['a1',2],['a8',2]]             ,0)
    AI.addNode('a8',   2,0,2   ,[['a5',1],['a9',1],['a7',2]]    ,0)
    AI.addNode('a9',   2,0,3   ,[['a8',1],['a10',2]]            ,0)
    AI.addNode('a10',  4,0,3   ,[['a6',2],['a9',2],['a11',2]]   ,0)
    AI.addNode('a11',  6,0,3   ,[['a10',2],['a4',3]]            ,0)
    /*arrangement.                                
    1.  -   2.     3.   -   4.      0
    -       5.  -  6.       -       1
    7.  -   8.      -       -       2
            9.  -  10   -   11      3

    0   1   2   3   4   5   6
    */
}

var cubearray = AI.getCubeArray()
var boxes = AI.getBoxesArray()
var nextpath
var goalobj
var foundobj
var path = []

function closestBox() // retorna o nome da box mais proxima do obj dado
{
    let cw, cc;
    cw =[] // "cube winner"
    cc =[] // cube to compare
    cw['range'] = cone.position.distanceTo(boxes[0].mesh.position) // v read below 
    cw['name'] = boxes[0].name // random cube just to exist value

    for (let i = 0; i < boxes.length; i++)
    {
        cc['range'] = cone.position.distanceTo(boxes[i].mesh.position)
        cc['name'] = boxes[i].name

        if (cc['range'] < cw['range']){
            cw['range'] = cc['range']
            cw['name'] =  cc['name']
        }
    } 
    nextpath = cw['name']  
    return cw['name']       
}
 
plane.position.set(3,-0.2,1.5) //plane adjustments for the arrangement above
plane.scale.setX(1.3)

//obstacles
// mat é opcional, mas o resto é required
creates({'geo': cube(1,.2,1), 'mat': translucid, 'xyz': [1,0,1]  , 'shadow' : true})
creates({'geo': cube(1,.2,1), 'mat': translucid, 'xyz': [1,0,3]  , 'shadow' : true})
creates({'geo': cube(1,.2,1), 'mat': translucid, 'xyz': [3,0,0]  , 'shadow' : true})
creates({'geo': cube(1,.2,1), 'mat': translucid, 'xyz': [3,0,2]  , 'shadow' : true})
creates({'geo': cube(1,.2,2), 'mat': translucid, 'xyz': [5,0,1.5], 'shadow' : true})

function addCubesToScene(){
    for (let i = 0; i < cubearray.length; i++)
    {      
        cubearray[i].castShadow = true;
        scene.add(cubearray[i])
    }
}
addCubesToScene()

var linearray = []
// linhas que seguem os caminhos do array path, para facilitar visualização
function addLines(path){
    if (path){
        for (let i = 0; i < path.length; i++)
        {      
            let range
            let line = new THREE.Line( linegeometry, linematerial );
            let mesh1 = meshFromName(path[i][0])
            let mesh2 = meshFromName(path[i][1])
        
            line.position.set(mesh1.position.x,mesh1.position.y,mesh1.position.z)
            range = line.position.distanceTo(mesh2.position)
            line.scale.setZ(range)
        
            line.lookAt(mesh2.position)
            linearray.push(line)
            scene.add(line)
        }
    }    
}
function removeLines(){
    for (let i = 0; i < linearray.length; i++)
    {      
        scene.remove(linearray[i])
    }
}
//______________________________________________________________________________

    // Lights
const ambientLight = new THREE.AmbientLight(0xffffff,1.4)
scene.add(ambientLight)

const spotlight = new THREE.SpotLight( 0xffffff, 1); // 0 = off
scene.add(spotlight)

spotLightConfig()
function spotLightConfig(){
    spotlight.castShadow = true; // default false
    spotlight.position.set(0,5,0)    
    spotlight.shadow.mapSize.width = 512; // 512 default, shadow res
    spotlight.shadow.mapSize.height = 512; // 512 default, shadow res
    spotlight.shadow.camera.near = 0.5; // default is something like 10?
    spotlight.shadow.camera.far = 8; // default is something like 100 or so idk
}

//helper for the "shadow camera", sorta confusing the use of "camera" for this...
const helper = new THREE.CameraHelper( spotlight.shadow.camera );
//scene.add( helper ); //**** removed because I don't need it atm

    //Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputEncoding = THREE.sRGBEncoding // faz o modelo ficar mais claro, sei la porque
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
})
    // Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
rendererConfig()
function rendererConfig(){
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputEncoding = THREE.sRGBEncoding // faz o modelo ficar mais claro, sei la porque
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
}

    // Cameras
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.2, 50)
camera.position.set(5,4,5)
scene.add(camera)

    // Controls
const controls = new OrbitControls(camera, renderer.domElement)

// Returns mesh given name as parameter
function meshFromName(target)
{
    for (let i = 0; i < boxes.length; i++)
    {
        if(boxes[i].name==target){
            return boxes[i].mesh
        }        
    } 
}

// makes cone look at the box that has name included in the nextpath var
function lookatbox()
{
    for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].name == nextpath){
           cone.lookAt(boxes[i].mesh.position)
        }
    }    
}

// Percorre o array path procurando por quem infectou o current 'nextpath'
function getNextstep()
{   
    for (let i = 0; i < path.length; i++) {
        if (path[i][0] == nextpath){
            return path[i][1]          
        }
    }    
}

let counter = 0;
let counter2 = 0;
let action = 0;

let raycaster;
const pointer = new THREE.Vector2();
raycaster = new THREE.Raycaster();
document.addEventListener( 'mousemove', onPointerMove );

//
function onPointerMove( event ) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
//
let ar = creates({'geo': arrow, 'mat': purple, 'xyz': [0,-2,0], 'shadow' : false,'ret':true})
scene.add(ar)

//
function keypressed(event) {    

    var keyCode = event.which;
    // http://gcctech.org/csc/javascript/javascript_keycodes.htm
    if (keyCode == 87)// W
    { 
        console.log('W pressed')               
    }
    else if (keyCode == 83)// S
    { 
        console.log('S pressed')               
    }
    else if (keyCode == 65)// A
    {
        console.log('A pressed')             
    }
    else if (keyCode == 68)// D
    {
        //temporary debug key
        console.log('D pressed')    
        console.log(path)
        console.log('nextpath:')
        console.log(nextpath)
    }
    else if (keyCode == 32)// SPACE
    {
        console.log('SPACEBAR pressed') 

        if(foundobj && action == 0) { 
            removeLines();
            nextpath = closestBox()
            action = 1; 
            goalobj = foundobj
            AI.setActive(goalobj)
            AI.makePath()
            path = AI.getPath() 
            addLines(path)
        }         
    }
};
function mousepressed(event) {
    var keyCode = event.which;
    //  1 = LMB, 2 = RMB
    if (keyCode == 1)
    { 
        console.log('left mouse button pressed')       
    }
}
//_______________________
    // Animate

const animate = (timeStamp) =>
{
    let timeInSecond = (timeStamp / 1000).toFixed(1);// limits to 1 decimal just to keep it simple
    if (timeInSecond - counter >= 0.1)//every 1 tenth of second
    {
        document.addEventListener("keydown", keypressed, false);
        document.addEventListener( "mousedown", mousepressed, false ); // ERROR, working only when clicking in html elements
        
        if (action === 1)
        {
            lookatbox() //look at "currently selected box" 
            cone.translateZ(+0.1)    // move 'cone' para frente 

            //when near enough of the nextpath / current target, only then execute nextstep
            if (cone.position.distanceTo(meshFromName(nextpath).position) < 0.5){
                nextpath = getNextstep()
                lookatbox()
            }            
            
           //stop when reaching goal
            if (cone.position.distanceTo(goalobj.position) < 0.5){
                action = 0;
            }
        }   
        counter = timeInSecond;
    }

    //_____________________________________________________
    if (timeInSecond - counter2 >= 0.3)//every 3 tenths of a second
    {
        // find intersections
        raycaster.setFromCamera( pointer, camera );
        const intersects = raycaster.intersectObjects( cubearray, true );
        if ( intersects.length > 0 )
        {    
            foundobj = intersects[ 0 ].object
            ar.position.set(foundobj.position.x,foundobj.position.y+0.5,foundobj.position.z)    
        }
        else
        {
            ar.position.set(0,-2,0)
        }

        counter2 = timeInSecond;
    }

    // Update Orbital Controls
    controls.update()

    // Update objects    

    // Render
    renderer.render(scene, camera)   

    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}
animate()