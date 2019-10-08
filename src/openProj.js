const { ipcRenderer } = require('electron');
const $ = require('jquery');

ipcRenderer.on('todo:send',(e,projects)=>{
    let select = $('<select>').addClass('form-control');
    projects.forEach(element => {
        select.append($('<option>',{ text : element, value : element}));
    })
    $('#sel').append(select);
})

$(()=>{
    $('#send').click(()=>{
        ipcRenderer.send('project:open',$('#sel').children('select').val());
    })
})