const { ipcRenderer } = require('electron');
const $ = require('jquery');

ipcRenderer.on('todo:send',(e,projects,action)=>{
    let select = $('<select>').addClass('form-control');
    projects.forEach(element => {
        select.append($('<option>',{ text : element, value : element}));
    })
    $('#sel').append(select);

    $('#send').click(()=>{
        switch(action){
            case 'delete':
                ipcRenderer.send('project:delete',$('#sel').children('select').val());
                break;
            case 'open':
                ipcRenderer.send('project:open',$('#sel').children('select').val());
                break;
            default:
                break;
        }
    })
})



