const { ipcRenderer } = require('electron');
const { createBasicWindow } = require('../main_src/remoteWindow');
//When window recieves array of items

//Little Memory variable

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






//Tidy up this function on Thursday > Saturday

/*

*/

function createTree(object){
    //Get folder names for iteration
    let categoryNames = Object.keys(object);
    categoryNames.forEach(name=>{
        let cat = createCategory(name,object[name].length);
        if(Array.isArray(object[name])){
            let itemFolder = $($.parseHTML(`<div class="container tab-pane fade" id=${cat.categoryId} role="tabpanel" aria-labelledby="list-home-list"><ul style='box-shadow: 0px 6px 21px 0px rgba(0,0,0,0.48);' class='list-group rounded'></ul></div>`));
            //Tasks
            object[name].forEach(element => {

                let x = createTask(element.name,name);

                itemFolder.find('ul').append(x);

            });
            if(name == '$DONE'){
                $('#list-tab').prepend(cat);
                $('#nav-tabContent').prepend(itemFolder);
            }
            else{
                $('#list-tab').append(cat);
                $('#nav-tabContent').append(itemFolder);    
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
        let x = createBasicWindow(window_template('pages/updateFolder.html'));
        x.webContents.on('did-finish-load',()=>{
            x.webContents.send('content:send','addFolder',{ folders : name, window_id : x.id });
        })
        x.on('close',()=>{
            x = null;
        })
    })
}


function RandId(){
    return Array(50).fill(null).map(v=>{
        return String.fromCharCode(Math.floor(Math.random()*20+1)+65);
    }).join('');
}

//Done for now
function createCategory(name,leng){
    //Append the category to the .categories class and to the div for task list
    let id = RandId();
    let btn = $($.parseHTML(`<button class='btn btn-sm btn-danger float-right'>X</button>`));
    let addBtn = $($.parseHTML(`<button class='btn btn-sm btn-dark mr-2 text-white float-right'>+</button>`));
    let c = $($.parseHTML(`<a class="list-group-item list-group-item-action ${(name === '$DONE')?'bg-success text-white':''}" data-toggle="list" href='#${id}' role="tab">${(name === '$DONE')?'Done Tasks':name} ${(name !== '$DONE')?`<span class='badge badge-light'>${leng}</span>`:""}</a>`));
    c.click(()=>{
        Mem.lastActiveFolder = name;
    })
    c.dblclick(()=>{
        let x = createBasicWindow(window_template('pages/updateFolder.html'));
        x.webContents.on('did-finish-load',()=>{
            x.webContents.send('content:send','editFolder', { folders : name, window_id : x.id });
        })
        x.on('close',()=>{
            x = null;
        })
    })
    btn.click(()=>{
        let x = confirm('Are you sure?');
        if(x){
            ipcRenderer.send('folder:update','delete', { folderName : name } );
        }
    })
    addBtn.click(()=>{
        let x = createBasicWindow(window_template('pages/updateItem.html'));
        x.webContents.on('did-finish-load',()=>{
            x.webContents.send('content:send','addTask',{ folders : name, window_id : x.id });
        })
        x.on('close',()=>{
            x = null;
        }) 
    })
    if(name !== '$DONE'){
        c.append(btn).append(addBtn);
    }
    c.categoryId = id;
    return c;
}

//Done for now
function createTask(name,cat){
    let list = $($.parseHTML(`<li class='list-group-item'><div class='col-6 float-left'><p>${name}</p></div></li>`));
    if(cat==='$DONE'){
        list.addClass('bg-success').addClass('text-white');
    } else {
        let task = $($.parseHTML('<div class="col-6 float-right"></div>'));
        let btnDel = $($.parseHTML(`<button class='mr-2 btn btn-sm btn-danger float-right'>Delete</button>`));
        let btnEdit = $($.parseHTML(`<button class='mr-2 btn btn-sm btn-secondary float-right'>Edit</button>`));
        let btnDone = $($.parseHTML(`<button class=' mr-2 btn btn-sm btn-success float-right'>Done!</button>`));
        btnDel.click(()=>{
            ipcRenderer.send('item:update','delete', { itemName : name, folderName : cat });
        })
        btnEdit.click(()=>{
            let x = createBasicWindow(window_template('pages/updateItem.html'));
            x.webContents.on('did-finish-load',()=>{
                x.webContents.send('content:send','editTask',{ folders : cat, item : name, window_id : x.id });
            })
            x.on('close',()=>{
                x = null;
            })
        })
        btnDone.click(()=>{
            ipcRenderer.send('item:update', 'done', { itemName : name, folderName : cat });
        })
        list.append(task.append(btnDone).append(btnEdit).append(btnDel));
    }
    return list;
}

function window_template(url){
    return {
        url : url,
        width : 350,
        height : 250
    }
}