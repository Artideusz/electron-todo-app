const { ipcRenderer } = require('electron');
const $ = require('jquery');

ipcRenderer.on('content:send',(e, cmd,{ folders=null, item=null }={})=>{
    switch(cmd){
        case 'addTask':
            let select = $('<select>').addClass('form-control');
            folders.forEach(element => {
                select.append($('<option>',{ text : element, value : element}));
            })
            $('#sel').append(select);
            $('#name').val('Example todo');
            $('#send').click(()=>{
                let cat = select.val();
                let name = $('#name').val();
                ipcRenderer.send('item:update','add',{folderName : cat, itemName : name});
            })
            break;
        case 'editTask':
            let x = $($.parseHTML(`<h4 id='category'>${folders}<h4>`));
            $('body').prepend(x);
            $('#name').val(item);
            $('#send').click(()=>{
                ipcRenderer.send('item:update','edit',{ folderName : folders, itemName : item , newItemName : $('#name').val() });
            })
            break;
        case 'addFolder':
                $('#send').click(()=>{
                    ipcRenderer.send('folder:update','add', { newFolderName : $('#name').val() } );
                })
            break;
        case 'editFolder':
                $('#send').click(()=>{
                    ipcRenderer.send('folder:update','edit',{ folderName : folders, newFolderName : $('#name').val() });
                })
            break;
    }
})
