import * as THREE from '../node_modules/three'

var cubearray = [];   
var boxes = [];

export function getCubeArray(){
    return cubearray
}
export function getBoxesArray(){
    return boxes
}
//Parameters: name, x,y,z, [ connected name, connected distance ] , active
// X = movimento para direita, Z = movimento para baixo
export function addNode(name,x,y,z,con,ac)
{  
    //adds the mesh to cubearray
    let mesh = new THREE.Mesh(new THREE.BoxGeometry( .2, .2, .2))   
    mesh.position.set(x,y,z)
    cubearray.push(mesh)

    //adds the object to boxes array
    let node={
        "name"      :name,
        "mesh"      :mesh,
        "active"    :ac,
        "passed"    :0,
        "connected" :[]} 
    for (let i = 0; i < con.length; i++)
    {
        node.connected[con[i][0]] = []
        node.connected[con[i][0]]['name'] = con[i][0]
        node.connected[con[i][0]]['distance'] = con[i][1]
    }
    boxes.push(node)
}

var infN; // infected number
var reshade = 0.0
var path = [];

export function getPath(){
    return path
}

export function setActive(chosen){
    for (let i = 0; i < boxes.length; i++) //desativa todas
    {
        boxes[i].active = 0;
    } 
    for (let i = 0; i < boxes.length; i++) //procura e ativa a passada de parametro
    {
        if(boxes[i].mesh === chosen){
            boxes[i].active = 1;
            break;
        }        
    } 
}

// Preenche o array path, que tem duas dimensões, ex: [[x1,y1],[x2,y2]...]
export function pathfinder(){
    while(infN < boxes.length)
    { 
        for (let i = 0; i < boxes.length; i++)
        {
            if (boxes[i].active==1 && boxes[i].passed==0) // procura box ativa que não passou ainda
            { 
                boxes[i].passed ==1;         
                for (let j = 0; j < boxes.length; j++)
                {
                    if(boxes[j].connected[boxes[i].name] && boxes[j].active == 0) // procura box não ativa, contectada com ativa
                    { 
                        boxes[i].mesh.material.color = new THREE.Color(1,reshade,reshade)
                        reshade = reshade+0.03; //reduz vermelho na cor ^

                        boxes[j].active = 1; // ativa a box  
                        infN++;
                        path.push([boxes[j].name,boxes[i].name])  // adds object and who infected it to path array   
                    }
                }
            }
        }
    }
}

export function makePath(){
    infN =1
    path = []
    reshade = 0    
    for (let i = 0; i < cubearray.length; i++)
    {
        cubearray[i].material.color = new THREE.Color(1,1,1)
    } 
    pathfinder()
}