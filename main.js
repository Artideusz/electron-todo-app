const {app, BrowserWindow, ipcMain, Menu } = require('electron');
const fs = require('fs');
const path = require('path');


//Do something with those variables, they just can't be here.

let main, items, addFolder, addTaskWindow, editFolder, editTaskWindow, listWindow, projectPath, projName;

app.on('ready',()=>{
    main = createBasicWindow({
        width: 1000,
        height:600, 
        url:'pages/main.html',
        template : mainTemplate
    })
    main.on('closed',()=>{
        app.quit();
    })
})

// Project creation in appdata

ipcMain.on('project:create', async(e, projectName)=>{
    items = { 'Example' : [{'name':'example task'}], '$DONE' : []}
    projName = projectName;
    projectPath = path.join(app.getPath('userData'),projectName);
    save();
})

ipcMain.on('project:open',async(e,projectName)=>{
    listWindow.close();
    projName = projectName;
    projectPath = path.join(app.getPath('userData'),projectName);
    load();
})


ipcMain.on('folder:edit:open',(e,foldername)=>{
    if(!editFolder){
        editFolder = createBasicWindow({
            url : 'pages/updateFolder.html',
            width : 350,
            height : 250,
            template : 'none',
            aot:true
        })
        editFolder.webContents.on('did-finish-load',()=>{
            editFolder.webContents.send('content:send','editFolder', { folders : foldername });
        })
        editFolder.on('close',()=>{
            editFolder = null;
        })
    }
})

ipcMain.on('folder:add:open',(e)=>{
    if(!addFolder){
        addFolder = createBasicWindow({
            url : 'pages/updateFolder.html',
            width : 350,
            height : 250,
            template : 'none',
            aot:true
        })
        addFolder.webContents.on('did-finish-load',()=>{
            addFolder.webContents.send('content:send','addFolder');
        })
        addFolder.on('close',()=>{
            addFolder = null;
        })
    }
})


ipcMain.on('folder:update',(e, cmd, { folderName=null, newFolderName=null }={})=>{
    if(projectPath){
        switch(cmd){
            case 'add':
                if(addFolder){
                    addFolder.close();
                    items[newFolderName] = [];
                }
                break;
            case 'edit':
                if(editFolder){
                    editFolder.close();
                    items[newFolderName] = items[folderName];
                    delete items[folderName];
                }
                break;
            case 'delete':
                    delete items[folderName];
                break;
        }
        save();
    }
})

ipcMain.on('item:update',(e, cmd, { folderName=null, itemName=null, newFolderName=null, newItemName=null }={})=>{
    if(projectPath){
        switch(cmd){
            case 'add':
                if(addTaskWindow){
                    addTaskWindow.close();
                    items[folderName].unshift({'name': itemName});
                }
                break;
            case 'delete':
                let folder = items[folderName];
                let index = folder.find(v=>v.name===itemName)
                folder.splice(folder.indexOf(index),1); 
                break;
            case 'edit':
                if(editTaskWindow){
                    editTaskWindow.close();
                    let index = items[folderName].map(v=>v.name).indexOf(itemName);
                    items[folderName][index].name = newItemName;     
                }
                break;
            case 'done':
                let x = items[folderName].splice(items[folderName].indexOf(items[folderName].find(v=>v.name===itemName)),1)[0]
                items['$DONE'].unshift(x);
                break;
            default:
                break;
        }
        save();
    }else{
        console.error('No project open!');
    }
})


//listen for window for editing

//Change to remote********************************

ipcMain.on('item:edit:open',(e,x,cat)=>{
    if(!editTaskWindow){
        editTaskWindow = createBasicWindow({
            url : 'pages/updateItem.html',
            width : 350,
            height : 250,
            template : 'none',
            aot:true
        })
        editTaskWindow.webContents.on('did-finish-load',()=>{
            editTaskWindow.webContents.send('content:send','editTask', { folders : cat, item : x });
        })
        editTaskWindow.on('close',()=>{
            editTaskWindow = null;
        })
    }
})



/*

Helper functions

*/

function getList(){
    return new Promise((rs,rj)=>{
        fs.readdir(app.getPath('userData'),(err,files)=>{
            if(err){
                rj(err);
            }else{

                rs(files.filter((v)=>/.json$/gi.test(v)));
            }
        })
    })
}

function createBasicWindow({url='index.html', width=800, height=600, template=null, frame=true, node=true, aot=false, show=true}={}){
    let x =  new BrowserWindow({
        width:width,
        height:height,
        frame:frame,
        alwaysOnTop : aot,
        webPreferences :{
            nodeIntegration : node
        },
        show : show
    })
    x.loadFile(url);
    if(template === 'none'){
        x.setMenu(null);
    }else if(template){
        let menu = Menu.buildFromTemplate(template);
        x.setMenu(menu);
    }
    return x;
}

function loadFile(method,path){
    switch(method.toLowerCase()){
        case 'get':
            return new Promise((rs,rj)=>{
                fs.readFile(path,'utf8',(err,data)=>{
                    if(err){
                        rj(err);
                    }else{
                        rs(data);
                    }
                })
            })
        case 'post':
            return new Promise((rs,rj)=>{
                fs.writeFile(path,JSON.stringify(items),(e)=>{
                    if(e){
                        console.log(e);
                        rj(e);
                    }else{
                        rs('Success');
                    }
                })
            })
        default:
            break;
    }
}

async function save(){
    let x = await loadFile('post', projectPath)
    console.log(x);
    main.webContents.send('todo:send',items, projName);
}

async function load(){
    let x = await loadFile('get',projectPath);
    items = JSON.parse(x);
    main.webContents.send('todo:send', items, projName);
}

const mainTemplate = [
    {
        label:'File',
        submenu:[
            {
                label:'Add Todo Folder',
                accelerator : 'Ctrl+Shift+A',
                click(){
                    addFolder = createBasicWindow({
                        url : 'pages/updateFolder.html',
                        width : 350,
                        height : 250,
                        template : 'none',
                        aot:true
                    })
                    addFolder.webContents.on('did-finish-load',()=>{
                        addFolder.webContents.send('content:send','addFolder');
                    })
                    addFolder.on('close',()=>{
                        addFolder = null;
                    })
                }
            },
            {
                label:'Add Todo Task',
                accelerator : 'Ctrl+Shift+B',
                click(){
                    if(projectPath){
                        addTaskWindow = createBasicWindow({
                            url:'pages/updateItem.html',
                            width:350,
                            height:250,
                            template:'none'
                        });
                        addTaskWindow.webContents.on('did-finish-load',()=>{
                            addTaskWindow.webContents.send('content:send','addTask',{ folders : Object.keys(items)});
                        })
                        addTaskWindow.on('close',()=>{
                            addTaskWindow = null;
                        })                        
                    }
                }
            },
            {
                label:'Create List',
                accelerator : 'Ctrl+P',
                async click(){
                    listWindow = createBasicWindow({
                        url : 'pages/createList.html',
                        width : 300,
                        height : 200,
                        template : 'none',
                        aot : true
                    })
                    listWindow.on('close',()=>{
                        listWindow = null;
                    })
                }
            },
            {
                label:'Open List',
                accelerator : 'Ctrl+Shift+P',
                async click(){
                    listWindow = createBasicWindow({
                        url : 'pages/openProj.html',
                        width : 300,
                        height : 200,
                        template : 'none',
                        aot : true
                    })
                    listWindow.webContents.on('did-finish-load',async()=>{
                        let x = await getList();
                        listWindow.webContents.send('todo:send',x);
                    })
                    listWindow.on('close',()=>{
                        listWindow = null;
                    })
                }
            }
        ]
    },
    {
        label:'Developer Tools',
        click(){
            main.webContents.toggleDevTools();
        }
    },
    {
        label:'Reload',
        click(){
            main.reload();
        }
    }
]