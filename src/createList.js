const { ipcRenderer } = require('electron');
const $ = require('jquery');

$(()=>{
    $('#name').val('Example List');
    $('#send').click(()=>{
        ipcRenderer.send('project:create',$('#name').val()+'.json');
    })
})