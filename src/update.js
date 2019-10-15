const { ipcRenderer } = require('electron');
const $ = require('jquery');

ipcRenderer.on('content:send',(e, cmd,{ folders = null, item = null, window_id = null }={})=>{
    switch(cmd){
        case 'addTask':
            if(!Array.isArray(folders)){
                $('#name').val('Single Todo Name');
                $('#send').click(()=>{
                    let name = $('#name').val();
                    ipcRenderer.send('item:update','addRemote',{ folderName : folders, itemName : name, window_id : window_id });
                })
            }else{
                let select = $('<select>').addClass('form-control');
                folders.forEach(element => {
                    select.append($('<option>',{ text : element, value : element}));
                })
                $('#sel').append(select);
                $('#name').val('Example todo');
                $('#send').click(()=>{
                    let cat = select.val();
                    let name = $('#name').val();
                    ipcRenderer.send('item:update','addRemote',{folderName : cat, itemName : name, window_id : window_id});
                })
            }

            break;
        case 'editTask':
            let x = $($.parseHTML(`<h4 id='category'>${folders}<h4>`));
            $('body').prepend(x);
            $('#name').val(item);
            $('#send').click(()=>{
                ipcRenderer.send('item:update','editRemote',{ folderName : folders, itemName : item , newItemName : $('#name').val(), window_id : window_id });
            })
            break;
        case 'addFolder':
                $('#send').click(()=>{
                    ipcRenderer.send('folder:update','addRemote', { newFolderName : $('#name').val(), window_id : window_id } );
                })
            break;
        case 'editFolder':
                $('#send').click(()=>{
                    ipcRenderer.send('folder:update','editRemote',{ folderName : folders, newFolderName : $('#name').val(), window_id : window_id });
                })
            break;
    }
})
