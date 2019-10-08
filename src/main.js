const { ipcRenderer } = require('electron');

//When window recieves array of items

let Mem = {
    curProj : null,
    lastProj : null,
    lastActiveFolder : null
}

ipcRenderer.on('todo:send',(e,data,projName)=>{
    if(Mem.curProj){
        Mem.lastProj = Mem.curProj;
    }
    Mem.curProj = projName;
    console.log(data);
    //Clean the list
    $('#list-tab').html('');
    $('#nav-tabContent').html('');
    $('#proj').text(projName.slice(0,-5));
    //Create div ul li for each object and append it ( hide the ul and add a click event to the div btn to show it
    createTree(data)
})




/*
    JSON-DOM FUNCTIONS
        -Add edit button to tasks
        -Add done button to tasks
    all done
*/


function createTree(object){
    //Get key values for iteration
    let x = Object.keys(object);
    //Iterate
    x.forEach(key=>{
        //Current task list
        console.log('In current category ' + key)
        //Create task list
        let cat = createCategory(key,object[key].length);
        //Check if there is the active folder from past update
        //Check if its a list of tasks
        if(Array.isArray(object[key])){
            let taskfolder = $($.parseHTML(`<div class="container tab-pane fade" id=${cat.categoryId} role="tabpanel" aria-labelledby="list-home-list"><ul style='box-shadow: 0px 6px 21px 0px rgba(0,0,0,0.48);' class='list-group rounded'></ul></div>`));
            object[key].forEach(element => {
                console.log(element);
                let x = createTask(element.name,key);
                //Create task
                //CreateTask()
                //Append it to the list
                taskfolder.find('ul').append((key==='$DONE')?x.addClass('bg-success').addClass('text-white'):x);
            });
            if(key == '$DONE'){
                $('#list-tab').prepend(cat);
                $('#nav-tabContent').prepend(taskfolder);
            }
            else{
                $('#list-tab').append(cat);
                $('#nav-tabContent').append(taskfolder);    
            }

        }else{
            console.log('Error!! Object or syntax error in todo list!!!')
        }
        if(Mem.curProj === Mem.lastProj){
            console.log(Mem.lastActiveFolder);
            if(object[Mem.lastActiveFolder]){
                console.log(object[Mem.lastActiveFolder])
                $('#list-tab').find(`a:contains(${Mem.lastActiveFolder})`).trigger('click');
            }
        }    
    })
    //Check if folder exists

    let add = $($.parseHTML(`<button style='text-align : center; font-size:1em; font-weight:bold' class="list-group-item list-group-item-action bg-secondary text-white">+</button>`));
    $('#list-tab').append(add);
    add.click(()=>{
        ipcRenderer.send('folder:add:open');
    })
}

/*

div
    p Category 1
    btn hide
    btn x
    ul
        li
            p
        li
            p
div
    p Category 2
    btn hide
    btn x

*/

function RandId(){
    return Array(50).fill(null).map(v=>{
        return String.fromCharCode(Math.floor(Math.random()*20+1)+65);
    }).join('');
}

function createCategory(name,leng){
    //Append the category to the .categories class and to the div for task list
    let id = RandId();
    let btn = $($.parseHTML(`<button class='btn btn-sm btn-danger float-right'>X</button>`));
    let c = $($.parseHTML(`<a class="list-group-item list-group-item-action ${(name === '$DONE')?'bg-success text-white':''}" data-toggle="list" href='#${id}' role="tab">${(name === '$DONE')?'Done Tasks':name} ${(name !== '$DONE')?`<span class='badge badge-light'>${leng}</span>`:""}</a>`));
    c.click(()=>{
        Mem.lastActiveFolder = name;
    })
    c.dblclick(()=>{
        ipcRenderer.send('folder:edit:open', name );
    })
    btn.click(()=>{
        let x = confirm('Are you sure?');
        if(x){
            ipcRenderer.send('folder:update','delete', { folderName : name } );
        }
    })
    if(name !== '$DONE'){
        c.append(btn);
    }
    c.categoryId = id;
    return c;
}

function createTask(name,cat){
    let list = $($.parseHTML(`<li class='list-group-item'><div class='col-6 float-left'><p>${name}</p></div></li>`));
    let dividor = $($.parseHTML('<div class="col-6 float-right"></div>'));
    if(cat !== '$DONE'){
        let btnDel = $($.parseHTML(`<button class='mr-2 btn btn-sm btn-danger float-right'>Delete</button>`));
        let btnEdit = $($.parseHTML(`<button class='mr-2 btn btn-sm btn-secondary float-right'>Edit</button>`));
        let btnDone = $($.parseHTML(`<button class=' mr-2 btn btn-sm btn-success float-right'>Done!</button>`));
        btnDel.click(()=>{
            ipcRenderer.send('item:update','delete', { itemName : name, folderName : cat });
        })
        btnEdit.click(()=>{
            ipcRenderer.send('item:edit:open',name,cat); //Change
        })
        btnDone.click(()=>{
            ipcRenderer.send('item:update', 'done', { itemName : name, folderName : cat });
        })
        list.append(dividor.append(btnDone).append(btnEdit).append(btnDel));
    }
    return list;
}